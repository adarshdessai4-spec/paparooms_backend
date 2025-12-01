import { Router } from 'express';
import path from 'path';
import multer from 'multer';
import protect from '../middlewares/auth.js';
import validateRequest from '../middlewares/validateRequest.js';
import {
  createListing,
  listListings,
  getListingById,
  updateListing,
  deleteListing,
  publishListing,
  getListingsByOwner,
} from '../controllers/listingController.js';
import { createListingSchema, updateListingSchema } from '../validations/listing.js';

const router = Router();

// 🆕 MULTER SETUP for listings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/listings/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `listing-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('Only .jpg, .jpeg, .png allowed'));
  },
});

// ✅ CREATE LISTING (multiple photos)
router.post(
  '/',
  protect,
  upload.array('images', 10), // up to 10 images
  createListing
);

// ✅ UPDATE LISTING (add/remove photos)
router.put(
  '/:id',
  protect,
  upload.array('newImages', 10), // new uploads go in 'newImages'
  updateListing
);

// ✅ OTHER ROUTES
router.get('/', listListings);
router.get('/:id', getListingById);
router.delete('/:id', protect, deleteListing);
router.post('/:id/publish', protect, publishListing);
router.get('/owner/:ownerId', getListingsByOwner);

export default router;
