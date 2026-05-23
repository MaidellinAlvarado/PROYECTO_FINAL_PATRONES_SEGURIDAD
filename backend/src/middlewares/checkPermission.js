
const Task = require('../models/Task'); 
const Membership = require('../models/membership.model');
const auditLogService = require('../services/auditLog.service');

// Este middleware es específico para verificar permisos sobre tareas, pero la idea se puede adaptar a otros recursos (proyectos, usuarios, etc.)
const checkTaskPermission = (policy) => {
  return async (req, res, next) => {
    try {
      const taskId = req.params.id; 
      const projectId = req.params.projectId || req.body.projectId; 
      const userId = req.user.id;

      let task = null;
      let targetProjectId = projectId;

      // Si la ruta tiene un taskId, buscamos la tarea para saber a qué proyecto pertenece
      if (taskId) {
        task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
        targetProjectId = task.projectId;
      }

      if (!targetProjectId) {
        return res.status(400).json({ message: 'No se especificó el proyecto' });
      }

      // Buscamos la membresía del usuario en este proyecto específico
      const membership = await Membership.findOne({ 
        userId: userId, 
        projectId: targetProjectId 
      });

      //  Le pasamos los datos a la política 
      const isAllowed = policy(req.user, task, membership);

      if (!isAllowed) {
        // Registrar el intento de acceso no autorizado en el Audit Log
        await auditLogService.log('security.unauthorized', req, {
          actorId: userId,
          resourceType: 'Task',
          resourceId: taskId,
          metadata: { 
            reason: 'ABAC_policy_failed',
            policyName: policy.name 
          }
        });

        return res.status(403).json({ 
          message: 'No tienes los permisos necesarios para realizar esta acción en este proyecto.' 
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { checkTaskPermission };