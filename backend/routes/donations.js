// routes/donations.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { donationValidation } = require('../utils/validators');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/donors/:id/donations
 * returns array of donor's donations with NGO details
 */
router.get('/donors/:id/donations', authenticateToken, requireRole(['donor']), async (req, res) => {
  try {
    const donorId = req.params.id;
    // ensure the requesting user matches donor id or is other privileged role? We'll check matching userId
    if (req.user.userId !== donorId && req.user.role !== 'ngo') {
      // donors may only fetch their own donations; ngo allowed optionally
      return res.status(403).json({ success: false, error: 'Forbidden', status: 403 });
    }
    const q = `
      SELECT d.*, n.id as ngo_id, n.name as ngo_name, n.email as ngo_email
      FROM donations d
      LEFT JOIN users n ON d.ngo_id = n.id
      WHERE d.donor_id = $1
      ORDER BY d.created_at DESC
    `;
    const result = await db.query(q, [donorId]);
    return res.json({ success: true, data: result.rows, message: 'Donations fetched' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error', status: 500 });
  }
});

/**
 * POST /api/donations
 * Body: { donorId, ngoId, ngoName, type, amount?, itemName?, count? }
 */
router.post('/donations', authenticateToken, requireRole(['donor']), donationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array(), status: 400 });
    }

    const { donorId, ngoId, type, amount, itemName, count } = req.body;

    // Ensure the token user matches donorId (prevent posting on behalf of others)
    if (req.user.userId !== donorId) {
      return res.status(403).json({ success: false, error: 'Cannot create donation for other user', status: 403 });
    }

    // Validate conditional fields
    if (type === 'money' && (amount === undefined || isNaN(amount))) {
      return res.status(400).json({ success: false, error: 'Amount is required for money type', status: 400 });
    }
    if (type === 'item' && (!itemName || !count)) {
      return res.status(400).json({ success: false, error: 'itemName and count required for item type', status: 400 });
    }

    const id = uuidv4();
    const insertQ = `
      INSERT INTO donations (id, donor_id, ngo_id, type, amount, item_name, count, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')
      RETURNING *
    `;
    const vals = [
      id,
      donorId,
      ngoId,
      type,
      type === 'money' ? amount : null,
      type === 'item' ? itemName : null,
      type === 'item' ? count : null
    ];
    const inserted = await db.query(insertQ, vals);

    // Optionally: push a notification entry (not implemented here)

    return res.json({ success: true, data: inserted.rows[0], message: 'Donation created' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error', status: 500 });
  }
});

module.exports = router;
