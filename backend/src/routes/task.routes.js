const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');

// Importamos el middleware de autenticación y el de verificación de permisos
const { checkTaskPermission } = require('../middlewares/checkPermission');
const { canReadTask, canCreateTask, canEditTask } = require('../policies/task.policies');
// Middleware de autenticación para proteger todas las rutas de tareas
const { authenticateToken } = require('../middlewares/auth.middleware'); 

// Todas las rutas de tareas requieren estar autenticado primero
router.use(authenticateToken);

// Un viewer/developer/admin puede leer las tareas del proyecto
router.get('/projects/:projectId/tasks', checkTaskPermission(canReadTask), taskController.getProjectTasks);

// Un admin puede crear tareas para cualquier usuario, un developer solo puede crear tareas que se le asignen a él mismo
router.post('/projects/:projectId/tasks', checkTaskPermission(canCreateTask), taskController.createTask);

// Un admin puede editar cualquier tarea, un developer solo puede editar tareas que le estén asignadas a él
router.put('/tasks/:id', checkTaskPermission(canEditTask), taskController.updateTask);

module.exports = router;