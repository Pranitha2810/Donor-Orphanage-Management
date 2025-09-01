// utils/validators.js
const { body } = require('express-validator');

const signupValidation = [
  body('role').isIn(['donor', 'ngo', 'orphanage']).withMessage('Invalid role'),
  body('name').isLength({ min: 2 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  // description & experience optional depending on role; validate in route
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').exists().withMessage('Password required'),
];

const donationValidation = [
  body('donorId').isUUID().withMessage('Valid donorId required'),
  body('ngoId').isUUID().withMessage('Valid ngoId required'),
  body('type').isIn(['money', 'item']).withMessage('type must be money or item'),
  // conditional checks handled in route handlers
];

const requestValidation = [
  body('ngoId').isUUID().withMessage('Valid ngoId required'),
  body('type').isIn(['money', 'item']).withMessage('type must be money or item'),
];

module.exports = {
  signupValidation,
  loginValidation,
  donationValidation,
  requestValidation
};
