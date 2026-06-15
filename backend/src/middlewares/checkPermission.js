const Task = require('../models/Task'); 
const Membership = require('../models/membership.model');
const Project = require('../models/porject.model'); 
const auditLogService = require('../services/auditLog.service');

const checkTaskPermission = (policy) => {
  return async (req, res, next) => {
    try {
      const taskId = req.params.id; 
      
      // Intentamos obtener el projectId desde los parámetros o el cuerpo de la solicitud, dependiendo del endpoint
      const projectId = req.params.projectId || req.body?.projectId; 
      const userId = req.user.id;

      let task = null;
      let targetProjectId = projectId;

      if (taskId) {
        task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
        targetProjectId = task.projectId;
      }

      if (!targetProjectId) {
        return res.status(400).json({ message: 'No se especificó el proyecto' });
      }

      const membership = await Membership.findOne({ 
        userId: userId, 
        projectId: targetProjectId 
      });

      const project = await Project.findById(targetProjectId);
      if (!project) return res.status(404).json({ message: 'Proyecto no encontrado' });

      // Obtenemos el nuevo estado propuesto para validar las reglas de cambio de estado, si es que se está intentando cambiar el estado
      const newStatus = req.body?.status;
      
      const isAllowed = policy(req.user, task, project, membership, newStatus);

      if (!isAllowed) {
        await auditLogService.log('security.unauthorized', req, {
          actorId: userId,
          resourceType: 'Task',
          resourceId: taskId || targetProjectId,
          metadata: { 
            reason: 'ABAC_policy_failed',
            policyName: policy.name 
          }
        });

        return res.status(403).json({ 
          message: 'No tienes los permisos necesarios para realizar esta acción en este proyecto o está archivado.' 
        });
      }

      req.currentTask = task; 
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { checkTaskPermission };