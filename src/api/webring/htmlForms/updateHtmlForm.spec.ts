import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as chaiAsPromised from 'chai-as-promised';
import { Session, User, Webring } from '../../../model';
import {
	createRandomString,
	sessionService,
	testUtils,
	userService
} from '../../../app';
import { app } from '../../../index';
import {
	badRequestError,
	invalidRingNameTooLongError,
	invalidRingNameTooShortError,
	invalidRingUrlNotUniqueError,
	invalidRingUrlTooLongError,
	invalidRingUrlTooShortError,
	notAuthorisedErrorMessage,
	requestAuthenticationFailedError,
	requestAuthorisationFailedError,
	requestValidationError
} from '../../api-error-response';
import { webringConfig } from '../../../config';
import { getResponseViewErrorMessage } from '../../../app/testUtils';
import { getWebringByIdOrFail } from '../../../app/webring';

chai.use(chaiAsPromised);
chai.use(chaiHttp);

describe('Update Webring HTML Form', function () {
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUser2: User;
	let testUser3: User;
	let testUserSession: Session;
	let testUser2Session: Session;
	let testUser3Session: Session;
	let testWebring: Webring;
	let testWebring2: Webring;
	let testWebring3: Webring;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
		testUser2 = await testUtils.insertTestUser();
		testUser3 = await testUtils.insertTestUser();
		testUserSession = await sessionService.createSession(testUser);
		testUser2Session = await sessionService.createSession(testUser2);
		testUser3Session = await sessionService.createSession(testUser3);
		testWebring = await testUtils.insertTestWebring(testUser.userId!, {
			moderators: [testUser2]
		});
		testWebring2 = await testUtils.insertTestWebring(testUser.userId!);
		testWebring3 = await testUtils.insertTestWebring(testUser.userId!);
	});

	after(async function afterTesting() {
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser.userId!);
		testUser2 = await userService.deleteUser(testUser2.userId!);
		testUser3 = await userService.deleteUser(testUser3.userId!);
	});

	it('should reject an invalid request', function (done) {
		chai
			.request(app)
			.post(`/webring/${testWebring.url}/update/form`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name: createRandomString(),
				url: testUtils.createRandomWebringUrl(),
				description: 'Test Description',
				fffff: 1234
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(requestValidationError.httpStatus);
				expect(getResponseViewErrorMessage(res.text)).to.equal(
					badRequestError.message
				);

				done();
			});
	});

	it('should reject an unauthenticated request', function (done) {
		chai
			.request(app)
			.post(`/webring/${testWebring.url}/update/form`)
			.send({
				name: createRandomString(),
				url: testUtils.createRandomWebringUrl(),
				description: 'Test Description'
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

	it('should reject a request with an unknown webring URL', function (done) {
		chai
			.request(app)
			.post(`/webring/nonexistenturl/update/form`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name: createRandomString(),
				url: testUtils.createRandomWebringUrl(),
				description: 'Test Description'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(404);
				done();
			});
	});

	it('should reject an unauthorised request', function (done) {
		chai
			.request(app)
			.post(`/webring/${testWebring.url}/update/form`)
			.set('Cookie', `session=${testUser3Session.sessionId}`)
			.send({
				name: createRandomString(),
				url: testUtils.createRandomWebringUrl(),
				description: 'Test Description'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(requestAuthorisationFailedError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'update-webring-error-message')
				).to.equal(requestAuthorisationFailedError.message);

				done();
			});
	});

	it('should reject a request with a non-unique webring URL', function (done) {
		chai
			.request(app)
			.post(`/webring/${testWebring.url}/update/form`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name: createRandomString(),
				url: testWebring2.url,
				description: 'Test Description'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidRingUrlNotUniqueError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'update-webring-error-message')
				).to.equal(invalidRingUrlNotUniqueError.message);

				done();
			});
	});

	it('should reject a request with a name that is too short', function (done) {
		const name = Array(webringConfig.nameRequirements.minLength - 1)
			.fill('n')
			.join('');

		chai
			.request(app)
			.post(`/webring/${testWebring.url}/update/form`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url: testUtils.createRandomWebringUrl(),
				description: 'Test Description'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidRingNameTooShortError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'update-webring-error-message')
				).to.equal(invalidRingNameTooShortError.message);

				done();
			});
	});

	it('should reject a request with a name that is too long', function (done) {
		const name = Array(webringConfig.nameRequirements.maxLength + 1)
			.fill('n')
			.join('');

		chai
			.request(app)
			.post(`/webring/${testWebring.url}/update/form`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url: testUtils.createRandomWebringUrl(),
				description: 'Test Description'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidRingNameTooLongError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'update-webring-error-message')
				).to.equal(invalidRingNameTooLongError.message);

				done();
			});
	});

	it('should reject a request with a URL that is too short', function (done) {
		const url = Array(webringConfig.urlRequirements.minLength - 1)
			.fill('n')
			.join('');

		chai
			.request(app)
			.post(`/webring/${testWebring.url}/update/form`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name: createRandomString(),
				url,
				description: 'Test Description'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidRingUrlTooShortError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'update-webring-error-message')
				).to.equal(invalidRingUrlTooShortError.message);

				done();
			});
	});

	it('should reject a request with a URL that is too long', function (done) {
		const url = Array(webringConfig.urlRequirements.maxLength + 1)
			.fill('n')
			.join('');

		chai
			.request(app)
			.post(`/webring/${testWebring.url}/update/form`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name: createRandomString(),
				url,
				description: 'Test Description'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidRingUrlTooLongError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'update-webring-error-message')
				).to.equal(invalidRingUrlTooLongError.message);

				done();
			});
	});

	it("should let a webring's moderator update a webring", function (done) {
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();

		chai
			.request(app)
			.post(`/webring/${testWebring.url}/update/form`)
			.set('Cookie', `session=${testUser2Session.sessionId}`)
			.send({
				name,
				url,
				description: 'Test Description'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				done();
			});
	});

	it('should successfully update a webring', function (done) {
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();

		chai
			.request(app)
			.post(`/webring/${testWebring2.url}/update/form`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url,
				description: 'Test Description'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				done();
			});
	});

	it('should successfully update a webring to be private', function (done) {
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();

		chai
			.request(app)
			.post(`/webring/${testWebring3.url}/update/form`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url,
				description: 'Test Description',
				privateRing: 'on'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);

				getWebringByIdOrFail(testWebring3.ringId!).then((updatedWebring) => {
					expect(updatedWebring.name).to.equal(name);
					expect(updatedWebring.url).to.equal(url);
					expect(updatedWebring.description).to.equal('Test Description');
					expect(updatedWebring.private).to.be.true;
					done();
				});
			});
	});
});
