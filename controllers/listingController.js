// controllers/listingController.js

import Listing from '../models/Listing.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { createListingSchema, updateListingSchema } from '../validations/listing.js';

/* --------------------------- Normalization helpers -------------------------- */

const safeJson = (v) => {
  if (v == null) return undefined;
  if (typeof v !== 'string') return v; // already parsed (object/array)
  try { return JSON.parse(v); } catch { return undefined; }
};

const splitCommaTrim = (v) =>
  String(v)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const normalizeStringArray = (raw) => {
  if (raw == null) return [];
  // Repeated fields (from multipart): amenities[]=A&amenities[]=B
  if (Array.isArray(raw)) {
    // Each item may itself be a comma-string; flatten.
    return raw.flatMap(x => (typeof x === 'string' ? splitCommaTrim(x) : []))
              .filter(Boolean);
  }
  // JSON string? e.g. '["A","B"]'
  const parsed = safeJson(raw);
  if (Array.isArray(parsed)) {
    return parsed.map(String).map(s => s.trim()).filter(Boolean);
  }
  // Plain string "A, B"
  if (typeof raw === 'string') {
    return splitCommaTrim(raw);
  }
  return [];
};

const pickFirst = (...vals) => vals.find(v => v !== undefined && v !== null && v !== '');

const toNum = (v) => (v === '' || v == null ? undefined : Number(v));

/** Build address from either a JSON string `address` or flat primitives. */
const normalizeAddress = (body, fallback) => {
  const fromJson = safeJson(body.address);
  if (fromJson) return fromJson;

  const addr = {
    line1: body.address_line1 ?? fallback?.line1 ?? '',
    city: body.address_city ?? fallback?.city ?? '',
    state: body.address_state ?? fallback?.state ?? '',
    country: body.address_country ?? fallback?.country ?? '',
    pincode: body.address_pincode ?? fallback?.pincode ?? '',
  };
  return addr;
};

/** Build location from either JSON string `location` or `lng`/`lat` primitives. */
const normalizeLocation = (body, fallback) => {
  const fromJson = safeJson(body.location);
  if (fromJson && Array.isArray(fromJson.coordinates)) return fromJson;

  const lng = toNum(body.lng);
  const lat = toNum(body.lat);
  const type = body.location_type || 'Point';

  if (Number.isFinite(lng) && Number.isFinite(lat)) {
    return { type, coordinates: [lng, lat] };
  }
  // If invalid or missing, use fallback if provided
  return fallback;
};

/** Normalize arrays for amenities/policies (supports [], JSON, or comma-string). */
const normalizeAmenPol = (body, key, fallback = []) => {
  const raw = pickFirst(body[`${key}[]`], body[key]);
  const arr = normalizeStringArray(raw);
  return arr.length ? arr : (fallback || []);
};

/** Normalize removeImages list (supports [], JSON, or comma-string). */
const normalizeRemoveImages = (body) => {
  const raw = pickFirst(body['removeImages[]'], body.removeImages);
  return normalizeStringArray(raw);
};

/** Ensure uploads directory exists. */
const ensureUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/* ---------------------------------- CREATE --------------------------------- */

// 🆕 CREATE LISTING
export const createListing = async (req, res) => {
  try {
    const { body, files } = req;

    // Normalize payload
    const address   = normalizeAddress(body);
    const location  = normalizeLocation(body);
    const amenities = normalizeAmenPol(body, 'amenities', []);
    const policies  = normalizeAmenPol(body, 'policies',  []);

    const parsedData = {
      title: body.title,
      description: body.description,
      address,
      location,
      amenities,
      policies,
      status: body.status || 'draft',
      coverImage: body.coverImage, // may be filename or URL; resolved below
    };

    // Validate
    const { error } = createListingSchema.validate(parsedData, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
        })),
        // helpful for debug:
        debug: parsedData,
      });
    }

    // Need at least 1 image
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required.',
      });
    }

    // Ensure upload dir
    const uploadDir = path.join('uploads', 'listings');
    ensureUploadDir(uploadDir);

    // Map URLs
    const imageUrls = files.map((file) => ({
      url: `${req.protocol}://${req.get('host')}/uploads/listings/${file.filename}`,
      filename: file.filename,
    }));

    // Resolve cover image
    let coverImageUrl = imageUrls[0]?.url;
    if (parsedData.coverImage) {
      const match = imageUrls.find(x => x.filename === parsedData.coverImage || x.url === parsedData.coverImage);
      if (match) coverImageUrl = match.url;
    }

    const listing = new Listing({
      ...parsedData,
      ownerId: req.user._id,
      images: imageUrls,
      coverImage: coverImageUrl,
    });

    await listing.save();

    return res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing,
    });
  } catch (err) {
    console.error('createListing error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

/* ---------------------------------- UPDATE --------------------------------- */

// 🧩 UPDATE LISTING (with inline validation)
export const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, files } = req;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid listing ID' });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Authorization
    if (listing.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Normalize with fallbacks
    const address   = normalizeAddress(body, listing.address);
    const location  = normalizeLocation(body, listing.location);
    const amenities = normalizeAmenPol(body, 'amenities', listing.amenities);
    const policies  = normalizeAmenPol(body, 'policies',  listing.policies);

    const parsedData = {
      title: body.title ?? listing.title,
      description: body.description ?? listing.description,
      address,
      location,
      amenities,
      policies,
      status: body.status ?? listing.status,
      coverImage: body.coverImage ?? listing.coverImage, // filename or URL; reconcile below
    };

    // Validate
    const { error } = updateListingSchema.validate(parsedData, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
        })),
        debug: parsedData,
      });
    }

    // Remove images
    const removeList = normalizeRemoveImages(body); // array of filenames
    if (removeList.length > 0) {
      removeList.forEach((filename) => {
        const imgPath = path.join('uploads', 'listings', filename);
        if (fs.existsSync(imgPath)) {
          try { fs.unlinkSync(imgPath); } catch {}
        }
      });
      listing.images = listing.images.filter(img => !removeList.includes(img.filename));

      // If cover points at a removed URL, clear; will reset below
      const coverStillExists = listing.images.some(img => img.url === listing.coverImage);
      if (!coverStillExists) {
        listing.coverImage = undefined;
      }
    }

    // Add new images
    if (files && files.length > 0) {
      const newImages = files.map((file) => ({
        url: `${req.protocol}://${req.get('host')}/uploads/listings/${file.filename}`,
        filename: file.filename,
      }));
      listing.images.push(...newImages);
    }

    // Cover image reconcile
    if (parsedData.coverImage) {
      const match = listing.images.find(
        x => x.filename === parsedData.coverImage || x.url === parsedData.coverImage
      );
      listing.coverImage = match ? match.url : parsedData.coverImage;
    } else if (!listing.coverImage && listing.images.length > 0) {
      listing.coverImage = listing.images[0].url;
    }

    // Merge fields
    listing.title       = parsedData.title;
    listing.description = parsedData.description;
    listing.address     = parsedData.address;
    listing.location    = parsedData.location;
    listing.amenities   = parsedData.amenities;
    listing.policies    = parsedData.policies;
    listing.status      = parsedData.status;
    listing.updatedAt   = new Date();

    await listing.save();

    return res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: listing,
    });
  } catch (err) {
    console.error('updateListing error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

/* ----------------------------------- READ ---------------------------------- */

export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid listing id' });
    }

    const listing = await Listing.findById(id).populate('ownerId');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    return res.status(200).json({ success: true, data: listing });
  } catch (err) {
    console.error('getListingById error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ------------------------------- LIST (PUBLIC) ------------------------------ */

export const listListings = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, q, city, minPrice, maxPrice,
      lat, lng, radius = 5000, sortBy = 'createdAt'
    } = req.query;

    const filter = {};

    if (q) filter.$text = { $search: q };
    if (city) filter['address.city'] = city;

    let aggregation = [];
    if (lat && lng) {
      const coords = [parseFloat(lng), parseFloat(lat)];
      aggregation.push({
        $geoNear: {
          near: { type: 'Point', coordinates: coords },
          distanceField: 'dist.calculated',
          maxDistance: parseInt(radius),
          spherical: true,
          query: filter
        }
      });
    } else {
      aggregation.push({ $match: filter });
    }

    const pageNum = Math.max(1, parseInt(page));
    const perPage = Math.min(100, parseInt(limit));

    aggregation.push({ $sort: { [sortBy]: -1 } });
    aggregation.push({ $skip: (pageNum - 1) * perPage });
    aggregation.push({ $limit: perPage });

    const listings = await Listing.aggregate(aggregation);
    return res.status(200).json({ success: true, data: listings, page: pageNum });
  } catch (err) {
    console.error('listListings error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* --------------------------------- DELETE ---------------------------------- */

export const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid listing ID' });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (
      listing.ownerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await listing.deleteOne();

    return res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (err) {
    console.error('deleteListing error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ------------------------------ PUBLISH STATE ------------------------------ */

export const publishListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'publish' | 'unpublish' | 'archive'

    if (!['publish', 'unpublish', 'archive'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    if (listing.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    listing.status = action === 'publish' ? 'published'
                  : action === 'archive' ? 'archived'
                  : 'draft';
    listing.updatedAt = new Date();
    await listing.save();

    return res.status(200).json({ success: true, data: listing });
  } catch (err) {
    console.error('publishListing error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ------------------------------- OWNER LISTS ------------------------------- */

export const getListingsByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ success: false, message: 'Invalid owner id' });
    }

    const listings = await Listing.find({ ownerId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: listings });
  } catch (err) {
    console.error('getListingsByOwner error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
