const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false // Par défaut, tous les sièges sont libres
  }
});

const ShowtimeSchema = new mongoose.Schema({
  time: String,
  seats: [SeatSchema]
});

const TheaterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  showtimes: [ShowtimeSchema]
});

const CitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  theaters: [TheaterSchema]
});

const MovieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  image: {
    type: String,
    required: [true, 'Please add an image URL']
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: [0, 'Rating must be at least 0'],
    max: [10, 'Rating cannot be more than 10']
  },
  duration: {
    type: String,
    required: [true, 'Please add a duration']
  },
  director: {
    type: String,
    required: [true, 'Please add a director']
  },
  cast: [{
    type: String
  }],
  genre: [{
    type: String
  }],
  releaseDate: {
    type: Date,
    required: [true, 'Please add a release date']
  },
  cities: [CitySchema],
  isUpcoming: {
    type: Boolean,
    default: false,
    description: 'Indique si le film est à venir ou actuellement à l\'affiche'
  },
  releaseExpectedDate: {
    type: Date,
    description: 'Date de sortie prévue pour les films à venir'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour initialiser les sièges lors de la création d'une séance
MovieSchema.pre('save', function(next) {
  // Pour chaque ville
  this.cities.forEach(city => {
    // Pour chaque théâtre
    city.theaters.forEach(theater => {
      // Pour chaque séance
      theater.showtimes.forEach(showtime => {
        // Si les sièges n'existent pas encore, les initialiser
        if (!showtime.seats || showtime.seats.length === 0) {
          const allSeats = [];
          // Créer tous les sièges de A1 à E10
          for (let row of ['A', 'B', 'C', 'D', 'E']) {
            for (let num = 1; num <= 10; num++) {
              allSeats.push({
                number: `${row}${num}`,
                isBooked: false
              });
            }
          }
          showtime.seats = allSeats;
        }
      });
    });
  });
  next();
});

module.exports = mongoose.model('Movie', MovieSchema); 