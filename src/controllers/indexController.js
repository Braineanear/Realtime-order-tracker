const Menu = require('../models/menuModel.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');


exports.homePage = catchAsync(async (req, res, next) => {
    const menu = await Menu.find();
    
    if(!menu) {
        return next(new AppError('There is no products to show', 400));
    }

    return res.render('home', { menu });    
});

exports.cartPage = (req, res, next) => {
    res.render('user/cart');
}
