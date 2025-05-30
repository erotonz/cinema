import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Rating, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { getCurrentUser } from '../services/auth';
import { api } from '../services/api';

interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  movieId: string;
}

interface ReviewListProps {
  movieId?: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ movieId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const user = getCurrentUser();
  const canModerate = user?.role === 'admin' || user?.role === 'organizer';

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        let url = '/reviews';
        if (movieId) {
          url = `/reviews/movie/${movieId}`;
        }
        const response = await api.get(url);
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, [movieId]);

  const handleDeleteReview = async (reviewId: string) => {
    try {
      // Use the api service which already has the token interceptor
      await api.delete(`/reviews/${reviewId}`);
      
      // Remove the deleted review from the state
      setReviews(reviews.filter(review => review._id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Avis des Utilisateurs
      </Typography>
      <Paper elevation={3}>
        <List>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <React.Fragment key={review._id}>
                <ListItem 
                  alignItems="flex-start"
                  secondaryAction={
                    canModerate && (
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleDeleteReview(review._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{review.userName}</Typography>
                        <Rating value={review.rating} readOnly size="small" />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block', mt: 1 }}
                        >
                          {review.comment}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 1 }}
                        >
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < reviews.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="Aucun avis pour le moment." />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default ReviewList; 