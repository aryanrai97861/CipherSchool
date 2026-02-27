const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');

// GET /api/assignments — List all assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .select('title description difficulty createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/assignments/:id — Get single assignment with full details
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
