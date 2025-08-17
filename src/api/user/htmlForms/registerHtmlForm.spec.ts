import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { app } from '../../..';
import { Session, User } from '../../../model';
import { userService, testUtils } from '../../../app';
import { appDataSource } from '../../../infra/database';
import { userConfig } from '../../../config';
import {
	badRequestError,
	emailNotUniqueError,
	invalidNewPasswordTooLongError,
	invalidNewPasswordTooShortError,
	invalidUsernameTooLongError,
	invalidUsernameTooShortError,
	newPasswordNotConfirmedCorrectlyError,
	requestValidationError,
	usernameNotUniqueError
} from '../../api-error-response';
import { GetUserSearchField } from '../../../app/user';
import { getResponseViewErrorMessage } from '../../../app/testUtils';

chai.use(chaiHttp);

describe('Registration HTML Form', function () {
	this.timeout(testUtils.defaultTestTimeout);

	let testExistingUser: User;

	let newRegisteredUserEmail: string;

	before(async function beforeTesting() {
		testExistingUser = await testUtils.insertTestUser();
	});

	after(async function tearDown() {
		await userService.deleteUser(testExistingUser.userId!);

		const newUser = await userService.getUser(
			GetUserSearchField.Email,
			newRegisteredUserEmail
		);

		if (!newUser) {
			throw new Error('Unable to get newly created user');
		}

		await userService.deleteUser(newUser.userId!);
	});

	it('should reject a registration with an invalid request', function (done) {
		const newPassword = testUtils.createRandomPassword();

		chai
			.request(app)
			.post('/user/register/form')
			.send({
				randomvarhere: 1,
				username: testUtils.createRandomUsername(),
				email: testUtils.createRandomEmailAddress(),
				password: newPassword,
				confirmPassword: newPassword
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(requestValidationError.httpStatus);
				expect(getResponseViewErrorMessage(res.text)).to.equal(
					badRequestError.message
				);

				done();
			});
	});

	it('should reject a registration which incorrectly confirms the password', function (done) {
		chai
			.request(app)
			.post('/user/register/form')
			.send({
				username: testUtils.createRandomUsername(),
				email: testUtils.createRandomEmailAddress(),
				password: 'newPassword',
				confirmPassword: 'notTheNewPassword'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(
					newPasswordNotConfirmedCorrectlyError.httpStatus
				);
				expect(
					getResponseViewErrorMessage(res.text, 'register-error-message')
				).to.equal(newPasswordNotConfirmedCorrectlyError.message);

				done();
			});
	});

	it('should reject a registration with an email that is already used', function (done) {
		const newPassword = testUtils.createRandomPassword();

		chai
			.request(app)
			.post('/user/register/form')
			.send({
				username: testUtils.createRandomUsername(),
				email: testExistingUser.email,
				password: newPassword,
				confirmPassword: newPassword
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(emailNotUniqueError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'register-error-message')
				).to.equal(emailNotUniqueError.message);

				done();
			});
	});

	it('should reject a registration with a username that is already used', function (done) {
		const newPassword = testUtils.createRandomPassword();

		chai
			.request(app)
			.post('/user/register/form')
			.send({
				username: testExistingUser.username,
				email: testUtils.createRandomEmailAddress(),
				password: newPassword,
				confirmPassword: newPassword
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(usernameNotUniqueError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'register-error-message')
				).to.equal(usernameNotUniqueError.message);

				done();
			});
	});

	it('should reject a registration with a password that is too short', function (done) {
		const shortPassword = Array(userConfig.password.minLength - 1)
			.fill('n')
			.join('');

		chai
			.request(app)
			.post('/user/register/form')
			.send({
				username: testUtils.createRandomUsername(),
				email: testUtils.createRandomEmailAddress(),
				password: shortPassword,
				confirmPassword: shortPassword
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(invalidNewPasswordTooShortError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'register-error-message')
				).to.equal(invalidNewPasswordTooShortError.message);

				done();
			});
	});

	it('should reject a registration with a password that is too long', function (done) {
		const longPassword = Array(userConfig.password.maxLength + 1)
			.fill('n')
			.join('');

		chai
			.request(app)
			.post('/user/register/form')
			.send({
				username: testUtils.createRandomUsername(),
				email: testUtils.createRandomEmailAddress(),
				password: longPassword,
				confirmPassword: longPassword
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(invalidNewPasswordTooLongError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'register-error-message')
				).to.equal(invalidNewPasswordTooLongError.message);

				done();
			});
	});

	it('should throw an exception when passed an invalid username that is too short', function (done) {
		const newPassword = testUtils.createRandomPassword();

		const shortUsername = Array(userConfig.usernameRequirements.minLength - 1)
			.fill('n')
			.join('');

		chai
			.request(app)
			.post('/user/register/form')
			.send({
				username: shortUsername,
				email: testUtils.createRandomEmailAddress(),
				password: newPassword,
				confirmPassword: newPassword
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(invalidUsernameTooShortError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'register-error-message')
				).to.equal(invalidUsernameTooShortError.message);

				done();
			});
	});

	it('should throw an exception when passed an invalid username that is too long', function (done) {
		const newPassword = testUtils.createRandomPassword();

		const longUsername = Array(userConfig.usernameRequirements.maxLength + 1)
			.fill('n')
			.join('');

		chai
			.request(app)
			.post('/user/register/form')
			.send({
				username: longUsername,
				email: testUtils.createRandomEmailAddress(),
				password: newPassword,
				confirmPassword: newPassword
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(invalidUsernameTooLongError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'register-error-message')
				).to.equal(invalidUsernameTooLongError.message);

				done();
			});
	});

	it('should register a new user', function (done) {
		const newPassword = testUtils.createRandomPassword();

		newRegisteredUserEmail = testUtils.createRandomEmailAddress();

		chai
			.request(app)
			.post('/user/register/form')
			.send({
				username: testUtils.createRandomUsername(),
				email: newRegisteredUserEmail,
				password: newPassword,
				confirmPassword: newPassword
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);

				appDataSource
					.getRepository(User)
					.findOneBy({
						email: newRegisteredUserEmail
					})
					.then((newUser: User | null) => {
						appDataSource
							.getRepository(Session)
							.findOne({
								where: {
									userId: newUser?.userId
								},
								order: {
									dateCreated: 'DESC'
								}
							})
							.then((userSession: Session | null) => {
								expect(res).to.have.cookie('session', userSession?.sessionId);
								done();
							});
					});
			});
	});
});
