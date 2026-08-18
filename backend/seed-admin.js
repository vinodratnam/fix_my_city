const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    const email = 'admin@civicwatch.com';
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log(`Admin user with email ${email} already exists!`);
      // Update their role to admin and password just in case
      const salt = await bcrypt.genSalt(10);
      existingAdmin.password = await bcrypt.hash('admin123', salt);
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin user credentials updated: admin@civicwatch.com / admin123');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const adminUser = new User({
        name: 'Municipal Admin',
        email,
        password: hashedPassword,
        role: 'admin'
      });

      await adminUser.save();
      console.log('Admin user created successfully: admin@civicwatch.com / admin123');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

seedAdmin();
