import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import QRCodeScanner from '../components/QRCodeScanner';

const ScannerPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Contrôle d'Accès Cinéma
        </Typography>
        <Typography variant="body1" paragraph align="center">
          Utilisez ce scanner pour vérifier les billets des clients à l'entrée du cinéma.
        </Typography>
      </Paper>
      
      <QRCodeScanner />
    </Container>
  );
};

export default ScannerPage; 