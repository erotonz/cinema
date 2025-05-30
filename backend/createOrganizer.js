const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Définissez explicitement l'URI MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/cinema';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB Connected Successfully');
  
  try {
    // Créer un nouvel utilisateur organisateur directement dans la collection
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Insérer directement dans la collection users
    const result = await mongoose.connection.collection('users').insertOne({
      username: 'organisateur',
      email: 'organisateur@example.com',
      password: hashedPassword,
      phone: '0123456789',
      role: 'organizer',
      createdAt: new Date()
    });
    
    console.log('Utilisateur organisateur créé avec succès');
    console.log('Email: organisateur@example.com');
    console.log('Mot de passe: password123');
    
  } catch (error) {
    // Si l'utilisateur existe déjà, mettre à jour son mot de passe
    if (error.code === 11000) { // Code d'erreur pour duplicate key
      console.log('L\'utilisateur existe déjà, mise à jour du mot de passe...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await mongoose.connection.collection('users').updateOne(
        { email: 'organisateur@example.com' },
        { $set: { password: hashedPassword, role: 'organizer' } }
      );
      
      console.log('Mot de passe mis à jour avec succès');
      console.log('Email: organisateur@example.com');
      console.log('Mot de passe: password123');
    } else {
      console.error('Erreur:', error);
    }
  }
  
  mongoose.disconnect();
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
}); 