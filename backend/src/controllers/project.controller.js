const Project = require('../models/porject.model');
const Membership = require('../models/membership.model');
const auditLogService = require('../services/auditLog.service');
const { decrypt } = require('../security/encryption');

const projectController = {

  // CREAR UN PROYECTO 
  createProject: async (req, res, next) => {
    try {
      const { name, description, visibility } = req.body;
      const { orgId } = req.params; 
      
      const creatorId = req.user.id; 

      const newProject = new Project({
        name,
        description,
        orgId,
        visibility,
        status: 'active'
      });
      await newProject.save();

      const adminMembership = new Membership({
        userId: creatorId,
        projectId: newProject._id,
        role: 'project_admin'
      });
      await adminMembership.save();

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
  }, 

  // OBTENER PROYECTO 
  getProjectById: async (req, res, next) => {
    try {
      // Usamos .lean() para que Mongoose nos devuelva un objeto modificable
      const project = await Project.findById(req.params.id).lean();
      
      if (!project) {
        return res.status(404).json({ message: 'Proyecto no encontrado' });
      }

      // Desciframos la descripción antes de enviarla
      if (project.description) {
        try {
          project.description = decrypt(project.description);
        } catch (err) {
          console.error('Error al descifrar:', err);
          project.description = '[Error: No se pudo descifrar el contenido]';
        }
      }

      res.status(200).json(project);
    } catch (error) {
      next(error);
    }
  }

};

module.exports = projectController;