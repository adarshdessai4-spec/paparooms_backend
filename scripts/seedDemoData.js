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
  // Gujarat
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
    amenities: ['Riverfront walk', 'Complimentary breakfast', 'Evening live music', 'Pool & cabanas'],
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
  // Other cities
  {
    title: 'Mumbai Harbour Heights',
    description: 'Bay-facing rooms near Colaba Causeway with rooftop bar and late check-out.',
    coverImage: '/uploads/listings/marina-exterior.jpg',
    images: [
      { url: '/uploads/listings/marina-exterior.jpg', filename: 'marina-exterior.jpg' },
      { url: '/uploads/listings/marina-lobby.jpg', filename: 'marina-lobby.jpg' },
    ],
    address: {
      line1: 'Colaba Causeway',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400005',
    },
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760],
    },
    amenities: ['Rooftop bar', 'Late checkout', 'Airport pickup', 'Breakfast included'],
    policies: ['No smoking indoors', 'Check-in after 2 PM'],
    status: 'published',
  },
  {
    title: 'Delhi City Center Inn',
    description: 'Central business stay near Connaught Place with metro access and co-work lounge.',
    coverImage: '/uploads/listings/aurora-facade.jpg',
    images: [
      { url: '/uploads/listings/aurora-facade.jpg', filename: 'aurora-facade.jpg' },
      { url: '/uploads/listings/aurora-lounge.jpg', filename: 'aurora-lounge.jpg' },
    ],
    address: {
      line1: 'Connaught Place',
      city: 'Delhi',
      state: 'Delhi NCR',
      country: 'India',
      pincode: '110001',
    },
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139],
    },
    amenities: ['Co-work lounge', 'Metro access', 'Breakfast included', 'Gym'],
    policies: ['ID required at check-in'],
    status: 'published',
  },
  {
    title: 'Bangalore Tech Park Stay',
    description: 'Smart rooms near Outer Ring Road with work pods and evening snacks.',
    coverImage: '/uploads/listings/aurora-lounge.jpg',
    images: [
      { url: '/uploads/listings/aurora-lounge.jpg', filename: 'aurora-lounge.jpg' },
      { url: '/uploads/listings/aurora-facade.jpg', filename: 'aurora-facade.jpg' },
    ],
    address: {
      line1: 'Outer Ring Road',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      pincode: '560103',
    },
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716],
    },
    amenities: ['Work pods', 'Evening snacks', 'Airport shuttle'],
    policies: ['Quiet hours after 10 PM'],
    status: 'published',
  },
  {
    title: 'Chennai Marina View',
    description: 'Beachfront stay on Marina Beach with airy balconies and coastal breakfast.',
    coverImage: '/uploads/listings/palm-resort.jpg',
    images: [
      { url: '/uploads/listings/palm-resort.jpg', filename: 'palm-resort.jpg' },
      { url: '/uploads/listings/palm-pool.jpg', filename: 'palm-pool.jpg' },
    ],
    address: {
      line1: 'Marina Beach Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '600001',
    },
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827],
    },
    amenities: ['Coastal breakfast', 'Balcony rooms', '24/7 concierge'],
    policies: ['No parties'],
    status: 'published',
  },
  {
    title: 'Goa Beachfront Villas',
    description: 'Laid-back villas with cabanas, pool bar, and direct access to the beach.',
    coverImage: '/uploads/listings/palm-pool.jpg',
    images: [
      { url: '/uploads/listings/palm-pool.jpg', filename: 'palm-pool.jpg' },
      { url: '/uploads/listings/palm-resort.jpg', filename: 'palm-resort.jpg' },
    ],
    address: {
      line1: 'Candolim Beach Road',
      city: 'Goa',
      state: 'Goa',
      country: 'India',
      pincode: '403515',
    },
    location: {
      type: 'Point',
      coordinates: [73.8567, 15.4909],
    },
    amenities: ['Pool bar', 'Cabanas', 'Evening live music', 'Breakfast included'],
    policies: ['Pets allowed on request'],
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
  {
    listingTitle: 'Mumbai Harbour Heights',
    title: 'Harbour Premium',
    type: 'double',
    pricePerNight: 7800,
    maxGuests: 3,
    bedInfo: '1 queen bed + sofa bed',
    amenities: ['Sea view', 'Late checkout', 'Breakfast included'],
    cancellationPolicy: 'Free cancellation until 48h before check-in',
    images: [{ url: '/uploads/rooms/marina-sea-view.jpg', filename: 'marina-sea-view.jpg' }],
  },
  {
    listingTitle: 'Delhi City Center Inn',
    title: 'Connaught Executive',
    type: 'double',
    pricePerNight: 6400,
    maxGuests: 2,
    bedInfo: '1 king bed',
    amenities: ['Co-work lounge access', 'High-speed Wi-Fi', 'Breakfast included'],
    cancellationPolicy: 'Free cancellation until 24h before check-in',
    images: [{ url: '/uploads/rooms/aurora-deluxe-room.jpg', filename: 'aurora-deluxe-room.jpg' }],
  },
  {
    listingTitle: 'Bangalore Tech Park Stay',
    title: 'Tech Park Studio',
    type: 'double',
    pricePerNight: 6100,
    maxGuests: 2,
    bedInfo: '1 queen bed',
    amenities: ['Work pod', 'Evening snacks', 'Gym access'],
    cancellationPolicy: '50% refund until 24h before check-in',
    images: [{ url: '/uploads/rooms/aurora-twin-room.jpg', filename: 'aurora-twin-room.jpg' }],
  },
  {
    listingTitle: 'Chennai Marina View',
    title: 'Marina Balcony Room',
    type: 'double',
    pricePerNight: 5900,
    maxGuests: 3,
    bedInfo: '1 queen bed + sofa bed',
    amenities: ['Sea-facing balcony', 'Coastal breakfast', 'In-room dining'],
    cancellationPolicy: 'Free cancellation until 48h before check-in',
    images: [{ url: '/uploads/rooms/marina-sea-view.jpg', filename: 'marina-sea-view.jpg' }],
  },
  {
    listingTitle: 'Goa Beachfront Villas',
    title: 'Beachfront Villa',
    type: 'suite',
    pricePerNight: 9800,
    maxGuests: 4,
    bedInfo: '1 king bed + 1 sofa bed',
    amenities: ['Pool bar', 'Cabanas', 'Evening live music'],
    cancellationPolicy: 'Free cancellation until 72h before check-in',
    images: [{ url: '/uploads/rooms/palm-villa.jpg', filename: 'palm-villa.jpg' }],
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
