var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var companySchema = Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    minlength: 1,
    trim: true
  },
}, {
  toJSON: {virtuals: true}
});

companySchema.virtual('collaborators', {
  ref: 'Collaborator',
  localField: 'name',
  foreignField: 'companyName'
});

var Company = mongoose.model('Company', companySchema);

module.exports = {Company};