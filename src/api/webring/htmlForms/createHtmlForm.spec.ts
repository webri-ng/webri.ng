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
	requestAuthenticationFailedError,
	requestValidationError
} from '../../api-error-response';
import { JSDOM } from 'jsdom';
import { webringConfig } from '../../../config';

chai.use(chaiAsPromised);
chai.use(chaiHttp);

describe('Create Webring HTML Form', function () {
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUserSession: Session;
	let testWebring: Webring;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
		testUserSession = await sessionService.createSession(testUser);
		testWebring = await testUtils.insertTestWebring(testUser.userId!);
	});

	after(async function afterTesting() {
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser.userId!);
	});

	it('should reject an invalid request', function (done) {
		chai
			.request(app)
			.post('/webring/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name: createRandomString(),
				url: testUtils.createRandomSiteUrl(),
				description: 'Test Description',
				fffff: 1234
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
			.post('/webring/form')
			.send({
				name: createRandomString(),
				url: testUtils.createRandomSiteUrl(),
				description: 'Test Description'
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

	it('should reject an a request with a non-unique webring URL', function (done) {
		chai
			.request(app)
			.post('/webring/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name: createRandomString(),
				url: testWebring.url,
				description: 'Test Description'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidRingUrlNotUniqueError.httpStatus);

				const dom = new JSDOM(res.text);
				const errorMessageElement =
					dom.window.document.getElementById('error-message');
				expect(errorMessageElement?.innerHTML).to.equal(
					invalidRingUrlNotUniqueError.message
				);

				done();
			});
	});

	it('should reject an a request with a name that is too short', function (done) {
		const name = Array(webringConfig.nameRequirements.minLength - 1)
			.fill('n')
			.join('');
		const url = testUtils.createRandomWebringUrl();

		chai
			.request(app)
			.post('/webring/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url,
				description: 'Test Description'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidRingNameTooShortError.httpStatus);

				const dom = new JSDOM(res.text);
				const errorMessageElement =
					dom.window.document.getElementById('error-message');
				expect(errorMessageElement?.innerHTML).to.equal(
					invalidRingNameTooShortError.message
				);

				done();
			});
	});

	it('should reject an a request with a name that is too long', function (done) {
		const name = Array(webringConfig.nameRequirements.maxLength + 1)
			.fill('n')
			.join('');
		const url = testUtils.createRandomWebringUrl();

		chai
			.request(app)
			.post('/webring/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url,
				description: 'Test Description'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidRingNameTooLongError.httpStatus);

				const dom = new JSDOM(res.text);
				const errorMessageElement =
					dom.window.document.getElementById('error-message');
				expect(errorMessageElement?.innerHTML).to.equal(
					invalidRingNameTooLongError.message
				);

				done();
			});
	});

	it('should reject an a request with a URL that is too short', function (done) {
		const name = createRandomString();
		const url = Array(webringConfig.urlRequirements.minLength - 1)
			.fill('n')
			.join('');

		chai
			.request(app)
			.post('/webring/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url,
				description: 'Test Description'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidRingUrlTooShortError.httpStatus);

				const dom = new JSDOM(res.text);
				const errorMessageElement =
					dom.window.document.getElementById('error-message');
				expect(errorMessageElement?.innerHTML).to.equal(
					invalidRingUrlTooShortError.message
				);

				done();
			});
	});

	it('should reject an a request with a URL that is too long', function (done) {
		const name = createRandomString();
		const url = Array(webringConfig.urlRequirements.maxLength + 1)
			.fill('n')
			.join('');

		chai
			.request(app)
			.post('/webring/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url,
				description: 'Test Description'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidRingUrlTooLongError.httpStatus);

				const dom = new JSDOM(res.text);
				const errorMessageElement =
					dom.window.document.getElementById('error-message');
				expect(errorMessageElement?.innerHTML).to.equal(
					invalidRingUrlTooLongError.message
				);

				done();
			});
	});

	it('should successfully create a webring', function (done) {
		const newWebringUrl = testUtils.createRandomWebringUrl();

		chai
			.request(app)
			.post('/webring/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name: createRandomString(),
				url: newWebringUrl,
				description: 'Test Description'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				done();
			});
	});
});
