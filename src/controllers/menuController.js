const Menu = require('../models/menuModel.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');

exports.getOrders = catchAsync(async (req, res, next) => {
  const menu = await Menu.find();

  if (!menu) {
    return next(new AppError('There is no products to show', 400));
  }
  return res.render('menu', { menu });
});
