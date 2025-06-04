const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const { sendReminderEmail, sendMovieCancellationEmail } = require('./emailservice');
const schedule = require('node-schedule');
const mongoose = require('mongoose');

// Fonction pour envoyer des rappels pour les séances du lendemain
async function scheduleReminders() {
  try {
    // Récupérer toutes les réservations confirmées pour demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const bookings = await Booking.find({
      date: tomorrowStr,
      status: 'confirmed'
    }).populate('movie');

    // Envoyer un email de rappel pour chaque réservation
    for (const booking of bookings) {
      try {
        await sendReminderEmail(booking);
        console.log(`Rappel envoyé pour la réservation ${booking._id}`);
      } catch (error) {
        console.error(`Erreur lors de l'envoi du rappel pour la réservation ${booking._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Erreur lors de la planification des rappels:', error);
  }
}

// Fonction pour annuler une séance et notifier les utilisateurs
async function cancelMovieSession(movieId, showtime) {
  try {
    // Récupérer le film
    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw new Error('Film non trouvé');
    }

    console.log('Searching for confirmed bookings with:', { movie: movieId, showtime: showtime, status: 'confirmed' }); // Log search criteria

    // Récupérer toutes les réservations pour cette séance AVANT de les annuler
    const allBookingsToCancel = await Booking.find({
      movie: movieId,
      showtime: showtime,
      status: 'confirmed',
    }).populate('user'); // Populate user to access email if it's a registered user

    console.log('Found bookings to cancel (before update):', allBookingsToCancel); // Log results

    // Mettre à jour le statut de TOUTES les réservations trouvées pour cette séance
    console.log('Updating bookings with criteria:', { movie: movieId, showtime: showtime, status: 'confirmed' }); // Log update criteria
    const updateResult = await Booking.updateMany(
      {
        movie: movieId,
        showtime: showtime,
        status: 'confirmed'
      },
      {
        $set: { status: 'cancelled' }
      }
    );
    console.log('Update result:', updateResult); // Log update result

    // Send cancellation emails to all relevant bookings found BEFORE the update
    // Only attempt to send emails if there are bookings to cancel
    if (allBookingsToCancel.length > 0) {
      console.log('Attempting to send emails for bookings:', allBookingsToCancel);
      await sendMovieCancellationEmail(movie, allBookingsToCancel);
    }

    console.log(`${allBookingsToCancel.length} emails d'annulation tentés d'envoyer.`);

    // Mettre à jour les places disponibles dans le film
    // This part assumes allBookingsToCancel[0] exists and has city/theater. Need to be careful if no bookings are found.
    if (allBookingsToCancel.length > 0) {
      const city = movie.cities.find(c => c.name === allBookingsToCancel[0]?.city);
      if (city) {
        const theater = city.theaters.find(t => t.name === allBookingsToCancel[0]?.theater);
        if (theater) {
          const showtimeObj = theater.showtimes.find(s => s.time === showtime);
          if (showtimeObj) {
            showtimeObj.seats.forEach(seat => {
              seat.isBooked = false;
            });
          }
        }
      }
    }

    await movie.save();

    return {
      success: true,
      message: `Séance annulée avec succès. ${allBookingsToCancel.length} utilisateurs/réservations ont été notifiés/annulés.`
    };
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la séance:', error);
    throw error; // Propage l'erreur pour qu'elle soit gérée plus haut si nécessaire
  }
}

// Planifier l'envoi des rappels tous les jours à 20h
schedule.scheduleJob('0 20 * * *', scheduleReminders);

module.exports = {
  scheduleReminders,
  cancelMovieSession
}; 