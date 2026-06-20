const mongoose = require('mongoose');
require('dotenv').config();

const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tata_supply_chain';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the MongoDB database:', error.message);
  }
};

module.exports = connectMongoDB;
