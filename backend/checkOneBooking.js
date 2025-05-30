const mongoose = require('mongoose');

async function checkBookings() {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/cinema');
    console.log('Connecté à MongoDB');
    
    // Requête directe à la collection bookings sans utiliser le modèle
    const bookings = await mongoose.connection.db.collection('bookings').find({}).toArray();
    
    console.log(`Il y a ${bookings.length} réservation(s) dans la base de données.`);
    
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
    
    // Vérifier la structure de la collection bookings
    const collections = await mongoose.connection.db.listCollections().toArray();
    const bookingsCollection = collections.find(c => c.name === 'bookings');
    
    if (bookingsCollection) {
      console.log('\nStructure de la collection bookings:');
      console.log(bookingsCollection);
    } else {
      console.log('\nLa collection bookings n\'existe pas.');
    }
    
    await mongoose.disconnect();
    console.log('\nDéconnecté de MongoDB');
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

checkBookings(); 