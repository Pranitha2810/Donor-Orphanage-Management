// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { signupValidation, loginValidation } = require('../utils/validators');
const { validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

router.post('/signup', signupValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array(), status: 400 });
    }

    const { role, name, email, password, description, experience } = req.body;

    // check existing user
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(400).json({ success: false, error: 'User already registered', status: 400 });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const id = uuidv4();

    const insertQuery = `
      INSERT INTO users (id, name, email, password, role, description, experience)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, name, email, role, description, experience, created_at
    `;

    const values = [id, name, email, hashed, role, description || null, experience || null];
    const result = await db.query(insertQuery, values);
    const user = result.rows[0];

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ success: true, data: { token, user }, message: 'Signup successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error', status: 500 });
  }
});

router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array(), status: 400 });
    }
    const { email, password } = req.body;
    const q = 'SELECT id, name, email, password, role, description, experience FROM users WHERE email = $1';
    const result = await db.query(q, [email]);
    if (!result.rows.length) {
      return res.status(400).json({ success: false, error: 'Invalid credentials', status: 400 });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ success: false, error: 'Invalid credentials', status: 400 });
    }
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    // hide password
    delete user.password;
    return res.json({ success: true, data: { token, user }, message: 'Login successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error', status: 500 });
  }
});

module.exports = router;
