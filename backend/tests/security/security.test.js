// Inyectamos las variables de entorno obligatorias para que el entorno de pruebas funcione correctamente
process.env.ENCRYPTION_KEY = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
process.env.JWT_SECRET = 'secretito_test';
process.env.JWT_REFRESH_SECRET = 'secretito_test_refresh';

const request = require('supertest');
const app = require('../../src/app'); 
const mongoose = require('mongoose');

// Importamos los modelos para manipular la base de datos durante las pruebas
const User = require('../../src/models/User'); 
const Project = require('../../src/models/porject.model'); 
const Membership = require('../../src/models/membership.model');
// Variables globales para almacenar tokens y IDs que necesitaremos en las pruebas
let tokenViewer = '';
let tokenUsuarioA = '';
let tokenUsuarioB = '';
let proyectoIdA = '';

// Antes de ejecutar las pruebas, conectamos a la base de datos de test y preparamos los datos necesarios
beforeAll(async () => {
  const url = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/securecollab_test';
  await mongoose.connect(url);
  // Limpiamos las colecciones para tener un entorno limpio antes de cada corrida de tests
  await User.deleteMany({});
  await Project.deleteMany({});
  await Membership.deleteMany({});

  // Creamos usuarios con diferentes roles y un proyecto para probar los permisos
  const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: '123' });
  const viewer = await User.create({ name: 'Viewer', email: 'viewer@test.com', password: '123' });
  const usuarioA = await User.create({ name: 'User A', email: 'a@test.com', password: '123' });
  const usuarioB = await User.create({ name: 'User B', email: 'b@test.com', password: '123' });

  // Creamos un proyecto y asignamos roles a los usuarios para ese proyecto
  const proyectoA = await Project.create({ 
    name: 'Proyecto A', 
    description: 'Data de A',
    orgId: new mongoose.Types.ObjectId() 
  });
  proyectoIdA = proyectoA._id;

  // Asignamos membresías: Admin es project_admin, Viewer es viewer, Usuario A es developer, Usuario B no tiene acceso
  await Membership.create({ userId: admin._id, projectId: proyectoA._id, role: 'project_admin' });
  await Membership.create({ userId: viewer._id, projectId: proyectoA._id, role: 'viewer' });
  await Membership.create({ userId: usuarioA._id, projectId: proyectoA._id, role: 'developer' });

// Obtenemos los tokens de autenticación para cada usuario para usarlos en las pruebas
  const resViewer = await request(app).post('/api/auth/login').send({ email: 'viewer@test.com', password: '123' });
  tokenViewer = resViewer.body.accessToken;

  const resB = await request(app).post('/api/auth/login').send({ email: 'b@test.com', password: '123' });
  tokenUsuarioB = resB.body.accessToken;
});

// Después de todas las pruebas, cerramos la conexión a la base de datos
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Testing - SecureCollab', () => {

  it('Debe retornar 401: Petición sin token a un endpoint protegido', async () => {
    const response = await request(app).get('/api/orgs');
    expect(response.status).toBe(401);
  });

  it('Debe retornar 422: Inyección NoSQL en el payload', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: { "$gt": "" }, password: "password123" });
    expect(response.status).toBe(422); 
  });

  it('Debe retornar 429: Bloqueo tras 6 intentos de login fallidos', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/auth/login').send({ email: 'test_bruteforce@test.com', password: '123' });
    }
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test_bruteforce@test.com', password: '123' });

    expect(response.status).toBe(429);
    expect(response.headers).toHaveProperty('retry-after');
  });

  it('Debe retornar 403: Un Viewer no puede crear una tarea', async () => {
    const response = await request(app)
      .post(`/api/projects/${proyectoIdA}/tasks`)
      .set('Authorization', `Bearer ${tokenViewer}`) 
      .set('Cookie', [`refreshToken=${tokenViewer}`])
      .send({ title: 'Hacking task', description: 'Intento de escalada' });

    expect(response.status).toBe(403);
  });

  it('Debe retornar 403: Usuario B no puede ver tareas del proyecto del Usuario A', async () => {
    const response = await request(app)
      .get(`/api/projects/${proyectoIdA}/tasks`)
      .set('Authorization', `Bearer ${tokenUsuarioB}`)
      .set('Cookie', [`refreshToken=${tokenUsuarioB}`]);

    expect(response.status).toBe(403); 
  });

});