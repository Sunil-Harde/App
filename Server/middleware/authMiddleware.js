// const jwt = require('jsonwebtoken');
// const User = require('../models/Users');

// const protect = async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     try {
//       token = req.headers.authorization.split(' ')[1];

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       req.user = await User.findById(decoded.id).select('-password');

//       next();
//     } catch (error) {
//       console.error(error);
//       res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   }

//   if (!token) {
//     res.status(401).json({ message: 'Not authorized, no token' });
//   }
// };

// const admin = (req, res, next) => {
//   if (req.user && req.user.isAdmin) {
//     next();
//   } else {
//     res.status(401).json({ message: 'Not authorized as an admin' });
//   }
// };

// module.exports = { protect, admin };

































const User = require('../models/Users');

// 1. Fake Login (Protect)
const protect = async (req, res, next) => {
  try {
    // SECURITY OFF: Find the first user (Admin) and use them
    const user = await User.findOne({}); 

    if (!user) {
      return res.status(401).json({ message: 'No users in DB to fake login!' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Auth Failed' });
  }
};

// 2. Fake Admin Check (Admin)
// This was missing! We need to add it back so adminRoutes doesn't crash.
const admin = (req, res, next) => {
  // Just say "Yes, this is an admin" and let them pass
  next();
};

// Export BOTH functions
module.exports = { protect, admin };