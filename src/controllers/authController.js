const passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');

const _getRedirectUrl = (req) =>
  req.user.role === 'admin' ? '/admin/orders' : '/user/orders';

exports.loginPage = (req, res) => {
  res.render('auth/login');
};

exports.registerPage = (req, res, next) => {
  res.render('auth/register');
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate Request
  if (!email || !password) {
    req.flash('error', 'All fields are required');
    req.flash('email', email);
    return res.redirect('/user/login');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      req.flash('error', info.message);
      return next(err);
    }

    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/user/login');
    }

    req.logIn(user, (error) => {
      if (error) {
        req.flash('error', info.message);
        return next(error);
      }
      return res.redirect(_getRedirectUrl(req));
    });
  })(req, res, next);
});

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  if (!name || !email || !password || !passwordConfirm) {
    req.flash('error', 'All fields are required');
    req.flash('name', name);
    req.flash('email', email);
    return res.redirect('/user/register');
  }
  if (password !== passwordConfirm) {
    req.flash('error', 'Passwords are not the same');
    req.flash('name', name);
    req.flash('email', email);
    return res.redirect('/user/register');
  }
  // Check if email exists
  User.exists({ email }, (err, result) => {
    if (result) {
      req.flash('error', 'Email already taken');
      req.flash('name', name);
      req.flash('email', email);
      return res.redirect('/user/register');
    }
  });

  // Create user
  let user = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  user = await user.save({ validateBeforeSave: false });
  if (user) {
    return res.redirect('/');
  }
  req.flash('error', 'Something went wrong');
  return res.redirect('/user/register');
});

exports.logout = (req, res) => {
  req.logout();
  return res.redirect('/');
};
