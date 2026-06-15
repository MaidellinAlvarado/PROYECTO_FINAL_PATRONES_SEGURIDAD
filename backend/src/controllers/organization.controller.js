const Organization = require('../models/organization.model');
const auditLogService = require('../services/auditLog.service');

const organizationController = {

  //  Crear organización
  createOrganization: async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const creatorId = req.user.id; 

      // 1. Crear la organización y agregar al creador como org_admin automáticamente
      const newOrg = new Organization({
        name,
        description,
        ownerId: creatorId,
        members: [{
          userId: creatorId,
          role: 'org_admin'
        }]
      });

      await newOrg.save();

      // Registrar en la auditoría la creación de la organización y la adición del miembro fundador
      await auditLogService.log('org.member.add', req, {
        actorId: creatorId,
        resourceType: 'Organization',
        resourceId: newOrg._id,
        metadata: { addedUser: creatorId, role: 'org_admin' }
      });

      res.status(201).json({
        message: 'Organización creada exitosamente',
        organization: newOrg
      });

    } catch (error) {
      next(error);
    }
  },

  //  Listar mis organizaciones
  getMyOrganizations: async (req, res, next) => {
    try {
      const orgs = await Organization.find({
        'members.userId': req.user.id
      }).lean();

      res.status(200).json(orgs);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = organizationController;