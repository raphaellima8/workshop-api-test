'use strict';

const app = require('../');
const chai = require('chai');
const request = require('supertest');

const expect = chai.expect;
const should = chai.should();

describe('NODE API Integration Tests', () => {
  describe('GET /api/health', () => { 
    it('should verify if API is running', done => { 
      request(app)
        .get('/api/health')
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.statusCode).to.equal(200); 
          done(); 
        }); 
    });
  });

  // async/await
  describe('GET /api/users', () => { 
    it('should return a list of users', async () => {
      try {
        const res = await request(app).get('/api/users');
        expect(res.body).to.be.an('array');
        expect(res.body).to.be.an('array').with.lengthOf(10);
      } catch (err) {
        console.error(err);
      }
    });
  });

  describe('GET /api/users?limit=6', () => { 
    it('should return a list of 6 users', done => { 
      request(app)
        .get('/api/users')
        .query({ limit: 6 })
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.be.an('array').with.lengthOf(6);
          done(); 
        }); 
    });
  });

  describe('GET /api/user/:id', () => { 
    it('should return only one user by ID', done => { 
      request(app)
        .get('/api/user/2')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('id', 'name', 'email');
          done(); 
        }); 
    });
  });

  describe('GET /api/user/:id', () => { 
    it('should return only one user by ID with full data', done => { 
      request(app)
        .get('/api/user/2')
        .set('full-user', 'true')
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('id', 'name', 'email', 'address');
          done(); 
        }); 
    });
  });

  describe('POST /api/auth', () => { 
    it('should return a JWT token', done => { 
      request(app)
        .post('/api/auth')
        .send({ email: 'email@email.com', password: '1234' })
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.be.an('object')
            .that.has.keys('token');
          done(); 
        }); 
    });
  });

  describe('POST /api/auth', () => { 
    it('should NOT return a JWT token', done => { 
      request(app)
        .post('/api/auth')
        .send({ email: null })
        .expect(401)
        .end((err, res) => {
          res.body.should.be.an('object')
            .that.has.keys('message');
          res.body.message.should.be.an('string')
            .equal('Não autorizado! Usuário ou senha inválida')
          done(); 
        }); 
    });
  });

  describe('POST /api/user/create', () => { 
    it('should NOT create an user without authentication', done => { 
      request(app)
        .post('/api/user/create')
        .send({
          id: '11',
          name: 'Usuário 11',
          email: 'usuario11@email.com'
        })
        .expect(401)
        .end((err, res) => {
          res.body.should.be.an('object').that.has.keys('message');
          res.body.message.should.be.an('string').equal('Não autorizado');
          done(); 
        }); 
    });
  });

  describe('POST /api/user/create', () => { 
    it('should NOT create an user without a valid token', done => { 
      request(app)
        .post('/api/user/create')
        .set('Authorization', 'JWT invalidtoken')
        .send({
          id: '11',
          name: 'Usuário 11',
          email: 'usuario11@email.com'
        })
        .expect(403)
        .end((err, res) => {
          res.body.should.be.an('object').that.has.keys('message');
          res.body.message.should.be.an('string').equal('Sem permissão');
          done(); 
        }); 
    });
  });

  describe('POST /api/user/create', () => { 
    it('should NOT create an user with empty body', done => { 
      request(app)
        .post('/api/user/create')
        .set('Authorization', 'JWT asldkmasfjn349-859kqljn141235213lrkm')
        .send({})
        .expect(500)
        .end((err, res) => {
          res.body.should.be.an('object').that.has.keys('message');
          res.body.message.should.be.an('string').equal('Erro ao persistir! Dados não recebidos');
          done(); 
        }); 
    });
  });

  
  // Using promise
  describe('POST /api/user/create', () => { 
    it('should create an user', done => { 
      request(app)
        .post('/api/user/create')
        .set('Authorization', 'JWT asldkmasfjn349-859kqljn141235213lrkm')
        .send({
          id: '11',
          name: 'Usuário 11',
          email: 'usuario11@email.com'
        })
        .expect(201)
        .then(res => {
          res.body.should.be.an('object').that.has.keys('status', 'message');
          res.body.message.should.be.an('string').equal('Dado persistido com sucesso');
          return done();
        })
        .catch(console.error.bind(this))
    });
  });
});