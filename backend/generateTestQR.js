const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Créer le répertoire pour les QR codes s'il n'existe pas
const qrDir = path.join(__dirname, 'public/qrcodes');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

// Données d'exemple pour le QR code
const testData = {
  id: '12345678',
  movie: 'Test Movie',
  date: '2024-05-15',
  showtime: '20:30',
  seats: ['A1', 'A2']
};

// Générer un QR code de test
async function generateTestQR() {
  try {
    // Générer un nom de fichier unique pour le QR code
    const qrFileName = `test-qr-${Date.now()}.png`;
    const qrFilePath = path.join(qrDir, qrFileName);
    
    // Générer le QR code et le sauvegarder comme fichier
    await QRCode.toFile(qrFilePath, JSON.stringify(testData), {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    console.log(`QR code généré avec succès: ${qrFilePath}`);
    console.log(`URL d'accès: http://localhost:5001/static/qrcodes/${qrFileName}`);
  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error);
  }
}

generateTestQR(); 