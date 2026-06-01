const auditLogService = require('../services/auditLog.service');

const errorHandler = async (err, req, res, next) => {
  const status = err.status || 500;

  //  Registrar accesos no autorizados
  if (status === 403) {
    auditLogService.log('security.unauthorized', req, {
      actorId: req.user?.id || null, 
      metadata: { 
        method: req.method, 
        path: req.originalUrl, 
        message: err.message 
      }
    });
  }

  // No enviar stack traces al cliente en producción
  res.status(status).json({ 
    error: status < 500 ? err.message : 'Internal server error' 
  });
};

module.exports = errorHandler;