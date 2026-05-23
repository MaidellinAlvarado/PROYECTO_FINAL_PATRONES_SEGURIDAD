
const canReadTask = (user, task, membership) => {
  if (!membership) return false;
  
  // validamos que el rol sea uno de los permitidos para leer tareas
  const validRoles = ['viewer', 'developer', 'project_admin'];
  return validRoles.includes(membership.role);
};


const canEditTask = (user, task, membership) => {
  if (!membership) return false;

  // El project_admin tiene poder absoluto sobre las tareas del proyecto
  if (membership.role === 'project_admin') return true;

  // El developer solo puede editar si la tarea le pertenece a él
  if (membership.role === 'developer') {
    return String(task.assigneeId) === String(user.id);
  }

  // Si es viewer 
  return false;
};

// Solo project_admin y developer pueden crear tareas, pero el developer solo puede crear tareas que le asignen a él mismo
const canCreateTask = (user, membership) => {
  if (!membership) return false;
  return ['developer', 'project_admin'].includes(membership.role);
};

module.exports = {
  canReadTask,
  canEditTask,
  canCreateTask
};