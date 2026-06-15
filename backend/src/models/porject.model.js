const mongoose = require('mongoose');
const encryption = require('../security/encryption'); 

const projectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String,
    required: true,
    // Aplicamos cifrado a la descripción del proyecto para proteger información sensible setters y getters para cifrar/descifrar automáticamente
    set: encryption.encrypt,
    get: encryption.decrypt
  },


  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['project_admin', 'developer', 'viewer'],
      required: true
    }
  }],

  // Referencia a la organización propietaria del proyecto
  orgId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: true 
  },
  visibility: { 
    type: String, 
    enum: ['private', 'internal'], 
    default: 'internal' 
  },
  status: { 
    type: String, 
    enum: ['active', 'archived'], 
    default: 'active' 
  }
}, { 
  timestamps: true,
  // Habilitar getters para que el cifrado/descifrado funcione al convertir a JSON o a objetos  
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('Project', projectSchema);