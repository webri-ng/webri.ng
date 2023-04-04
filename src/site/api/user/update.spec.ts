import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { app } from '../..';
import { Session, User } from '../../model';
import { userService, testUtils, sessionService } from '../../app';
import { userConfig } from '../../config';
import { emailNotUniqueError, invalidUsernameTooLongError, invalidUsernameTooShortError,
	requestAuthenticationFailedError, usernameNotUniqueError } from '../api-error-response';
import { getRepository } from 'typeorm';

chai.use(chaiHttp);


describe('Update user API', function() {
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testExistingUser: User;
	let testUserSession: Session;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
		testExistingUser = await testUtils.insertTestUser();
		testUserSession = await sessionService.createSession(testUser);
	});


	after(async function tearDown() {
		await userService.deleteUser(testUser.userId!);
		await userService.deleteUser(testExistingUser.userId!);
	});


	it('should reject an unauthenticated request', function(done) {
		chai.request(app)
			.patch('/user')
			.send({
				'username': testUtils.createRandomUsername(),
				'email': testUtils.createRandomEmailAddress(),
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(requestAuthenticationFailedError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(requestAuthenticationFailedError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(requestAuthenticationFailedError.message);
				done();
			});
	});


	it('should reject an update with an email that is already used',
		function(done)
	{
		chai.request(app)
			.patch('/user')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				'username': testUtils.createRandomUsername(),
				'email': testExistingUser.email,
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(emailNotUniqueError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(emailNotUniqueError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(emailNotUniqueError.message);
				done();
			});
	});


	it('should reject a registration with a username that is already used',
		function(done)
	{
		chai.request(app)
			.patch('/user')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				'username': testExistingUser.username,
				'email': testUtils.createRandomEmailAddress(),
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(usernameNotUniqueError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(usernameNotUniqueError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(usernameNotUniqueError.message);
				done();
			});
	});


	it('should throw an exception when passed an invalid username that is too short',
		function(done)
	{
		const shortUsername = Array(userConfig.usernameRequirements.minLength - 1)
			.fill('n').join('');

		chai.request(app)
			.patch('/user')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				'username': shortUsername,
				'email': testUtils.createRandomEmailAddress(),
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(invalidUsernameTooShortError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(invalidUsernameTooShortError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(invalidUsernameTooShortError.message);
				done();
			});
	});


	it('should throw an exception when passed an invalid username that is too long',
		function(done)
	{
		const longUsername = Array(userConfig.usernameRequirements.maxLength + 1)
			.fill('n').join('');

		chai.request(app)
			.patch('/user')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				'username': longUsername,
				'email': testUtils.createRandomEmailAddress(),
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(invalidUsernameTooLongError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(invalidUsernameTooLongError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(invalidUsernameTooLongError.message);
				done();
			});
	});


	it('should correctly update a user', function(done) {
		const email = testUtils.createRandomEmailAddress();
		const username = testUtils.createRandomUsername();

		chai.request(app)
			.patch('/user')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				'username': username,
				'email': email,
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);

				getRepository(User).findOneBy({
					userId: testUser.userId!
				}).then((user) => {
					expect(user?.username).to.equal(username);
					expect(user?.email).to.equal(email);
					done();
				});
			});
	});
});
