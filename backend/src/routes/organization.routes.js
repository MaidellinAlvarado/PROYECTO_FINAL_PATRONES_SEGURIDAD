const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization.controller');

const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware.authenticateToken);

// Crear una organización nueva
router.post('/', organizationController.createOrganization);

// Ver a qué organizaciones pertenezco
router.get('/', organizationController.getMyOrganizations);

module.exports = router;