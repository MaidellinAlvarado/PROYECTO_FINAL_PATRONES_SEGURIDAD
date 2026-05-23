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
      const updateData = req.body;

      // Actualizamos la tarea
      const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true });
      res.status(200).json({ message: 'Tarea actualizada', task: updatedTask });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = taskController;