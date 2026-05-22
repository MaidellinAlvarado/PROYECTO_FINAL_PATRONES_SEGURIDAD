const auditLogService = require('../services/auditLog.service');

const errorHandler = async (err, req, res, next) => {
  const status = err.status || 500;

  // 🛡️ REQUISITO CLASE 10: Registrar accesos no autorizados
  if (status === 403) {
    // Nota: no usamos await aquí para no bloquear la respuesta rápida de error al cliente,
    // el servicio ya tiene su propio try/catch interno.
    auditLogService.log('security.unauthorized', req, {
      actorId: req.user?.id || null, // Asumiendo que tu auth middleware inyecta req.user
      metadata: { 
        method: req.method, 
        path: req.originalUrl, 
        message: err.message 
      }
    });
  }

  // No enviar stack traces al cliente (Requisito Clase 8)
  res.status(status).json({ 
    error: status < 500 ? err.message : 'Internal server error' 
  });
};

module.exports = errorHandler;