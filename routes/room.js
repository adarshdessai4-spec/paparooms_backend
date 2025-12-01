import { Router } from 'express';
import protect from '../middlewares/auth.js';
import validateRequest from '../middlewares/validateRequest.js';
import { createRoomSchema, updateRoomSchema } from '../validations/room.js';
import {
  createRoom,
  listRoomsByListing,
  getRoomById,
  updateRoom,
  deleteRoom
} from '../controllers/roomController.js';
import { uploadRoomImages } from '../middlewares/uploadLocal.js';

const router = Router({ mergeParams: true });

// ✅ create room under a listing (owner only)
router.post(
  '/',
  protect,
  uploadRoomImages.array('images', 5), // 🆕 allow up to 5 room images
  validateRequest(createRoomSchema),
  createRoom
);

// ✅ list rooms for a listing (public)
router.get('/', listRoomsByListing);

// ✅ single room details
router.get('/:id', getRoomById);

// ✅ update room (owner or admin)
router.put(
  '/:id',
  protect,
  uploadRoomImages.array('images', 5),
  validateRequest(updateRoomSchema),
  updateRoom
);

// ✅ delete room
router.delete('/:id', protect, deleteRoom);

export default router;
