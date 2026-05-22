const { RateLimiterMemory } = require('rate-limiter-flexible');
const auditLogService = require('../services/auditLog.service');

// Límite para Login (5 intentos por 15 minutos)
const loginLimiter = new RateLimiterMemory({
  points: 5, // 5 intentos
  duration: 15 * 60, // 15 minutos
});

// Límite para Registro (3 intentos por hora)
const registerLimiter = new RateLimiterMemory({
  points: 3, 
  duration: 60 * 60, 
});

//  Límite General (100 requests por minuto)
const generalLimiter = new RateLimiterMemory({
  points: 100, 
  duration: 60, 
});

// Middleware genérico para aplicar cualquier limitador
const createRateLimitMiddleware = (limiterInstance) => {
  return async (req, res, next) => {
    try {
      // Usamos la IP como llave para limitar
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      await limiterInstance.consume(ip);
      next();
    } catch (rejRes) {
      // Registrar el abuso 
      auditLogService.log('security.rate_limited', req, {
        actorId: req.user?.id || null, 
        metadata: { path: req.originalUrl }
      });

      // Informar al cliente que ha sido bloqueado temporalmente

      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      res.set('Retry-After', String(secs));

      return res.status(429).json({ 
        error: 'Demasiadas peticiones. Por favor, intente más tarde.' 
      });
    }
  };
};

// Exportamos los middlewares ya listos para usar en las rutas
module.exports = {
  loginRateLimiter: createRateLimitMiddleware(loginLimiter),
  registerRateLimiter: createRateLimitMiddleware(registerLimiter),
  generalRateLimiter: createRateLimitMiddleware(generalLimiter)
};