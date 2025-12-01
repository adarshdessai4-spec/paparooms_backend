import mongoose from 'mongoose';
import Room from '../models/Room.js';
import Listing from '../models/Listing.js';
import fs from 'fs';
import path from 'path';

// 🆕 CREATE ROOM
export const createRoom = async (req, res) => {
  try {
    const { listingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ success: false, message: 'Invalid listingId' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing)
      return res.status(404).json({ success: false, message: 'Listing not found' });

    if (listing.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to add room' });
    }

    const imageUrls = req.files
      ? req.files.map((file) => ({
          url: `${req.protocol}://${req.get('host')}/uploads/images/${file.filename}`,
          filename: file.filename,
        }))
      : [];

    const amenities = Array.isArray(req.body.amenities)
      ? req.body.amenities
      : req.body.amenities
      ? JSON.parse(req.body.amenities)
      : [];

    const payload = {
      listingId,
      title: req.body.title,
      type: req.body.type,
      pricePerNight: req.body.pricePerNight,
      maxGuests: req.body.maxGuests,
      bedInfo: req.body.bedInfo,
      amenities,
      images: imageUrls,
      cancellationPolicy: req.body.cancellationPolicy || '',
    };

    const room = await Room.create(payload);
    res.status(201).json({ success: true, message: 'Room created successfully', data: room });
  } catch (err) {
    console.error('createRoom error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// 📋 LIST ROOMS FOR LISTING
export const listRoomsByListing = async (req, res) => {
  try {
    const { listingId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ success: false, message: 'Invalid listingId' });
    }

    const rooms = await Room.find({ listingId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: rooms });
  } catch (err) {
    console.error('listRoomsByListing error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🔍 GET ROOM BY ID
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid room id' });
    }

    const room = await Room.findById(id).populate('listingId');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    return res.status(200).json({ success: true, data: room });
  } catch (err) {
    console.error('getRoomById error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✏️ UPDATE ROOM
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid room id' });
    }

    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    const listing = await Listing.findById(room.listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Parent listing not found' });

    if (listing.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this room' });
    }

    // 🧩 Handle removing old images
    if (req.body.removeImages) {
      const removeList = Array.isArray(req.body.removeImages)
        ? req.body.removeImages
        : [req.body.removeImages];

      removeList.forEach((filename) => {
        const imgPath = path.join('uploads/images/', filename);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });

      room.images = room.images.filter((img) => !removeList.includes(img.filename));
    }

    // 🆕 Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: `${req.protocol}://${req.get('host')}/uploads/images/${file.filename}`,
        filename: file.filename,
      }));
      room.images.push(...newImages);
    }

    // Parse amenities if stringified
    if (req.body.amenities) {
      room.amenities = Array.isArray(req.body.amenities)
        ? req.body.amenities
        : JSON.parse(req.body.amenities);
    }

    // Update other fields
    Object.assign(room, req.body, { updatedAt: new Date() });

    await room.save();

    return res.status(200).json({ success: true, message: 'Room updated successfully', data: room });
  } catch (err) {
    console.error('updateRoom error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ❌ DELETE ROOM
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid room id' });
    }

    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    const listing = await Listing.findById(room.listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Parent listing not found' });

    if (listing.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this room' });
    }

    room.images.forEach((img) => {
      const imgPath = path.join('uploads/images/', img.filename);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    });

    await room.deleteOne();

    return res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (err) {
    console.error('deleteRoom error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
