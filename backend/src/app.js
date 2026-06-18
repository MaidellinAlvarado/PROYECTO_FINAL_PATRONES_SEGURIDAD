const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const auditLogService = require('./services/auditLog.service');

// 1. Inicializamos la aplicación
const app = express();

// 2. Configuramos los orígenes permitidos (La lista VIP de CORS)
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// 3. MIDDLEWARES GLOBALES DE SEGURIDAD
app.use(helmet()); 
app.use(express.json()); 
app.use(cookieParser()); 
app.use(cors({
  origin: allowedOrigins,
  credentials: true 
}));

// 4. RUTAS (Que no pasan por el Rate Limiter global)
app.use('/api/orgs', require('./routes/organization.routes'));

// 5. RATE LIMITER CON AUDITORÍA 
const rateLimiter = new RateLimiterMemory({
  points: 100, // 100 peticiones
  duration: 60, // por 60 segundos por IP
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    const retryAfter = Math.round(rejRes.msBeforeNext / 1000);
    
    await auditLogService.log('security.rate_limited', req, {
      metadata: { retryAfter }
    });
    
    res.set('Retry-After', String(retryAfter));
    res.status(429).json({ message: 'Demasiadas peticiones. Intente más tarde.' });
  }
});

// 6. RUTAS (Que sí pasan por el Rate Limiter)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api', require('./routes/task.routes'));
app.use('/api', require('./routes/project.routes'));

// 7. MIDDLEWARE GLOBAL DE MANEJO DE ERRORES
app.use(async (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error("🔍 ERROR DETECTADO:", err);
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Error interno del servidor' : err.message;
  
  res.status(status).json({ message });
});

module.exports = app;