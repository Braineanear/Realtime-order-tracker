const moment = require('moment')

const catchAsync = require('../utils/catchAsync');
const Order = require('../models/orderModel');

exports.createOrder = catchAsync(async(req, res, next) => {
    // Validate request
    const { phone, address, paymentType } = req.body;
    if(!phone || !address){
        req.flash('error', 'All fields are required');
        return res.redirect('/cart');
    }
    const order = await Order.create({
        userId: req.user._id,
        items: req.session.cart.items,
        phone,
        address
    });
    if(order) {
        Order.populate(order, { path: 'userId' }, (err, placedOrder) => {
            // Emit
            const eventEmitter = req.app.get('eventEmitter');
            eventEmitter.emit('orderPlaced', order);
            delete req.session.cart;
            return res.json({ message: "Order placed successfully"});
        });
    } else {
        req.flash('error', 'Something went wrong');
        return res.redirect('/cart');
    };
});

exports.getUserOrders = catchAsync(async(req, res, next) => {
    const orders = await Order.find({ userId: req.user._id }, null, { sort: { 'createdAt': -1 } });
    res.header('Cache-Control', 'no-cache');
    res.render('user/orders', {orders, moment});
});

exports.getSingleOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    
    //Authorized User
    if(req.user._id.toString() === order.userId.toString()){
        res.render('user/singleOrder', {order});
    } else {
        res.redirect('/');
    }
});