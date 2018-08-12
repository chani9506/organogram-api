require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Company} = require('./models/company');
const {Collaborator} = require('./models/collaborator');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/companies', async (req, res) => {
  try {
    const company = new Company({
      name: req.body.name
    });
  
    const doc = await company.save();
    res.send(doc);
  } catch (e) {
    res.status(400).send(e);
  };
});

app.get('/companies', async (req, res) => {
  try {
    const companies = await Company.find().populate('collaborators');
    res.send({companies});
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get('/companies/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const company = await Company.findOne({name});

    if (!company) {
      return res.status(404).send();
    }

    res.send({company});
  } catch (e) {
    res.status(400).send();
  }
});

app.delete('/companies/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const company = await Company.findOneAndRemove({name});

    if (!company) {
      return res.status(404).send();
    }

    res.send({company});
  } catch (e) {
    res.status(400).send(e);
  }
});

app.post('/collaborators', async (req, res) => {
  try {
    const companyName = req.body.companyName;
    
    const collaborator = new Collaborator({
      name: req.body.name,
      email: req.body.email,
      companyName,
    });

    const doc = await collaborator.save();
    
    res.send(doc);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};