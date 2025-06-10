import { JSDOM } from 'jsdom';
import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { app } from '../../../';
import { Session, User } from '../../../model';
import { userService, testUtils, sessionService } from '../../../app';
import { appDataSource } from '../../../infra/database';
import {
	badRequestError,
	emailNotUniqueError,
	invalidUsernameTooLongError,
	invalidUsernameTooShortError,
	requestAuthenticationFailedError,
	requestValidationError,
	usernameNotUniqueError
} from '../../api-error-response';
import { userConfig } from '../../../config';

chai.use(chaiHttp);

describe('Update User HTML Form', function () {
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

	it('should reject an update with an invalid request', function (done) {
		chai
			.request(app)
			.post('/user/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				randomvarhere: 1,
				username: testUtils.createRandomUsername(),
				email: testUtils.createRandomEmailAddress()
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(requestValidationError.httpStatus);

				const dom = new JSDOM(res.text);
				const errorMessageElement =
					dom.window.document.getElementById('error-message');
				expect(errorMessageElement?.innerHTML).to.equal(
					badRequestError.message
				);

				done();
			});
	});

	it('should reject an unauthenticated request', function (done) {
		chai
			.request(app)
			.post('/user/form')
			.send({
				username: testUtils.createRandomUsername(),
				email: testUtils.createRandomEmailAddress()
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(
					requestAuthenticationFailedError.httpStatus
				);

				const dom = new JSDOM(res.text);
				const errorMessageElement =
					dom.window.document.getElementById('error-message');
				expect(errorMessageElement?.innerHTML).to.equal(
					'You are not authorised to access this page!'
				);

				done();
			});
	});

	it('should reject an update with an email that is already used', function (done) {
		chai
			.request(app)
			.post('/user/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				username: testUtils.createRandomUsername(),
				email: testExistingUser.email
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(emailNotUniqueError.httpStatus);

				const dom = new JSDOM(res.text);
				const registrationErrorMessageElement =
					dom.window.document.getElementById('error-message');
				expect(registrationErrorMessageElement?.innerHTML).to.equal(
					emailNotUniqueError.message
				);

				done();
			});
	});

	it('should reject a registration with a username that is already used', function (done) {
		chai
			.request(app)
			.post('/user/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				username: testExistingUser.username,
				email: testUtils.createRandomEmailAddress()
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(usernameNotUniqueError.httpStatus);

				const dom = new JSDOM(res.text);
				const registrationErrorMessageElement =
					dom.window.document.getElementById('error-message');
				expect(registrationErrorMessageElement?.innerHTML).to.equal(
					usernameNotUniqueError.message
				);

				done();
			});
	});

	it('should throw an exception when passed an invalid username that is too short', function (done) {
		const shortUsername = Array(userConfig.usernameRequirements.minLength - 1)
			.fill('n')
			.join('');

		chai
			.request(app)
			.post('/user/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				username: shortUsername,
				email: testUtils.createRandomEmailAddress()
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(invalidUsernameTooShortError.httpStatus);

				const dom = new JSDOM(res.text);
				const registrationErrorMessageElement =
					dom.window.document.getElementById('error-message');
				expect(registrationErrorMessageElement?.innerHTML).to.equal(
					invalidUsernameTooShortError.message
				);

				done();
			});
	});

	it('should throw an exception when passed an invalid username that is too long', function (done) {
		const longUsername = Array(userConfig.usernameRequirements.maxLength + 1)
			.fill('n')
			.join('');

		chai
			.request(app)
			.post('/user/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				username: longUsername,
				email: testUtils.createRandomEmailAddress()
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(invalidUsernameTooLongError.httpStatus);

				const dom = new JSDOM(res.text);
				const registrationErrorMessageElement =
					dom.window.document.getElementById('error-message');
				expect(registrationErrorMessageElement?.innerHTML).to.equal(
					invalidUsernameTooLongError.message
				);

				done();
			});
	});

	it('should update the user successfully', function (done) {
		const newUsername = testUtils.createRandomUsername();
		const newEmail = testUtils.createRandomEmailAddress();

		chai
			.request(app)
			.post('/user/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				username: newUsername,
				email: newEmail
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);

				appDataSource
					.getRepository(User)
					.findOneBy({
						userId: testUser.userId
					})
					.then((updatedUser: User | null) => {
						expect(updatedUser?.username).to.equal(newUsername);
						expect(updatedUser?.email).to.equal(newEmail);
						done();
					});
			});
	});
});
