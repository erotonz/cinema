const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const { sendBookingConfirmation } = require('../services/emailservice');
const mongoose = require('mongoose');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('movie', 'title image');
    
    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      movieId, 
      showtime, 
      seats, 
      theater,
      city,
      cardNumber,
      expiry,
      cvv,
      email,
      name,
      phone,
      movieTitle
    } = req.body;
    
    const userId = req.user ? req.user.id : 'guest';
    
    // Vérifier si le film existe
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(400).json({
        success: false,
        error: 'Film non trouvé'
      });
    }

    // Trouver la ville et le théâtre correspondants
    const selectedCity = movie.cities.find(c => c.name === city);
    if (!selectedCity) {
      return res.status(400).json({
        success: false,
        error: 'Ville non trouvée'
      });
    }

    const selectedTheater = selectedCity.theaters.find(t => t.name === theater);
    if (!selectedTheater) {
      return res.status(400).json({
        success: false,
        error: 'Théâtre non trouvé'
      });
    }

    // Trouver la séance correspondante
    const selectedShowtime = selectedTheater.showtimes.find(s => s.time === showtime);
    if (!selectedShowtime) {
      return res.status(400).json({
        success: false,
        error: 'Séance non trouvée'
      });
    }

    // Vérifier si les places sont disponibles
    const unavailableSeats = [];
    for (const seat of seats) {
      const seatObj = selectedShowtime.seats.find(s => s.number === seat);
      if (seatObj && seatObj.isBooked) {
        unavailableSeats.push(seat);
      }
    }

    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Les places suivantes sont déjà occupées: ${unavailableSeats.join(', ')}`
      });
    }

    // Création des données de réservation
    const bookingData = {
      movie: movieId,
      movieTitle: movieTitle || movie.title,
      user: userId,
      name: name || (req.user ? req.user.username : 'Invité'),
      email: email || (req.user ? req.user.email : ''),
      phone: phone || (req.user ? req.user.phone : ''),
      showtime,
      seats: Array.isArray(seats) ? seats : [seats],
      theater,
      city,
      paymentInfo: {
        cardNumber: cardNumber ? `xxxx-xxxx-xxxx-${cardNumber.slice(-4)}` : null,
        expiry: expiry || null
      },
      totalPrice: seats.length * 40,
      status: 'confirmed',
      createdAt: new Date()
    };

    // Créer la réservation
    const booking = await Booking.create(bookingData);

    // Marquer les places comme occupées
    for (const seat of seats) {
      const seatObj = selectedShowtime.seats.find(s => s.number === seat);
      if (seatObj) {
        seatObj.isBooked = true;
      }
    }

    // Sauvegarder les modifications du film
    await movie.save();

    // Envoyer l'email de confirmation
    try {
      const confirmationEmail = email || (req.user ? req.user.email : null);
      if (confirmationEmail) {
        await sendBookingConfirmation(booking, confirmationEmail);
      }
    } catch (err) {
      console.error('Erreur envoi email:', err);
    }

    res.status(201).json({
      success: true,
      data: {
        ...booking.toObject(),
        paymentInfo: { cardLast4: booking.paymentInfo.cardNumber ? booking.paymentInfo.cardNumber.slice(-4) : null }
      }
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + err.message
    });
  }
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie', 'title image');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Vérifier que l'utilisateur est propriétaire de la réservation
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

// @desc    Get seats status for a specific showtime
// @route   GET /api/bookings/seats-status
// @access  Public
router.get('/seats-status', async (req, res) => {
  try {
    const { movieId, city, theater, showtime } = req.query;

    // Vérifier si le film existe
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(400).json({
        success: false,
        error: 'Film non trouvé'
      });
    }

    // Trouver la ville et le théâtre correspondants
    const selectedCity = movie.cities.find(c => c.name === city);
    if (!selectedCity) {
      return res.status(400).json({
        success: false,
        error: 'Ville non trouvée'
      });
    }

    const selectedTheater = selectedCity.theaters.find(t => t.name === theater);
    if (!selectedTheater) {
      return res.status(400).json({
        success: false,
        error: 'Théâtre non trouvé'
      });
    }

    // Trouver la séance correspondante
    const selectedShowtime = selectedTheater.showtimes.find(s => s.time === showtime);
    if (!selectedShowtime) {
      return res.status(400).json({
        success: false,
        error: 'Séance non trouvée'
      });
    }

    // Retourner l'état des sièges
    res.status(200).json({
      success: true,
      data: {
        seats: selectedShowtime.seats.map(seat => ({
          number: seat.number,
          isBooked: seat.isBooked
        }))
      }
    });
  } catch (err) {
    console.error('Error getting seats status:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

module.exports = router;