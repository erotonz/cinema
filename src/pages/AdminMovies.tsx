import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
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
  FormHelperText,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
  Divider,
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
}

const AdminMovies = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [currentMovies, setCurrentMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour le dialogue de nouveau film
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [movieForm, setMovieForm] = useState({
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
    isUpcoming: false
  });
  
  // État pour le dialogue de confirmation de suppression
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  
  // Token d'authentification (normalement stocké dans un contexte ou localStorage)
  const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    fetchMovies();
  }, []);
  
  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      setError(err.message || 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleDialogOpen = (isUpcoming = false, movie: Movie | null = null) => {
    if (movie) {
      // Mode édition
      setEditingMovie(movie);
      setMovieForm({
        title: movie.title,
        description: movie.description,
        image: movie.image,
        rating: movie.rating,
        duration: movie.duration,
        director: movie.director,
        cast: movie.cast ? movie.cast.join(', ') : '',
        genre: movie.genre ? movie.genre.join(', ') : '',
        releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        releaseExpectedDate: movie.releaseExpectedDate ? new Date(movie.releaseExpectedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        isUpcoming: Boolean(movie.isUpcoming)
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
        isUpcoming: isUpcoming
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
  
  const handleMovieSubmit = async () => {
    try {
      // Préparation des données
      const movieData = {
        title: movieForm.title,
        description: movieForm.description,
        image: movieForm.image,
        rating: parseFloat(movieForm.rating.toString()),
        duration: movieForm.duration,
        director: movieForm.director,
        cast: movieForm.cast.split(',').map(item => item.trim()),
        genre: movieForm.genre.split(',').map(item => item.trim()),
        releaseDate: movieForm.releaseDate,
        releaseExpectedDate: movieForm.releaseExpectedDate,
        isUpcoming: movieForm.isUpcoming
      };
      
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
        body: JSON.stringify(movieData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Rafraîchir la liste des films
      await fetchMovies();
      handleDialogClose();
      
    } catch (err: any) {
      console.error('Error saving movie:', err);
      setError(err.message || 'Failed to save movie');
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
      setError(err.message || 'Failed to delete movie');
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
      setError(err.message || 'Failed to release movie');
    }
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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
      
    </Container>
  );
};

export default AdminMovies;
