const catchAsync = require('../utils/catchAsync');

const Order = require('../models/orderModel');

exports.getAllOrders = catchAsync(async (req, res, next) => {
    await Order.find({ status: { $ne: 'completed'} }, null, { sort: { 'createdAt': -1 } }).populate('userId', '-password').exec((err,orders) => {
        if(req.xhr) {
            return res.json(orders);
        } else {
         return res.render('admin/orders');
        }
    });
});

exports.orderStatus = (req, res, next) => {
    Order.updateOne({_id: req.body.orderId}, {status: req.body.status}, (err, data) => {
        if(err) {
            return res.redirect('/admin/orders');
        }
        // Emit Event
        const eventEmitter = req.app.get('eventEmitter');
        eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status });
        return res.redirect('/admin/orders');
    });
    
};