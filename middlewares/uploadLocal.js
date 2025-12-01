import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Create upload folders if they don’t exist
const createUploadFolders = () => {
  const folders = [
    path.join(__dirname, '../uploads/images'),
    path.join(__dirname, '../uploads/documents'),
    path.join(__dirname, '../uploads/kyc'),
    path.join(__dirname, '../uploads/listings'),
    path.join(__dirname, '../uploads/rooms'), // ✅ added folder for room images
  ];

  folders.forEach((folder) => {
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  });
};
createUploadFolders();

// ✅ Common storage config for generic uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, path.join(__dirname, '../uploads/images'));
    } else if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, path.join(__dirname, '../uploads/documents'));
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// ✅ File filter (only images & documents)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and documents allowed.'), false);
  }
};

// ✅ Base upload instance (5MB limit)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ✅ Export middlewares for general usage
export const uploadSingleImage = upload.single('image');
export const uploadMultipleImages = upload.array('images', 5);
export const uploadSingleDocument = upload.single('document');
export const uploadMultipleDocuments = upload.array('documents', 5);

// ✅ Separate KYC storage setup
const kycStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/kyc'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const kycFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Only images and PDF files are allowed'), false);
};

// ✅ Export upload for KYC (profile, aadhar, pan)
export const uploadKycFiles = multer({
  storage: kycStorage,
  fileFilter: kycFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
]);

// ✅ Separate Listing images upload
const listingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/listings'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `listing-${unique}${path.extname(file.originalname)}`);
  },
});

const listingFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPG, PNG, and WEBP formats are allowed'), false);
};

export const uploadListingImages = multer({
  storage: listingStorage,
  fileFilter: listingFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ✅ Separate Room images upload (NEW)
const roomStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/rooms'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `room-${unique}${path.extname(file.originalname)}`);
  },
});

const roomFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPG, PNG, and WEBP formats are allowed'), false);
};

export const uploadRoomImages = multer({
  storage: roomStorage,
  fileFilter: roomFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
