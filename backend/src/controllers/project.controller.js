const Project = require('../models/Project');
const Membership = require('../models/membership.model');
const auditLogService = require('../services/auditLog.service');

const projectController = {

  // CREAR UN PROYECTO
  createProject: async (req, res, next) => {
    try {
      const { name, description, visibility } = req.body;
      const { orgId } = req.params; 
      

      const creatorId = req.user.id; 

      // Crear el registro del Proyecto
      const newProject = new Project({
        name,
        description,
        orgId,
        visibility,
        status: 'active'
      });
      await newProject.save();

      //  Asignar al creador como 'project_admin'
      const adminMembership = new Membership({
        userId: creatorId,
        projectId: newProject._id,
        role: 'project_admin'
      });
      await adminMembership.save();

      //  Dejar rastro en el Audit Log
      await auditLogService.log('project.create', req, {
        actorId: creatorId,
        resourceType: 'Project',
        resourceId: newProject._id,
        metadata: { projectName: name }
      });

      res.status(201).json({ 
        message: 'Proyecto creado exitosamente.', 
        project: newProject 
      });

    } catch (error) {
      next(error);
    }
  }

};

module.exports = projectController;