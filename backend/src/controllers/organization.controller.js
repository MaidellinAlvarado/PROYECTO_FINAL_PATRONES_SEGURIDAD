const Organization = require('../models/organization.model');
const Project = require('../models/porject.model'); 
const auditLogService = require('../services/auditLog.service');

const organizationController = {
  createOrganization: async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const creatorId = req.user.id; 

      const newOrg = new Organization({
        name,
        description,
        ownerId: creatorId,
        members: [{ userId: creatorId, role: 'org_admin' }]
      });

      await newOrg.save();

      await auditLogService.log('org.create', req, {
        actorId: creatorId,
        resourceType: 'Organization',
        resourceId: newOrg._id,
        metadata: { name }
      });

      res.status(201).json({ message: 'Organización creada exitosamente', organization: newOrg });
    } catch (error) {
      next(error);
    }
  },

  getMyOrganizations: async (req, res, next) => {
    try {
      const orgs = await Organization.find({ 'members.userId': req.user.id }).lean();
      res.status(200).json(orgs);
    } catch (error) {
      next(error);
    }
  },

  getOrganizationById: async (req, res, next) => {
    try {
      const org = await Organization.findById(req.params.id);
      if (!org) return res.status(404).json({ message: 'Organización no encontrada' });
      res.status(200).json(org);
    } catch (error) {
      next(error);
    }
  },

  getProjectsByOrg: async (req, res, next) => {
    try {
      const projects = await Project.find({ orgId: req.params.id });
      res.status(200).json(projects);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = organizationController;