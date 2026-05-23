// seed.js
require('dotenv').config();
const mongoose = require('mongoose');

// Importamos los modelos
const User = require('./src/models/User');
const Project = require('./src/models/Project');
const Membership = require('./src/models/membership.model');
const Task = require('./src/models/Task');

async function seedDatabase() {
  try {
    console.log('⏳ Conectando a la base de datos...');
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('🧹 Limpiando datos de prueba anteriores (si existen)...');
    await User.deleteMany({ email: { $regex: '@abac.com' } });
    await Project.deleteMany({ name: 'Proyecto Prueba ABAC' });

    console.log('🌱 Creando usuarios de prueba...');
    // Asumimos que tu modelo User cifra la contraseña automáticamente antes de guardar
    const viewerUser = await User.create({ name: 'Soy Viewer', email: 'viewer@abac.com', password: 'Password123!' });
    const dev1User = await User.create({ name: 'Soy Dev 1', email: 'dev1@abac.com', password: 'Password123!' });
    const dev2User = await User.create({ name: 'Soy Dev 2', email: 'dev2@abac.com', password: 'Password123!' });

    console.log('🏗️ Creando proyecto...');
    const fakeOrgId = new mongoose.Types.ObjectId(); // Mock rápido para pasar la validación
    const project = await Project.create({
      name: 'Proyecto Prueba ABAC',
      description: 'Proyecto generado por seed para pruebas',
      orgId: fakeOrgId
    });

    console.log('🤝 Asignando membresías...');
    await Membership.create([
      { userId: viewerUser._id, projectId: project._id, role: 'viewer' },
      { userId: dev1User._id, projectId: project._id, role: 'developer' },
      { userId: dev2User._id, projectId: project._id, role: 'developer' }
    ]);

    console.log('📝 Creando tareas...');
    const task1 = await Task.create({
      title: 'Tarea del Dev 1',
      projectId: project._id,
      assigneeId: dev1User._id,
      reporterId: dev2User._id
    });

    const task2 = await Task.create({
      title: 'Tarea del Dev 2',
      projectId: project._id,
      assigneeId: dev2User._id,
      reporterId: dev1User._id
    });

    console.log('\n✅ ¡SEED COMPLETADO CON ÉXITO! Usa estos datos en Postman:\n');
    console.log('--- CREDENCIALES ---');
    console.log('Viewer: viewer@abac.com / Password123!');
    console.log('Dev 1:  dev1@abac.com / Password123!');
    console.log('Dev 2:  dev2@abac.com / Password123!');
    
    console.log('\n--- IDs PARA TUS RUTAS ---');
    console.log(`ID del Proyecto : ${project._id}`);
    console.log(`ID Tarea (Dev 1): ${task1._id}`);
    console.log(`ID Tarea (Dev 2): ${task2._id}`);
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seeder:', error);
    process.exit(1);
  }
}

seedDatabase();