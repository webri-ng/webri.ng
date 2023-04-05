import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as chaiAsPromised from 'chai-as-promised';
import { Session, User, Webring } from '../../model';
import { createRandomString, sessionService, testUtils, userService } from '../../app';
import { app } from '../../index';
import { requestAuthenticationFailedError, requestAuthorisationFailedError,
	webringNotFoundError } from '../api-error-response';
import { appDataSource } from '../../infra/database';

chai.use(chaiAsPromised);
chai.use(chaiHttp);

describe('Update Webring API', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUser2: User;
	let testUser3: User;
	let testUserSession: Session;
	let testUser2Session: Session;
	let testUser3Session: Session;
	let testWebring: Webring;
	let testWebring2: Webring;

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
		testWebring2 = await testUtils.insertTestWebring(testUser.userId!);
	});


	after(async function afterTesting()
	{
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser.userId!);
		testUser2 = await userService.deleteUser(testUser2.userId!);
		testUser3 = await userService.deleteUser(testUser3.userId!);
	});


	it('should reject an unauthenticated request', function(done) {
		chai.request(app)
			.patch(`/webring/${testWebring.url}`)
			.send({
				name: createRandomString(),
				url: testUtils.createRandomWebringUrl(),
				description: createRandomString(),
				privateRing: false,
				tags: ['one', 'two', 'three']
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


	it('should reject a request with an unknown URL', function(done) {
		chai.request(app)
			.patch(`/webring/nonexistenturl`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name: createRandomString(),
				url: testUtils.createRandomWebringUrl(),
				description: createRandomString(),
				privateRing: false,
				tags: ['one', 'two', 'three']
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


	it('should reject an unauthorised request', function(done) {
		chai.request(app)
			.patch(`/webring/${testWebring.url}`)
			.set('Cookie', `session=${testUser3Session.sessionId}`)
			.send({
				name: createRandomString(),
				url: testUtils.createRandomWebringUrl(),
				description: createRandomString(),
				privateRing: false,
				tags: ['one', 'two', 'three']
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


	it("should not reject a request by a webring's moderator", function(done) {
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();
		const description = createRandomString();

		chai.request(app)
			.patch(`/webring/${testWebring.url}`)
			.set('Cookie', `session=${testUser2Session.sessionId}`)
			.send({
				name,
				url,
				description,
				privateRing: false,
				tags: ['one', 'two', 'three']
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);

				appDataSource.getRepository(Webring).findOneBy({
					ringId: testWebring.ringId!
				}).then(webring => {
					expect(webring?.name).to.equal(name);
					expect(webring?.url).to.equal(url);
					expect(webring?.description).to.equal(description);
					done();
				});
			});
	});


	it('should successfully update a webring', function(done) {
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();
		const description = createRandomString();

		chai.request(app)
			.patch(`/webring/${testWebring2.url}`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url,
				description,
				privateRing: false,
				tags: ['one', 'two', 'three']
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);

				appDataSource.getRepository(Webring).findOneBy({
					ringId: testWebring2.ringId!
				}).then(webring => {
					expect(webring?.name).to.equal(name);
					expect(webring?.url).to.equal(url);
					expect(webring?.description).to.equal(description);
					done();
				});
			});
	});
});
