import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { api } from '../services/api';

interface QRCodeDisplayProps {
  bookingId?: string;
  qrData?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ bookingId, qrData }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (qrData) {
      // If qrData is provided directly, generate QR code from it
      generateQRCode(qrData);
    } else if (bookingId) {
      // If bookingId is provided, fetch booking data and generate QR code
      fetchBookingQRCode(bookingId);
    }
  }, [bookingId, qrData]);

  const generateQRCode = async (data: string) => {
    try {
      setLoading(true);
      // Use the QR code API directly in the frontend
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
      setQrCodeUrl(qrUrl);
      setLoading(false);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('Impossible de générer le QR code');
      setLoading(false);
    }
  };

  const fetchBookingQRCode = async (id: string) => {
    try {
      setLoading(true);
      // Fetch booking data
      const response = await api.get(`/bookings/${id}`);
      const booking = response.data;
      
      // Create data for QR code
      const bookingData = {
        id: booking._id,
        movie: booking.movieTitle,
        date: booking.date,
        showtime: booking.showtime,
        seats: booking.seats
      };
      
      // Generate QR code
      generateQRCode(JSON.stringify(bookingData));
    } catch (error) {
      console.error('Error fetching booking data:', error);
      setError('Impossible de récupérer les données de réservation');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', my: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, textAlign: 'center', maxWidth: 300, mx: 'auto', my: 2 }}>
      <Typography variant="h6" gutterBottom>
        Votre QR Code
      </Typography>
      
      {qrCodeUrl && (
        <Box>
          <img 
            src={qrCodeUrl} 
            alt="QR Code" 
            style={{ maxWidth: '100%', height: 'auto' }} 
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Présentez ce QR code à l'entrée du cinéma
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default QRCodeDisplay; 