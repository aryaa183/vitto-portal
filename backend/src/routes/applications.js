const express = require('express');
const router = express.Router();
const pool = require('../db');

// ─── Validation helper ───────────────────────────────────────────
const VALID_LANGUAGES = ['Hindi', 'Tamil', 'Telugu', 'Marathi', 'English'];
const VALID_STATUSES  = ['pending', 'approved', 'rejected'];

function validateApplication({ name, mobile, amount, purpose, language }) {
  const errors = [];

  if (!name || name.trim().length < 2)
    errors.push('Name must be at least 2 characters.');

  if (!mobile || !/^[6-9]\d{9}$/.test(mobile))
    errors.push('Mobile must be a valid 10-digit Indian number.');

  if (!amount || isNaN(amount) || Number(amount) <= 0)
    errors.push('Loan amount must be a positive number.');

  if (!purpose || purpose.trim().length < 5)
    errors.push('Purpose must be at least 5 characters.');

  if (!language || !VALID_LANGUAGES.includes(language))
    errors.push(`Language must be one of: ${VALID_LANGUAGES.join(', ')}.`);

  return errors;
}

// ─── POST /api/applications ───────────────────────────────────────
router.post('/applications', async (req, res) => {
  const { name, mobile, amount, purpose, language } = req.body;

  const errors = validateApplication({ name, mobile, amount, purpose, language });
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const result = await pool.query(
      `INSERT INTO applications (name, mobile, amount, purpose, language)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name.trim(), mobile.trim(), Number(amount), purpose.trim(), language]
    );

    res.status(201).json({ success: true, application: result.rows[0] });
  } catch (err) {
    console.error('POST /applications error:', err);
    res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

// ─── GET /api/applications ────────────────────────────────────────
router.get('/applications', async (req, res) => {
  const { status } = req.query;

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status filter. Use: ${VALID_STATUSES.join(', ')}` });
  }

  try {
    let query  = 'SELECT * FROM applications';
    const params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, applications: result.rows });
  } catch (err) {
    console.error('GET /applications error:', err);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// ─── PATCH /api/applications/:id/status ──────────────────────────
router.patch('/applications/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Status must be approved or rejected.' });
  }

  try {
    const result = await pool.query(
      `UPDATE applications
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }

    res.json({ success: true, application: result.rows[0] });
  } catch (err) {
    console.error('PATCH /applications/:id/status error:', err);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// ─── GET /api/summary ─────────────────────────────────────────────
router.get('/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)                                         AS total,
        COALESCE(SUM(amount), 0)                         AS total_amount,
        COUNT(*) FILTER (WHERE status = 'pending')       AS pending,
        COUNT(*) FILTER (WHERE status = 'approved')      AS approved,
        COUNT(*) FILTER (WHERE status = 'rejected')      AS rejected
      FROM applications
    `);

    res.json({ success: true, summary: result.rows[0] });
  } catch (err) {
    console.error('GET /summary error:', err);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

module.exports = router;