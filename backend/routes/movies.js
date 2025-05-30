const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { protect } = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Access denied: Admin only'
    });
  }
};

// @desc    Get all current movies (not upcoming)
// @route   GET /api/movies
// @access  Public
router.get('/', async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isUpcoming: { $ne: true } };
    const movies = await Movie.find(filter);
    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Get all upcoming movies
// @route   GET /api/movies/upcoming
// @access  Public
router.get('/upcoming', async (req, res) => {
  try {
    const movies = await Movie.find({ isUpcoming: true });
    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }

    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private/Admin
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      success: true,
      data: movie
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

// @desc    Create new upcoming movie
// @route   POST /api/movies/upcoming
// @access  Private/Admin
router.post('/upcoming', protect, isAdmin, async (req, res) => {
  try {
    const movieData = {
      ...req.body,
      isUpcoming: true
    };
    const movie = await Movie.create(movieData);
    res.status(201).json({
      success: true,
      data: movie
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }

    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

// @desc    Move movie from upcoming to current
// @route   PUT /api/movies/:id/release
// @access  Private/Admin
router.put('/:id/release', protect, isAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id, 
      { 
        isUpcoming: false,
        releaseDate: new Date() // Met à jour la date de sortie à aujourd'hui
      }, 
      {
        new: true,
        runValidators: true
      }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }

    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;