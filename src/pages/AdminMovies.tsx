import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import { styled } from '@mui/material/styles';

// Onglet personnalisé avec couleur rose et texte noir
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#ff0066', // Rose vif
  borderRadius: '4px',
  '& .MuiTab-root': {
    color: 'black', // Texte noir
    opacity: 0.7,
    fontWeight: 'bold',
    '&.Mui-selected': {
      opacity: 1,
      fontWeight: 'bold',
      color: 'black',
    },
  },
  '& .MuiTabs-indicator': {
    backgroundColor: 'black', // Indicateur noir
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#ff0066', // Rose vif
  color: 'black', // Texte noir
  '&:hover': {
    backgroundColor: '#e6005c', // Rose plus foncé au survol
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
  cast: string[];
  releaseDate: string;
  isUpcoming?: boolean;
  releaseExpectedDate?: string;
  cities?: {
    name: string;
    theaters: {
      name: string;
      showtimes: { time: string }[];
    }[];
  }[];
}

// Define a type for the form state that includes fields as strings for input
// and makes _id optional for new movies
interface MovieFormState {
  _id?: string; // Make _id optional
  title: string;
  image: string;
  description: string;
  rating: number; // Keep as number for the form initially
  duration: string;
  director: string;
  genre: string; // String for the input field
  cast: string; // String for the input field
  releaseDate: string;
  isUpcoming: boolean;
  releaseExpectedDate?: string;
  cities: { // Define cities structure here
    name: string;
    theaters: {
      name: string;
      showtimes: { time: string; numberOfSeats: number; seats?: boolean[]; }[]; // Add seats here as optional boolean array
    }[];
  }[];
}

const AdminMovies = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [currentMovies, setCurrentMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le dialogue de nouveau film
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [movieForm, setMovieForm] = useState<MovieFormState>({
    title: '',
    description: '',
    image: '',
    rating: 0,
    duration: '',
    director: '',
    cast: '',
    genre: '',
    releaseDate: new Date().toISOString().split('T')[0],
    releaseExpectedDate: new Date().toISOString().split('T')[0],
    isUpcoming: false,
    cities: []
  });
  
  // État pour le dialogue de confirmation de suppression
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [selectedShowtime, setSelectedShowtime] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);
  
  // Token d'authentification (normalement stocké dans un contexte ou localStorage)
  const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      
      // Charger tous les films (y compris actuels et à venir)
      const allMoviesResponse = await fetch('http://localhost:5001/api/movies?all=true', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!allMoviesResponse.ok) {
        throw new Error(`HTTP error! status: ${allMoviesResponse.status}`);
      }
      
      const allMoviesData = await allMoviesResponse.json();
      
      if (allMoviesData.success) {
        // Séparer les films actuels et à venir
        const current = allMoviesData.data.filter((movie: Movie) => !movie.isUpcoming);
        const upcoming = allMoviesData.data.filter((movie: Movie) => movie.isUpcoming);
        
        setCurrentMovies(current);
        setUpcomingMovies(upcoming);
      } else {
        throw new Error(allMoviesData.error || 'Failed to load movies');
      }
    } catch (err: any) {
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleDialogOpen = (isUpcoming = false, movie: Movie | null = null) => {
    if (movie) {
      // Mode édition: Transformer les données du film pour qu'elles correspondent à l'état du formulaire
      setEditingMovie(movie);
      setMovieForm({
        _id: movie._id, // Include _id for editing
        title: movie.title || '',
        description: movie.description || '',
        image: movie.image || '',
        rating: movie.rating || 0,
        duration: movie.duration || '',
        director: movie.director || '',
        cast: movie.cast ? movie.cast.join(', ') : '',
        genre: movie.genre ? movie.genre.join(', ') : '',
        releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : '',
        releaseExpectedDate: movie.releaseExpectedDate ? new Date(movie.releaseExpectedDate).toISOString().split('T')[0] : '',
        isUpcoming: Boolean(movie.isUpcoming),
        cities: (movie.cities || []).map(city => ({
          name: city.name || '',
          theaters: (city.theaters || []).map(theater => ({
            name: theater.name || '',
            showtimes: (theater.showtimes || []).map((showtime: any) => ({
              time: showtime.time || '',
              // Populate numberOfSeats from the length of the seats array from the backend
              numberOfSeats: showtime.seats?.length || 0
              // Do NOT include the 'seats' array in the form state
            }))
          }))
        }))
      });
    } else {
      // Mode création
      setEditingMovie(null);
      setMovieForm({
        title: '',
        description: '',
        image: '',
        rating: 0,
        duration: '',
        director: '',
        cast: '',
        genre: '',
        releaseDate: new Date().toISOString().split('T')[0],
        releaseExpectedDate: new Date().toISOString().split('T')[0],
        isUpcoming: isUpcoming,
        cities: []
      });
    }
    setOpenDialog(true);
  };
  
  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingMovie(null);
  };
  
  const handleDeleteDialogOpen = (movie: Movie) => {
    setMovieToDelete(movie);
    setOpenDeleteDialog(true);
  };
  
  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setMovieToDelete(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMovieForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setMovieForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: string) => {
    const { value } = e.target;
    setMovieForm((prev) => ({ 
      ...prev, 
      [fieldName]: value
    }));
  };
  
  // Handlers for managing cities, theaters, and showtimes
  const handleAddCity = () => {
    setMovieForm(prev => ({
      ...prev,
      cities: [...(prev.cities || []), { name: '', theaters: [] }]
    }));
  };

  const handleRemoveCity = (cityIndex: number) => {
    setMovieForm(prev => ({
      ...prev,
      cities: (prev.cities || []).filter((_, index) => index !== cityIndex)
    }));
  };

  const handleCityNameChange = (cityIndex: number, name: string) => {
    setMovieForm(prev => ({
      ...prev,
      cities: (prev.cities || []).map((city, index) => 
        index === cityIndex ? { ...city, name } : city
      )
    }));
  };

  const handleAddTheater = (cityIndex: number) => {
    setMovieForm(prev => ({
      ...prev,
      cities: (prev.cities || []).map((city, index) => 
        index === cityIndex ? { ...city, theaters: [...city.theaters, { name: '', showtimes: [] }] } : city
      )
    }));
  };

  const handleRemoveTheater = (cityIndex: number, theaterIndex: number) => {
    setMovieForm(prev => ({
      ...prev,
      cities: (prev.cities || []).map((city, cIndex) => 
        cIndex === cityIndex ? { ...city, theaters: city.theaters.filter((_, tIndex) => tIndex !== theaterIndex) } : city
      )
    }));
  };

  const handleTheaterNameChange = (cityIndex: number, theaterIndex: number, name: string) => {
    setMovieForm(prev => ({
      ...prev,
      cities: (prev.cities || []).map((city, cIndex) => 
        cIndex === cityIndex ? { ...city, theaters: city.theaters.map((theater, tIndex) => tIndex === theaterIndex ? { ...theater, name } : theater) } : city
      )
    }));
  };

  const handleAddShowtime = (cityIndex: number, theaterIndex: number) => {
    setMovieForm(prev => ({
      ...prev,
      cities: (prev.cities || []).map((city, cIndex) =>
        cIndex === cityIndex ? { ...city, theaters: city.theaters.map((theater, tIndex) => tIndex === theaterIndex ? { ...theater, showtimes: [...theater.showtimes, { time: '', numberOfSeats: 0 }] } : theater) } : city
      )
    }));
  };

  const handleRemoveShowtime = (cityIndex: number, theaterIndex: number, showtimeIndex: number) => {
    setMovieForm(prev => ({
      ...prev,
      cities: (prev.cities || []).map((city, cIndex) => 
        cIndex === cityIndex ? { ...city, theaters: city.theaters.map((theater, tIndex) => tIndex === theaterIndex ? { ...theater, showtimes: theater.showtimes.filter((_, sIndex) => sIndex !== showtimeIndex) } : theater) } : city
      )
    }));
  };

  const handleShowtimeChange = (cityIndex: number, theaterIndex: number, showtimeIndex: number, field: string, value: string | number) => {
    setMovieForm(prev => ({
      ...prev,
      cities: (prev.cities || []).map((city, cIndex) =>
        cIndex === cityIndex ? { ...city, theaters: city.theaters.map((theater, tIndex) => tIndex === theaterIndex ? { ...theater, showtimes: theater.showtimes.map((showtime, sIndex) => sIndex === showtimeIndex ? { ...showtime, [field]: value } : showtime) } : theater) } : city
      )
    }));
  };

  const handleMovieSubmit = async () => {
    try {
      // Préparation des données pour l'envoi au backend
      const movieDataForBackend = {
        title: movieForm.title,
        description: movieForm.description,
        image: movieForm.image,
        // Safely parse rating, default to 0 if undefined or null
        rating: parseFloat((movieForm.rating ?? 0).toString()),
        duration: movieForm.duration,
        director: movieForm.director,
        // Convert comma-separated strings to arrays
        cast: movieForm.cast.split(',').map((item: string) => item.trim()).filter((item: string) => item),
        genre: movieForm.genre.split(',').map((item: string) => item.trim()).filter((item: string) => item),
        releaseDate: movieForm.releaseDate,
        isUpcoming: movieForm.isUpcoming,
        ...(movieForm.isUpcoming && { releaseExpectedDate: movieForm.releaseExpectedDate }), // Include if upcoming
        // Transform cities, theaters, and showtimes to match backend structure (using 'seats' instead of 'numberOfSeats')
        cities: (movieForm.cities || []).map(city => ({
          name: city.name,
          theaters: (city.theaters || []).map(theater => ({
            name: theater.name,
            showtimes: (theater.showtimes || []).map((showtime: any) => ({
              time: showtime.time,
              // Convert numberOfSeats from the form to an array of booleans for the 'seats' field for the backend
              numberOfSeats: parseInt(showtime.numberOfSeats, 10) || 0,
              // Do NOT include the 'seats' array in the form state
            }))
          }))
        })),
      };
      
      // Include _id if editing
      if (editingMovie && editingMovie._id) {
        (movieDataForBackend as any)._id = editingMovie._id; // Add _id for PUT requests
        // Explicitly remove the top-level showtimes field if it exists (from old data)
        if ((movieDataForBackend as any).showtimes !== undefined) {
          delete (movieDataForBackend as any).showtimes;
        }
      }
      
      // URL et méthode selon qu'on crée ou modifie
      let url = 'http://localhost:5001/api/movies';
      let method = 'POST';
      
      if (movieForm.isUpcoming && !editingMovie) {
        url = 'http://localhost:5001/api/movies/upcoming';
      }
      
      if (editingMovie) {
        url = `http://localhost:5001/api/movies/${editingMovie._id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(movieDataForBackend)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Rafraîchir la liste des films
      await fetchMovies();
      handleDialogClose();
      
    } catch (err: any) {
      console.error('Error saving movie:', err);
    }
  };
  
  const handleMovieDelete = async () => {
    if (!movieToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/movies/${movieToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Rafraîchir la liste des films
      await fetchMovies();
      handleDeleteDialogClose();
      
    } catch (err: any) {
      console.error('Error deleting movie:', err);
      handleDeleteDialogClose();
    }
  };
  
  const handleReleaseMovie = async (movie: Movie) => {
    try {
      const response = await fetch(`http://localhost:5001/api/movies/${movie._id}/release`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Rafraîchir la liste des films
      await fetchMovies();
      
    } catch (err: any) {
      console.error('Error releasing movie:', err);
    }
  };
  
  const handleCancelSession = async () => {
    try {
      if (!selectedMovie || !selectedShowtime) {
        setCancelError('Veuillez remplir tous les champs');
        return;
      }

      const response = await fetch(`http://localhost:5001/api/movies/${selectedMovie._id}/cancel-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          showtime: selectedShowtime,
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Session cancelled successfully:', data);
        alert('Séance annulée avec succès !');
        setCancelDialogOpen(false);
        setSelectedMovie(null);
        setSelectedShowtime('');
        fetchMovies();
      } else {
        setCancelError(data.error || 'Erreur lors de l\'annulation de la séance');
      }
    } catch (error: any) {
      console.error('Error canceling session:', error);
      setCancelError(error.message || 'Erreur lors de l\'annulation de la séance');
    }
  };

  const openCancelDialog = (movie: any) => {
    setSelectedMovie(movie);
    setSelectedShowtime('');
    setCancelError(null);
    setCancelDialogOpen(true);
  };
  
  // Affichage des films actuels ou à venir selon l'onglet
  const getDisplayedMovies = () => {
    return tabValue === 0 ? currentMovies : upcomingMovies;
  };
  
  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Chargement...</Typography>
      </Container>
    );
  }
  
  return (
    <Container sx={{ py: 4 }} maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Gestion des films
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
          >
            Retour au site
          </Button>
        </Box>
      </Box>
      
      {/* Onglets pour films actuels et à venir */}
      <Box sx={{ mb: 4 }}>
        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          centered
        >
          <Tab label="FILMS À L'AFFICHE" />
          <Tab label="FILMS À VENIR" />
        </StyledTabs>
      </Box>
      
      {/* Bouton d'ajout */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <ActionButton 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen(tabValue === 1)}
        >
          {tabValue === 0 ? 'Ajouter un film' : 'Ajouter un film à venir'}
        </ActionButton>
      </Box>
      
      {/* Liste des films */}
      <Grid container spacing={3}>
        {getDisplayedMovies().length === 0 ? (
          <Box sx={{ width: '100%', textAlign: 'center', my: 4 }}>
            <Typography variant="h6">
              {tabValue === 0 ? 
                "Aucun film à l'affiche actuellement" : 
                "Aucun film à venir disponible pour le moment"}
            </Typography>
          </Box>
        ) : (
          getDisplayedMovies().map((movie) => (
            <Grid item key={movie._id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  image={movie.image}
                  alt={movie.title}
                  sx={{ 
                    height: 250,
                    objectFit: 'cover',
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {movie.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {movie.director}
                  </Typography>
                  <Box sx={{ mb: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {movie.genre && movie.genre.map((g) => (
                      <Chip 
                        key={g} 
                        label={g} 
                        size="small" 
                        sx={{
                          bgcolor: '#ff0066',
                          color: 'black',
                        }}
                      />
                    ))}
                  </Box>
                  <Typography variant="body2" paragraph sx={{ height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {movie.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">
                      <strong>Durée:</strong> {movie.duration}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Note:</strong> {movie.rating}/10
                    </Typography>
                  </Box>
                </CardContent>
                <Divider />
                <CardActions>
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <IconButton 
                        aria-label="edit" 
                        onClick={() => handleDialogOpen(movie.isUpcoming, movie)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        aria-label="delete" 
                        onClick={() => handleDeleteDialogOpen(movie)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                      <Button
                        size="small"
                        color="warning"
                        onClick={() => openCancelDialog(movie)}
                        sx={{ ml: 1 }}
                      >
                        Annuler Séance
                      </Button>
                    </Box>
                    {tabValue === 1 && (
                      <Button 
                        size="small"
                        variant="outlined"
                        startIcon={<UpgradeIcon />}
                        onClick={() => handleReleaseMovie(movie)}
                      >
                        Sortir maintenant
                      </Button>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      
      {/* Dialogue d'ajout/modification de film */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingMovie ? 'Modifier le film' : (movieForm.isUpcoming ? 'Ajouter un film à venir' : 'Ajouter un film')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="title"
                label="Titre"
                fullWidth
                variant="outlined"
                value={movieForm.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="director"
                label="Réalisateur"
                fullWidth
                variant="outlined"
                value={movieForm.director}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                variant="outlined"
                value={movieForm.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="image"
                label="URL de l'image"
                fullWidth
                variant="outlined"
                value={movieForm.image}
                onChange={handleInputChange}
                required
                helperText="Entrez une URL d'image valide"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="cast"
                label="Casting (séparé par des virgules)"
                fullWidth
                variant="outlined"
                value={movieForm.cast}
                onChange={(e) => setMovieForm((prev) => ({ ...prev, cast: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="genre"
                label="Genres (séparés par des virgules)"
                fullWidth
                variant="outlined"
                value={movieForm.genre}
                onChange={(e) => setMovieForm((prev) => ({ ...prev, genre: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="duration"
                label="Durée (ex: 2h 30min)"
                fullWidth
                variant="outlined"
                value={movieForm.duration}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="rating"
                label="Note sur 10"
                type="number"
                InputProps={{ inputProps: { min: 0, max: 10, step: 0.1 } }}
                fullWidth
                variant="outlined"
                value={movieForm.rating}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="upcoming-label">Type de film</InputLabel>
                <Select
                  labelId="upcoming-label"
                  name="isUpcoming"
                  value={movieForm.isUpcoming ? "true" : "false"}
                  onChange={(e) => {
                    setMovieForm(prev => ({
                      ...prev,
                      isUpcoming: e.target.value === "true"
                    }));
                  }}
                  label="Type de film"
                >
                  <MenuItem value="false">À l'affiche maintenant</MenuItem>
                  <MenuItem value="true">À venir prochainement</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="releaseDate"
                label={movieForm.isUpcoming ? "Date de sortie officielle" : "Date de sortie"}
                type="date"
                fullWidth
                variant="outlined"
                value={movieForm.releaseDate}
                onChange={(e) => handleDateChange(e, 'releaseDate')}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            {movieForm.isUpcoming && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="releaseExpectedDate"
                  label="Date de sortie prévue"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={movieForm.releaseExpectedDate}
                  onChange={(e) => handleDateChange(e, 'releaseExpectedDate')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            )}

            {/* Showtime Management Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Gestion des Séances</Typography>
              
              {(movieForm.cities || []).map((city, cityIndex) => (
                <Box key={cityIndex} sx={{ mb: 3, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>Ville {cityIndex + 1}</Typography>
                  <TextField
                    label="Nom de la ville"
                    value={city.name}
                    onChange={(e) => handleCityNameChange(cityIndex, e.target.value)}
                    fullWidth
                    margin="normal"
                    size="small"
                  />
                  <Button onClick={() => handleRemoveCity(cityIndex)} color="error">Supprimer la ville</Button>

                  {(city.theaters || []).map((theater, theaterIndex) => (
                    <Box key={theaterIndex} sx={{ ml: 2, mt: 2, p: 2, border: '1px dashed #ddd', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>Cinéma {theaterIndex + 1}</Typography>
                      <TextField
                        label="Nom du cinéma"
                        value={theater.name}
                        onChange={(e) => handleTheaterNameChange(cityIndex, theaterIndex, e.target.value)}
                        fullWidth
                        margin="normal"
                        size="small"
                      />
                      <Button onClick={() => handleRemoveTheater(cityIndex, theaterIndex)} color="error">Supprimer le cinéma</Button>

                      {(theater.showtimes || []).map((showtime, showtimeIndex) => (
                        <Box key={showtimeIndex} sx={{ ml: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            label="Heure de la séance"
                            value={showtime.time}
                            onChange={(e) => handleShowtimeChange(cityIndex, theaterIndex, showtimeIndex, 'time', e.target.value)}
                            fullWidth
                            size="small"
                          />
                          <TextField
                            label="Nombre de places"
                            type="number"
                            value={showtime.numberOfSeats}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              handleShowtimeChange(cityIndex, theaterIndex, showtimeIndex, 'numberOfSeats', value.toString());
                            }}
                            fullWidth
                            size="small"
                            inputProps={{ min: 0 }}
                          />
                          <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                              onClick={() => handleRemoveShowtime(cityIndex, theaterIndex, showtimeIndex)}
                              color="error"
                              size="small"
                            >
                              Supprimer la séance
                            </Button>
                          </Grid>
                        </Box>
                      ))}
                      <Button onClick={() => handleAddShowtime(cityIndex, theaterIndex)} startIcon={<AddIcon />} sx={{ mt: 1 }}>Ajouter une séance</Button>
                    </Box>
                  ))}
                  <Button onClick={() => handleAddTheater(cityIndex)} startIcon={<AddIcon />} sx={{ mt: 1 }}>Ajouter un cinéma</Button>
                </Box>
              ))}
              <Button onClick={handleAddCity} startIcon={<AddIcon />}>Ajouter une ville</Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Annuler</Button>
          <ActionButton onClick={handleMovieSubmit} variant="contained">
            {editingMovie ? 'Mettre à jour' : 'Ajouter'}
          </ActionButton>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le film "{movieToDelete?.title}" ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Annuler</Button>
          <Button onClick={handleMovieDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog d'annulation de séance */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Annuler une séance</DialogTitle>
        <DialogContent>
          {cancelError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {cancelError}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Film: {selectedMovie?.title}
            </Typography>

            <TextField
              select
              fullWidth
              label="Horaire"
              value={selectedShowtime}
              onChange={(e) => setSelectedShowtime(e.target.value)}
              sx={{ mt: 2 }}
            >
              {selectedMovie?.cities?.map((city: any) =>
                city.theaters?.map((theater: any) =>
                  theater.showtimes?.map((showtime: any) => (
                    <MenuItem key={showtime.time} value={showtime.time}>
                      {showtime.time} - {theater.name} ({city.name})
                    </MenuItem>
                  ))
                )
              )}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={handleCancelSession}
            color="error"
            variant="contained"
          >
            Confirmer l'annulation
          </Button>
        </DialogActions>
      </Dialog>
      
    </Container>
  );
};

export default AdminMovies;

