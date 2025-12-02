/**
 * Seeds demo users, listings, and rooms with local placeholder images.
 * Requires: MONGO_URI (or falls back to mongodb://127.0.0.1:27017/oyo_plus).
 * Run: npm run seed:demo
 */
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Room from '../models/Room.js';

dotenv.config();

const DEMO_OWNER = {
  name: process.env.DEMO_OWNER_NAME || 'Demo Host',
  email: process.env.DEMO_OWNER_EMAIL || 'host.demo@paparooms.com',
  password: process.env.DEMO_OWNER_PASSWORD || 'HostDemo@123',
};

const demoListings = [
  {
    title: 'Aurora Suites Downtown',
    description: 'Modern business-friendly suites near the metro with skyline views and a cozy rooftop lounge.',
    coverImage: '/uploads/listings/aurora-facade.jpg',
    images: [
      { url: '/uploads/listings/aurora-facade.jpg', filename: 'aurora-facade.jpg' },
      { url: '/uploads/listings/aurora-lounge.jpg', filename: 'aurora-lounge.jpg' },
    ],
    address: {
      line1: '12 Park Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
    },
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760],
    },
    amenities: ['High-speed Wi-Fi', 'Rooftop pool', 'Airport pickup', 'Breakfast included'],
    policies: ['No smoking indoors', 'Check-in after 2 PM', 'Late checkout on request'],
    status: 'published',
  },
  {
    title: 'Marina Bay Residences',
    description: 'Sea-facing hotel with airy rooms, palm-lined promenade access, and a laid-back café.',
    coverImage: '/uploads/listings/marina-exterior.jpg',
    images: [
      { url: '/uploads/listings/marina-exterior.jpg', filename: 'marina-exterior.jpg' },
      { url: '/uploads/listings/marina-lobby.jpg', filename: 'marina-lobby.jpg' },
    ],
    address: {
      line1: '88 Shoreline Road',
      city: 'Goa',
      state: 'Goa',
      country: 'India',
      pincode: '403001',
    },
    location: {
      type: 'Point',
      coordinates: [73.8567, 15.4909],
    },
    amenities: ['Beach access', 'Complimentary breakfast', 'Evening live music', 'Pool & cabanas'],
    policies: ['Pets allowed on request', 'ID required at check-in'],
    status: 'published',
  },
  {
    title: 'Palm Grove Retreat',
    description: 'Tropical-style villas tucked among palms with private patios and outdoor showers.',
    coverImage: '/uploads/listings/palm-resort.jpg',
    images: [
      { url: '/uploads/listings/palm-resort.jpg', filename: 'palm-resort.jpg' },
      { url: '/uploads/listings/palm-pool.jpg', filename: 'palm-pool.jpg' },
    ],
    address: {
      line1: '54 Coastal Avenue',
      city: 'Kochi',
      state: 'Kerala',
      country: 'India',
      pincode: '682001',
    },
    location: {
      type: 'Point',
      coordinates: [76.2673, 9.9312],
    },
    amenities: ['Private plunge pool', 'Spa access', 'In-villa dining', '24/7 concierge'],
    policies: ['Quiet hours after 10 PM', 'No parties'],
    status: 'published',
  },
];

const demoRooms = [
  {
    listingTitle: 'Aurora Suites Downtown',
    title: 'Deluxe King Suite',
    type: 'suite',
    pricePerNight: 6500,
    maxGuests: 3,
    bedInfo: '1 king bed',
    amenities: ['City view', 'In-room workspace', 'Complimentary minibar'],
    cancellationPolicy: 'Free cancellation until 24h before check-in',
    images: [{ url: '/uploads/rooms/aurora-deluxe-room.jpg', filename: 'aurora-deluxe-room.jpg' }],
  },
  {
    listingTitle: 'Aurora Suites Downtown',
    title: 'Twin Executive Room',
    type: 'double',
    pricePerNight: 5200,
    maxGuests: 2,
    bedInfo: '2 twin beds',
    amenities: ['Work desk', 'Rain shower', 'Tea/coffee station'],
    cancellationPolicy: '50% refund until 24h before check-in',
    images: [{ url: '/uploads/rooms/aurora-twin-room.jpg', filename: 'aurora-twin-room.jpg' }],
  },
  {
    listingTitle: 'Marina Bay Residences',
    title: 'Sea View Deluxe',
    type: 'double',
    pricePerNight: 5800,
    maxGuests: 3,
    bedInfo: '1 queen bed + sofa bed',
    amenities: ['Ocean balcony', 'Evening turndown', 'In-room dining'],
    cancellationPolicy: 'Free cancellation until 48h before check-in',
    images: [{ url: '/uploads/rooms/marina-sea-view.jpg', filename: 'marina-sea-view.jpg' }],
  },
  {
    listingTitle: 'Palm Grove Retreat',
    title: 'Garden Villa',
    type: 'suite',
    pricePerNight: 9200,
    maxGuests: 4,
    bedInfo: '1 king bed + 1 sofa bed',
    amenities: ['Private plunge pool', 'Outdoor shower', 'Butler on call'],
    cancellationPolicy: 'Free cancellation until 72h before check-in',
    images: [{ url: '/uploads/rooms/palm-villa.jpg', filename: 'palm-villa.jpg' }],
  },
];

async function ensureDemoOwner() {
  const existing = await User.findOne({ email: DEMO_OWNER.email });
  if (existing) {
    console.log(`ℹ️ Demo owner already exists (${existing.email})`);
    return existing;
  }

  const created = await User.create({
    ...DEMO_OWNER,
    role: 'owner',
    authProvider: 'local',
    isVerified: true,
  });
  console.log(`✅ Demo owner created (${created.email})`);
  return created;
}

async function seedDemoData() {
  await connectDB();

  const owner = await ensureDemoOwner();

  const listingTitles = demoListings.map((l) => l.title);
  await Listing.deleteMany({ title: { $in: listingTitles } });
  console.log(`🧹 Cleared existing demo listings: ${listingTitles.join(', ')}`);

  const createdListings = [];
  for (const listing of demoListings) {
    const created = await Listing.create({
      ...listing,
      ownerId: owner._id,
      updatedAt: new Date(),
    });
    createdListings.push(created);
    console.log(`✅ Listing created: ${created.title}`);
  }

  const listingMap = createdListings.reduce((acc, listing) => {
    acc[listing.title] = listing;
    return acc;
  }, {});

  const roomTitles = demoRooms.map((r) => r.title);
  await Room.deleteMany({ title: { $in: roomTitles } });
  console.log(`🧹 Cleared existing demo rooms: ${roomTitles.join(', ')}`);

  for (const room of demoRooms) {
    const listing = listingMap[room.listingTitle];
    if (!listing) {
      console.warn(`⚠️ Skipping room "${room.title}" - listing not found`);
      continue;
    }
    const { listingTitle, ...roomData } = room;
    const created = await Room.create({
      ...roomData,
      listingId: listing._id,
      updatedAt: new Date(),
    });
    console.log(`✅ Room created: ${created.title} (for ${listing.title})`);
  }

  console.log('🎉 Demo data seeded successfully');
  process.exit(0);
}

seedDemoData().catch((err) => {
  console.error('❌ Failed to seed demo data:', err);
  process.exit(1);
});
