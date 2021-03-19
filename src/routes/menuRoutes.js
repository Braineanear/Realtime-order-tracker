const express = require('express');
const { getOrders } = require('../controllers/menuController.js');

const router = express.Router();

router.get('/', getOrders);

module.exports = router;
