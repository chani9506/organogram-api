const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Company} = require('./../models/company');

const companies = [{
  _id: new ObjectID(),
  name: 'First test company'
}, {
  _id: new ObjectID(),
  name: 'Second test company'
}];

beforeEach((done) => {
  Company.remove({}).then(() => {
    return Company.insertMany(companies);
  }).then(() => done());
});

describe('POST /companies', () => {
  it('should create a new company', (done) => {
    var name = 'Test company name';

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

describe('GET /companies/:id', () => {
  it('should return company doc', (done) => {
    request(app)
      .get(`/companies/${companies[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.company.name).toBe(companies[0].name);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();
    request(app)
      .get(`/companies/${hexId}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/companies/123`)
      .expect(404)
      .end(done);
  });
});