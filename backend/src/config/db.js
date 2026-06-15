const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ Base de datos MongoDB conectada exitosamente en: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error fatal conectando a MongoDB: ${error.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;