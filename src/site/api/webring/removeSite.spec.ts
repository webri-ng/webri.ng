import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as chaiAsPromised from 'chai-as-promised';
import { Session, Site, User, Webring } from '../../model';
import { createRandomString, sessionService, testUtils, userService } from '../../app';
import { app } from '../../index';
import { invalidSiteNameTooLongError, invalidSiteNameTooShortError,
	requestAuthenticationFailedError, requestAuthorisationFailedError,
	requestValidationError,
	siteNotFoundError,
	webringNotFoundError} from '../api-error-response';
import { siteConfig } from '../../config';
import { createRandomSiteUrl } from '../../app/testUtils';

chai.use(chaiAsPromised);
chai.use(chaiHttp);

describe('Remove site API', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUser2: User;
	let testUser3: User;
	let testUserSession: Session;
	let testUser2Session: Session;
	let testUser3Session: Session;
	let testWebring: Webring;
	let testSite: Site;
	let testSite2: Site;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testUser2 = await testUtils.insertTestUser();
		testUser3 = await testUtils.insertTestUser();
		testUserSession = await sessionService.createSession(testUser);
		testUser2Session = await sessionService.createSession(testUser2);
		testUser3Session = await sessionService.createSession(testUser3);
		testWebring = await testUtils.insertTestWebring(testUser.userId!, {
			moderators: [testUser2]
		});
		testSite = await testUtils.insertTestSite(testWebring.ringId!, testUser.userId!);
		testSite2 = await testUtils.insertTestSite(testWebring.ringId!, testUser.userId!);
	});


	after(async function afterTesting()
	{
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser.userId!);
		testUser2 = await userService.deleteUser(testUser2.userId!);
		testUser3 = await userService.deleteUser(testUser3.userId!);
	});


	it('should reject a bad request body', function(done) {
		chai.request(app)
			.post(`/webring/${testWebring.url}/remove`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				uuuu: testSite.url
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(requestValidationError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(requestValidationError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(requestValidationError.message);

				done();
			});
	});


	it('should reject a request with an unknown webring URL', function(done) {
		chai.request(app)
			.post(`/webring/nonexistenturl/remove`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				url: testSite.url
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(webringNotFoundError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(webringNotFoundError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(webringNotFoundError.message);
				done();
			});
	});


	it('should reject a request with an unknown site URL', function(done) {
		const url = createRandomSiteUrl();

		chai.request(app)
			.post(`/webring/${testWebring.url}/remove`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				url
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(siteNotFoundError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(siteNotFoundError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(`Site with url '${url}' cannot be found in this webring`);
				done();
			});
	});


	it('should reject an unauthenticated request', function(done) {
		chai.request(app)
			.post(`/webring/${testWebring.url}/remove`)
			.send({
				url: testSite.url
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(requestAuthenticationFailedError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(requestAuthenticationFailedError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(requestAuthenticationFailedError.message);

				done();
			});
	});


	it('should reject an unauthorised request', function(done) {
		chai.request(app)
			.post(`/webring/${testWebring.url}/remove`)
			.set('Cookie', `session=${testUser3Session.sessionId}`)
			.send({
				url: testSite.url
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(requestAuthorisationFailedError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(requestAuthorisationFailedError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(requestAuthorisationFailedError.message);

				done();
			});
	});


	it('should successfully remove a site from a webring', function(done) {
		chai.request(app)
			.post(`/webring/${testWebring.url}/remove`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				url: testSite.url
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				expect(res.body).to.have.property('url');
				expect(res.body.url).to.equal(`/webring/${testWebring.url}`);
				done();
			});
	});


	it(`should let a webring's moderator add a site to a webring`, function(done) {
		chai.request(app)
			.post(`/webring/${testWebring.url}/remove`)
			.set('Cookie', `session=${testUser2Session.sessionId}`)
			.send({
				url: testSite2.url
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				expect(res.body).to.have.property('url');
				expect(res.body.url).to.equal(`/webring/${testWebring.url}`);
				done();
			});
	});
});
