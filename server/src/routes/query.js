const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pgPool } = require('../config/db');

// Blocked SQL keywords — only SELECT queries allowed
const BLOCKED_KEYWORDS = [
  'DROP', 'DELETE', 'ALTER', 'TRUNCATE', 'INSERT', 'UPDATE',
  'CREATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE', 'COPY',
  'IMPORT', 'VACUUM', 'COMMENT', 'LOCK', 'SET ', 'RESET',
];

const QUERY_TIMEOUT_MS = 5000; // 5 second timeout

function validateQuery(sql) {
  const upperSql = sql.toUpperCase().trim();

  // Must start with SELECT or WITH (for CTEs)
  if (!upperSql.startsWith('SELECT') && !upperSql.startsWith('WITH')) {
    return { valid: false, reason: 'Only SELECT queries are allowed.' };
  }

  // Check for blocked keywords
  for (const keyword of BLOCKED_KEYWORDS) {
    // Use word boundary regex to avoid false positives
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(sql)) {
      return { valid: false, reason: `Prohibited keyword detected: ${keyword.trim()}` };
    }
  }

  // Check for semicolons (potential injection with multiple statements)
  const withoutStrings = sql.replace(/'[^']*'/g, '');
  if (withoutStrings.includes(';') && withoutStrings.indexOf(';') < withoutStrings.length - 1) {
    return { valid: false, reason: 'Multiple statements are not allowed.' };
  }

  return { valid: true };
}

// POST /api/query/execute
router.post(
  '/execute',
  [body('query').isString().trim().notEmpty().withMessage('Query is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { query } = req.body;

    // Validate query
    const validation = validateQuery(query);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.reason,
      });
    }

    const client = await pgPool.connect();
    const startTime = Date.now();

    try {
      // Set statement timeout
      await client.query(`SET statement_timeout = '${QUERY_TIMEOUT_MS}'`);

      const result = await client.query(query);
      const executionTime = Date.now() - startTime;

      res.json({
        success: true,
        data: {
          columns: result.fields.map((f) => f.name),
          rows: result.rows,
          rowCount: result.rowCount,
          executionTimeMs: executionTime,
        },
      });
    } catch (err) {
      const executionTime = Date.now() - startTime;
      res.status(400).json({
        success: false,
        message: err.message,
        executionTimeMs: executionTime,
      });
    } finally {
      // Reset timeout and release client
      try {
        await client.query("SET statement_timeout = '0'");
      } catch (_) {}
      client.release();
    }
  }
);

module.exports = router;
