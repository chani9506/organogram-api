const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Company} = require('./../models/company');

const companies = [{
  name: 'First test company'
}, {
  name: 'Second test company'
}];

beforeEach((done) => {
  Company.remove({}).then(() => {
    return Company.insertMany(companies);
  }).then(() => done());
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
  it('should remove a company', (done) => {
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