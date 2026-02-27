const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
let model;

function initGemini() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
}

const SYSTEM_PROMPT = `You are a helpful SQL tutor. The student is working on a SQL assignment and needs guidance.

CRITICAL RULES:
1. NEVER provide the complete SQL query solution
2. NEVER write the full answer — only give HINTS and GUIDANCE
3. Break down the problem into smaller steps
4. Suggest which SQL clauses or functions might be useful
5. Point out common mistakes if the student's query has errors
6. Encourage the student to think through the logic
7. You may provide small SQL fragments (1-2 lines max) as examples of syntax, but NEVER the full solution
8. If the student asks you to just give the answer, politely refuse and offer a hint instead
9. Keep responses concise (3-5 sentences max)

You are a TUTOR, not an answer machine.`;

// POST /api/hints
router.post(
  '/',
  [
    body('question').isString().trim().notEmpty().withMessage('Question is required'),
    body('userQuery').optional().isString().trim(),
    body('errorMessage').optional().isString().trim(),
    body('tableSchemas').optional().isString().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    initGemini();

    if (!model) {
      return res.status(503).json({
        success: false,
        message: 'LLM service is not configured. Please set GEMINI_API_KEY.',
      });
    }

    const { question, userQuery, errorMessage, tableSchemas } = req.body;

    try {
      let userPrompt = `Assignment Question: "${question}"`;

      if (tableSchemas) {
        userPrompt += `\n\nAvailable Tables and Schemas:\n${tableSchemas}`;
      }

      if (userQuery) {
        userPrompt += `\n\nStudent's current SQL attempt:\n\`\`\`sql\n${userQuery}\n\`\`\``;
      }

      if (errorMessage) {
        userPrompt += `\n\nError received: ${errorMessage}`;
      }

      userPrompt += '\n\nPlease provide a helpful hint (NOT the answer) to guide me.';

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: SYSTEM_PROMPT,
      });

      const hint = result.response.text();

      res.json({
        success: true,
        data: { hint },
      });
    } catch (err) {
      console.error('Gemini API error:', err.message);
      res.status(500).json({
        success: false,
        message: 'Failed to generate hint. Please try again.',
      });
    }
  }
);

module.exports = router;
