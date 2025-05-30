const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Définissez explicitement l'URI MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/cinema';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB Connected Successfully');
  
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: 'organisateur@example.com' });
    
    if (existingUser) {
      console.log('Un utilisateur avec cet email existe déjà');
      // Mettre à jour le rôle si nécessaire
      if (existingUser.role !== 'organizer') {
        existingUser.role = 'organizer';
        await existingUser.save();
        console.log('Le rôle de l\'utilisateur a été mis à jour à "organizer"');
      }
    } else {
      // Créer un nouvel utilisateur organisateur
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      const organizer = new User({
        name: 'Organisateur',
        username: 'organisateur',
        email: 'organisateur@example.com',
        password: hashedPassword,
        phone: '0123456789',
        role: 'organizer'
      });
      
      await organizer.save();
      console.log('Utilisateur organisateur créé avec succès');
      console.log('Email: organisateur@example.com');
      console.log('Mot de passe: password123');
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
  
  mongoose.disconnect();
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
}); 