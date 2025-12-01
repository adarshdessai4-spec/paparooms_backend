import Kyc from '../models/Kyc.js';
import User from '../models/User.js';
// ===============================
// CREATE KYC
// ===============================
export const createKyc = async (req, res) => {
  try {
    const { bankDetails } = req.body;
    const files = req.files;
    // Check required documents
    if (!files.profilePhoto || !files.aadharCard || !files.panCard) {
      return res.status(400).json({
        success: false,
        message: 'All files (profilePhoto, aadharCard, panCard) are required',
      });
    }
    // Parse bank details from form-data
    let parsedBank = {};
    if (bankDetails) {
      parsedBank = JSON.parse(bankDetails);
    }
    const kycData = {
      user: req.user._id,
      profilePhoto: `${req.protocol}://${req.get('host')}/uploads/kyc/${files.profilePhoto[0].filename}`,
      aadharCard: `${req.protocol}://${req.get('host')}/uploads/kyc/${files.aadharCard[0].filename}`,
      panCard: `${req.protocol}://${req.get('host')}/uploads/kyc/${files.panCard[0].filename}`,
      bankName: parsedBank.bankName,
      accountName: parsedBank.accountName,
      accountNumber: parsedBank.accountNumber,
      ifscCode: parsedBank.ifscCode,
      accountType: parsedBank.accountType,
      branch: parsedBank.branch,
      status: 'pending',
    };
    const newKyc = await Kyc.create(kycData);
    // Update User with reference and status
    await User.findByIdAndUpdate(req.user._id, {
      kyc: newKyc._id,
      'ownerProfile.kyc.status': 'pending',
      'ownerProfile.kyc.rejectionReason': null,
    });
    res.status(201).json({
      success: true,
      message: 'KYC submitted successfully',
      data: newKyc,
    });
  } catch (err) {
    console.error('createKyc error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};
// ===============================
// UPDATE / RESUBMIT KYC
// ===============================
export const updateKyc = async (req, res) => {
  try {
    const { id } = req.params; // :small_blue_diamond: Get KYC ID from URL
    const { bankDetails } = req.body;
    const files = req.files;
    // :small_blue_diamond: Find the KYC record by ID and verify it belongs to the logged-in user
    const kyc = await Kyc.findOne({ _id: id, user: req.user._id });
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC not found or not authorized',
      });
    }
    // :small_blue_diamond: Prevent resubmission if status is still pending or already approved
    if (kyc.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'KYC is under review. You cannot resubmit at this time.',
      });
    }
    if (kyc.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'KYC has already been approved and cannot be updated.',
      });
    }
    // :small_blue_diamond: Update uploaded files (if any)
    if (files?.profilePhoto) {
      kyc.profilePhoto = `${req.protocol}://${req.get('host')}/uploads/kyc/${files.profilePhoto[0].filename}`;
    }
    if (files?.aadharCard) {
      kyc.aadharCard = `${req.protocol}://${req.get('host')}/uploads/kyc/${files.aadharCard[0].filename}`;
    }
    if (files?.panCard) {
      kyc.panCard = `${req.protocol}://${req.get('host')}/uploads/kyc/${files.panCard[0].filename}`;
    }
    // :small_blue_diamond: Parse and update bank details
    if (bankDetails) {
      const parsedBank = JSON.parse(bankDetails);
      kyc.bankName = parsedBank.bankName || kyc.bankName;
      kyc.accountName = parsedBank.accountName || kyc.accountName;
      kyc.accountNumber = parsedBank.accountNumber || kyc.accountNumber;
      kyc.ifscCode = parsedBank.ifscCode || kyc.ifscCode;
      kyc.accountType = parsedBank.accountType || kyc.accountType;
      kyc.branch = parsedBank.branch || kyc.branch;
    }
    // :small_blue_diamond: Keep old rejection reason
    const existingReason = kyc.rejectionReason;
    // :small_blue_diamond: Set status to resubmitted
    kyc.status = 'resubmitted';
    kyc.rejectionReason = existingReason || null;
    await kyc.save();
    // :small_blue_diamond: Update user profile for sync
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        'ownerProfile.kyc.status': 'resubmitted',
        'ownerProfile.kyc.rejectionReason': existingReason || null,
      },
    });
    res.status(200).json({
      success: true,
      message: 'KYC resubmitted successfully',
      data: kyc,
    });
  } catch (err) {
    console.error('updateKyc error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};