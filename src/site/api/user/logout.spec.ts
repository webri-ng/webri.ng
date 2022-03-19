import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { app } from '../..';
import { Session, User } from '../../model';
import { userService, testUtils, sessionService } from '../../app';

chai.use(chaiHttp);

describe('Logout API', function()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUserSession: Session;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
		testUserSession = await sessionService.createSession(testUser);
	});


	after(async function tearDown() {
		await userService.deleteUser(testUser.userId!);
	});


	it('should remove the session cookie', function (done) {
		chai.request(app)
			.get('/user/logout')
			.redirects(0)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.cookie('session', '');
				expect(res).to.have.status(302);
				done();
			});
	});
});
