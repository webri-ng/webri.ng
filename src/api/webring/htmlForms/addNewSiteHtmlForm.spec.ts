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
	invalidSiteNameTooLongError,
	invalidSiteNameTooShortError,
	notAuthorisedErrorMessage,
	requestAuthenticationFailedError,
	requestAuthorisationFailedError,
	requestValidationError,
	unhandledExceptionError
} from '../../api-error-response';
import { siteConfig } from '../../../config';
import { getResponseViewErrorMessage } from '../../../app/testUtils';

chai.use(chaiAsPromised);
chai.use(chaiHttp);

describe('Add new site HTML form API', function () {
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUser2: User;
	let testUser3: User;
	let testUserSession: Session;
	let testUser2Session: Session;
	let testUser3Session: Session;
	let testWebring: Webring;

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
	});

	after(async function afterTesting() {
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser.userId!);
		testUser2 = await userService.deleteUser(testUser2.userId!);
		testUser3 = await userService.deleteUser(testUser3.userId!);
	});

	it('should reject a bad request body', function (done) {
		chai
			.request(app)
			.post(`/webring/${testWebring.url}/add/form`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name: createRandomString(),
				uuuu: testUtils.createRandomSiteUrl()
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

	it('should reject a request with an unknown URL', function (done) {
		chai
			.request(app)
			.post(`/webring/nonexistenturl/add/form`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name: createRandomString(),
				url: testUtils.createRandomSiteUrl(),
				webringUrl: 'nonexistenturl'
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(unhandledExceptionError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text)?.startsWith(
						'An unhandled server error has occurred.'
					)
				).to.be.true;

				done();
			});
	});

	it('should reject an unauthenticated request', function (done) {
		chai
			.request(app)
			.post(`/webring/${testWebring.url}/add/form`)
			.send({
				name: createRandomString(),
				url: testUtils.createRandomSiteUrl(),
				webringUrl: testWebring.url
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

	it('should reject an unauthorised request', function (done) {
		chai
			.request(app)
			.post(`/webring/${testWebring.url}/add/form`)
			.set('Cookie', `session=${testUser3Session.sessionId}`)
			.send({
				name: createRandomString(),
				url: testUtils.createRandomSiteUrl(),
				webringUrl: testWebring.url
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(requestAuthorisationFailedError.httpStatus);
				expect(getResponseViewErrorMessage(res.text)).to.equal(
					requestAuthorisationFailedError.message
				);

				done();
			});
	});

	it('should reject an a request with a name that is too short', function (done) {
		const name = Array(siteConfig.nameRequirements.minLength - 1)
			.fill('n')
			.join('');
		const url = testUtils.createRandomSiteUrl();

		chai
			.request(app)
			.post(`/webring/${testWebring.url}/add/form`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url,
				webringUrl: testWebring.url
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidSiteNameTooShortError.httpStatus);
				expect(getResponseViewErrorMessage(res.text)).to.equal(
					invalidSiteNameTooShortError.message
				);

				done();
			});
	});

	it('should reject an a request with a name that is too long', function (done) {
		const name = Array(siteConfig.nameRequirements.maxLength + 1)
			.fill('n')
			.join('');
		const url = testUtils.createRandomWebringUrl();

		chai
			.request(app)
			.post(`/webring/${testWebring.url}/add/form`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url,
				webringUrl: testWebring.url
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidSiteNameTooLongError.httpStatus);
				expect(getResponseViewErrorMessage(res.text)).to.equal(
					invalidSiteNameTooLongError.message
				);

				done();
			});
	});

	it('should successfully add a site to a webring', function (done) {
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();

		chai
			.request(app)
			.post(`/webring/${testWebring.url}/add/form`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url,
				webringUrl: testWebring.url
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				done();
			});
	});

	it(`should let a webring's moderator add a site to a webring`, function (done) {
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();

		chai
			.request(app)
			.post(`/webring/${testWebring.url}/add/form`)
			.set('Cookie', `session=${testUser2Session.sessionId}`)
			.send({
				name,
				url,
				webringUrl: testWebring.url
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				done();
			});
	});
});
