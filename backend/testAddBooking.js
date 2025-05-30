const mongoose = require('mongoose');
const Booking = require('./models/Booking');

async function testAddBooking() {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/cinema', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connecté à MongoDB');
    
    // ID d'un film existant (à remplacer par un ID réel de votre base de données)
    const movieId = '682282aabb615ae7b2d40521'; // ID que vous avez vu dans la console
    
    // ID d'un utilisateur existant (à remplacer par un ID réel)
    const userId = '65a1b2c3d4e5f6a7b8c9d0e1'; // exemple d'ID, à remplacer
    
    // Données de réservation
    const bookingData = {
      movie: movieId,
      user: userId,
      showtime: '15:00',
      seats: ['1-1', '1-2'],
      totalPrice: 200, // Nouveau prix en MAD (100 MAD par place)
      status: 'confirmed'
    };
    
    console.log('Tentative d\'ajout d\'une réservation avec les données:', bookingData);
    
    // Méthode 1: Utilisation de new Booking et save()
    try {
      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();
      console.log('Réservation créée avec succès (méthode 1):', savedBooking);
    } catch (err) {
      console.error('Erreur méthode 1:', err);
      
      // Méthode 2: Utilisation de Booking.create()
      try {
        const booking = await Booking.create(bookingData);
        console.log('Réservation créée avec succès (méthode 2):', booking);
      } catch (err2) {
        console.error('Erreur méthode 2:', err2);
        
        // Méthode 3: Insertion directe
        try {
          const result = await mongoose.connection.db.collection('bookings').insertOne(bookingData);
          console.log('Réservation créée avec succès (méthode 3):', result);
        } catch (err3) {
          console.error('Erreur méthode 3:', err3);
        }
      }
    }
    
    // Vérifier si la réservation a été ajoutée
    const bookings = await Booking.find({});
    console.log(`Nombre de réservations dans la base: ${bookings.length}`);
    if (bookings.length > 0) {
      console.log('Dernière réservation:', bookings[bookings.length - 1]);
    }
    
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
    
  } catch (err) {
    console.error('Erreur globale:', err);
  }
}

// Exécuter le test
testAddBooking(); 