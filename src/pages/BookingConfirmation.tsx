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
          No booking information found. Please check your email for booking details.
        </Alert>
        <Button variant="contained" onClick={handleReturnHome}>
          Return to Movies
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
            Booking Confirmed!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your booking has been successfully confirmed. A confirmation email has been sent to your email address.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Booking Details
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Movie</Typography>
              <Typography variant="body1" color="text.secondary">
                {bookingData.movieTitle}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Cinema</Typography>
              <Typography variant="body1" color="text.secondary">
                {bookingData.theater}, {bookingData.city}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Date and Time</Typography>
              <Typography variant="body1" color="text.secondary">
                {bookingData.date} at {bookingData.showtime}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Seats</Typography>
              <Typography variant="body1" color="text.secondary">
                {bookingData.seats && bookingData.seats.join(', ')}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Booking Number</Typography>
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
              Present this QR code at the cinema entrance to access your session.
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
            Return to Movies
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingConfirmation; 