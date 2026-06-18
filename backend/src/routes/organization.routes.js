const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization.controller');
const projectController = require('../controllers/project.controller'); 
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware.authenticateToken);

router.post('/', organizationController.createOrganization);
router.get('/', organizationController.getMyOrganizations);
router.get('/:id', organizationController.getOrganizationById);
router.get('/:id/projects', projectController.getProjectsByOrg);
router.post('/:id/projects', projectController.createProject);

module.exports = router;