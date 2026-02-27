require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectMongo, verifyPg } = require('./config/db');

// Import route modules
const assignmentRoutes = require('./routes/assignments');
const queryRoutes = require('./routes/query');
const hintRoutes = require('./routes/hints');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ─── Routes ─────────────────────────────────────────────────
app.use('/api/assignments', assignmentRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/hints', hintRoutes);
app.use('/api/auth', authRoutes);

// ─── Health check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Global error handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// ─── Start server ───────────────────────────────────────────
async function start() {
  await connectMongo();
  await verifyPg();

  app.listen(PORT, () => {
    console.log(`\n🚀 CipherSQLStudio API running on http://localhost:${PORT}\n`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
