const axios = require('axios');

const token = 'YOUR_TOKEN_HERE'; // Remplacez par un token JWT valide

// Test des routes de l'API
async function testApi() {
  const baseUrl = 'http://localhost:5002/api';
  
  try {
    // Test de la route /movies
    console.log('Test GET /movies');
    console.log(`URL: ${baseUrl}/movies`);
    
    const moviesResponse = await axios.get(`${baseUrl}/movies`);
    console.log(`Statut: ${moviesResponse.status}`);
    console.log(`Nombre de films: ${moviesResponse.data.data.length}`);
    console.log('-------------------');
    
    // Exemple de film pour test
    if (moviesResponse.data.data.length > 0) {
      const movie = moviesResponse.data.data[0];
      console.log(`Film d'exemple: ${movie.title}`);
      console.log(`ID: ${movie._id}`);
      console.log(`Séances disponibles: ${movie.showtimes.length}`);
      console.log('-------------------');
    }
    
    // Plus de tests si un token est fourni
    if (token !== 'YOUR_TOKEN_HERE') {
      // Test de la route /bookings (nécessite authentification)
      console.log('Test GET /bookings');
      const bookingsResponse = await axios.get(`${baseUrl}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`Statut: ${bookingsResponse.status}`);
      console.log(`Nombre de réservations: ${bookingsResponse.data.data.length}`);
      console.log('-------------------');
    } else {
      console.log('Pas de token fourni - impossible de tester les routes protégées');
    }
    
  } catch (error) {
    console.error('Erreur de test API:');
    if (error.code) {
      console.error(`Code d'erreur: ${error.code}`);
    }
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    } else if (error.request) {
      console.error('Pas de réponse reçue du serveur');
      console.error(error.request);
    } else {
      console.error('Erreur de configuration:', error.message);
    }
    console.error(error.stack);
  }
}

testApi(); 