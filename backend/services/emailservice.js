const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movie');
const dotenv = require('dotenv');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Charger les variables d'environnement
dotenv.config();

// Configuration pour Gmail
async function sendBookingConfirmation(booking, userEmail) {
  try {
    // Récupérer les informations supplémentaires si disponibles
    let user = null;
    let movie = null;
    
    try {
      if (booking.user && booking.user !== 'guest') {
        user = await User.findById(booking.user);
      }
      
      if (booking.movie) {
        movie = await Movie.findById(booking.movie);
      }
    } catch (err) {
      console.log('Erreur lors de la récupération des informations supplémentaires:', err);
    }
    
    // Utiliser les informations directes si les objets ne sont pas trouvés
    const userName = booking.name || (user ? user.username : 'Cher client');
    const movieTitle = booking.movieTitle || (movie ? movie.title : 'Film réservé');
    
    // Vérifier si les identifiants Gmail sont configurés
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    
    let transporter;
    
    if (gmailUser && gmailPass) {
      // Configuration du transporteur Gmail
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });
      console.log('Utilisation du transporteur Gmail');
    } else {
      // Si les identifiants Gmail ne sont pas configurés, utiliser Ethereal
      console.log('Identifiants Gmail non configurés, utilisation d\'Ethereal à la place');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    // Générer un QR code pour la réservation
    const bookingData = {
      id: booking._id.toString(),
      movie: movieTitle,
      date: booking.date,
      showtime: booking.showtime,
      seats: booking.seats
    };
    
    // Créer le répertoire pour les QR codes s'il n'existe pas
    const qrDir = path.join(__dirname, '../public/qrcodes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }
    
    // Générer un nom de fichier unique pour le QR code
    const qrFileName = `qr-${booking._id}.png`;
    const qrFilePath = path.join(qrDir, qrFileName);
    
    // Générer le QR code et le sauvegarder comme fichier
    await QRCode.toFile(qrFilePath, JSON.stringify(bookingData), {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    // Créer une version base64 du QR code pour l'inclure directement dans l'email
    const qrCodeBase64 = await QRCode.toDataURL(JSON.stringify(bookingData), {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 1
    });
    
    // Obtenir la date et l'heure actuelles
    const now = new Date();
    const formattedDate = now.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Calculer la date d'expiration du ticket
    const [hours, minutes] = booking.showtime.split(':');
    const showtimeDate = new Date();
    showtimeDate.setHours(parseInt(hours, 10));
    showtimeDate.setMinutes(parseInt(minutes, 10) - 30);
    
    const formattedShowtime = showtimeDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Contenu de l'email
    let info = await transporter.sendMail({
      from: `"Cinéma Deluxe" <${gmailUser || 'notifications@cinema.com'}>`,
      to: userEmail,
      subject: "✅ Confirmation de votre réservation cinéma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; background-color: #d32f2f; color: white; padding: 10px 0; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">Confirmation de Réservation</h1>
            <p style="margin: 5px 0;">Numéro de réservation: #${booking._id.toString().substring(0, 8).toUpperCase()}</p>
          </div>
          
          <div style="padding: 20px;">
            <p style="font-size: 16px;">Bonjour <strong>${userName}</strong>,</p>
            <p>Votre réservation a été confirmée avec succès. Voici les détails de votre réservation :</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #d32f2f;">${movieTitle}</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; width: 40%;"><strong>Date et heure :</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${formattedDate} à ${booking.showtime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Salle :</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">Salle ${Math.floor(Math.random() * 10) + 1}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Cinéma :</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${booking.theater || 'Non spécifié'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Ville :</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${booking.city || 'Non spécifiée'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Sièges :</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${booking.seats.join(', ')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Nombre de places :</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${booking.seats.length}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Prix total :</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${booking.totalPrice} MAD</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Statut :</strong></td>
                  <td style="padding: 8px 0; color: green;"><strong>${booking.status === 'confirmed' ? 'Confirmé' : booking.status}</strong></td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <img src="${qrCodeBase64}" alt="QR Code" style="max-width: 150px;" />
              <p style="font-size: 14px; color: #666;">Présentez ce QR code à l'entrée du cinéma</p>
            </div>
            
            <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="margin-top: 0; color: #ff6f00;">Informations importantes</h3>
              <ul style="padding-left: 20px; margin-bottom: 0;">
                <li>Veuillez arriver au moins 15 minutes avant le début de la séance.</li>
                <li>Les tickets sont valables uniquement pour la séance indiquée.</li>
                <li>Aucun remboursement n'est possible après confirmation, sauf en cas d'annulation de la séance.</li>
                <li>Des frais supplémentaires pourront être appliqués pour les lunettes 3D si nécessaire.</li>
              </ul>
            </div>
            
            <p>Nous vous souhaitons une excellente séance et vous remercions de votre confiance.</p>
            
            <p style="margin-top: 30px;">Cordialement,</p>
            <p style="margin: 0;"><strong>L'équipe de Cinéma Deluxe</strong></p>
          </div>
          
          <div style="background-color: #424242; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">© 2024 Cinéma Deluxe - Tous droits réservés</p>
            <p style="margin: 0;">Pour toute question, contactez-nous au <span style="color: #ffc107;">+33 1 23 45 67 89</span> ou par email à <a href="mailto:support@cinema.com" style="color: #ffc107;">support@cinema.com</a></p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'ticket-qrcode.png',
          path: qrFilePath,
          cid: 'qrcode@cinema.com' // Identifiant unique pour référencer dans l'email si nécessaire
        }
      ]
    });

    // Afficher les informations appropriées
    if (gmailUser && gmailPass) {
      console.log("Email envoyé avec succès à:", userEmail);
    } else {
      console.log("Email de test envoyé via Ethereal: %s", info.messageId);
      console.log("Voir l'email de test ici: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
}

async function sendMovieCancellationEmail(movie, bookings) {
  console.log('Attempting to send movie cancellation email...');
  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    
    let transporter;
    
    if (gmailUser && gmailPass) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    // The 'to' field needs to be an array of email addresses.
    const recipientEmails = bookings.map(booking => {
      // Logic to determine which email to use for each booking
      // Currently, this part is missing or needs to be adjusted
      // to use the booking.email field reliably.
      return booking.email; // Always use the email from the booking document
    }).filter(email => email); // Filter out any null or undefined emails

    if (recipientEmails.length === 0) {
      console.warn('No valid email addresses found for movie cancellation emails.');
      return;
    }

    // Envoyer un email à chaque utilisateur ayant une réservation
    for (const booking of bookings) {
      try {
        // Récupérer l'email de l'utilisateur.
        // Explicitly check if booking.user is an object (populated user) or use booking.email for guests
        const userEmail = booking.email;
        
        if (!userEmail) {
          console.warn(`Email utilisateur non trouvé pour la réservation ${booking._id}. Email non envoyé.`);
          continue; // Passer à la réservation suivante si l'email n'est pas trouvé
        }

        console.log("Booking object in sendMovieCancellationEmail:", booking);
        // Récupérer les informations du film et de la séance pour l'email
        const movieTitle = movie.title;
        const showtime = booking.showtime;
        const date = booking.date;

        // Contenu de l'email d'annulation
        const mailOptions = {
          from: `"Cinéma Deluxe" <${gmailUser || 'notifications@cinema.com'}>`,
          to: userEmail,
          subject: "❌ Annulation de votre séance cinéma",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <div style="text-align: center; background-color: #d32f2f; color: white; padding: 10px 0; border-radius: 5px 5px 0 0;">
                <h1 style="margin: 0;">Séance Annulée</h1>
              </div>
              
              <div style="padding: 20px;">
                <p style="font-size: 16px;">Bonjour,</p>
                <p>Nous vous informons que la séance du film <strong>${movieTitle}</strong> prévue le <strong>${date}</strong> à <strong>${showtime}</strong> a été annulée par l'organisateur.</p>
                <p>Nous vous prions de nous excuser pour ce désagrément.</p>
                
                <p>Votre réservation pour cette séance a été annulée. Si vous avez des questions, veuillez contacter l'organisateur.</p>
                
                <p style="margin-top: 30px;">Cordialement,</p>
                <p style="margin: 0;"><strong>L'équipe de Cinéma Deluxe</strong></p>
              </div>
              
              <div style="background-color: #424242; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; font-size: 14px;">
                <p style="margin: 0 0 10px 0;">© 2024 Cinéma Deluxe - Tous droits réservés</p>
                <p style="margin: 0;">Pour toute question, contactez-nous au <span style="color: #ffc107;">+33 1 23 45 67 89</span> ou par email à <a href="mailto:support@cinema.com" style="color: #ffc107;">support@cinema.com</a></p>
              </div>
            </div>
          `,
        };

        // Envoyer l'email
        let info = await transporter.sendMail(mailOptions);

        console.log('Email sent successfully. Info:', info);

        if (gmailUser && gmailPass) {
          console.log("Email d'annulation envoyé avec succès à:", userEmail);
        } else {
          console.log("Email d'annulation de test envoyé via Ethereal à %s: %s", userEmail, info.messageId);
          console.log("Voir l'email de test ici: %s", nodemailer.getTestMessageUrl(info));
        }

      } catch (error) {
        console.error(`Erreur lors de l'envoi de l'email d'annulation pour la réservation ${booking._id}:`, error);
      }
    }

    console.log(`${bookings.length} emails d'annulation tentés d'envoyer.`);

  } catch (error) {
    console.error('Error sending movie cancellation email:', error);
    throw error; // Propage l'erreur pour qu'elle soit gérée plus haut si nécessaire
  }
}

async function sendReminderEmail(booking) {
  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    
    let transporter;
    
    if (gmailUser && gmailPass) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const info = await transporter.sendMail({
      from: `"Cinéma Deluxe" <${gmailUser || 'notifications@cinema.com'}>`,
      to: booking.email,
      subject: "⏰ Rappel de votre séance - Cinéma Deluxe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; background-color: #4caf50; color: white; padding: 10px 0; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">Rappel de Séance</h1>
          </div>
          
          <div style="padding: 20px;">
            <p style="font-size: 16px;">Bonjour <strong>${booking.name}</strong>,</p>
            <p>Nous vous rappelons votre séance de cinéma prévue demain :</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #4caf50;">${booking.movieTitle}</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Date :</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${booking.date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Horaire :</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${booking.showtime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Cinéma :</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${booking.theater}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Ville :</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${booking.city}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Sièges :</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${booking.seats.join(', ')}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h3 style="margin-top: 0; color: #2e7d32;">Informations importantes</h3>
              <ul style="padding-left: 20px; margin-bottom: 0;">
                <li>N'oubliez pas d'apporter votre QR code ou votre billet.</li>
                <li>Veuillez arriver au moins 15 minutes avant le début de la séance.</li>
                <li>Les portes ferment 5 minutes avant le début du film.</li>
              </ul>
            </div>
            
            <p>Nous vous souhaitons une excellente séance !</p>
            
            <p style="margin-top: 30px;">Cordialement,</p>
            <p style="margin: 0;"><strong>L'équipe de Cinéma Deluxe</strong></p>
          </div>
          
          <div style="background-color: #424242; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">© 2024 Cinéma Deluxe - Tous droits réservés</p>
            <p style="margin: 0;">Pour toute question, contactez-nous au <span style="color: #4caf50;">+33 1 23 45 67 89</span> ou par email à <a href="mailto:support@cinema.com" style="color: #4caf50;">support@cinema.com</a></p>
          </div>
        </div>
      `
    });

    console.log(`Email de rappel envoyé à ${booking.email}`);
    return info;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de rappel:', error);
    throw error;
  }
}

module.exports = { 
  sendBookingConfirmation,
  sendMovieCancellationEmail,
  sendReminderEmail
};
