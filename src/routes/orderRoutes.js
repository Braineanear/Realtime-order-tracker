const express = require('express');
const { createOrder } = require('../controllers/orderController.js');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, createOrder);

module.exports = router;
