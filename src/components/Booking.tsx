import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getMovie, createBooking } from '../services/api';

const Booking = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvc: ''
  });
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const time = searchParams.get('time');

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        if (id) {
          const movieData = await getMovie(id);
          setMovie(movieData);
        }
      } catch (err) {
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await createBooking({
        movieId: id,
        showtime: time,
        seats: selectedSeats,
        ...formData,
        payment: paymentInfo
      });
      navigate('/booking-confirmation');
    } catch (err) {
      setError('Failed to process booking. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }} maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Book Tickets
      </Typography>
      <Typography variant="h6" gutterBottom>
        {movie?.title} - {time}
      </Typography>

      {/* ... rest of the existing JSX ... */}
    </Container>
  );
};

export default Booking; 