var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Company} = require('./models/company');
var {Collaborator} = require('./models/collaborator');

var app = express();
const port = process.env.PORT || 3000;

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

app.get('/companies', (req, res) => {
  Company.find().then((companies) => {
    res.send({companies});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/companies/:id', (req, res) => {
  var id = req.params.id;
  
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  
  Company.findById(id).then((company) => {
    if (!company) {
      return res.status(404).send();
    }

    res.send({company});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
})

module.exports = {app};