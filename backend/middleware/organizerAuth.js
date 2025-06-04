const organizerAuth = (req, res, next) => {
  // Assumes req.user is populated by the previous authentication middleware
  if (req.user && req.user.role === 'organizer') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Access denied: Organizer only'
    });
  }
};

module.exports = organizerAuth; 