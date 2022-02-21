import dayjs = require('dayjs');
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as chaiAsPromised from 'chai-as-promised';
import { Session, User, Webring } from '../../model';
import { createRandomString, sessionService, testUtils, userService } from '../../app';
import { app } from '../../index';
import { invalidRingNameTooLongError, invalidRingNameTooShortError,
	invalidRingUrlNotUniqueError, invalidRingUrlTooLongError, invalidRingUrlTooShortError,
	requestAuthenticationFailedError, tooManyTagsError } from '../api-error-response';
import { webringConfig } from '../../config';

chai.use(chaiAsPromised);
chai.use(chaiHttp);

describe('Create Webring API', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUserSession: Session;
	let testWebring: Webring;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testUserSession = await sessionService.createSession(testUser);
		testWebring = await testUtils.insertTestWebring(testUser?.userId || '');
	});


	after(async function afterTesting()
	{
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser?.userId || '');
	});


	it('should reject an unauthenticated request', function(done) {
		chai.request(app)
			.post(`/webring/`)
			.send({
				name: createRandomString(),
				url: testUtils.createRandomSiteUrl(),
				description: 'Test Description',
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


	it('should reject an a request with a non-unique webring URL', function(done) {
		chai.request(app)
			.post(`/webring/`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name: createRandomString(),
				url: testWebring.url,
				description: 'Test Description',
				privateRing: false,
				tags: ['one', 'two', 'three']
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidRingUrlNotUniqueError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(invalidRingUrlNotUniqueError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(invalidRingUrlNotUniqueError.message);

				done();
			});
	});


	it('should reject an a request with a name that is too short', function(done) {
		const name = Array(webringConfig.nameRequirements.minLength - 1).fill('n').join('');
		const url = testUtils.createRandomWebringUrl();

		chai.request(app)
			.post(`/webring/`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url,
				description: 'Test Description',
				privateRing: false,
				tags: ['one', 'two', 'three']
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidRingNameTooShortError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(invalidRingNameTooShortError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(invalidRingNameTooShortError.message);

				done();
			});
	});


	it('should reject an a request with a name that is too long', function(done) {
		const name = Array(webringConfig.nameRequirements.maxLength + 1).fill('n').join('');
		const url = testUtils.createRandomWebringUrl();

		chai.request(app)
			.post(`/webring/`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url,
				description: 'Test Description',
				privateRing: false,
				tags: ['one', 'two', 'three']
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidRingNameTooLongError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(invalidRingNameTooLongError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(invalidRingNameTooLongError.message);

				done();
			});
	});


	it('should reject an a request with a URL that is too short', function(done) {
		const name = createRandomString();
		const url = Array(webringConfig.urlRequirements.minLength - 1).fill('n').join('');

		chai.request(app)
			.post(`/webring/`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url,
				description: 'Test Description',
				privateRing: false,
				tags: ['one', 'two', 'three']
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidRingUrlTooShortError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(invalidRingUrlTooShortError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(invalidRingUrlTooShortError.message);

				done();
			});
	});


	it('should reject an a request with a URL that is too long', function(done) {
		const name = createRandomString();
		const url = Array(webringConfig.urlRequirements.maxLength + 1).fill('n').join('');

		chai.request(app)
			.post(`/webring/`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url,
				description: 'Test Description',
				privateRing: false,
				tags: ['one', 'two', 'three']
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(invalidRingUrlTooLongError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(invalidRingUrlTooLongError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(invalidRingUrlTooLongError.message);

				done();
			});
	});


	it('should reject an a request with too many tags', function(done) {
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();
		const tags = Array(webringConfig.maxTagCount + 1).fill('').map(() => createRandomString());

		chai.request(app)
			.post(`/webring/`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name,
				url,
				description: 'Test Description',
				privateRing: false,
				tags
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(tooManyTagsError.httpStatus);
				expect(res.body).to.have.property('code');
				expect(res.body.code).to.equal(tooManyTagsError.code);
				expect(res.body).to.have.property('error');
				expect(res.body.error).to.equal(tooManyTagsError.message);

				done();
			});
	});


	it('should successfully create a webring', function(done) {
		chai.request(app)
			.post(`/webring/`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send({
				name: createRandomString(),
				url: testUtils.createRandomWebringUrl(),
				description: 'Test Description',
				privateRing: false,
				tags: ['one', 'two', 'three']
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				done();
			});
	});
});
