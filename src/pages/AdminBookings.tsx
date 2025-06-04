import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';

interface Booking {
  _id: string;
  movieTitle: string;
  name: string;
  email: string;
  showtime: string;
  date: string;
  seats: string[];
  theater: string;
  city: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  createdAt: string;
}

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('/api/bookings/admin');
        setBookings(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des réservations');
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'warning';
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Réservations
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Film</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Horaire</TableCell>
              <TableCell>Sièges</TableCell>
              <TableCell>Cinéma</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking._id}>
                <TableCell>{booking._id.substring(0, 8)}</TableCell>
                <TableCell>{booking.movieTitle}</TableCell>
                <TableCell>{booking.name}</TableCell>
                <TableCell>{booking.email}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>{booking.showtime}</TableCell>
                <TableCell>{booking.seats.join(', ')}</TableCell>
                <TableCell>{booking.theater}, {booking.city}</TableCell>
                <TableCell>{booking.totalPrice} MAD</TableCell>
                <TableCell>
                  <Chip 
                    label={booking.status} 
                    color={getStatusColor(booking.status) as any}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminBookings; 