const AuditLog = require('../models/auditLog.model');

const auditLogService = {
  /**
   * * @param {string} action - Acción realizada (ej. 'auth.login.success')
   * @param {Object} req - El objeto request de Express (para extraer IP y User-Agent)
   * @param {Object} options - Opciones adicionales (actorId, resourceType, etc.)
   */
  log: async (action, req, { actorId = null, resourceType = null, resourceId = null, metadata = {} } = {}) => {
    try {

      const ip = req.ip || req.connection.remoteAddress || '0.0.0.0';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      // Creamos la instancia del log
      const newLog = new AuditLog({
        action,
        actorId,
        resourceType,
        resourceId,
        metadata,
        ip,
        userAgent
        // timestamp se genera automáticamente por el default: Date.now del modelo
      });

      // Guardamos en la BD
      await newLog.save();

      // Mostramos en consola durante desarrollo para verificar que funciona
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📝 Log de Auditoría guardado: [${action}] - IP: ${ip}`);
      }

    } catch (error) {
      console.error('❌ Error crítico en el servicio de Audit Log:', error.message);
    }
  }
};

module.exports = auditLogService;