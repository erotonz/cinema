const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

async function testEmail() {
  try {
    // Récupérer les identifiants Gmail depuis .env
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    
    console.log('Informations de configuration:');
    console.log('- Gmail User:', gmailUser ? gmailUser : 'Non défini');
    console.log('- Gmail Password:', gmailPass ? '****' : 'Non défini');
    
    if (!gmailUser || !gmailPass) {
      console.error('ERREUR: Les identifiants Gmail ne sont pas configurés dans le fichier .env');
      return;
    }
    
    // Configuration du transporteur Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });
    
    console.log('Tentative de connexion au serveur SMTP...');
    
    // Vérifier la connexion
    await transporter.verify();
    console.log('Connexion au serveur SMTP réussie!');
    
    // Envoyer un email de test
    console.log('Envoi d\'un email de test...');
    const info = await transporter.sendMail({
      from: `"Test Cinéma" <${gmailUser}>`,
      to: gmailUser, // Envoyer à soi-même pour tester
      subject: "Test d'envoi d'email depuis l'app Cinéma",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0;">
          <h1 style="color: #d32f2f;">Ceci est un email de test</h1>
          <p>Si vous recevez cet email, cela signifie que la configuration de votre serveur d'email fonctionne correctement.</p>
          <p>Date et heure du test: ${new Date().toLocaleString()}</p>
        </div>
      `
    });
    
    console.log('Email envoyé avec succès!');
    console.log('ID du message:', info.messageId);
    
  } catch (error) {
    console.error('ERREUR lors du test d\'envoi d\'email:');
    console.error(error);
    
    if (error.code === 'EAUTH') {
      console.log('\nProblème d\'authentification. Vérifiez que:');
      console.log('1. Votre adresse Gmail et mot de passe d\'application sont corrects');
      console.log('2. L\'authentification à deux facteurs est activée sur votre compte Google');
      console.log('3. Vous avez créé un mot de passe d\'application spécifique pour cette application');
    }
    
    if (error.code === 'ESOCKET') {
      console.log('\nProblème de connexion au serveur. Vérifiez que:');
      console.log('1. Votre connexion internet fonctionne');
      console.log('2. Les ports nécessaires ne sont pas bloqués par un pare-feu');
    }
  }
}

// Exécuter le test
testEmail(); 