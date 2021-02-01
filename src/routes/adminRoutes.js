const express = require('express');
const {getAllOrders, orderStatus} = require('../controllers/adminController.js');
const admin = require('../middlewares/admin');

const router = express.Router();

router.get('/orders', admin, getAllOrders);
router.post('/order/status', admin, orderStatus);

module.exports = router;