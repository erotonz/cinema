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
    // Créer un nouvel utilisateur admin directement dans la collection
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Insérer directement dans la collection users
    const result = await mongoose.connection.collection('users').insertOne({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      phone: '0123456789',
      role: 'admin',
      createdAt: new Date()
    });
    
    console.log('Utilisateur admin créé avec succès');
    console.log('Email: admin@example.com');
    console.log('Mot de passe: admin123');
    
  } catch (error) {
    // Si l'utilisateur existe déjà, mettre à jour son mot de passe
    if (error.code === 11000) { // Code d'erreur pour duplicate key
      console.log('L\'utilisateur existe déjà, mise à jour du mot de passe...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await mongoose.connection.collection('users').updateOne(
        { email: 'admin@example.com' },
        { $set: { password: hashedPassword, role: 'admin' } }
      );
      
      console.log('Mot de passe mis à jour avec succès');
      console.log('Email: admin@example.com');
      console.log('Mot de passe: admin123');
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