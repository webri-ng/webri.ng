import * as dayjs from 'dayjs';
import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { Session, User } from '../../model';
import { EntityManager, getManager } from 'typeorm';
import { userService, testUtils } from '../';
import { createSession } from './createSession';


describe('Create User Session', function()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	const nonSerialisedUser: User = new User('test', 'test@example.org', 'passwordHash');

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
	});


	after(async function tearDown() {
		await userService.deleteUser(testUser?.userId || '');
	});


	it('should throw an exception when passed a non-serialised user', async function ()
	{
		return expect(createSession(nonSerialisedUser)).to.be.rejectedWith(Error);
	});


	it('should create a session for a user', async function ()
	{
		const newSession = await createSession(testUser);
		expect(newSession.sessionId).to.not.be.null;
		expect(newSession.userId).to.equal(testUser?.userId);
		expect(dayjs(newSession.dateCreated).isSame(dayjs(), 'hour')).to.be.true;
		expect(newSession.dateDeleted).to.be.null;
		expect(dayjs(newSession.expiryDate)
			.isSame(Session.getDefaultExpiryDate(newSession.dateCreated))).to.be.true;
	});


	it('should create a session for a user with an arbitrary expiry date', async function ()
	{
		const expiryDate = dayjs().add(2, 'months').toDate();

		const newSession = await createSession(testUser, {
			expiryDate: expiryDate
		});
		expect(newSession.sessionId).to.not.be.null;
		expect(newSession.userId).to.equal(testUser?.userId);
		expect(dayjs(newSession.dateCreated).isSame(dayjs(), 'hour')).to.be.true;
		expect(newSession.dateDeleted).to.be.null;
		expect(dayjs(newSession.expiryDate).isSame(expiryDate)).to.be.true;
	});


	it('should create a user session within a transaction', async function ()
	{
		await getManager().transaction(async (transactionalEntityManager: EntityManager) => {
			const newSession = await createSession(testUser, {
				transactionalEntityManager,
			});
			expect(newSession.sessionId).to.not.be.null;
			expect(newSession.userId).to.equal(testUser?.userId);
		});
	});
});
