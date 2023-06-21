import chai from 'chai';
import chaiHttp from 'chai-http';
import { describe, it } from 'mocha';

import app from '../app.js';

chai.use(chaiHttp);

const BASE_URL = 'api';
const CURRENT_VERSION = 'v1';

const basicUser = {
  firstName: 'Bob',
  lastName: 'Bob',
  username: 'bobby',
  email: 'bobby@gmail.com',
  password: 'password!1',
  confirmPassword: 'password!1',
};

const loginBasicUser = {
  email: 'bobby@gmail.com',
  password: 'password!1',
};

const quiz = {
  categoryId: 9,
  difficulty: 'easy',
  name: 'firstQuiz',
  type: 'multiple',
  numOfQuestions: 10,
  startDate: '2023/06/23',
  endDate: '2023/06/24',
};

const participate = {
  answers: ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'],
};

describe('Basic User register', () => {
  it('should register a basic user', (done) => {
    chai
      .request(app)
      .post(`/${BASE_URL}/${CURRENT_VERSION}/auth/register`)
      .send(basicUser)
      .end((err, res) => {
        chai.expect(res.status).to.be.equal(201);
        chai.expect(res.body).to.be.a('object');
        chai.expect(res.body.msg).to.be.equal('bobby successfully registered');
        done();
      });
  });
});

describe('Login Basic User register', () => {
  it('should login as a basic user', (done) => {
    chai
      .request(app)
      .post(`/${BASE_URL}/${CURRENT_VERSION}/auth/login`)
      .send(loginBasicUser)
      .end((err, res) => {
        chai.expect(res.status).to.be.equal(200);
        chai.expect(res.body).to.be.a('object');
        chai.expect(res.body.msg).to.be.equal('bobby successfully logged in');
        done();
      });
  });
});

describe('Create a quiz', () => {
  it('should create a quiz', (done) => {
    chai
      .request(app)
      .post(`/${BASE_URL}/${CURRENT_VERSION}/auth/login`)
      .send({
        email: 'bossMan@gmail.com',
        password: 'password!1'
      })
      .end((err, res) => {
        chai
          .request(app)
          .post(`/${BASE_URL}/${CURRENT_VERSION}/category`)
          .set('Authorization', `Bearer ${res.body.token}`)
          .send()
          .end((err, res) => {
            chai.expect(res.status).to.be.equal(201);
            chai.expect(res.body).to.be.a('object');
          });
        chai
          .request(app)
          .post(`/${BASE_URL}/${CURRENT_VERSION}/quiz`)
          .set('Authorization', `Bearer ${res.body.token}`)
          .send(quiz)
          .end((err, res) => {
            chai.expect(res.status).to.be.equal(201);
            chai.expect(res.body).to.be.a('object');
            chai.expect(res.body.msg).to.be.equal('Quiz successfully created');
            // Call done() inside the last end() callback
            done();
          });
      });
  });
});

describe('Participate in quiz', () => {
  it('should particpate a quiz', (done) => {
    chai
      .request(app)
      .post(`/${BASE_URL}/${CURRENT_VERSION}/auth/login`)
      .send({
        email: 'bossMan@gmail.com',
        password: 'password!1',
      })
      .end((err, res) => {
        chai
          .request(app)
          .post(`/${BASE_URL}/${CURRENT_VERSION}/quiz/1/participate`)
          .set('Authorization', `Bearer ${res.body.token}`)
          .send(participate)
          .end((err, res) => {
            chai.expect(res.body).to.be.a('object');
            chai
              .expect(res.body.data)
              .to.be.equal(
                'bossMan has successfully participated in quiz firstQuiz, your score was 0/10. Average score is 0'
              );
            done();
          });
      });
  });
});

