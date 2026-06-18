const Task = require('../models/Task');

const taskController = {

  // GET /api/projects/:projectId/tasks
  getProjectTasks: async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const tasks = await Task.find({ projectId });
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/projects/:projectId/tasks
  createTask: async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const { title, description, assigneeId, priority, sensitive, dueDate } = req.body;
      
      const newTask = new Task({
        title,
        description,
        projectId,
        assigneeId,
        reporterId: req.user.id, 
        priority,
        sensitive,
        dueDate
      });

      await newTask.save();
      res.status(201).json({ message: 'Tarea creada exitosamente', task: newTask });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/tasks/:id
  updateTask: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Para evitar que se actualicen campos no permitidos, solo extraemos los campos seguros
      const { title, description, priority, dueDate, sensitive } = req.body;

      // Construimos un objeto con solo los campos permitidos que fueron enviados
      const safeUpdateData = {};
      if (title !== undefined) safeUpdateData.title = title;
      if (description !== undefined) safeUpdateData.description = description;
      if (priority !== undefined) safeUpdateData.priority = priority;
      if (dueDate !== undefined) safeUpdateData.dueDate = dueDate;
      if (sensitive !== undefined) safeUpdateData.sensitive = sensitive;

      // Actualizamos la tarea con solo los campos permitidos
      const updatedTask = await Task.findByIdAndUpdate(
        id, 
        { $set: safeUpdateData }, 
        { new: true, runValidators: true } 
      );

      res.status(200).json({ message: 'Tarea actualizada de forma segura', task: updatedTask });
    } catch (error) {
      next(error);
    }
  }, 

  // PATCH /api/tasks/:id/status
  changeTaskStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body; 

      if (!status) {
        return res.status(400).json({ message: 'El campo status es requerido' });
      }

      // Actualizamos únicamente el estado de la tarea
      const updatedTask = await Task.findByIdAndUpdate(
        id, 
        { $set: { status: status } }, 
        { new: true, runValidators: true } 
      );

      if (!updatedTask) {
        return res.status(404).json({ message: 'Tarea no encontrada' });
      }

      res.status(200).json({ message: 'Estado de la tarea actualizado', task: updatedTask });
    } catch (error) {
      next(error);
    }
  }

}; 

module.exports = taskController;