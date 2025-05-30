const axios = require('axios');

async function testBookingAPI() {
  try {
    // Les données exactement comme on les voit dans la console du frontend
    const bookingData = {
      cardNumber: "1234567890123",
      city: "Salé",
      cvv: "271",
      email: "housdin203@gmail.com",
      expiry: "12/25",
      movieId: "6822a2abb615ae7b2d4050d9",
      movieTitle: "Creed II",
      name: "houssine tounsi",
      phone: "0653335437",
      seats: ["A8"],
      showtime: "21:30",
      theater: "Ciné Atlas"
    };

    console.log('Envoi des données de réservation:', bookingData);

    // Appel direct à l'API
    const response = await axios.post('http://localhost:5001/api/bookings', bookingData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Réponse de l\'API:', response.status, response.statusText);
    console.log('Données de réponse:', response.data);
    console.log('Réservation créée avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'appel API:', error.message);
    if (error.response) {
      console.error('Statut de l\'erreur:', error.response.status);
      console.error('Détails de l\'erreur:', error.response.data);
    } else if (error.request) {
      console.error('Pas de réponse reçue:', error.request);
    }
  }
}

// Exécuter le test
testBookingAPI(); 