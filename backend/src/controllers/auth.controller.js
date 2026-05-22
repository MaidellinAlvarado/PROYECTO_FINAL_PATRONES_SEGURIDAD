const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auditLogService = require('../services/auditLog.service');

// Generador de tokens auxiliar
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const authController = {

  // REGISTRO DE USUARIO

  register: async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'El correo ya está registrado.' });
      }

      // Crear el nuevo usuario 
      const newUser = new User({ name, email, password });
      await newUser.save();

      // Registrar la creación del usuario
      await auditLogService.log('auth.register', req, {
        actorId: newUser._id,
        resourceType: 'User',
        resourceId: newUser._id
      });

      res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (error) {
      next(error);
    }
  },


  // LOGIN DE USUARIO

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Buscar al usuario
      const user = await User.findOne({ email });
      if (!user) {
        // Login fallido 
        await auditLogService.log('auth.login.failure', req, {
          metadata: { reason: 'user_not_found', emailAttempted: email }
        });
        return res.status(401).json({ message: 'Credenciales inválidas.' });
      }

      // Verificar contraseña usando el método que creamos en el modelo
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Login fallido (contraseña incorrecta)
        await auditLogService.log('auth.login.failure', req, {
          actorId: user._id,
          metadata: { reason: 'invalid_password' }
        });
        return res.status(401).json({ message: 'Credenciales inválidas.' });
      }

      // Generar Tokens
      const { accessToken, refreshToken } = generateTokens(user._id, user.role);

      // Guardar el Refresh Token en una cookie HttpOnly 
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      //  Login exitoso
      await auditLogService.log('auth.login.success', req, {
        actorId: user._id
      });

      // Enviar el Access Token y los datos del usuario en JSON
      res.status(200).json({ accessToken, user });
    } catch (error) {
      next(error);
    }
  },


  // LOGOUT DE USUARIO

  logout: async (req, res, next) => {
    try {
      // Extraemos el ID del usuario del token si existe 
      const token = req.cookies.refreshToken;
      let userId = null;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
          userId = decoded.id;
        } catch (e) { /* Token inválido o expirado, lo ignoramos para el logout */ }
      }

      // Borramos la cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      //  Logout
      await auditLogService.log('auth.logout', req, {
        actorId: userId
      });

      res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;