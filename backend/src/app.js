const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const auditLogService = require('./services/auditLog.service');


const app = express();

//MIDDLEWARES GLOBALES DE SEGURIDAD

app.use(helmet()); 
app.use(express.json()); 
app.use(cookieParser()); 
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true 
}));

// RATE LIMITER CON AUDITORÍA 
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


// RUTAS
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api', require('./routes/task.routes'));
app.use('/api', require('./routes/project.routes'));

// MIDDLEWARE GLOBAL DE MANEJO DE ERRORES CON AUDITORÍA

app.use(async (err, req, res, next) => {

  if (err.status === 403) {
    await auditLogService.log('security.unauthorized', req, {
      metadata: { reason: err.message, path: req.originalUrl }
    });
  }

  console.error("🔍 ERROR DETECTADO:", err); 

  const status = err.status || 500;
  const message = status === 500 ? 'Error interno del servidor' : err.message;
  
  res.status(status).json({ message });
});

module.exports = app;