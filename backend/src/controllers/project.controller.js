
const Project = require('../models/porject.model'); 
const Membership = require('../models/membership.model');
const auditLogService = require('../services/auditLog.service');
const { decrypt } = require('../security/encryption');

const projectController = {
  // Crear un proyecto
  createProject: async (req, res, next) => {
    try {
      const { name, description, visibility } = req.body;
      const orgId = req.params.id; 
      const creatorId = req.user.id; 

      const newProject = new Project({
        name,
        description,
        orgId,
        visibility,
        status: 'active',
        // Inicializamos los miembros con el creador como admin
        members: [{ userId: creatorId, role: 'project_admin' }]
      });
      await newProject.save();

      // Registro de auditoría
      await auditLogService.log('project.create', req, {
        actorId: creatorId,
        resourceType: 'Project',
        resourceId: newProject._id,
        metadata: { projectName: name }
      });

      res.status(201).json(newProject);
    } catch (error) {
      next(error);
    }
  },

  // Obtener proyectos por organización
  getProjectsByOrg: async (req, res, next) => {
    try {
      const projects = await Project.find({ orgId: req.params.id });
      res.status(200).json(projects);
    } catch (error) {
      next(error);
    }
  },

  // Obtener proyecto por ID
  getProjectById: async (req, res, next) => {
    try {
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: 'Proyecto no encontrado' });
      }

      res.status(200).json(project);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = projectController;