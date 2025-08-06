import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as chaiAsPromised from 'chai-as-promised';
import { Session, User, Webring } from '../../model';
import { sessionService, testUtils, userService } from '../../app';
import { app } from '../../index';

chai.use(chaiAsPromised);
chai.use(chaiHttp);

describe('Webring Detail View', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUser2: User;
	let testUser3: User;
	let testUserSession: Session;
	let testUser2Session: Session;
	let testWebring: Webring;
	let testWebring2: Webring;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testUser2 = await testUtils.insertTestUser();
		testUser3 = await testUtils.insertTestUser();
		testUserSession = await sessionService.createSession(testUser);
		testUser2Session = await sessionService.createSession(testUser2);
		testWebring = await testUtils.insertTestWebring(testUser.userId!, {
			private: true,
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


	it('should return a 404 status when the webring is private, and the user is not authneticated',
		function(done)
	{
		chai.request(app)
			.get(`/webring/${testWebring.url}`)
			.send()
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(404);
				done();
			});
	});


	it('should return a 200 status when the webring is private, and the user is the owner',
		function(done)
	{
		chai.request(app)
			.get(`/webring/${testWebring.url}`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send()
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				done();
			});
	});


	it('should return a 200 status when the webring is private, and the user is a moderator',
		function(done)
	{
		chai.request(app)
			.get(`/webring/${testWebring.url}`)
			.set('Cookie', `session=${testUser2Session.sessionId}`)
			.send()
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				done();
			});
	});


	it('should unconditionally render a non-private webring', function(done) {
		chai.request(app)
			.get(`/webring/${testWebring2.url}`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send()
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);
				done();
			});
	});
});
