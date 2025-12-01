import express from 'express';
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleDocument,
  uploadMultipleDocuments,
} from '../middlewares/uploadLocal.js';
import {
  uploadSingleImageController,
  uploadMultipleImagesController,
  uploadSingleDocumentController,
  uploadMultipleDocumentsController,
} from '../controllers/uploadController.js';
import protect from '../middlewares/auth.js';

const router = express.Router();

// Images
router.post('/upload/image', protect, uploadSingleImage, uploadSingleImageController);
router.post('/upload/images', protect ,uploadMultipleImages, uploadMultipleImagesController);

// Documents
router.post('/upload/document',protect , uploadSingleDocument, uploadSingleDocumentController);
router.post('/upload/documents',protect , uploadMultipleDocuments, uploadMultipleDocumentsController);

export default router;
