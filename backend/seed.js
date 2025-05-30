const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./models/Movie');

dotenv.config();

const movies = [
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    image: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    rating: 9.0,
    duration: '2h 32min',
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    genre: ['Action', 'Crime', 'Drama'],
    releaseDate: '2008-07-18',
    showtimes: [
      {
        time: '14:30',
        seats: Array.from({ length: 80 }, (_, i) => ({
          number: `${Math.floor(i/10 + 1)}-${(i%10 + 1)}`,
          isBooked: false
        }))
      },
      {
        time: '18:00',
        seats: Array.from({ length: 80 }, (_, i) => ({
          number: `${Math.floor(i/10 + 1)}-${(i%10 + 1)}`,
          isBooked: false
        }))
      },
      {
        time: '21:30',
        seats: Array.from({ length: 80 }, (_, i) => ({
          number: `${Math.floor(i/10 + 1)}-${(i%10 + 1)}`,
          isBooked: false
        }))
      }
    ]
  },
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    image: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    rating: 8.8,
    duration: '2h 28min',
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Ellen Page'],
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    releaseDate: '2010-07-16',
    showtimes: [
      {
        time: '15:00',
        seats: Array.from({ length: 80 }, (_, i) => ({
          number: `${Math.floor(i/10 + 1)}-${(i%10 + 1)}`,
          isBooked: false
        }))
      },
      {
        time: '18:30',
        seats: Array.from({ length: 80 }, (_, i) => ({
          number: `${Math.floor(i/10 + 1)}-${(i%10 + 1)}`,
          isBooked: false
        }))
      }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    await Movie.deleteMany({}); // Clear existing movies
    await Movie.insertMany(movies);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB(); 