import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { app } from '../..';
import { Session, User } from '../../model';
import { userService, testUtils } from '../../app';
import { userConfig } from '../../config';
import { emailNotUniqueError, invalidNewPasswordTooLongError, invalidNewPasswordTooShortError,
	invalidUsernameTooLongError, invalidUsernameTooShortError, requestValidationError,
	usernameNotUniqueError } from '../api-error-response';
import { GetUserSearchField } from '../../app/user';
import { getRepository } from 'typeorm';

chai.use(chaiHttp);


describe('Registration API', function() {
	this.timeout(testUtils.defaultTestTimeout);

	let testExistingUser: User;

	let newRegisteredUserEmail: string;

	before(async function beforeTesting() {
		testExistingUser = await testUtils.insertTestUser();
	});


	after(async function tearDown() {
		await userService.deleteUser(testExistingUser?.userId!);

		const newUser = await userService.getUser(GetUserSearchField.Email,
			newRegisteredUserEmail);

		if (!newUser) {
			throw new Error('Unable to get newly created user');
		}

		await userService.deleteUser(newUser?.userId!);
	});


	it('should reject a registration with an invalid request', function(done) {
		chai.request(app)
			.post('/user/register')
			.send({
				'randomvarhere': 1,
				'username': testUtils.createRandomUsername(),
				'email': testUtils.createRandomEmailAddress(),
				'password': testUtils.createRandomPassword()
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


	it('should reject a registration with an email that is already used',
		function(done)
	{
		chai.request(app)
			.post('/user/register')
			.send({
				'username': testUtils.createRandomUsername(),
				'email': testExistingUser.email,
				'password': testUtils.createRandomPassword()
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
			.post('/user/register')
			.send({
				'username': testExistingUser.username,
				'email': testUtils.createRandomEmailAddress(),
				'password': testUtils.createRandomPassword()
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


	it('should reject a registration with a password that is too short',
		function(done)
	{
		const shortPassword = Array(userConfig.password.minLength - 1)
			.fill('n').join('');

		chai.request(app)
			.post('/user/register')
			.send({
				'username': testUtils.createRandomUsername(),
				'email': testUtils.createRandomEmailAddress(),
				'password': shortPassword
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(invalidNewPasswordTooShortError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(invalidNewPasswordTooShortError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(invalidNewPasswordTooShortError.message);
				done();
			});
	});


	it('should reject a registration with a password that is too long',
		function(done)
	{
		const longPassword = Array(userConfig.password.maxLength + 1)
			.fill('n').join('');

		chai.request(app)
			.post('/user/register')
			.send({
				'username': testUtils.createRandomUsername(),
				'email': testUtils.createRandomEmailAddress(),
				'password': longPassword
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(invalidNewPasswordTooLongError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(invalidNewPasswordTooLongError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(invalidNewPasswordTooLongError.message);
				done();
			});
	});


	it('should throw an exception when passed an invalid username that is too short',
		function(done)
	{
		const shortUsername = Array(userConfig.usernameRequirements.minLength - 1)
			.fill('n').join('');

		chai.request(app)
			.post('/user/register')
			.send({
				'username': shortUsername,
				'email': testUtils.createRandomEmailAddress(),
				'password': testUtils.createRandomPassword()
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
			.post('/user/register')
			.send({
				'username': longUsername,
				'email': testUtils.createRandomEmailAddress(),
				'password': testUtils.createRandomPassword()
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


	it('should register a new user', function(done) {
		newRegisteredUserEmail = testUtils.createRandomEmailAddress();

		chai.request(app)
			.post('/user/register')
			.send({
				'username': testUtils.createRandomUsername(),
				'email': newRegisteredUserEmail,
				'password': testUtils.createRandomPassword()
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);

				getRepository(User).findOne({
					email: newRegisteredUserEmail
				}).then((newUser) => {
					getRepository(Session).findOne({
						where: {
							userId: newUser?.userId
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
	});
});
