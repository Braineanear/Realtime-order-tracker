const mongoose = require('mongoose');
const argon2 = require('argon2');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    avatarURL: {
      type: String,
      default: null
    },
    avatarPublicID: {
      type: String,
      default: null
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    passwordChangedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    confirmEmailToken: String,
    isEmailConfirmed: {
      type: Boolean,
      default: false
    },
    passwordConfirm: {
      type: String,
      required: true
    }
  },
  { timestamp: true }
);

// Encrypting Password Using Argon2
userSchema.pre('save', async function (next) {
  // Only Run This Function if The Password was Actually Modified
  if (!this.isModified('password')) return next();

  // Salting & Hashing the Password
  const salt = crypto.randomBytes(32);
  this.password = await argon2.hash(this.password, { salt });

  // Deleting The PasswordConfirm Field in The Database
  this.passwordConfirm = undefined;
});

// Set passwordChangedAt Field to The Current Time When The User Change The Password
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Matching User Entered Password to The Hashed Password in The Database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await argon2.verify(this.password, enteredPassword);
};

// Check if User Changed The Password After The Token Was Issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false; // False means not changed
};

// Generate The Reset Password Token And Then Hashing it
userSchema.methods.createPasswordResetToken = function () {
  // Generating The Reset Password Token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hashing The Generated Reset Password Token
  // Set The Hashed Token to The resetPasswordToken Field in The Database
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //Set The resetPasswordExpire Field in the Database
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  //Return The Generated Reset Password Token
  return resetToken;
};

// Generate The Email Confirmation Token and Then Hashing it
userSchema.methods.generateEmailConfirmToken = function () {
  // Generating The Email Confirmation Token
  const confirmationToken = crypto.randomBytes(32).toString('hex');

  // Hashing The Generated Email Confirmation Token
  // Set The Hashed Token to the confirmEmailToken Field in The Database
  this.confirmEmailToken = crypto
    .createHash('sha256')
    .update(confirmationToken)
    .digest('hex');

  // Generating The Confirm Token Extend
  const confirmTokenExtend = crypto.randomBytes(100).toString('hex');
  const confirmTokenCombined = `${confirmationToken}.${confirmTokenExtend}`;

  // Return The Token
  return confirmTokenCombined;
};

module.exports = mongoose.model('User', userSchema);
