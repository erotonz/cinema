const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

console.log('MongoDB URI:', process.env.MONGODB_URI); // Pour le débogage

const users = [
  {
    username: 'admin',
    email: 'admin@cinema.com',
    password: 'admin123',
    phone: '0123456789',
    role: 'admin'
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    password: 'user123',
    phone: '0123456788',
    role: 'user'
  },
  {
    username: 'user2',
    email: 'user2@example.com',
    password: 'user123',
    phone: '0123456787',
    role: 'user'
  }
];

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cinema', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB successfully');
    
    // Clear existing users except admin
    console.log('Clearing existing regular users...');
    await User.deleteMany({ role: 'user' });
    
    // Check if admin exists
    console.log('Checking for admin user...');
    const adminExists = await User.findOne({ email: 'admin@cinema.com' });
    if (!adminExists) {
      console.log('Creating admin user...');
      await User.create(users[0]);
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Create regular users
    console.log('Creating regular users...');
    await User.create(users.slice(1));
    console.log('Regular users created successfully');
    
    console.log('Database seeding completed');
    
    // Log all users for verification
    const allUsers = await User.find({}).select('-password');
    console.log('Current users in database:', allUsers);
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB(); 