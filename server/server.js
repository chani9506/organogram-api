var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Company} = require('./models/company');
var {Collaborator} = require('./models/collaborator');

var app = express();

app.use(bodyParser.json());

app.post('/companies', (req, res) => {
  var company = new Company({
    name: req.body.name
  });

  company.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.listen(3000, () => {
  console.log('Started on port 3000');
})

module.exports = {app};