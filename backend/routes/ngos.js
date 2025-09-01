// routes/ngos.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/ngos
 * returns all users with role = ngo
 */
router.get('/ngos', async (req, res) => {
  try {
    const q = `SELECT id, name, email, description, experience, created_at FROM users WHERE role = 'ngo' ORDER BY created_at DESC`;
    const result = await db.query(q);
    return res.json({ success: true, data: result.rows, message: 'NGOs list' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error', status: 500 });
  }
});

/**
 * GET /api/ngos/:id/requests
 * Returns orphanage requests to this NGO
 */
router.get('/ngos/:id/requests', authenticateToken, requireRole(['ngo']), async (req, res) => {
  try {
    const ngoId = req.params.id;
    if (req.user.userId !== ngoId) {
      return res.status(403).json({ success: false, error: 'Forbidden', status: 403 });
    }
    const q = `
      SELECT r.*, o.name as orphanage_name, o.email as orphanage_email
      FROM orphanage_requests r
      LEFT JOIN users o ON r.orphanage_id = o.id
      WHERE r.ngo_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await db.query(q, [ngoId]);
    return res.json({ success: true, data: result.rows, message: 'Requests fetched' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error', status: 500 });
  }
});

/**
 * GET /api/ngos/:id/donations
 * donations received by this NGO
 */
router.get('/ngos/:id/donations', authenticateToken, requireRole(['ngo']), async (req, res) => {
  try {
    const ngoId = req.params.id;
    if (req.user.userId !== ngoId) {
      return res.status(403).json({ success: false, error: 'Forbidden', status: 403 });
    }
    const q = `
      SELECT d.*, u.name as donor_name, u.email as donor_email
      FROM donations d
      LEFT JOIN users u ON d.donor_id = u.id
      WHERE d.ngo_id = $1
      ORDER BY d.created_at DESC
    `;
    const result = await db.query(q, [ngoId]);
    return res.json({ success: true, data: result.rows, message: 'Donations fetched' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error', status: 500 });
  }
});

/**
 * POST /api/ngos/:id/distribute
 * Body: { donationId, orphanageName, action: 'accept'|'reject' }
 */
router.post('/ngos/:id/distribute', authenticateToken, requireRole(['ngo']), async (req, res) => {
  try {
    const ngoId = req.params.id;
    if (req.user.userId !== ngoId) {
      return res.status(403).json({ success: false, error: 'Forbidden', status: 403 });
    }
    const { donationId, orphanageName, action } = req.body;
    if (!donationId || !['accept','reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid payload', status: 400 });
    }

    // Fetch donation
    const getQ = `SELECT * FROM donations WHERE id = $1`;
    const donationRes = await db.query(getQ, [donationId]);
    if (!donationRes.rows.length) return res.status(404).json({ success: false, error: 'Donation not found', status: 404 });

    const donation = donationRes.rows[0];
    if (donation.ngo_id !== ngoId) {
      return res.status(403).json({ success: false, error: 'Donation does not belong to this NGO', status: 403 });
    }

    // If reject -> create distribution_history with action rejected and update orphanage_name? spec says update only on accept.
    if (action === 'reject') {
      const histId = uuidv4();
      const insertHist = `
        INSERT INTO distribution_history (id, donation_id, ngo_id, orphanage_id, donor_id, action)
        VALUES ($1,$2,$3,$4,$5,'rejected') RETURNING *
      `;
      // We don't have orphanage_id when rejecting — leave null
      await db.query(insertHist, [histId, donationId, ngoId, null, donation.donor_id]);

      // Update donation record? let's keep status pending (not distributed)
      return res.json({ success: true, data: { donationId }, message: 'Donation rejected' });
    }

    // If accept:
    // We need to find orphanage by name (or rely on orphanageId). The spec provided orphanageName — so find orphanage user
    const orphanQ = `SELECT id FROM users WHERE role = 'orphanage' AND name = $1 LIMIT 1`;
    const orphanRes = await db.query(orphanQ, [orphanageName]);
    if (!orphanRes.rows.length) {
      return res.status(404).json({ success: false, error: 'Orphanage not found by that name', status: 404 });
    }
    const orphanageId = orphanRes.rows[0].id;

    // Update donation.status -> distributed and orphanage_name
    const updateDonationQ = `UPDATE donations SET status = 'distributed', orphanage_name = $1 WHERE id = $2 RETURNING *`;
    const updatedDonation = await db.query(updateDonationQ, [orphanageName, donationId]);

    // Insert distribution history
    const histId = uuidv4();
    const insertHist = `
      INSERT INTO distribution_history (id, donation_id, ngo_id, orphanage_id, donor_id, action)
      VALUES ($1,$2,$3,$4,$5,'accepted') RETURNING *
    `;
    const histRes = await db.query(insertHist, [histId, donationId, ngoId, orphanageId, donation.donor_id]);

    // Also: remove orphanage request(s) that match? The spec asked to remove the accepted orphanage from requests log.
    // Delete the orphanage_request(s) matching orphanage & ngo & type & matching amount/item name — We'll remove the first matching pending request
    const deleteReqQ = `
      DELETE FROM orphanage_requests
      WHERE orphanage_id = $1 AND ngo_id = $2 AND status = 'pending'
      AND ( (type = $3) )
      RETURNING *
    `;
    // Note: a more exact match could consider amount/item_name/count. For now, delete pending requests for that orphanage->ngo
    await db.query(deleteReqQ, [orphanageId, ngoId, donation.type]);

    return res.json({
      success: true,
      data: { donation: updatedDonation.rows[0], distribution: histRes.rows[0] },
      message: 'Donation accepted and distributed'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error', status: 500 });
  }
});

module.exports = router;
