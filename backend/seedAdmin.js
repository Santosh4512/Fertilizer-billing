const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fertilizer-shop';

if (!adminEmail || !adminPassword) {
  console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for admin seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    await connectDB();

    const admin = await User.findOne({ email: adminEmail });

    if (admin) {
      admin.password = adminPassword;
      await admin.save();
      console.log(`Updated admin user: ${adminEmail}`);
    } else {
      await User.create({ name: 'Admin', email: adminEmail, password: adminPassword });
      console.log(`Created admin user: ${adminEmail}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
