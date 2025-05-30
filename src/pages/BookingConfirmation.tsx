import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Grid, 
  Divider,
  Alert
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QRCodeDisplay from '../components/QRCodeDisplay';

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<any>(null);
  
  useEffect(() => {
    // Check if booking data was passed through location state
    if (location.state && location.state.booking) {
      setBookingData(location.state.booking);
    } else {
      // If no booking data is available, we could either:
      // 1. Redirect to the home page
      // 2. Show an error message
      // 3. Try to fetch the most recent booking from the API
      
      // For now, let's just show an error message
      console.error('No booking data available');
    }
  }, [location]);

  const handleReturnHome = () => {
    navigate('/');
  };

  if (!bookingData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Aucune information de réservation n'a été trouvée. Veuillez vérifier votre email pour les détails de votre réservation.
        </Alert>
        <Button variant="contained" onClick={handleReturnHome}>
          Retour à l'accueil
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Réservation Confirmée
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Votre réservation a été confirmée avec succès. Un email de confirmation a été envoyé à votre adresse email.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Détails de la Réservation
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Film</Typography>
              <Typography variant="body1" color="text.secondary">
                {bookingData.movieTitle}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Cinéma</Typography>
              <Typography variant="body1" color="text.secondary">
                {bookingData.theater}, {bookingData.city}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Date et Heure</Typography>
              <Typography variant="body1" color="text.secondary">
                {bookingData.date} à {bookingData.showtime}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Places</Typography>
              <Typography variant="body1" color="text.secondary">
                {bookingData.seats && bookingData.seats.join(', ')}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Numéro de Réservation</Typography>
              <Typography variant="body1" color="text.secondary">
                #{bookingData._id?.substring(0, 8).toUpperCase() || 'N/A'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <QRCodeDisplay 
              qrData={JSON.stringify({
                id: bookingData._id,
                movie: bookingData.movieTitle,
                date: bookingData.date,
                showtime: bookingData.showtime,
                seats: bookingData.seats
              })} 
            />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              Présentez ce QR code à l'entrée du cinéma pour accéder à votre séance.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleReturnHome}
            sx={{ minWidth: 200 }}
          >
            Retour à l'accueil
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingConfirmation; 