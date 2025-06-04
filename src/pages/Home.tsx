import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Tabs,
  Tab,
  Paper,
  Chip,
  CircularProgress,
  styled,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Style pour les tabs (onglets) - Modifié avec texte noir
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#ff0066', // Rose vif (couleur principale)
  borderRadius: '4px',
  '& .MuiTab-root': {
    color: 'black', // Texte noir au lieu de blanc
    opacity: 0.7,
    fontWeight: 'bold',
    '&.Mui-selected': {
      opacity: 1,
      fontWeight: 'bold',
      color: 'black', // Texte noir quand sélectionné aussi
    },
  },
  '& .MuiTabs-indicator': {
    backgroundColor: 'black', // Indicateur noir
  },
}));

// Style pour les cartes de films
const MovieCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.03)',
    '& .movie-overlay': {
      opacity: 1,
    },
  },
}));

// Style pour l'overlay qui apparaît au survol
const MovieOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
  color: 'white',
  opacity: 0,
  transition: 'opacity 0.3s ease-in-out',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  height: '100%',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#ff0066', // Rose vif (couleur principale)
  color: 'black', // Texte noir au lieu de blanc
  borderRadius: '20px',
  padding: '6px 20px',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#e6005c', // Rose légèrement plus foncé
  },
}));

interface Movie {
  _id: string;
  title: string;
  image: string;
  description: string;
  rating: number;
  duration: string;
  director: string;
  genre: string[];
  isUpcoming?: boolean;
  releaseExpectedDate?: string;
}

const Home = () => {
  console.log('Rendering Home component');
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [currentMovies, setCurrentMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useEffect in Home.tsx is running');
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Charger les films actuellement à l\'affiche
        const currentResponse = await fetch('http://localhost:5001/api/movies');
        if (!currentResponse.ok) {
          throw new Error(`HTTP error! status: ${currentResponse.status}`);
        }
        const currentData = await currentResponse.json();
        
        // Charger les films à venir
        const upcomingResponse = await fetch('http://localhost:5001/api/movies/upcoming');
        if (!upcomingResponse.ok) {
          throw new Error(`HTTP error! status: ${upcomingResponse.status}`);
        }
        const upcomingData = await upcomingResponse.json();
        
        if (currentData.success && upcomingData.success) {
          setCurrentMovies(currentData.data);
          setUpcomingMovies(upcomingData.data);
        } else {
          throw new Error('Failed to load movies');
        }
      } catch (err: any) {
        console.error('Error fetching movies:', err);
        setError(err.message || 'Failed to load movies');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  // Obtenir les films en fonction de l'onglet sélectionné
  const getDisplayedMovies = useCallback(() => {
    return tabValue === 0 ? currentMovies : upcomingMovies;
  }, [tabValue, currentMovies, upcomingMovies]);

  const handleMovieClick = useCallback((movieId: string) => {
    if (tabValue === 0) {
      navigate(`/movies/${movieId}`);
    }
  }, [tabValue, navigate]);

  const handleReviewClick = useCallback((e: React.MouseEvent, movieId: string) => {
    e.stopPropagation();
    navigate(`/movies/${movieId}?scrollTo=bottom`);
  }, [navigate]);

  const handleBookingClick = useCallback((e: React.MouseEvent, movieId: string) => {
    e.stopPropagation();
    navigate(`/movies/${movieId}`);
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero Section avec bannière principale */}
      <Box
        sx={{
          width: '100%%',
          position: 'relative',
          height: '600px',
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://source.unsplash.com/random/1920x1080?cinema)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography
              component="h1"
              variant="h2"
              gutterBottom
              sx={{ fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
            >
              Welcome to Cinema
            </Typography>
            <Typography variant="h5" paragraph sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}>
              Discover the latest movies and book your tickets online.
              Experience the magic of cinema in the comfort of your home.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/movies')}
              sx={{ 
                px: 4, 
                py: 1.5, 
                fontSize: '1.1rem',
                borderRadius: '30px',
                backgroundColor: '#ff0066', // Rose vif
                color: 'black', // Texte noir
                '&:hover': {
                  backgroundColor: '#e6005c', // Rose légèrement plus foncé au survol
                }
              }}
            >
              BROWSE MOVIES
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Section des onglets et films */}
      <Container sx={{ py: 5 }} maxWidth="lg">
        {/* Tabs pour Vizyonda (À l'affiche) et Yakında (Prochainement) */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <StyledTabs
            value={tabValue}
            onChange={handleTabChange}
            centered
          >
            <Tab label="À L'AFFICHE" />
            <Tab label="PROCHAINEMENT" />
          </StyledTabs>
        </Box>

        {/* Grille des films - Conditionnelle basée sur l'onglet sélectionné */}
        <Grid container spacing={3}>
          {getDisplayedMovies().length === 0 ? (
            <Box sx={{ width: '100%%', textAlign: 'center', my: 4 }}>
              <Typography variant="h6">
                {tabValue === 0 ? 
                  "Aucun film à l'affiche actuellement" : 
                  "Aucun film à venir disponible pour le moment"}
              </Typography>
            </Box>
          ) : (
            getDisplayedMovies().map((movie) => (
              <Grid item key={movie._id} xs={12} sm={6} md={2.4}>
                <MovieCard onClick={() => handleMovieClick(movie._id)}>
                  <CardMedia
                    component="img"
                    image={movie.image}
                    alt={movie.title}
                    sx={{ 
                      height: '400px',
                      objectFit: 'cover',
                      ...(tabValue === 1 && { filter: 'grayscale(0.3)' })
                    }}
                  />
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    backgroundColor: '#222'
                  }}>
                    <Typography 
                      gutterBottom 
                      variant="h6" 
                      component="h3" 
                      sx={{ 
                        fontWeight: 'bold', 
                        textAlign: 'center',
                        color: 'white',
                        mb: 0
                      }}
                    >
                      {movie.title}
                    </Typography>
                    {tabValue === 1 && (
                      <Chip 
                        label="Prochainement" 
                        sx={{ 
                          mt: 1, 
                          bgcolor: '#ff0066', 
                          color: 'black',
                          fontWeight: 'bold' 
                        }} 
                      />
                    )}
                  </CardContent>
                  
                  {/* Overlay qui apparaît au survol - différent selon l'onglet */}
                  <MovieOverlay className="movie-overlay">
                    {tabValue === 0 ? (
                      // Overlay pour les films à l'affiche
                      <Box sx={{ mt: 'auto', mb: 2, width: '100%' }}>
                        <Grid container spacing={1} justifyContent="center">
                          <Grid item>
                            <ActionButton 
                              size="small" 
                              variant="contained"
                              onClick={(e) => handleReviewClick(e, movie._id)}
                            >
                              Avis
                            </ActionButton>
                          </Grid>
                          <Grid item>
                            <ActionButton 
                              size="small" 
                              variant="contained" 
                              onClick={(e) => handleBookingClick(e, movie._id)}
                            >
                              Achat
                            </ActionButton>
                          </Grid>
                        </Grid>
                      </Box>
                    ) : (
                      // Overlay pour les films à venir
                      <Box sx={{ mt: 'auto', mb: 2, width: '100%%', textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold' }}>
                          Bientôt dans vos salles
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ 
                            color: 'white', 
                            borderColor: 'white',
                            '&:hover': {
                              borderColor: '#ff0066',
                              color: '#ff0066'
                            }
                          }}
                        >
                          Plus d'infos
                        </Button>
                      </Box>
                    )}
                  </MovieOverlay>
                </MovieCard>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
      
      {/* Bannière d'information ou publicité */}
      <Box sx={{ 
        bgcolor: 'background.paper', 
        py: 6,
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(https://source.unsplash.com/random/1920x1080?popcorn)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        textAlign: 'center',
        mt: 4,
      }}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            Profitez de notre offre spéciale
          </Typography>
          <Typography variant="subtitle1" paragraph>
            Réservez vos billets en ligne et bénéficiez d'une réduction de 20% sur votre prochain achat
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ 
              backgroundColor: '#ff0066',
              color: 'black', 
              borderColor: '#ff0066',
              mt: 2,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#e6005c',
                borderColor: '#e6005c',
              }
            }}
          >
            En savoir plus
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 




