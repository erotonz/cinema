import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Grid, Card, CardContent, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ReviewList from '../components/ReviewList';
import { api } from '../services/api';

const OrganizerDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/reviews');
        const reviews = response.data;
        
        // Calculate statistics
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews 
          : 0;
        
        setStats({
          totalReviews,
          averageRating: parseFloat(averageRating.toFixed(1))
        });
      } catch (error) {
        console.error('Error fetching review statistics:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tableau de Bord Organisateur
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Nombre total d'avis
                </Typography>
                <Typography variant="h3">{stats.totalReviews}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Note moyenne
                </Typography>
                <Typography variant="h3">{stats.averageRating} / 5</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Outils de l'Organisateur
          </Typography>
          
          <Button
            component={RouterLink}
            to="/scanner"
            variant="contained"
            color="primary"
            startIcon={<QrCodeScannerIcon />}
            sx={{ mt: 2 }}
          >
            Scanner les QR Codes d'Entrée
          </Button>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Utilisez le scanner pour vérifier les billets des clients à l'entrée du cinéma.
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Modération des Commentaires
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            En tant qu'organisateur, vous pouvez supprimer les commentaires inappropriés en cliquant sur l'icône de suppression.
          </Typography>
        </Paper>

        <ReviewList />
      </Box>
    </Container>
  );
};

export default OrganizerDashboard; 