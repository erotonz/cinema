const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Obtenir tous les avis (pour l'interface organisateur)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtenir les avis pour un film spécifique
router.get('/movie/:movieId', async (req, res) => {
  try {
    const reviews = await Review.find({ movieId: req.params.movieId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer un nouvel avis
router.post('/', protect, async (req, res) => {
  try {
    // Vérifier que movieId est fourni
    if (!req.body.movieId) {
      return res.status(400).json({ message: 'ID du film requis' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const review = new Review({
      userId: req.user.id,
      movieId: req.body.movieId,
      userName: user.username,
      rating: req.body.rating,
      comment: req.body.comment
    });

    const newReview = await review.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un avis (uniquement pour les organisateurs et admins)
router.delete('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'admin' && user.role !== 'organizer')) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Avis non trouvé' });
    }

    await Review.deleteOne({ _id: req.params.id });
    res.json({ message: 'Avis supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 