const express = require('express');
const {
  getAllOrders,
  orderStatus,
  createProduct,
  getCreateProductPage
} = require('../controllers/adminController.js');
const admin = require('../middlewares/admin');

const router = express.Router();

router.get('/orders', admin, getAllOrders);
router.get('/createProduct', admin, getCreateProductPage);
router.post('/createProduct', admin, createProduct);
router.post('/order/status', admin, orderStatus);

module.exports = router;
