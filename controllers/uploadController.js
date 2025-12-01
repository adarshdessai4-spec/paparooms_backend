export const uploadSingleImageController = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No image uploaded' });

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/images/${req.file.filename}`;
    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { filename: req.file.filename, url: fileUrl },
    });
  } catch (err) {
    console.error('uploadSingleImage error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const uploadMultipleImagesController = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: 'No images uploaded' });

    const uploaded = req.files.map((file) => ({
      filename: file.filename,
      url: `${req.protocol}://${req.get('host')}/uploads/images/${file.filename}`,
    }));

    res.status(201).json({
      success: true,
      message: 'Images uploaded successfully',
      data: uploaded,
    });
  } catch (err) {
    console.error('uploadMultipleImages error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const uploadSingleDocumentController = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No document uploaded' });

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/documents/${req.file.filename}`;
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { filename: req.file.filename, url: fileUrl },
    });
  } catch (err) {
    console.error('uploadSingleDocument error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const uploadMultipleDocumentsController = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: 'No documents uploaded' });

    const uploaded = req.files.map((file) => ({
      filename: file.filename,
      url: `${req.protocol}://${req.get('host')}/uploads/documents/${file.filename}`,
    }));

    res.status(201).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: uploaded,
    });
  } catch (err) {
    console.error('uploadMultipleDocuments error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
