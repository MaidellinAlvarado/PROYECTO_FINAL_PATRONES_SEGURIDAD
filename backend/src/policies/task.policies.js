// este archivo define las políticas de acceso para las tareas, considerando el rol del usuario, la relación con la tarea y el estado del proyecto

const canReadTask = (user, task, project, membership, newStatus) => {
  if (!membership) return false;
  
  const validRoles = ['viewer', 'developer', 'project_admin'];
  return validRoles.includes(membership.role);
};

// solo para tareas sensibles, si no es sensible se puede leer sin importar el rol
const canReadSensitiveData = (user, task, project, membership, newStatus) => {
  if (!task.sensitive) return true;
  if (!membership) return false;
  
  return membership.role === 'project_admin' || String(task.assigneeId) === String(user.id);
};

// no se puede editar si el proyecto está archivado, incluso para admins. Un developer solo puede editar tareas que le pertenezcan (reporter) o estén asignadas a él (assignee)
const canEditTask = (user, task, project, membership, newStatus) => {
  if (!membership) return false;
  
  // Primero, no se puede editar si el proyecto está archivado, incluso para admins. Esto protege la integridad de los datos en proyectos que ya no están activos.
  if (project && project.status === 'archived') return false; 

  if (membership.role === 'project_admin') return true;

  // Regla para Developer: Editar si le pertenece (reporter) o está asignada a él (assignee)
  if (membership.role === 'developer') {
    const isAssignee = String(task.assigneeId) === String(user.id);
    const isReporter = String(task.reporterId) === String(user.id);
    return isAssignee || isReporter;
  }

  return false;
};

// Un developer solo puede cambiar el estado
const canChangeTaskStatus = (user, task, project, membership, newStatus) => {
  // Primero, no se puede alterar si el proyecto está archivado
  if (project && project.status === 'archived') return false;

  if (membership.role === 'project_admin') return true;

  if (membership.role === 'developer') {
     // Solo el assignee (o el project_admin evaluado arriba) puede mover a 'done'
     if (newStatus === 'done') {
         return String(task.assigneeId) === String(user.id);
     }
     // Si es otro estado, el developer asignado o el reporter pueden cambiarlo
     return String(task.assigneeId) === String(user.id) || String(task.reporterId) === String(user.id);
  }

  return false;
};

const canCreateTask = (user, task, project, membership, newStatus) => { 
  if (!membership) return false; // Agregamos esta defensa por seguridad
  if (project && project.status === 'archived') return false;
  return ['developer', 'project_admin'].includes(membership.role);
};

module.exports = {
  canReadTask,
  canReadSensitiveData,
  canEditTask,
  canChangeTaskStatus,
  canCreateTask
};