import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { app } from '../..';
import { Session, User } from '../../model';
import { userService, testUtils, sessionService } from '../../app';
import { appDataSource } from '../../infra/database';
import { userConfig } from '../../config';
import { invalidExistingPasswordError, invalidNewPasswordTooLongError,
	invalidNewPasswordTooShortError, requestAuthenticationFailedError } from '../api-error-response';
import { validatePassword } from '../../app/user/password';

chai.use(chaiHttp);


describe('Update user password API', function() {
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


	it('should reject an unauthenticated request', function(done) {
		chai.request(app)
			.post('/user/update-password')
			.send({
				'currentPassword': testUtils.testPasswordText,
				'newPassword': newPassword,
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


	it('should reject a request with an incorrect current password',
		function(done)
	{
		chai.request(app)
			.post('/user/update-password')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				'currentPassword': 'incorrect',
				'newPassword': newPassword,
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(invalidExistingPasswordError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(invalidExistingPasswordError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(invalidExistingPasswordError.message);
				done();
			});
	});


	it('should reject an update to a password that is too short',
		function(done)
	{
		const shortPassword = Array(userConfig.password.minLength - 1)
			.fill('n').join('');

		chai.request(app)
			.post('/user/update-password')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				'currentPassword': testUtils.testPasswordText,
				'newPassword': shortPassword,
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


	it('should reject an update to a password that is too long',
		function(done)
	{
		const longPassword = Array(userConfig.password.maxLength + 1)
			.fill('n').join('');

		chai.request(app)
			.post('/user/update-password')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				'currentPassword': testUtils.testPasswordText,
				'newPassword': longPassword,
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


	it(`should correctly update a user's password`, function(done) {
		chai.request(app)
			.post('/user/update-password')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				'currentPassword': testUtils.testPasswordText,
				'newPassword': newPassword,
			}).end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);

				appDataSource.getRepository(User).findOneBy({
					userId: testUser.userId!
				}).then((user: User | null) => {
					if (!user) {
						throw new Error('Unable to find user');
					}

					validatePassword(newPassword, user.passwordHash).then(result => {
						expect(result).to.be.true;
						done();
					});
				});
			});
	});
});
