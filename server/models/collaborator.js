var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var collaboratorSchema = Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'Collaborator'
  }
});

var Collaborator = mongoose.model('Collaborator', collaboratorSchema);

module.exports = {Collaborator};