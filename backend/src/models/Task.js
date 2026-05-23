const mongoose = require('mongoose');

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

module.exports = mongoose.model('Task', taskSchema);