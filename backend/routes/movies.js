const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { protect } = require('../middleware/auth');
const { cancelMovieSession } = require('../services/notificationService');
const organizerAuth = require('../middleware/organizerAuth');

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

// Nouveau middleware pour vérifier si l'utilisateur est admin ou organisateur
const isAdminOrOrganizer = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'organizer')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Access denied: Admin or Organizer only'
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

    // Extract city, theater, and time from query parameters
    const { city, theater, time } = req.query;

    // If city, theater, and time are provided, filter down to the specific showtime
    if (city && theater && time) {
      const selectedCity = movie.cities.find(c => c.name === city);
      
      if (selectedCity) {
        const selectedTheater = selectedCity.theaters.find(t => t.name === theater);
        
        if (selectedTheater) {
          const selectedShowtime = selectedTheater.showtimes.find(s => s.time === time);
          
          if (selectedShowtime) {
            // Return movie with only the selected showtime and its seats
            const movieWithShowtime = {
              ...movie.toObject(), // Convert Mongoose document to plain object
              cities: [{
                ...selectedCity.toObject(),
                theaters: [{
                  ...selectedTheater.toObject(),
                  showtimes: [selectedShowtime.toObject()]
                }]
              }]
            };
             return res.status(200).json({
              success: true,
              data: movieWithShowtime
            });
          }
        }
      }
       // If showtime not found for provided parameters
        return res.status(404).json({
          success: false,
          error: 'Showtime not found for the provided city, theater, and time'
        });

    } else {
       // If no showtime parameters are provided, return the full movie object (as before)
        res.status(200).json({
          success: true,
          data: movie
        });
    }

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
    // Generate seats array for each showtime based on numberOfSeats
    if (req.body.cities) {
      req.body.cities.forEach(city => {
        if (city.theaters) {
          city.theaters.forEach(theater => {
            if (theater.showtimes) {
              theater.showtimes.forEach(showtime => {
                if (showtime.numberOfSeats !== undefined) {
                  showtime.seats = Array.from({ length: showtime.numberOfSeats }, (_, i) => ({
                    number: (i + 1).toString(), // Simple seat numbering (1, 2, 3...)
                    isBooked: false
                  }));
                  delete showtime.numberOfSeats; // Remove numberOfSeats as it's not needed after generating seats
                }
              });
            }
          });
        }
      });
    }

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
    // Generate seats array for each showtime based on numberOfSeats
    if (req.body.cities) {
      req.body.cities.forEach(city => {
        if (city.theaters) {
          city.theaters.forEach(theater => {
            if (theater.showtimes) {
              theater.showtimes.forEach(showtime => {
                // Only generate seats if numberOfSeats is provided and seats array does not exist or is empty
                // This prevents overwriting existing seat bookings when updating other movie details
                if (showtime.numberOfSeats !== undefined && (!showtime.seats || showtime.seats.length === 0)) {
                   showtime.seats = Array.from({ length: showtime.numberOfSeats }, (_, i) => ({
                    number: (i + 1).toString(), // Simple seat numbering (1, 2, 3...)
                    isBooked: false
                  }));
                   delete showtime.numberOfSeats; // Remove numberOfSeats
                } else if (showtime.numberOfSeats !== undefined && showtime.seats && showtime.seats.length > 0) {
                   // If numberOfSeats is provided and seats already exist, check if the number changed
                   if (showtime.numberOfSeats > showtime.seats.length) {
                      // Add new seats if the number increased
                       const existingSeatsCount = showtime.seats.length;
                       for (let i = existingSeatsCount; i < showtime.numberOfSeats; i++) {
                           showtime.seats.push({
                              number: (i + 1).toString(),
                              isBooked: false
                           });
                       }
                   } else if (showtime.numberOfSeats < showtime.seats.length) {
                       // If the number decreased, truncate the array (be careful with existing bookings!)
                       // A more robust solution would handle this more gracefully, perhaps marking seats as unavailable.
                       // For simplicity, we'll just truncate, which might remove booked seats.
                       showtime.seats = showtime.seats.slice(0, showtime.numberOfSeats);
                   }
                    delete showtime.numberOfSeats; // Remove numberOfSeats
                }
              });
            }
          });
        }
      });
    }

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

// @desc    Cancel a movie session and notify users
// @route   POST /api/movies/:id/cancel-session
// @access  Private/Admin
router.post('/:id/cancel-session', protect, isAdmin, async (req, res) => {
  try {
    const movieId = req.params.id;
    const { showtime } = req.body;

    console.log('Received cancellation request for Movie ID:', movieId);
    console.log('Received cancellation request for Showtime:', showtime);

    if (!showtime) {
      return res.status(400).json({
        success: false,
        error: 'Showtime is required'
      });
    }

    await cancelMovieSession(movieId, showtime);
    
    res.status(200).json({
      success: true,
      message: 'Movie session cancelled successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;