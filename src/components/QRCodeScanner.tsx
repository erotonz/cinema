import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { QrReader } from 'react-qr-reader';

const QRCodeScanner: React.FC = () => {
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cleanup function
  const cleanupScanner = async () => {
    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current = null;
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  useEffect(() => {
    return () => {
      cleanupScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
    setError(null);
      setLoading(true);

      // Cleanup any existing instance
      await cleanupScanner();

      // Create container element
      const container = containerRef.current;
      if (!container) return;

      // Clear container
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      // Create new scanner instance
      const scanner = new Html5Qrcode('qr-reader', { verbose: false });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
      {
        fps: 10,
          qrbox: {
            width: 200,
            height: 200
          }
      },
      (decodedText) => {
        handleScanSuccess(decodedText);
      },
      (errorMessage) => {
          // Ignore QR code parsing errors
          if (!errorMessage.includes('QR code parse error')) {
            console.log('QR Code scanning error:', errorMessage);
          }
        }
      );

      setScanning(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
      setError('Impossible de démarrer le scanner. Veuillez vérifier les permissions de la caméra.');
    } finally {
      setLoading(false);
    }
  };

  const stopScanner = async () => {
    await cleanupScanner();
    setScanning(false);
  };

  const handleScanSuccess = (decodedText: string) => {
    try {
      const bookingData = JSON.parse(decodedText);
      console.log('Decoded booking data:', bookingData);
      setScanResult(bookingData);
      setDialogOpen(true);
      stopScanner();
    } catch (error) {
      console.error('Error parsing QR code data:', error);
      setError('QR code invalide. Veuillez réessayer.');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setScanResult(null);
  };

  const handleConfirmEntry = () => {
    alert('Entrée confirmée pour le client !');
    setDialogOpen(false);
    setScanResult(null);
  };

  const handleScan = (result: any) => {
    if (result && result.text) {
      handleScanSuccess(result.text);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom align="center">
        Scanner de QR Code - Entrée Cinéma
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          bgcolor: '#1a1a1a'
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={handleScan}
            className="qr-reader"
          />
          <Box
          sx={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              border: '2px solid #ff0066',
              borderRadius: '8px',
              pointerEvents: 'none',
            }}
          />
        </Box>
        <Alert severity="info" sx={{ mt: 2 }}>
          Position the QR code within the frame to scan
        </Alert>
      </Paper>

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Détails de la Réservation</DialogTitle>
        <DialogContent>
          {scanResult && (
            <List>
              <ListItem>
                <ListItemText 
                  primary="Film" 
                  secondary={scanResult.movie || 'Non spécifié'} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Date" 
                  secondary={scanResult.date || 'Non spécifiée'} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Heure" 
                  secondary={scanResult.showtime || 'Non spécifiée'} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Places" 
                  secondary={scanResult.seats ? scanResult.seats.join(', ') : 'Non spécifiées'} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="ID de Réservation" 
                  secondary={scanResult.id || 'Non spécifié'} 
                />
              </ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Annuler
          </Button>
          <Button onClick={handleConfirmEntry} color="primary" variant="contained">
            Confirmer l'Entrée
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QRCodeScanner; 