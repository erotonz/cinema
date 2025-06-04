import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Card,
  CardContent,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TheatersIcon from '@mui/icons-material/Theaters';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import { getCurrentUser } from '../services/auth';

// Types pour les données de villes et cinémas
type Seat = {
  number: string;
  isBooked: boolean;
};

type Showtime = {
  time: string;
  seats: Seat[];
};

type Theater = {
  name: string;
  showtimes: Showtime[];
};

type City = {
  name: string;
  theaters: Theater[];
};

type Movie = {
  _id: string;
  title: string;
  image: string;
  description: string;
  rating: number;
  duration: string;
  director: string;
  cast: string[];
  genre: string[];
  releaseDate: string;
  cities: City[];
  showtimes: { time: string; seats: any[] }[]; // Gardé pour compatibilité
};

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // États pour les sélections de l'utilisateur
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedTheater, setSelectedTheater] = useState<string>('');
  const [selectedShowtime, setSelectedShowtime] = useState<string>('');
  
  // Théâtres disponibles basés sur la ville sélectionnée
  const [availableTheaters, setAvailableTheaters] = useState<Theater[]>([]);
  // Séances disponibles basées sur le théâtre sélectionné
  const [availableShowtimes, setAvailableShowtimes] = useState<Showtime[]>([]);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:5001/api/movies/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setMovie(data.data);
          
          // Si le film a des villes, sélectionner la première par défaut
          if (data.data.cities && data.data.cities.length > 0) {
            setSelectedCity(data.data.cities[0].name);
          }
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

    fetchMovie();
  }, [id]);
  
  // Défilement vers le bas si le paramètre scrollTo=bottom est présent
  useEffect(() => {
    if (movie) { // Assure que le film est chargé
      const urlParams = new URLSearchParams(window.location.search);
      const scrollTo = urlParams.get('scrollTo');
      
      if (scrollTo === 'bottom') {
        // Utilise setTimeout pour s'assurer que le rendu est complet avant de défiler
        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [movie]); // Déclenche cet effet lorsque le film est chargé
  
  // Mettre à jour les théâtres disponibles lorsque la ville change
  useEffect(() => {
    if (movie && selectedCity) {
      const city = movie.cities.find(c => c.name === selectedCity);
      if (city) {
        setAvailableTheaters(city.theaters);
        // Sélectionner le premier théâtre par défaut
        if (city.theaters.length > 0) {
          setSelectedTheater(city.theaters[0].name);
        } else {
          setSelectedTheater('');
          setAvailableShowtimes([]);
        }
      }
    }
  }, [selectedCity, movie]);
  
  // Mettre à jour les séances disponibles lorsque le théâtre change
  useEffect(() => {
    if (selectedCity && selectedTheater && movie) {
      const city = movie.cities.find(c => c.name === selectedCity);
      if (city) {
        const theater = city.theaters.find(t => t.name === selectedTheater);
        if (theater) {
          setAvailableShowtimes(theater.showtimes);
          // Sélectionner la première séance par défaut
          if (theater.showtimes.length > 0) {
            setSelectedShowtime(theater.showtimes[0].time);
          } else {
            setSelectedShowtime('');
          }
        }
      }
    }
  }, [selectedTheater, selectedCity, movie]);

  const handleCityChange = (event: SelectChangeEvent) => {
    setSelectedCity(event.target.value);
    // Réinitialiser les sélections suivantes
    setSelectedTheater('');
    setSelectedShowtime('');
  };

  const handleTheaterChange = (event: SelectChangeEvent) => {
    setSelectedTheater(event.target.value);
    // Réinitialiser la sélection de séance
    setSelectedShowtime('');
  };
  
  const handleShowtimeChange = (event: SelectChangeEvent) => {
    setSelectedShowtime(event.target.value);
  };
  
  const handleBooking = () => {
    const user = getCurrentUser(); // Check if user is logged in
    if (!user) {
      // If not logged in, redirect to login page
      navigate('/login');
      return; // Stop the function here
    }

    if (selectedCity && selectedTheater && selectedShowtime) {
      navigate(`/booking/${id}?city=${selectedCity}&theater=${selectedTheater}&time=${selectedShowtime}`);
    }
  };

  const handleReviewSubmitted = () => {
    setReviewSubmitted(!reviewSubmitted);
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error || !movie) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" color="error" gutterBottom>
          {error || 'Movie not found'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/movies')}
          sx={{ mt: 2 }}
        >
          BACK TO MOVIES
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }} maxWidth="lg">
      <Button
        onClick={() => navigate('/movies')}
        sx={{ mb: 4 }}
      >
        ← Back to Movies
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          {!imageError ? (
            <Box
              component="img"
              src={movie.image}
              alt={movie.title}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: 3,
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: 0,
                paddingBottom: '150%', // 2:3 aspect ratio for movie posters
                borderRadius: 2,
                boxShadow: 3,
                backgroundColor: 'rgba(0,0,0,0.1)',
                backgroundImage: `url(https://via.placeholder.com/500x750?text=${encodeURIComponent(movie.title)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h3" component="h1" gutterBottom>
            {movie.title}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Chip
              icon={<StarIcon />}
              label={`${movie.rating}/10`}
              color="primary"
            />
            <Chip
              icon={<AccessTimeIcon />}
              label={movie.duration}
              color="secondary"
            />
            <Chip
              icon={<CalendarTodayIcon />}
              label={movie.releaseDate}
              color="info"
            />
          </Box>

          <Typography variant="body1" paragraph>
            {movie.description}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Director
          </Typography>
          <Typography variant="body1" paragraph>
            {movie.director}
          </Typography>

          <Typography variant="h6" gutterBottom>
            Cast
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {movie.cast.map((actor: string) => (
              <Chip key={actor} label={actor} />
            ))}
          </Box>

          <Typography variant="h6" gutterBottom>
            Genre
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {movie.genre.map((genre: string) => (
              <Chip key={genre} label={genre} color="primary" variant="outlined" />
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />
          
          {/* Section de réservation */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Réservez vos places
          </Typography>
          
          <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
            <CardContent>
              {/* Sélection de la ville */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="city-select-label">Ville</InputLabel>
                <Select
                  labelId="city-select-label"
                  id="city-select"
                  value={selectedCity}
                  label="Ville"
                  onChange={handleCityChange}
                  startAdornment={<LocationOnIcon sx={{ mr: 1 }} />}
                >
                  {movie.cities.map((city) => (
                    <MenuItem key={city.name} value={city.name}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Sélection du cinéma */}
              <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedCity}>
                <InputLabel id="theater-select-label">Cinéma</InputLabel>
                <Select
                  labelId="theater-select-label"
                  id="theater-select"
                  value={selectedTheater}
                  label="Cinéma"
                  onChange={handleTheaterChange}
                  startAdornment={<TheatersIcon sx={{ mr: 1 }} />}
                >
                  {availableTheaters.map((theater) => (
                    <MenuItem key={theater.name} value={theater.name}>
                      {theater.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Sélection de l'horaire */}
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle1">Horaires disponibles:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {availableShowtimes.map((showtime) => (
                    <Button
                      key={showtime.time}
                      variant={selectedShowtime === showtime.time ? "contained" : "outlined"}
                      onClick={() => setSelectedShowtime(showtime.time)}
                      disabled={!selectedTheater}
                    >
                      {showtime.time}
                    </Button>
                  ))}
                </Box>
              </Box>
              
              {/* Bouton de réservation */}
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                disabled={!selectedCity || !selectedTheater || !selectedShowtime}
                onClick={handleBooking}
                sx={{ mt: 2 }}
              >
                Réserver
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Section des avis */}
      <Box sx={{ mt: 6 }} id="reviews-section">
        <Typography variant="h4" gutterBottom>
          Avis des spectateurs
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        {/* Formulaire d'avis (uniquement pour les utilisateurs connectés) */}
        {user && (
          <ReviewForm movieId={movie._id} onReviewSubmitted={handleReviewSubmitted} />
        )}
        
        {/* Liste des avis */}
        <Box sx={{ mt: 4 }}>
          <ReviewList movieId={movie._id} key={reviewSubmitted.toString()} />
        </Box>
      </Box>
    </Container>
  );
};

export default MovieDetails;
