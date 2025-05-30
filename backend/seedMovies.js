const mongoose = require('mongoose');
const Movie = require('./models/Movie');

// Fonction pour générer un tableau de sièges
const generateSeats = (count) => Array(count).fill().map((_, i) => ({
  number: `${String.fromCharCode(65 + Math.floor(i / 10))}${(i % 10) + 1}`,
  isBooked: Math.random() > 0.8 // 20% des sièges sont réservés aléatoirement
}));

// Films actuellement à l'affiche
const movies = [
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    image: 'http://localhost:5001/api/images/tmdb/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    rating: 9,
    duration: '2h 32min',
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    genre: ['Action', 'Crime', 'Drama'],
    releaseDate: new Date('2008-07-18'),
    isUpcoming: false,
    // Ajouter les villes
    cities: [
      {
        name: 'Rabat',
        theaters: [
          {
            name: 'Cinéma Megarama',
            showtimes: [
              { time: '14:00', seats: generateSeats(50) },
              { time: '17:30', seats: generateSeats(50) },
              { time: '20:00', seats: generateSeats(50) }
            ]
          },
          {
            name: 'Cinéma Renaissance',
            showtimes: [
              { time: '15:30', seats: generateSeats(40) },
              { time: '19:00', seats: generateSeats(40) }
            ]
          }
        ]
      },
      {
        name: 'Salé',
        theaters: [
          {
            name: 'Cinéma Dawliz',
            showtimes: [
              { time: '16:00', seats: generateSeats(45) },
              { time: '20:30', seats: generateSeats(45) }
            ]
          }
        ]
      }
    ],
    // Maintenir la compatibilité avec l'ancien format
    showtimes: [
      { time: '14:00', seats: Array(50).fill({ number: '', isBooked: false }) },
      { time: '17:30', seats: Array(50).fill({ number: '', isBooked: false }) },
      { time: '20:00', seats: Array(50).fill({ number: '', isBooked: false }) }
    ]
  },
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    image: 'http://localhost:5001/api/images/tmdb/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    rating: 8.8,
    duration: '2h 28min',
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Ellen Page'],
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    releaseDate: new Date('2010-07-16'),
    isUpcoming: false,
    // Ajouter les villes
    cities: [
      {
        name: 'Rabat',
        theaters: [
          {
            name: 'Cinéma Megarama',
            showtimes: [
              { time: '15:00', seats: generateSeats(50) },
              { time: '18:30', seats: generateSeats(50) }
            ]
          }
        ]
      },
      {
        name: 'Salé',
        theaters: [
          {
            name: 'Cinéma Dawliz',
            showtimes: [
              { time: '14:30', seats: generateSeats(45) },
              { time: '18:00', seats: generateSeats(45) },
              { time: '21:00', seats: generateSeats(45) }
            ]
          },
          {
            name: 'Ciné Atlas',
            showtimes: [
              { time: '16:30', seats: generateSeats(35) },
              { time: '20:00', seats: generateSeats(35) }
            ]
          }
        ]
      }
    ],
    // Maintenir la compatibilité avec l'ancien format
    showtimes: [
      { time: '15:00', seats: Array(50).fill({ number: '', isBooked: false }) },
      { time: '18:30', seats: Array(50).fill({ number: '', isBooked: false }) },
      { time: '21:00', seats: Array(50).fill({ number: '', isBooked: false }) }
    ]
  },
  {
    title: 'Creed II',
    description: 'Under the tutelage of Rocky Balboa, newly crowned heavyweight champion Adonis Creed faces off against Viktor Drago, the son of Ivan Drago.',
    image: 'http://localhost:5001/api/images/tmdb/w500/v3QyboWRoA4O9RbcsqH8tJMe8EB.jpg',
    rating: 7.1,
    duration: '2h 10min',
    director: 'Steven Caple Jr.',
    cast: ['Michael B. Jordan', 'Sylvester Stallone', 'Tessa Thompson'],
    genre: ['Drama', 'Sport'],
    releaseDate: new Date('2018-11-21'),
    isUpcoming: false,
    // Ajouter les villes
    cities: [
      {
        name: 'Rabat',
        theaters: [
          {
            name: 'Cinéma Renaissance',
            showtimes: [
              { time: '16:00', seats: generateSeats(40) },
              { time: '19:00', seats: generateSeats(40) }
            ]
          }
        ]
      },
      {
        name: 'Salé',
        theaters: [
          {
            name: 'Ciné Atlas',
            showtimes: [
              { time: '17:30', seats: generateSeats(35) },
              { time: '21:30', seats: generateSeats(35) }
            ]
          }
        ]
      }
    ],
    // Maintenir la compatibilité avec l'ancien format
    showtimes: [
      { time: '16:00', seats: Array(50).fill({ number: '', isBooked: false }) },
      { time: '19:00', seats: Array(50).fill({ number: '', isBooked: false }) },
      { time: '21:30', seats: Array(50).fill({ number: '', isBooked: false }) }
    ]
  },
  // Ajout du film Casanegra
  {
    title: 'Casanegra',
    description: 'Chronique de la vie de deux jeunes de Casablanca qui tentent de survivre en utilisant la débrouillardise dans les quartiers populaires. Ce film emblématique dépeint avec réalisme les problèmes sociaux de la jeunesse marocaine.',
    image: 'https://i.ibb.co/nLB1BGf/casanegra.jpg',
    rating: 8.7,
    duration: '2h 10min',
    director: 'Nour-Eddine Lakhmari',
    cast: ['Nezha Rahil', 'Omar Lotfi', 'Mohamed Benbrahim'],
    genre: ['Drame', 'Action', 'Social'],
    releaseDate: new Date('2008-10-22'),
    isUpcoming: false,
    cities: [
      {
        name: 'Rabat',
        theaters: [
          {
            name: 'Cinéma Renaissance',
            showtimes: [
              { time: '15:00', seats: generateSeats(40) },
              { time: '18:30', seats: generateSeats(40) }
            ]
          },
          {
            name: 'Cinéma Megarama',
            showtimes: [
              { time: '16:15', seats: generateSeats(50) },
              { time: '20:45', seats: generateSeats(50) }
            ]
          }
        ]
      },
      {
        name: 'Salé',
        theaters: [
          {
            name: 'Cinéma Dawliz',
            showtimes: [
              { time: '17:00', seats: generateSeats(45) },
              { time: '21:15', seats: generateSeats(45) }
            ]
          }
        ]
      }
    ],
    showtimes: [
      { time: '15:00', seats: Array(50).fill({ number: '', isBooked: false }) },
      { time: '18:30', seats: Array(50).fill({ number: '', isBooked: false }) },
      { time: '21:15', seats: Array(50).fill({ number: '', isBooked: false }) }
    ]
  }
];

// Films prochainement à l'affiche
const upcomingMovies = [
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides joins the Fremen and begins a spiritual and martial journey to become Muad\'dib, while trying to prevent the terrible future he\'s witnessed.',
    image: 'https://m.media-amazon.com/images/M/MV5BODM1MDk3OTM4Ml5BMl5BanBnXkFtZTgwNDEzODY3NDM@._V1_.jpg',
    rating: 9.2,
    duration: '2h 45min',
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'],
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    releaseDate: new Date('2023-12-25'), // Date future
    releaseExpectedDate: new Date('2023-12-25'),
    isUpcoming: true,
    cities: [] // Pas de cinémas pour un film à venir
  },
  {
    title: 'Top Gun: Maverick 2',
    description: 'Pete "Maverick" Mitchell returns for a new adventure in the skies, training a new generation of Top Gun pilots for a specialized mission.',
    image: 'https://m.media-amazon.com/images/M/MV5BZWYzOGEwNTgtNWU3NS00ZTQ0LWJkODUtMmVhMjIwMjA1ZmQwXkEyXkFqcGdeQXVyMjkwOTAyMDU@._V1_.jpg',
    rating: 8.9,
    duration: '2h 20min',
    director: 'Joseph Kosinski',
    cast: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly'],
    genre: ['Action', 'Drama'],
    releaseDate: new Date('2024-02-15'), // Date future
    releaseExpectedDate: new Date('2024-02-15'),
    isUpcoming: true,
    cities: [] // Pas de cinémas pour un film à venir
  },
  {
    title: 'Spider-Man: Across the Multiverse',
    description: 'Miles Morales returns for the next chapter of the Spider-Verse saga, an epic adventure that will transport Brooklyn\'s full-time, friendly neighborhood Spider-Man across the Multiverse.',
    image: 'https://m.media-amazon.com/images/M/MV5BMzI0NmVkMjEtYmY4MS00ZDMxLTlkZmEtMzU4MDQxYTMzMjU2XkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_.jpg',
    rating: 9.0,
    duration: '2h 15min',
    director: 'Joaquim Dos Santos',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
    genre: ['Animation', 'Action', 'Adventure'],
    releaseDate: new Date('2024-01-10'), // Date future
    releaseExpectedDate: new Date('2024-01-10'),
    isUpcoming: true,
    cities: [] // Pas de cinémas pour un film à venir
  },
  // Films marocains à venir
  {
    title: 'Les Dames de Casablanca',
    description: 'Un drame puissant qui suit la vie de quatre femmes de différentes générations à Casablanca, confrontées aux défis sociaux et personnels dans le Maroc contemporain.',
    image: 'https://i.ibb.co/BCKXXrk/dames-casablanca.jpg',
    rating: 8.5,
    duration: '2h 05min',
    director: 'Hicham Lasri',
    cast: ['Nadia Kounda', 'Nisrin Erradi', 'Fatima Zahra Bennacer'],
    genre: ['Drame', 'Social'],
    releaseDate: new Date('2024-03-15'),
    releaseExpectedDate: new Date('2024-03-15'),
    isUpcoming: true,
    cities: []
  },
  {
    title: 'Le Cri des Dunes',
    description: 'Un jeune berger du désert marocain découvre un ancien artefact qui le mène à une aventure épique à travers les vastes étendues du Sahara.',
    image: 'https://i.ibb.co/wRdxTKk/cri-dunes.jpg',
    rating: 7.9,
    duration: '1h 55min',
    director: 'Nabil Ayouch',
    cast: ['Younes Bouab', 'Abdelilah Rachid', 'Fatima Attif'],
    genre: ['Aventure', 'Drame historique'],
    releaseDate: new Date('2024-04-10'),
    releaseExpectedDate: new Date('2024-04-10'),
    isUpcoming: true,
    cities: []
  },
  {
    title: 'Rêves de Médina',
    description: 'Dans la médina de Fès, une jeune artisane talentueuse rêve de moderniser l\'art traditionnel marocain tout en respectant ses racines culturelles profondes.',
    image: 'https://i.ibb.co/NSDDgsS/reves-medina.jpg',
    rating: 8.2,
    duration: '1h 45min',
    director: 'Maryam Touzani',
    cast: ['Nisrine Erradi', 'Mouna Fettou', 'Saadia Ladib'],
    genre: ['Drame', 'Culture'],
    releaseDate: new Date('2024-05-20'),
    releaseExpectedDate: new Date('2024-05-20'),
    isUpcoming: true,
    cities: []
  },
  {
    title: 'La Légende d\'Anzar',
    description: 'Un film d\'aventure basé sur les légendes berbères, racontant l\'histoire d\'un guerrier amazigh qui doit sauver son village d\'une menace mystique.',
    image: 'https://i.ibb.co/NN1v2ND/legende-anzar.jpg',
    rating: 8.7,
    duration: '2h 15min',
    director: 'Faouzi Bensaïdi',
    cast: ['Ahmed Hammoudi', 'Salima Benmoumen', 'Aziz Dadas'],
    genre: ['Aventure', 'Fantastique', 'Historique'],
    releaseDate: new Date('2024-07-12'),
    releaseExpectedDate: new Date('2024-07-12'),
    isUpcoming: true,
    cities: []
  },
  {
    title: 'Mémoires d\'Atlas',
    description: 'Un documentaire fictif qui explore la vie extraordinaire des communautés montagnardes de l\'Atlas, leurs traditions ancestrales et leur adaptation au monde moderne.',
    image: 'https://i.ibb.co/68NYZt1/memoires-atlas.jpg',
    rating: 9.0,
    duration: '1h 50min',
    director: 'Leila Kilani',
    cast: ['Hassan Badida', 'Fatima Ouchay', 'Mohamed Majd'],
    genre: ['Documentaire', 'Drame'],
    releaseDate: new Date('2024-06-08'),
    releaseExpectedDate: new Date('2024-06-08'),
    isUpcoming: true,
    cities: []
  },
  // Ajout du film Tarik Ila Kaboul
  {
    title: 'Tarik Ila Kaboul',
    description: 'Un drame saisissant sur un jeune Marocain qui part en Afghanistan pendant la période du régime des talibans. Ce film explore les questions d\'identité, de foi et d\'humanité dans un contexte géopolitique complexe.',
    image: 'https://i.ibb.co/k40qZQB/tarik-ila-kaboul.jpg',
    rating: 8.4,
    duration: '1h 58min',
    director: 'Ibrahim Chkiri',
    cast: ['Abdellah Ferkous', 'Youssef Britel', 'Said Bey'],
    genre: ['Drame', 'Guerre', 'Politique'],
    releaseDate: new Date('2024-05-03'),
    releaseExpectedDate: new Date('2024-05-03'),
    isUpcoming: true,
    cities: []
  }
];

async function seedMovies() {
  try {
    await mongoose.connect('mongodb://localhost:27017/cinema');
    console.log('Connected to MongoDB');
    
    await Movie.deleteMany({});
    console.log('Deleted existing movies');
    
    // Ajout des films actuels
    await Movie.insertMany(movies);
    console.log('Added current movies');
    
    // Ajout des films à venir
    await Movie.insertMany(upcomingMovies);
    console.log('Added upcoming movies');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding movies:', error);
  }
}

seedMovies();
