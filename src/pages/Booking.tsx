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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TheatersIcon from '@mui/icons-material/Theaters';

const steps = ['Select Seats', 'Personal Information', 'Confirmation', 'Paiement'];

const Booking = () => {
  const { movieId } = useParams();
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
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
  });

  const time = searchParams.get('time');
  const city = searchParams.get('city');
  const theater = searchParams.get('theater');

  // Charger les détails du film
  useEffect(() => {
    // Log the URL parameters to check if they are being read correctly
    console.log('Booking page URL parameters:', { movieId, city, theater, time });

    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Construct the URL with query parameters for city, theater, and time
        const url = `http://localhost:5001/api/movies/${movieId}?city=${city}&theater=${theater}&time=${time}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.data && data.data.cities && data.data.cities.length > 0 && data.data.cities[0].theaters && data.data.cities[0].theaters.length > 0 && data.data.cities[0].theaters[0].showtimes && data.data.cities[0].theaters[0].showtimes.length > 0) {
          // The backend now returns data for the specific showtime, so we can set it directly
          setMovie(data.data);
        } else {
          // Handle cases where the specific showtime data was not found
          setError('Showtime data not found for the selected city, theater, or time.');
          setMovie(null); // Ensure movie state is null if showtime data is missing
        }
      } catch (err: any) {
        console.error('Error fetching movie or showtime data:', err);
        setError(err.message || 'Failed to load movie or showtime data.');
        setMovie(null); // Ensure movie state is null on error
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if movieId, city, theater, and time are available
    if (movieId && city && theater && time) {
      fetchMovie();
    } else if (!movieId) {
       setError('Movie ID is missing.');
       setLoading(false);
    } else {
       setError('City, theater, or time information is missing from the URL.');
       setLoading(false);
    }
  }, [movieId, city, theater, time]); // Add dependencies

  // Récupérer les places disponibles pour cet horaire et ce cinéma
  // This function is now simpler as the fetched movie data is already filtered by showtime
  const getAvailableSeats = () => {
    // Check if movie data and the showtime structure exist before accessing seats
    if (movie && movie.cities && movie.cities.length > 0 && movie.cities[0].theaters && movie.cities[0].theaters.length > 0 && movie.cities[0].theaters[0].showtimes && movie.cities[0].theaters[0].showtimes.length > 0) {
        return movie.cities[0].theaters[0].showtimes[0].seats || [];
    }
    return []; // Return empty array if showtime data is not available
  };

  const handleSeatSelection = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid = () => {
    const newErrors = {
      email: '',
      phone: '',
    };

    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone is required';
    }

    return newErrors; // Return the validation errors object
  };

  const handleNext = () => {
    if (activeStep === 1) { // Assuming step 1 is the personal information step
      const validationErrors = isFormValid(); // Get the validation errors
      setErrors(validationErrors); // Set the errors state

      // Check if there are no errors before proceeding
      if (!validationErrors.email && !validationErrors.phone) {
        setActiveStep((prev) => prev + 1);
      }
    } else if (activeStep === 2) { // Assuming step 2 is the confirmation step
       // No validation needed for confirmation, proceed to payment
       setActiveStep((prev) => prev + 1);
    } else {
    setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Afficher les données dans la console pour le débogage
      console.log('Booking submitted:', {
        movieId: movieId,
        movieTitle: movie?.title,
        city,
        theater,
        showtime: time,
        seats: selectedSeats,
        ...formData,
        ...paymentInfo,
      });
      
      // Envoyer les données au backend
      const response = await fetch('http://localhost:5001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          movieId: movieId,
          movieTitle: movie?.title,
          city,
          theater,
          showtime: time,
          date: new Date().toLocaleDateString('fr-FR'),
          seats: selectedSeats,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          cardNumber: paymentInfo.cardNumber,
          expiry: paymentInfo.expiry,
          cvv: paymentInfo.cvc,
          totalPrice: selectedSeats.length * 40 // Prix de 40 par siège
        }),
      });
      
      if (!response.ok) {
        // Attempt to read the error message from the backend response
        const errorData = await response.json();
        const backendErrorMessage = errorData.error || 'Failed to create booking'; // Use backend error or a fallback
        throw new Error(backendErrorMessage); // Throw an error with the backend message
      }
      
      const result = await response.json();
      console.log('Réponse du serveur:', result);
      
      // Rediriger vers la page de confirmation avec les données de réservation
      navigate('/booking-confirmation', { 
        state: { 
          booking: {
            _id: result.data._id,
            movieId: movieId,
            movieTitle: movie?.title,
            city,
            theater,
            showtime: time,
            date: new Date().toLocaleDateString('fr-FR'),
            seats: selectedSeats,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            totalPrice: selectedSeats.length * 40 // Prix de 40 par siège
          }
        } 
      });
    } catch (error: any) {
      console.error('Erreur lors de la création de la réservation:', error);
      // Display the specific error message from the thrown error
      setError(error.message || 'Erreur lors de la création de la réservation. Veuillez réessayer.');
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Sélectionnez vos places
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      <strong>Ville:</strong> {city}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TheatersIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      <strong>Cinéma:</strong> {theater}
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    <strong>Séance:</strong> {time}
                  </Typography>
                </Box>
              </Paper>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Légende:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip label="Disponible" variant="outlined" />
                <Chip label="Sélectionné" color="primary" />
                <Chip label="Occupé" color="error" />
              </Box>
            </Box>
            
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Paper 
                sx={{ 
                  display: 'inline-block', 
                  px: 10, 
                  py: 1, 
                  bgcolor: 'black',
                  borderRadius: 1,
                  color: 'pink',
                  border: '2px solid pink'
                }}
              >
                <Typography variant="body2">ÉCRAN</Typography>
              </Paper>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                {/* Render actual seats based on fetched data */}
                {getAvailableSeats().length > 0 ? (
                  getAvailableSeats().map((seat: any) => { // Removed index as it's not used
                    const seatId = seat.number; // Use seat.number as the unique identifier
                    return (
                      <Grid item key={seatId} xs={1}>
                        <Button
                          variant={selectedSeats.includes(seatId) ? 'contained' : 'outlined'}
                          onClick={() => handleSeatSelection(seatId)}
                          disabled={seat.isBooked} // Keep disabled for already booked seats
                          color={seat.isBooked ? 'error' : (selectedSeats.includes(seatId) ? 'primary' : 'inherit')}
                          sx={{ 
                            minWidth: '35px',
                            height: '35px', 
                            p: 0,
                            backgroundColor: seat.isBooked ? 'rgba(211, 47, 47, 0.1)' : (selectedSeats.includes(seatId) ? undefined : 'inherit') // Keep light background for booked, default for others
                          }}
                        >
                          {seat.number}
                        </Button>
                      </Grid>
                    );
                  })
                ) : (
                  // Display a message if showtime data or seats are not available
                  <Grid item xs={12}>
                      <Typography variant="h6" color="textSecondary" align="center">
                          Seat information not available for this showtime.
                      </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
            
            {selectedSeats.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Vous avez sélectionné {selectedSeats.length} place(s): {selectedSeats.join(', ')}
              </Alert>
            )}
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Informations Personnelles
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Nom Complet"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Téléphone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  disabled={loading}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Résumé de la Réservation
            </Typography>
            <Paper sx={{ p: 3 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Film:</strong> {movie?.title}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Ville:</strong> {city}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Cinéma:</strong> {theater}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Séance:</strong> {time}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Places:</strong> {selectedSeats.join(', ')}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" gutterBottom>
                <strong>Nom:</strong> {formData.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {formData.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Téléphone:</strong> {formData.phone}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                <strong>Total:</strong> {selectedSeats.length} × 40 MAD = {selectedSeats.length * 40} MAD
              </Typography>
            </Paper>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Paiement
            </Typography>
            <Typography variant="body1" paragraph>
              (Simulation) Entrez les informations de votre carte bancaire :
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Numéro de carte"
                  name="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={handlePaymentChange}
                  placeholder="1234 5678 9012 3456"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required
                  fullWidth
                  label="Date d'expiration"
                  name="expiry"
                  value={paymentInfo.expiry}
                  onChange={handlePaymentChange}
                  placeholder="MM/AA"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required
                  fullWidth
                  label="CVC"
                  name="cvc"
                  value={paymentInfo.cvc}
                  onChange={handlePaymentChange}
                  placeholder="123"
                />
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Chargement...</Typography>
      </Container>
    );
  }

  if (error || !movie) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'Film non trouvé'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/movies')}
          sx={{ mt: 2 }}
        >
          RETOUR AUX FILMS
        </Button>
      </Container>
    );
  }

  if (!city || !theater || !time) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Informations de réservation incomplètes
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(`/movies/${movieId}`)}
          sx={{ mt: 2 }}
        >
          RETOUR AU FILM
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }} maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Réserver des billets
      </Typography>
      <Typography variant="h6" gutterBottom>
        {movie.title}
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mb: 4 }}>{renderStepContent(activeStep)}</Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={
            activeStep === 0 ? () => navigate(`/movies/${movieId}`) : handleBack
          }
          sx={{ mr: 1 }}
        >
          {activeStep === 0 ? 'Annuler' : 'Retour'}
        </Button>
        <Button
          variant="contained"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          disabled={
            (activeStep === 0 && selectedSeats.length === 0) ||
            (activeStep === 1 && !isFormValid()) ||
            (activeStep === 3 &&
              (!paymentInfo.cardNumber || !paymentInfo.expiry || !paymentInfo.cvc)) ||
            !movieId // Disable if movieId is undefined
          }
        >
          {activeStep === steps.length - 1 ? 'Confirmer la réservation' : 'Suivant'}
        </Button>
      </Box>
    </Container>
  );
};

export default Booking;
