// routes/booking.routes.js
import express from "express";
import protect from "../middlewares/auth.js";
import validateRequest from "../middlewares/validateRequest.js";
import { createBookingSchema } from "../validations/booking.js";
import { createBooking, getMyBookings, getOwnerBookings,cancelBooking } from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", protect, validateRequest(createBookingSchema), createBooking);
router.get("/my", protect, getMyBookings);
router.get("/owner", protect, getOwnerBookings);
router.put("/:bookingId/cancel",protect,cancelBooking);

export default router;
