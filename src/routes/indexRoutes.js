const express = require('express');
const {homePage, cartPage} = require('../controllers/indexController.js');
const {updateCart} = require('../controllers/cartController.js');

const router = express.Router();

router.get('/', homePage);
router.get('/cart', cartPage);
router.post('/update-cart', updateCart);

module.exports = router;