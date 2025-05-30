const mongoose = require('mongoose');
const Movie = require('./models/Movie');

async function checkMovies() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/cinema');
    console.log('Connected to MongoDB');
    
    const movies = await Movie.find({});
    console.log(`Found ${movies.length} movies in the database:`);
    
    // Simplified output to ensure all movies are displayed
    const movieList = movies.map(movie => ({
      id: movie._id.toString(),
      title: movie.title
    }));
    
    console.log(JSON.stringify(movieList, null, 2));
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error checking movies:', error);
  }
}

checkMovies();