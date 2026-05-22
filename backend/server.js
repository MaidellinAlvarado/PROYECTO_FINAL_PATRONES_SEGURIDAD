require('dotenv').config(); // Carga las variables de entorno
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor API seguro corriendo en http://localhost:${PORT}`);
  });
});