import * as dayjs from 'dayjs';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as chaiAsPromised from 'chai-as-promised';
import { Session, User, Webring } from '../../model';
import { sessionService, testUtils, userService } from '../../app';
import { appDataSource } from '../../infra/database';
import { app } from '../../index';
import { requestAuthenticationFailedError,
	requestAuthorisationFailedError,
	webringNotFoundError } from '../api-error-response';

chai.use(chaiAsPromised);
chai.use(chaiHttp);

describe('Delete Webring API', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUser2: User;
	let testUser3: User;
	let testUserSession: Session;
	let testUser2Session: Session;
	let testUser3Session: Session;
	let testWebring: Webring;

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
			.delete(`/webring/${testWebring.url}`)
			.send()
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(requestAuthenticationFailedError.httpStatus);
				expect(res.body).to.have.property('code', requestAuthenticationFailedError.code);
				expect(res.body).to.have.property('error', requestAuthenticationFailedError.message);

				done();
			});
	});


	it('should reject a request with an unknown URL', function(done) {
		chai.request(app)
			.delete(`/webring/nonexistenturl`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send()
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(webringNotFoundError.httpStatus);
				expect(res.body).to.have.property('code', webringNotFoundError.code);
				expect(res.body).to.have.property('error', webringNotFoundError.message);
				done();
			});
	});


	it('should reject an unauthorised request', function(done) {
		chai.request(app)
			.delete(`/webring/${testWebring.url}`)
			.set('Cookie', `session=${testUser3Session.sessionId}`)
			.send()
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(requestAuthorisationFailedError.httpStatus);
				expect(res.body).to.have.property('code', requestAuthorisationFailedError.code);
				expect(res.body).to.have.property('error', requestAuthorisationFailedError.message);
				done();
			});
	});


	it("should reject a request by a webring's moderator", function(done) {
		chai.request(app)
			.delete(`/webring/${testWebring.url}`)
			.set('Cookie', `session=${testUser2Session.sessionId}`)
			.send()
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(requestAuthorisationFailedError.httpStatus);
				expect(res.body).to.have.property('code', requestAuthorisationFailedError.code);
				expect(res.body).to.have.property('error', requestAuthorisationFailedError.message);
				done();
			});
	});


	it('should successfully delete a webring', function(done) {
		chai.request(app)
			.delete(`/webring/${testWebring.url}`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send()
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);

				appDataSource.getRepository(Webring).findOneBy({
					ringId: testWebring.ringId!
				}).then((webring: Webring | null) => {
					expect(webring?.dateDeleted).to.not.be.null;
					expect(dayjs(webring?.dateDeleted).isSame(dayjs(), 'minute')).to.be.true;
					done();
				});
			});
	});
});
