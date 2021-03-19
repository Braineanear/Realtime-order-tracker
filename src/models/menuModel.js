const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    minlength: 3,
    required: [true, 'Please provide a name']
  },
  price: {
    type: String,
    required: [true, 'Please provide a price']
  },
  image: {
    type: String,
    required: [true, 'Please upload an image']
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'small'
  }
});

module.exports = mongoose.model('Menu', menuSchema);
