const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');


router.use(authenticateToken);


router.get('/projects/:id', projectController.getProjectById);

module.exports = router;