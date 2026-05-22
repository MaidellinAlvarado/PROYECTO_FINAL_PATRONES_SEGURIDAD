const express = require('express');
const router = express.Router();
const Joi = require('joi');
const authController = require('../controllers/auth.controller');
// Importamos los limitadores de tasa

const { loginRateLimiter, registerRateLimiter } = require('../middlewares/rateLimiter'); 
// Middleware de validación rápida con Joi
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(422).json({ message: error.details[0].message });
  next();
};

// Esquemas de validación
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});


// Inyectamos los limitadores
router.post('/register', registerRateLimiter, validate(registerSchema), authController.register);
router.post('/login', loginRateLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

module.exports = router;