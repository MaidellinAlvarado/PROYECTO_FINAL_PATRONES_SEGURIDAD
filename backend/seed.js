require('dotenv').config();
const mongoose = require('mongoose');

// Importamos los modelos 
const User = require('./src/models/User');
const Project = require('./src/models/porject.model');
const Membership = require('./src/models/membership.model');
const Task = require('./src/models/Task');

async function seedDatabase() {
  try {
    console.log('⏳ Conectando a la base de datos...');
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('🧹 Limpiando datos de prueba anteriores...');
    await User.deleteMany({ email: { $regex: '@abac.com' } });
    await Project.deleteMany({ name: 'Proyecto Prueba ABAC' });
    // Es vital limpiar las membresías para evitar conflictos de IDs únicos
    await Membership.deleteMany({}); 

    console.log('🌱 Creando a nuestro super usuario de pruebas...');
    const dev1User = await User.create({ 
      name: 'Soy Dev 1', 
      email: 'dev1@abac.com', 
      password: 'Password123!',
      role: 'super_admin'
    });

    console.log('🏢 Generando Organización...');
    const testOrgId = new mongoose.Types.ObjectId(); 

    console.log('🏗️ Creando proyecto...');
    const project = await Project.create({
      name: 'Proyecto Prueba ABAC',
      description: 'Proyecto generado por seed para pruebas',
      orgId: testOrgId
    });

    console.log('🤝 Asignando membresía ');
    // Hacemos que Dev 1 sea administrador total de este proyecto
    await Membership.create([
      { userId: dev1User._id, projectId: project._id, role: 'project_admin' }
    ]);

    console.log('\n✅ ¡SEED COMPLETADO CON ÉXITO!\n');
    console.log(`ID de Organización : ${testOrgId}`);
    console.log(`ID del Proyecto    : ${project._id} `);
  

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seeder:', error);
    process.exit(1);
  }
}

seedDatabase();