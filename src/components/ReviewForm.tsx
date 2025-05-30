import React, { useState } from 'react';
import { Box, TextField, Button, Rating, Typography, Paper, Alert } from '@mui/material';
import { api } from '../services/api';

interface ReviewFormProps {
  onReviewSubmitted: () => void;
  movieId: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onReviewSubmitted, movieId }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      setError('Veuillez donner une note');
      return;
    }

    if (!comment.trim()) {
      setError('Veuillez écrire un commentaire');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté pour soumettre un avis');
        return;
      }

      await api.post(
        '/reviews',
        {
          rating,
          comment,
          movieId
        }
      );

      setSuccess('Votre avis a été soumis avec succès');
      setRating(null);
      setComment('');
      onReviewSubmitted();
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Une erreur est survenue lors de la soumission de votre avis');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, margin: '0 auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Donnez votre avis
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <Typography component="legend">Note</Typography>
          <Rating
            value={rating}
            onChange={(_, newValue) => {
              setRating(newValue);
              setError('');
            }}
          />
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Votre commentaire"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setError('');
          }}
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
        >
          Soumettre
        </Button>
      </Box>
    </Paper>
  );
};

export default ReviewForm; 