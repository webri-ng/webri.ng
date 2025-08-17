import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { app } from '../../..';
import { Session, User } from '../../../model';
import { userService, testUtils, sessionService } from '../../../app';
import { appDataSource } from '../../../infra/database';
import {
	badRequestError,
	invalidExistingPasswordError,
	invalidNewPasswordTooLongError,
	invalidNewPasswordTooShortError,
	notAuthorisedErrorMessage,
	requestAuthenticationFailedError,
	requestValidationError
} from '../../api-error-response';
import { userConfig } from '../../../config';
import { validatePassword } from '../../../app/user/password';
import { getResponseViewErrorMessage } from '../../../app/testUtils';

chai.use(chaiHttp);

describe('Update User Password HTML Form', function () {
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testExistingUser: User;
	let testUserSession: Session;

	const newPassword = testUtils.createRandomPassword();

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
			.post('/user/update-password/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				curentPassword: testUtils.testPasswordText,
				newPassword: newPassword,
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

	it('should reject an unauthenticated request', function (done) {
		chai
			.request(app)
			.post('/user/update-password/form')
			.send({
				currentPassword: testUtils.testPasswordText,
				newPassword: newPassword,
				confirmPassword: newPassword
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(
					requestAuthenticationFailedError.httpStatus
				);
				expect(getResponseViewErrorMessage(res.text)).to.equal(
					notAuthorisedErrorMessage
				);

				done();
			});
	});

	it('should reject a request with an incorrect current password', function (done) {
		chai
			.request(app)
			.post('/user/update-password/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				currentPassword: 'incorrect',
				newPassword: newPassword,
				confirmPassword: newPassword
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidExistingPasswordError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'update-password-error-message')
				).to.equal(invalidExistingPasswordError.message);

				done();
			});
	});

	it('should reject an update to a password that is too short', function (done) {
		const shortPassword = Array(userConfig.password.minLength - 1)
			.fill('n')
			.join('');

		chai
			.request(app)
			.post('/user/update-password/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				currentPassword: testUtils.testPasswordText,
				newPassword: shortPassword,
				confirmPassword: shortPassword
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidNewPasswordTooShortError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'update-password-error-message')
				).to.equal(invalidNewPasswordTooShortError.message);

				done();
			});
	});

	it('should reject an update to a password that is too long', function (done) {
		const longPassword = Array(userConfig.password.maxLength + 1)
			.fill('n')
			.join('');

		chai
			.request(app)
			.post('/user/update-password/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				currentPassword: testUtils.testPasswordText,
				newPassword: longPassword,
				confirmPassword: longPassword
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidNewPasswordTooLongError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'update-password-error-message')
				).to.equal(invalidNewPasswordTooLongError.message);

				done();
			});
	});

	it(`should correctly update a user's password`, function (done) {
		chai
			.request(app)
			.post('/user/update-password/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				currentPassword: testUtils.testPasswordText,
				newPassword: newPassword,
				confirmPassword: newPassword
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);

				appDataSource
					.getRepository(User)
					.findOneBy({
						userId: testUser.userId!
					})
					.then((user: User | null) => {
						if (!user) {
							throw new Error('Unable to find user');
						}

						validatePassword(newPassword, user.passwordHash).then((result) => {
							expect(result).to.be.true;
							done();
						});
					});
			});
	});
});
