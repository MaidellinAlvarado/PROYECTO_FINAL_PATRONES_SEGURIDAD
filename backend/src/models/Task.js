const mongoose = require('mongoose');

const { encrypt } = require('../security/encryption'); 

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true,
    index: true 
  },
  assigneeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reporterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  status: { 
    type: String, 
    enum: ['backlog', 'in_progress', 'review', 'done'], 
    default: 'backlog' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  sensitive: { 
    type: Boolean, 
    default: false 
  },
  dueDate: { 
    type: Date 
  }
}, { 
  timestamps: true 
});

taskSchema.pre('save', async function() {
  console.log('🛑 [DEBUG] Entrando al Hook de Tareas');
  console.log('🛑 [DEBUG] ¿Es sensible?:', this.sensitive);

  if (this.sensitive === true && this.description) {
    try {
      this.description = encrypt(this.description);
      console.log('✅ [DEBUG] Cifrado exitoso');
    } catch (error) {
      console.log('❌ [DEBUG] Error al cifrar:', error.message);
      throw error; 
    }
  } else {
    console.log('⚠️ [DEBUG] No se cifró (No es sensible o no hay texto).');
  }
});

module.exports = mongoose.model('Task', taskSchema);