import express from 'express';
import protect from '../middlewares/auth.js';
import { uploadKycFiles } from '../middlewares/uploadLocal.js';
import { createKyc, updateKyc } from '../controllers/kycController.js';

const router = express.Router();

router.post('/', protect, uploadKycFiles, createKyc);
router.put('/:id', protect, uploadKycFiles, updateKyc);

export default router;
