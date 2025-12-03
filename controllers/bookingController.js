// controllers/bookingController.js
import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Listing from "../models/Listing.js";
import User from "../models/User.js";
import { sendEmail } from "../middlewares/mailer.js"; // ✅ email helper
import crypto from "crypto";

const generateTempPassword = () => crypto.randomBytes(9).toString("base64");

const ensureGuestUser = async ({ name, email, phone }) => {
  if (!email) return null;

  const existing = await User.findOne({ email });
  if (existing) {
    let dirty = false;
    if (!existing.name && name) { existing.name = name; dirty = true; }
    if (!existing.phone && phone) { existing.phone = phone; dirty = true; }
    if (dirty) await existing.save();
    return existing;
  }

  const [created] = await User.create([{
    name: name || email.split("@")[0] || "Guest",
    email,
    phone,
    password: generateTempPassword(),
    role: "guest",
    authProvider: "local",
    isVerified: false,
  }]);

  return created;
};

export const createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, guestName, guestEmail, guestPhone } = req.body;
    const authUser = req.user;

    // ✅ Validate dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        message: "Check-in date cannot be in the past",
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    // ✅ Check room & listing
    const room = await Room.findById(roomId);
    if (!room)
      return res.status(404).json({ success: false, message: "Room not found" });

    const listing = await Listing.findById(room.listingId);
    if (!listing)
      return res.status(404).json({ success: false, message: "Listing not found" });

    const ownerId = listing.ownerId;
    const owner = await User.findById(ownerId).select("email name");

    // ✅ Overlapping booking check
    const overlappingBooking = await Booking.findOne({
      roomId,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } },
      ],
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: "Room already booked for selected dates",
      });
    }

    // ✅ Calculate amount
    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );
    const totalAmount = nights * room.pricePerNight;

    // ✅ Resolve guest (logged-in or walk-in with contact details)
    const contactEmail = (guestEmail || authUser?.email || "").trim().toLowerCase();
    if (!authUser && !contactEmail) {
      return res.status(400).json({
        success: false,
        message: "Guest email is required to place a booking",
      });
    }

    const contactName = guestName || authUser?.name || "Guest";
    const contactPhone = guestPhone || authUser?.phone || "";

    let guestUserId = authUser?._id || authUser?.id;
    if (!guestUserId) {
      const guestUser = await ensureGuestUser({
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
      });
      guestUserId = guestUser?._id;
    }

    if (!guestUserId) {
      return res.status(400).json({
        success: false,
        message: "Unable to create guest profile for booking",
      });
    }

    const booking = await Booking.create(
      {
        roomId,
        listingId: listing._id,
        guestId: guestUserId,
        guestContact: {
          name: contactName,
          email: contactEmail || authUser?.email,
          phone: contactPhone,
        },
        ownerId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalAmount,
        status: "pending",
        paymentStatus: "unpaid",
      }
    );

    // ✅ Send email to Guest
    await sendEmail({
      to: contactEmail || authUser?.email,
      subject: "Booking Created - Payment Pending",
      html: `
        <h2>Your booking request is created!</h2>
        <p><strong>Listing:</strong> ${listing.title}</p>
        <p><strong>Check-in:</strong> ${checkInDate.toDateString()}</p>
        <p><strong>Check-out:</strong> ${checkOutDate.toDateString()}</p>
        <p><strong>Total:</strong> ₹${totalAmount}</p>
        <p>Please complete payment to confirm your booking.</p>
      `,
    });

    // ✅ Send email to Owner
    if (owner?.email) {
      await sendEmail({
        to: owner.email,
        subject: "New Booking Request",
        html: `
          <h2>You have a new booking request!</h2>
          <p><strong>Property:</strong> ${listing.title}</p>
          <p><strong>Check-in:</strong> ${checkInDate.toDateString()}</p>
          <p><strong>Check-out:</strong> ${checkOutDate.toDateString()}</p>
          <p>Total amount: ₹${totalAmount}</p>
        `,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Booking created, waiting for payment",
      booking,
    });
  } catch (err) {
    console.error("Booking error:", err?.stack || err);

    return res.status(500).json({
      success: false,
      message: "Booking failed",
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ guestId: req.user.id })
      .populate("roomId")
      .populate("listingId");

    res.json({ success: true, bookings });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

export const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user.id })
      .populate("guestId", "name email")
      .populate("roomId")
      .populate("listingId");

    res.json({ success: true, bookings });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch owner bookings" });
  }
};

// ✅ Cancel Booking Controller
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const userId = req.user.id.toString();

    const booking = await Booking.findById(bookingId)
      .populate("listingId")
      .populate("guestId", "email name")
      .populate("ownerId", "email name");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ✅ If populated → use booking.guestId._id
    const guestId = booking.guestId?._id?.toString();
    const ownerId = booking.ownerId?._id?.toString();

    const createdByGuest = guestId === userId;
    const createdByOwner = ownerId === userId;

    console.log("User:", userId);
    console.log("Guest:", guestId);
    console.log("Owner:", ownerId);

    if (!createdByGuest && !createdByOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to cancel this booking",
      });
    }

    if (["cancelled", "completed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${booking.status} booking`,
      });
    }

    booking.status = "cancelled";

    // ✅ fix payment status error
    booking.paymentStatus =
      booking.paymentStatus === "paid" ? "refunded" : "unpaid";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });

  } catch (err) {
    console.error("Cancel booking error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};
