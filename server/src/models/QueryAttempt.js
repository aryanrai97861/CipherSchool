const mongoose = require('mongoose');

const queryAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  query: { type: String, required: true },
  success: { type: Boolean, default: false },
  errorMessage: { type: String, default: null },
  executionTimeMs: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('QueryAttempt', queryAttemptSchema);
