const express = require('express');
const {
  loginPage,
  registerPage,
  register,
  login,
  logout
} = require('../controllers/authController');
const {
  getUserOrders,
  getSingleOrder
} = require('../controllers/orderController');
const guest = require('../middlewares/guest');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/login', guest, loginPage);
router.get('/register', guest, registerPage);
router.get('/orders', auth, getUserOrders);
router.get('/orders/:id', auth, getSingleOrder);
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);

module.exports = router;
