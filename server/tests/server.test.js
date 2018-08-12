const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Company} = require('./../models/company');
const {Collaborator} = require('./../models/collaborator');

const companies = [{
  name: 'First test company'
}, {
  name: 'Second test company'
}];

const collaborators = [{
  name: 'First test collaborator',
  email: 'First test email',
  companyName: companies[0].name
}, {
  name: 'Second test collaborator',
  email: 'Second test email',
  companyName: companies[0].name
}, {
  name: 'Third test collaborator',
  email: 'Third test email',
  companyName: companies[0].name,
  managerEmail: 'Second test email'
}, {
  name: 'Fourth test collaborator',
  email: 'Fourth test email',
  companyName: companies[0].name,
  managerEmail: 'Second test email'
}];

beforeEach(async () => {
  await Promise.all([Collaborator.remove({}), Company.remove({})]);
  await Promise.all([Collaborator.insertMany(collaborators), Company.insertMany(companies)]);
});

describe('POST /companies', () => {
  it('should create a new company', (done) => {
    const name = 'Test company name';

    request(app)
      .post('/companies')
      .send({name})
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(name);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Company.find({name}).then((companies) => {
          expect(companies.length).toBe(1);
          expect(companies[0].name).toBe(name);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create company with invalid body data', (done) => {
    request(app)
      .post('/companies')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Company.find().then((companies) => {
          expect(companies.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create company that already exists', (done) => {
    request(app)
      .post('/companies')
      .send({name: companies[0].name})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Company.find().then((companies) => {
          expect(companies.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /companies', () => {
  it('should get all companies', (done) => {
    request(app)
      .get('/companies')
      .expect(200)
      .expect((res) => {
        expect(res.body.companies.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /companies/:name', () => {
  it('should return a company', (done) => {
    request(app)
      .get(`/companies/${companies[0].name}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.company.name).toBe(companies[0].name);
      })
      .end(done);
  });

  it('should return 404 if company not found', (done) => {
    request(app)
      .get(`/companies/non`)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /companies/:name', () => {
  it('should remove a company and related collaborators', (done) => {
    const name = companies[0].name;

    request(app)
      .delete(`/companies/${name}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.company.name).toBe(name);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Collaborator.find({companyName: name}).then((collaborators) => {
          expect(collaborators).toEqual([]);
        })

        Company.findOne({name}).then((company) => {
          expect(company).toBeNull();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if company not found', (done) => {
    request(app)
      .delete(`/companies/non`)
      .expect(404)
      .end(done);
  });
})

describe('POST /collaborators/:companyName', () => {
  it('should create a new collaborator', (done) => {
    const testBody = {
      name: 'Test collaborator name',
      email: 'Test collaborator email',
      companyName: companies[0].name,
    };

    request(app)
      .post(`/collaborators/${testBody.companyName}`)
      .send(testBody)
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(testBody.name);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Collaborator.find({name: testBody.name}).then((collaborators) => {
          expect(collaborators.length).toBe(1);
        }).catch((e) => done(e));

        Company.find({name: testBody.companyName}).populate('collaborators').then((companies) => {
          expect(companies[0].collaborators.length).toBe(5);
          expect(companies[0].name).toBe(testBody.companyName);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create collaborator with invalid body data', (done) => {
    const testBody = {
      name: 'Test collaborator name',
      companyName: companies[0].name,
    };
    
    request(app)
      .post(`/collaborators/${testBody.companyName}`)
      .send(testBody)
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Collaborator.find().then((collaborators) => {
          expect(collaborators.length).toBe(4);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create collaborator with name and/or email that already exists', (done) => {
    request(app)
      .post(`/collaborators/${companies[0].name}`)
      .send(collaborators[0])
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Collaborator.find().then((collaborators) => {
          expect(collaborators.length).toBe(4);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /collaborators/:companyName/:email', () => {
  it('should remove a collaborator', (done) => {
    const companyName = collaborators[0].companyName;
    const email = collaborators[0].email;
    request(app)
      .delete(`/collaborators/${companyName}/${email}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.collaborator.email).toBe(collaborators[0].email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Collaborator.findOne({companyName, email}).then((collaborator) => {
          expect(collaborator).toBeNull();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if collaborator not found', (done) => {
    const companyName = collaborators[0].companyName;
    const email = 'Invalid email';
    request(app)
      .delete(`/collaborators/${companyName}/${email}`)
      .expect(404)
      .end(done);
  });
})

describe('POST /collaborators/:companyName', () => {
  it('should create a new collaborator', (done) => {
    const testBody = {
      name: 'Test collaborator name',
      email: 'Test collaborator email',
      companyName: companies[0].name,
    };

    request(app)
      .post(`/collaborators/${testBody.companyName}`)
      .send(testBody)
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(testBody.name);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Collaborator.find({name: testBody.name}).then((collaborators) => {
          expect(collaborators.length).toBe(1);
        }).catch((e) => done(e));

        Company.find({name: testBody.companyName}).populate('collaborators').then((companies) => {
          expect(companies[0].collaborators.length).toBe(5);
          expect(companies[0].name).toBe(testBody.companyName);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create collaborator with invalid body data', (done) => {
    const testBody = {
      name: 'Test collaborator name',
      companyName: companies[0].name,
    };
    
    request(app)
      .post(`/collaborators/${testBody.companyName}`)
      .send(testBody)
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Collaborator.find().then((collaborators) => {
          expect(collaborators.length).toBe(4);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should not create collaborator with name and/or email that already exists', (done) => {
    request(app)
      .post(`/collaborators/${companies[0].name}`)
      .send(collaborators[0])
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Collaborator.find().then((collaborators) => {
          expect(collaborators.length).toBe(4);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('PATCH /collaborators/:companyName/:email', () => {
  it('should set a collaborator\'s manager', (done) => {
    const companyName = collaborators[0].companyName;
    const email = collaborators[0].email;
    const managerEmail = collaborators[1].email;
    request(app)
      .patch(`/collaborators/${companyName}/${email}`)
      .send({managerEmail})
      .expect(200)
      .expect((res) => {
        expect(res.body.collaborator.managerEmail).toBe(collaborators[1].email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Collaborator.findOne({companyName, email: managerEmail}).populate('managed').then((collaborator) => {
          expect(collaborator.managed.length).toBe(3);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 400 if manager not found', (done) => {
    const companyName = collaborators[0].companyName;
    const email = collaborators[0].email;
    const managerEmail = 'Invalid email';
    request(app)
      .patch(`/collaborators/${companyName}/${email}`)
      .send({managerEmail})
      .expect(400)
      .end(done);
  });
})

describe('GET /collaborators/:companyName/:email/pairs', () => {
  it('should get a collaborator\'s pairs', (done) => {
    const companyName = collaborators[2].companyName;
    const email = collaborators[2].email;
    request(app)
      .get(`/collaborators/${companyName}/${email}/pairs`)
      .expect(200)
      .expect((res) => {
        expect(res.body.pairs.length).toBe(1);
      })
      .end(done);
  });
})

describe('GET /collaborators/:companyName/:email/managed', () => {
  it('should get a managers\'s managed collaborators', (done) => {
    const companyName = collaborators[1].companyName;
    const email = collaborators[1].email;
    request(app)
      .get(`/collaborators/${companyName}/${email}/managed`)
      .expect(200)
      .expect((res) => {
        expect(res.body.managed.length).toBe(2);
      })
      .end(done);
  });
})
