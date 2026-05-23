const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
 
  },
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
  timestamps: true 
});

module.exports = mongoose.model('Project', projectSchema);