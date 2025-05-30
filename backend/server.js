const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { protect } = require('./middleware/auth');

// Load env vars
dotenv.config();

// Définissez explicitement l'URI MongoDB si la variable d'environnement n'est pas définie
const MONGODB_URI = 'mongodb://localhost:27017/cinema';
console.log('MongoDB URI:', MONGODB_URI);

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use('/static', express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB Connected Successfully');
  // Log database name
  console.log('Database:', mongoose.connection.name);
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/users', protect, require('./routes/users'));
app.use('/api/images', require('./routes/images'));
app.use('/api/reviews', require('./routes/reviews'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

// Utilisez le port 5001
const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 