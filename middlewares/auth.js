import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  try {
    // Get token from cookie or header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // No token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }
    console.log('JWT header check:', token.split('.')[0]);
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // ✅ Force HS256
    });

    // Find user in database (check both id and _id for compatibility)
    const user = await User.findById(decoded.id || decoded._id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or token invalid'
      });
    }

    // Attach user to request object
    req.user = {
      id: user._id,
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

export default protect;
