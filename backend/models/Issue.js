const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['pothole', 'streetlight', 'water_leakage', 'garbage_overflow', 'public_property', 'other'],
    required: true
  },
  location: {
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'Point'
    }
  },
  imageUrl: {
    type: String,
    required: true
  },
  afterImageUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved'],
    default: 'pending'
  },
  department: {
    type: String,
    enum: ['road', 'water', 'electricity', 'sanitation', 'general'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  slaDeadline: {
    type: Date,
    default: null
  },
  escalated: {
    type: Boolean,
    default: false
  }
});

IssueSchema.index({ location: '2dsphere' });
IssueSchema.index({ status: 1, priority: 1 });
IssueSchema.index({ upvotes: -1 });

module.exports = mongoose.model('Issue', IssueSchema);
