var mongoose = require('mongoose');

var Collaborator = mongoose.model('Collaborator', {
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
});

module.exports = {Collaborator};