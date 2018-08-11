var mongoose = require('mongoose');

var Company = mongoose.model('Company', {
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
});

module.exports = {Company};