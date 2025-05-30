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
        const response = await fetch(`http://localhost:5001/api/movies/${movieId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setMovie(data.data);
        } else {
          throw new Error(data.error || 'Failed to load movie');
        }
      } catch (err: any) {
        console.error('Error fetching movie:', err);
        setError(err.message || 'Failed to load movie');
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
    fetchMovie();
    }
  }, [movieId]);

  // Récupérer les places disponibles pour cet horaire et ce cinéma
  const getAvailableSeats = () => {
    if (!movie || !city || !theater || !time) return [];
    
    try {
      const selectedCity = movie.cities.find((c: any) => c.name === city);
      if (!selectedCity) return [];
      
      const selectedTheater = selectedCity.theaters.find((t: any) => t.name === theater);
      if (!selectedTheater) return [];
      
      const selectedShowtime = selectedTheater.showtimes.find((s: any) => s.time === time);
      if (!selectedShowtime) return [];
      
      return selectedShowtime.seats || [];
    } catch (err) {
      console.error('Error getting available seats:', err);
      return [];
    }
  };

  const handleSeatSelection = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
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
        },
        body: JSON.stringify({
          movieId: movieId,
          movieTitle: movie?.title,
          city,
          theater,
          showtime: time,
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
        throw new Error(`Erreur HTTP: ${response.status}`);
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
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      setError('Erreur lors de la création de la réservation. Veuillez réessayer.');
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
                {getAvailableSeats().length > 0 ? (
                  getAvailableSeats().map((seat: any, index: number) => {
                    const row = Math.floor(index / 10);
                    const col = index % 10;
                    const seatId = seat.number || `${String.fromCharCode(65 + row)}${col + 1}`;
                    return (
                      <Grid item key={seatId} xs={1}>
                        <Button
                          variant={selectedSeats.includes(seatId) ? 'contained' : 'outlined'}
                          onClick={() => handleSeatSelection(seatId)}
                          disabled={seat.isBooked}
                          color={seat.isBooked ? 'error' : (selectedSeats.includes(seatId) ? 'primary' : 'inherit')}
                          sx={{ 
                            minWidth: '35px',
                            height: '35px', 
                            p: 0,
                            backgroundColor: seat.isBooked ? 'rgba(211, 47, 47, 0.1)' : 'inherit'
                          }}
                        >
                          {seat.number || seatId}
                        </Button>
                      </Grid>
                    );
                  })
                ) : (
                  Array.from({ length: 80 }, (_, index) => {
                    const row = Math.floor(index / 10);
                    const col = index % 10;
                    const seatId = `${String.fromCharCode(65 + row)}${col + 1}`;
                    const isBooked = Math.random() > 0.7; // 30% des sièges sont réservés aléatoirement
                    return (
                      <Grid item key={seatId} xs={1}>
                        <Button
                          variant={selectedSeats.includes(seatId) ? 'contained' : 'outlined'}
                          onClick={() => handleSeatSelection(seatId)}
                          disabled={isBooked}
                          color={isBooked ? 'error' : (selectedSeats.includes(seatId) ? 'primary' : 'inherit')}
                          sx={{ 
                            minWidth: '35px',
                            height: '35px', 
                            p: 0,
                            backgroundColor: isBooked ? 'rgba(211, 47, 47, 0.1)' : 'inherit'
                          }}
                        >
                          {seatId}
                        </Button>
                      </Grid>
                    );
                  })
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Téléphone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
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
            (activeStep === 1 &&
              (!formData.name || !formData.email || !formData.phone)) ||
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
