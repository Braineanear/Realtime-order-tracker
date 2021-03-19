const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/userModel');

// eslint-disable-next-line no-shadow
const passport = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        // Login
        // check if email exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
          return done(null, false, { message: 'No user with this email' });
        }

        const match = await user.matchPassword(password);

        if (match) {
          return done(null, user, { message: 'Logged in successfully' });
        }

        return done(null, false, { message: 'Wrong username or password' });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};

module.exports = passport;
