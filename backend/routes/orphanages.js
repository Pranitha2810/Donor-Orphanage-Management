// routes/orphanages.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { requestValidation } = require('../utils/validators');

/**
 * GET /api/orphanages/:id/requests
 * returns array of requests made by this orphanage
 */
router.get('/orphanages/:id/requests', authenticateToken, requireRole(['orphanage']), async (req, res) => {
  try {
    const orphanageId = req.params.id;
    if (req.user.userId !== orphanageId) {
      return res.status(403).json({ success: false, error: 'Forbidden', status: 403 });
    }
    const q = `
      SELECT r.*, n.name as ngo_name, n.email as ngo_email
      FROM orphanage_requests r
      LEFT JOIN users n ON r.ngo_id = n.id
      WHERE r.orphanage_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await db.query(q, [orphanageId]);
    return res.json({ success: true, data: result.rows, message: 'Requests fetched' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error', status: 500 });
  }
});

/**
 * POST /api/orphanages/:id/requests
 * Body: { ngoId, ngoName, type, amount?, itemName?, count? }
 */
router.post('/orphanages/:id/requests', authenticateToken, requireRole(['orphanage']), requestValidation, async (req, res) => {
  try {
    const orphanageId = req.params.id;
    if (req.user.userId !== orphanageId) {
      return res.status(403).json({ success: false, error: 'Forbidden', status: 403 });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array(), status: 400 });
    }

    const { ngoId, type, amount, itemName, count } = req.body;
    // Validate conditional fields
    if (type === 'money' && (amount === undefined || isNaN(amount))) {
      return res.status(400).json({ success: false, error: 'Amount is required for money type', status: 400 });
    }
    if (type === 'item' && (!itemName || !count)) {
      return res.status(400).json({ success: false, error: 'itemName and count required for item type', status: 400 });
    }

    const id = uuidv4();
    const insertQ = `
      INSERT INTO orphanage_requests (id, orphanage_id, ngo_id, type, amount, item_name, count, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING *
    `;
    const vals = [
      id,
      orphanageId,
      ngoId,
      type,
      type === 'money' ? amount : null,
      type === 'item' ? itemName : null,
      type === 'item' ? count : null
    ];
    const inserted = await db.query(insertQ, vals);

    return res.json({ success: true, data: inserted.rows[0], message: 'Request created' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error', status: 500 });
  }
});

/**
 * GET /api/orphanages/:id/accepted-requests
 * returns array of accepted requests with donor/NGO details
 */
router.get('/orphanages/:id/accepted-requests', authenticateToken, requireRole(['orphanage']), async (req, res) => {
  try {
    const orphanageId = req.params.id;
    if (req.user.userId !== orphanageId) {
      return res.status(403).json({ success: false, error: 'Forbidden', status: 403 });
    }
    // find distribution_history entries with this orphanage_id
    const q = `
      SELECT dh.*, d.type as donation_type, d.amount as donation_amount, d.item_name as donation_item_name, 
             u_donor.name as donor_name, u_ngo.name as ngo_name
      FROM distribution_history dh
      LEFT JOIN donations d ON dh.donation_id = d.id
      LEFT JOIN users u_donor ON dh.donor_id = u_donor.id
      LEFT JOIN users u_ngo ON dh.ngo_id = u_ngo.id
      WHERE dh.orphanage_id = $1 AND dh.action = 'accepted'
      ORDER BY dh.distributed_at DESC
    `;
    const result = await db.query(q, [orphanageId]);
    return res.json({ success: true, data: result.rows, message: 'Accepted requests fetched' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error', status: 500 });
  }
});

module.exports = router;
