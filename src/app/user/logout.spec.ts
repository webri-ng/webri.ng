import { before, beforeEach, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { User, Session } from '../../model';
import { userService, testUtils, sessionService } from '..';
import { logout } from './logout';
import { appDataSource } from '../../infra/database';

describe('User logout', function () {
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUserSession: Session;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
	});

	beforeEach(async function () {
		testUserSession = await sessionService.createSession(testUser);
	});

	after(async function tearDown() {
		await userService.deleteUser(testUser.userId!);
	});

	it('should successfully invalidate an active session', async function () {
		await logout(testUserSession);

		testUserSession = await appDataSource
			.getRepository(Session)
			.findOneByOrFail({
				sessionId: testUserSession.sessionId
			});

		expect(testUserSession.isInvalidated()).to.be.true;
	});

	it('should not throw when attempting to logout an already inactive session', async function () {
		await logout(testUserSession);

		testUserSession = await appDataSource
			.getRepository(Session)
			.findOneByOrFail({
				sessionId: testUserSession.sessionId
			});

		await expect(logout(testUserSession)).to.not.be.rejected;
	});
});
