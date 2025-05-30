const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  movieTitle: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.Mixed, // Permet à la fois ObjectId et String pour les invités
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  showtime: {
    type: String,
    required: [true, 'Please add a showtime']
  },
  seats: [{
    type: String,
    required: [true, 'Please add seats']
  }],
  theater: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  totalPrice: {
    type: Number,
    required: [true, 'Please add a total price']
  },
  paymentInfo: {
    cardNumber: String,
    expiry: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema); 