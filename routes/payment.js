import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/create-order', optionalAuth, createOrder);
router.post('/verify', optionalAuth, verifyPayment);

export default router;
