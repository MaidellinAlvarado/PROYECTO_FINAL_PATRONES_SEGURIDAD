const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true, 
    index: true 
  },
  actorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null,
    index: true
  },
  resourceType: { 
    type: String,
    default: null
  },
  resourceId: { 
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed 
  },
  ip: { 
    type: String, 
    required: true 
  },
  userAgent: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now, 
    index: true 
  }
});



// Creamos una función que siempre lance un error si se intenta borrar

const preventDelete = function(next) {
  next(new Error('Seguridad: Los registros de auditoría  NO pueden ser eliminados.'));
};

// Agregamos middleware para prevenir eliminaciones en todas las formas posibles
auditLogSchema.pre('deleteOne', { document: true, query: false }, preventDelete);
auditLogSchema.pre('deleteOne', { document: false, query: true }, preventDelete);
auditLogSchema.pre('deleteMany', preventDelete);
auditLogSchema.pre('findOneAndDelete', preventDelete);


const preventUpdate = function(next) {
  next(new Error('Seguridad: Los registros de auditoría NO pueden ser modificados.'));
};

auditLogSchema.pre('updateOne', preventUpdate);
auditLogSchema.pre('updateMany', preventUpdate);
auditLogSchema.pre('findOneAndUpdate', preventUpdate);

module.exports = mongoose.model('AuditLog', auditLogSchema);