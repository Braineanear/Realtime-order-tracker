const catchAsync = require('../utils/catchAsync');

const Order = require('../models/orderModel');
const Menu = require('../models/menuModel');

exports.getAllOrders = catchAsync(async (req, res, next) => {
  await Order.find({ status: { $ne: 'completed' } }, null, {
    sort: { createdAt: -1 }
  })
    .populate('userId', '-password')
    .exec((err, orders) => {
      if (req.xhr) return res.json(orders);
      return res.render('admin/orders');
    });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const { name, price, image, size } = req.body;

  if (!name || !image || !size || !price) {
    req.flash('error', 'All fields are required');
    return res.redirect('/admin/createProduct');
  }

  Menu.exists({ name }, (err, result) => {
    if (result) {
      req.flash('error', 'This product already exists');
      req.flash('name', name);
      req.flash('image', image);
      req.flash('size', size);
      req.flash('price', price);
      return res.redirect('/admin/createProduct');
    }
  });

  const product = await Menu.create({
    name,
    price,
    image,
    size
  });

  if (product) {
    delete req.session.cart;
    return res.redirect('/menu');
  }
  req.flash('error', 'Something went wrong');
  return res.redirect('/admin/createProduct');
});

exports.getCreateProductPage = (req, res, next) => {
  res.render('admin/createProduct');
};

exports.orderStatus = (req, res, next) => {
  Order.updateOne(
    { _id: req.body.orderId },
    { status: req.body.status },
    (err) => {
      if (err) {
        return res.redirect('/admin/orders', { csrfToken: req.csrfToken() });
      }
      // Emit Event
      const eventEmitter = req.app.get('eventEmitter');
      eventEmitter.emit('orderUpdated', {
        id: req.body.orderId,
        status: req.body.status
      });
      return res.redirect('/admin/orders', { csrfToken: req.csrfToken() });
    }
  );
};
