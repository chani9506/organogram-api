const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Company} = require('./../models/company');

beforeEach((done) => {
  Company.remove({}).then(() => done());
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

        Company.find().then((companies) => {
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
          expect(companies.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});