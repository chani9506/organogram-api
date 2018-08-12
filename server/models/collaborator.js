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
    unique: true,
    minlength: 1,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
  },
  managerEmail: {
    type: String,
    minlength: 1,
    trim: true,
  }
}, {
  toJSON: {virtuals: true}
});

collaboratorSchema.virtual('managed', {
  ref: 'Collaborator',
  localField: 'email',
  foreignField: 'managerEmail'
});

var Collaborator = mongoose.model('Collaborator', collaboratorSchema);

module.exports = {Collaborator};