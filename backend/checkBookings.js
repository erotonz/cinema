const mongoose = require('mongoose');
const Booking = require('./models/Booking');

mongoose.connect('mongodb://localhost:27017/cinema', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB Connected');
  
  try {
    // Compter le nombre de réservations
    const count = await Booking.countDocuments();
    console.log(`Il y a ${count} réservation(s) dans la base de données.`);
    
    // Récupérer toutes les réservations avec les détails
    const bookings = await Booking.find().populate('movie user');
    
    if (bookings.length === 0) {
      console.log('Aucune réservation trouvée.');
    } else {
      console.log('\nListe des réservations:');
      bookings.forEach((booking, index) => {
        console.log(`\nRéservation ${index + 1}:`);
        console.log(`ID: ${booking._id}`);
        console.log(`Film ID: ${booking.movie}`);
        console.log(`Utilisateur ID: ${booking.user}`);
        console.log(`Horaire: ${booking.showtime}`);
        console.log(`Sièges: ${booking.seats.join(', ')}`);
        console.log(`Prix total: ${booking.totalPrice}`);
        console.log(`Statut: ${booking.status}`);
        console.log(`Créée le: ${booking.createdAt}`);
      });
    }
  } catch (err) {
    console.error('Erreur:', err);
  } finally {
    mongoose.disconnect();
  }
})
.catch(err => {
  console.error('Erreur de connexion MongoDB:', err);
}); 