const mongoose = require('mongoose');

const sampleTableSchema = new mongoose.Schema({
  tableName: { type: String, required: true },
  columns: [
    {
      name: { type: String, required: true },
      type: { type: String, required: true },
    },
  ],
  sampleRows: { type: [[mongoose.Schema.Types.Mixed]], default: [] },
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  question: { type: String, required: true },
  sampleTables: [sampleTableSchema],
  sandboxTableNames: [{ type: String }],
  expectedOutputHint: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Assignment', assignmentSchema);
