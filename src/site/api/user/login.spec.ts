import * as dayjs from 'dayjs';
import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { app } from '../..';
import { User, Session } from '../../model';
import { userService, testUtils } from '../../app';
import { appDataSource } from '../../infra/database';
import { userConfig } from '../../config';
import { expiredPasswordError, lockedAccountDueToAuthFailureError,
	loginAttemptCountExceededError, loginFailedError,
	requestValidationError } from '../api-error-response';

chai.use(chaiHttp);


describe('Login API', function()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testMaxAttemptCountUser: User;
	let testExpiredPasswordCustomer: User;


	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();

		testExpiredPasswordCustomer = await testUtils.insertTestUser();
		await appDataSource.getRepository(User).update(testExpiredPasswordCustomer.userId!, {
			passwordExpiryTime: dayjs().subtract(1, 'day').toDate()
		});

		testMaxAttemptCountUser = await testUtils.insertTestUser();
		await appDataSource.getRepository(User).update(testMaxAttemptCountUser.userId!, {
			loginAttemptCount: userConfig.maxUnsuccessfulLoginAttempts - 1
		});
	});


	after(async function tearDown() {
		await userService.deleteUser(testUser.userId!);
		await userService.deleteUser(testMaxAttemptCountUser.userId!);
		await userService.deleteUser(testExpiredPasswordCustomer.userId!);
	});


	it('should reject a login attempt with an invalid request', function (done) {
		chai.request(app)
			.post('/user/login')
			.send({
				'sdgsdgds': 1,
				'email': testUser.email,
				'password': testUtils.testPasswordText
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(requestValidationError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(requestValidationError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(requestValidationError.message);
				done();
			});
	});


	it('should reject a login attempt with an unknown user email', function (done)
	{
		chai.request(app)
			.post('/user/login')
			.send({
				'email': 'notauser@example.org',
				'password': testUtils.testPasswordText
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(loginFailedError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(loginFailedError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(loginFailedError.message);
				done();
			});
	});


	it('should reject a login attempt with bad credentials', function (done) {
		chai.request(app)
			.post('/user/login')
			.send({
				'email': testUser.email,
				'password': 'notapassword1'
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(loginFailedError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(loginFailedError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(loginFailedError.message);
				done();
			});
	});


	it('should reject a login attempt with an expired password', function (done) {
		chai.request(app)
			.post('/user/login')
			.send({
				'email': testExpiredPasswordCustomer.email,
				'password': testUtils.testPasswordText
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(expiredPasswordError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(expiredPasswordError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(expiredPasswordError.message);
				done();
			});
	});


	it('should successfully authenticate correct credentials', function (done) {
		chai.request(app)
			.post('/user/login')
			.send({
				'email': testUser.email,
				'password': testUtils.testPasswordText
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);

				appDataSource.getRepository(Session).findOne({
					where: {
						userId: testUser.userId
					},
					order: {
						dateCreated: 'DESC'
					}
				}).then((userSession) => {
					expect(res).to.have.cookie('session', userSession?.sessionId);
					done();
				});
			});
	});


	it('should successfully authenticate an email in the incorrect case', function (done)
	{
		chai.request(app)
			.post('/user/login')
			.send({
				'email': `${testUser.email.toUpperCase()}`,
				'password': testUtils.testPasswordText
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);

				appDataSource.getRepository(Session).findOne({
					where: {
						userId: testUser.userId
					},
					order: {
						dateCreated: 'DESC'
					}
				}).then((userSession) => {
					expect(res).to.have.cookie('session', userSession?.sessionId);
					done();
				});
			});
	});


	it('should correctly lock an account after multiple unsuccessful attempts', function (done)
	{
		chai.request(app)
			.post('/user/login')
			.send({
				'email': testMaxAttemptCountUser.email,
				'password': 'incorrectpassword1'
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(loginAttemptCountExceededError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(loginAttemptCountExceededError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(loginAttemptCountExceededError.message);
				done();
			});
	});


	it('should receive an error when an account is locked due to too many unsuccessful ' +
		'login attempts', function (done)
	{
		chai.request(app)
			.post('/user/login')
			.send({
				'email': testMaxAttemptCountUser.email,
				'password': testUtils.testPasswordText
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(lockedAccountDueToAuthFailureError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(lockedAccountDueToAuthFailureError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(lockedAccountDueToAuthFailureError.message);
				done();
			});
	});
});
