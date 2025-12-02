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
    title: 'Ahmedabad Central Suites',
    description: 'Business-friendly suites in Navrangpura with skyline views and a cozy rooftop lounge.',
    coverImage: '/uploads/listings/aurora-facade.jpg',
    images: [
      { url: '/uploads/listings/aurora-facade.jpg', filename: 'aurora-facade.jpg' },
      { url: '/uploads/listings/aurora-lounge.jpg', filename: 'aurora-lounge.jpg' },
    ],
    address: {
      line1: 'Navrangpura',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      pincode: '380009',
    },
    location: {
      type: 'Point',
      coordinates: [72.5714, 23.0225],
    },
    amenities: ['High-speed Wi-Fi', 'Rooftop pool', 'Airport pickup', 'Breakfast included'],
    policies: ['No smoking indoors', 'Check-in after 2 PM', 'Late checkout on request'],
    status: 'published',
  },
  {
    title: 'Surat Riverside Hotel',
    description: 'Sea-facing stay along the Tapi riverfront with airy rooms and a laid-back café.',
    coverImage: '/uploads/listings/marina-exterior.jpg',
    images: [
      { url: '/uploads/listings/marina-exterior.jpg', filename: 'marina-exterior.jpg' },
      { url: '/uploads/listings/marina-lobby.jpg', filename: 'marina-lobby.jpg' },
    ],
    address: {
      line1: 'Tapi Riverfront',
      city: 'Surat',
      state: 'Gujarat',
      country: 'India',
      pincode: '395007',
    },
    location: {
      type: 'Point',
      coordinates: [72.8311, 21.1702],
    },
    amenities: ['Beach access', 'Complimentary breakfast', 'Evening live music', 'Pool & cabanas'],
    policies: ['Pets allowed on request', 'ID required at check-in'],
    status: 'published',
  },
  {
    title: 'Vadodara Palace Stay',
    description: 'Tropical-style boutique stay near Laxmi Vilas with private patios and outdoor showers.',
    coverImage: '/uploads/listings/palm-resort.jpg',
    images: [
      { url: '/uploads/listings/palm-resort.jpg', filename: 'palm-resort.jpg' },
      { url: '/uploads/listings/palm-pool.jpg', filename: 'palm-pool.jpg' },
    ],
    address: {
      line1: 'Laxmi Vilas Palace Road',
      city: 'Vadodara',
      state: 'Gujarat',
      country: 'India',
      pincode: '390001',
    },
    location: {
      type: 'Point',
      coordinates: [73.1812, 22.3072],
    },
    amenities: ['Private plunge pool', 'Spa access', 'In-villa dining', '24/7 concierge'],
    policies: ['Quiet hours after 10 PM', 'No parties'],
    status: 'published',
  },
  {
    title: 'Rajkot Business Inn',
    description: 'Modern business hotel near Race Course Ring Road with quick access to the airport.',
    coverImage: '/uploads/listings/aurora-lounge.jpg',
    images: [
      { url: '/uploads/listings/aurora-lounge.jpg', filename: 'aurora-lounge.jpg' },
      { url: '/uploads/listings/aurora-facade.jpg', filename: 'aurora-facade.jpg' },
    ],
    address: {
      line1: 'Race Course Ring Road',
      city: 'Rajkot',
      state: 'Gujarat',
      country: 'India',
      pincode: '360001',
    },
    location: {
      type: 'Point',
      coordinates: [70.7833, 22.3039],
    },
    amenities: ['Conference hall', 'Airport shuttle', 'High-speed Wi-Fi', 'Breakfast included'],
    policies: ['Check-in after 12 PM', 'ID required at check-in'],
    status: 'published',
  },
];

const demoRooms = [
  {
    listingTitle: 'Ahmedabad Central Suites',
    title: 'Navrangpura Deluxe',
    type: 'suite',
    pricePerNight: 6500,
    maxGuests: 3,
    bedInfo: '1 king bed',
    amenities: ['City view', 'In-room workspace', 'Complimentary minibar'],
    cancellationPolicy: 'Free cancellation until 24h before check-in',
    images: [{ url: '/uploads/rooms/aurora-deluxe-room.jpg', filename: 'aurora-deluxe-room.jpg' }],
  },
  {
    listingTitle: 'Surat Riverside Hotel',
    title: 'Riverside Queen',
    type: 'double',
    pricePerNight: 5200,
    maxGuests: 2,
    bedInfo: '1 queen bed',
    amenities: ['River view', 'Evening turndown', 'In-room dining'],
    cancellationPolicy: 'Free cancellation until 48h before check-in',
    images: [{ url: '/uploads/rooms/marina-sea-view.jpg', filename: 'marina-sea-view.jpg' }],
  },
  {
    listingTitle: 'Vadodara Palace Stay',
    title: 'Palace Heritage Suite',
    type: 'suite',
    pricePerNight: 9200,
    maxGuests: 4,
    bedInfo: '1 king bed + 1 sofa bed',
    amenities: ['Private plunge pool', 'Outdoor shower', 'Butler on call'],
    cancellationPolicy: 'Free cancellation until 72h before check-in',
    images: [{ url: '/uploads/rooms/palm-villa.jpg', filename: 'palm-villa.jpg' }],
  },
  {
    listingTitle: 'Rajkot Business Inn',
    title: 'Business King',
    type: 'double',
    pricePerNight: 4800,
    maxGuests: 2,
    bedInfo: '1 king bed',
    amenities: ['Work desk', 'Airport shuttle', 'High-speed Wi-Fi'],
    cancellationPolicy: '50% refund until 24h before check-in',
    images: [{ url: '/uploads/rooms/aurora-twin-room.jpg', filename: 'aurora-twin-room.jpg' }],
  },
];

// Old demo titles to clean up when reseeding
const legacyListingTitles = ['Aurora Suites Downtown', 'Marina Bay Residences', 'Palm Grove Retreat'];
const legacyRoomTitles = ['Deluxe King Suite', 'Twin Executive Room', 'Sea View Deluxe', 'Garden Villa'];

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
  await Listing.deleteMany({ title: { $in: [...listingTitles, ...legacyListingTitles] } });
  console.log(`🧹 Cleared existing demo listings: ${[...listingTitles, ...legacyListingTitles].join(', ')}`);

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
  await Room.deleteMany({ title: { $in: [...roomTitles, ...legacyRoomTitles] } });
  console.log(`🧹 Cleared existing demo rooms: ${[...roomTitles, ...legacyRoomTitles].join(', ')}`);

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
