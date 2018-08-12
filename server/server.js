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
    const company = await Company.findOne({name}).populate('collaborators');

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
    const company = await Company.findOneAndRemove({name}).populate('collaborators');

    if (!company) {
      return res.status(404).send();
    }

    await Collaborator.remove({companyName: name});

    res.send({company});
  } catch (e) {
    res.status(400).send(e);
  }
});

app.post('/collaborators/:companyName', async (req, res) => {
  try {
    const companyName = req.params.companyName;
    const company = await Company.findOne({name: companyName});

    if (!company) {
      return res.status(404).send();
    }

    const collaborator = new Collaborator({
      name: req.body.name,
      email: req.body.email,
      companyName
    });

    const doc = await collaborator.save();
    
    res.send(doc);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get('/collaborators/:companyName', async (req, res) => {
  try {
    const companyName = req.params.companyName;
    const company = await Company.findOne({name: companyName});

    if (!company) {
      return res.status(404).send();
    }

    const collaborators = await Collaborator.find({companyName}).select('-companyName');
  
    res.send({collaborators});
  } catch (e) {
    res.status(400).send();
  }
});

app.delete('/collaborators/:companyName/:email', async (req, res) => {
  try {
    const companyName = req.params.companyName;
    const email = req.params.email;
    const collaborator = await Collaborator.findOneAndRemove({
      email,
      companyName
    });
    
    if (!collaborator) {
      return res.status(404).send();
    }

    res.send({collaborator});
  } catch (e) {
    res.status(400).send(e);
  }
});

app.patch('/collaborators/:companyName/:email', async (req, res) => {
  try {
    const companyName = req.params.companyName;
    const email = req.params.email;
    const body = _.pick(req.body, ['name', 'managerEmail']);

    const company = await Company.findOne({name: companyName});
    if (!company) {
      return res.status(404).send();
    }

    if (body.managerEmail) {
      const manager =  await Collaborator.findOne({companyName, email: body.managerEmail});
      if (!manager) {
        throw {
          error: {
            name: 'ManagerNotFoundException',
            message: `Unable to update a collaborator. Manager not found.`
          }
        }
      }
    }

    const collaborator = await Collaborator.findOneAndUpdate({companyName, email}, {$set: body}, {new: true});

    res.send({collaborator});
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get('/collaborators/:companyName/:email/pairs', async (req, res) => {
  try {
    const companyName = req.params.companyName;
    const email = req.params.email;

    const collaborator = await Collaborator.findOne({email, companyName});
    if (!collaborator) {
      return res.status(404).send();
    }

    if (!collaborator.managerEmail) {
      res.send({pairs: null});
    }

    const pairs = await Collaborator.find({companyName, managerEmail: collaborator.managerEmail})
      .where('email').ne(email);

    res.send({pairs});
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get('/collaborators/:companyName/:email/managed', async (req, res) => {
  try {
    const companyName = req.params.companyName;
    const email = req.params.email;

    const collaborator = req.query.secondLevel ? 
      await Collaborator.findOne({email, companyName}).populate({path: 'managed', populate: {path: 'managed'}})
      : await Collaborator.findOne({email, companyName}).populate('managed');
    
    if (!collaborator) {
      return res.status(404).send();
    }

    res.send({managed: collaborator.managed});
  } catch (e) {
    res.status(400).send(e);
  }
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};