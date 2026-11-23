const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/plenti_db';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn(`⚠️ Running with in-memory / fallback mode until a valid MONGO_URI is configured in server/.env`);
  }
};

module.exports = connectDB;
