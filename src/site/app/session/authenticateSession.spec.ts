import * as dayjs from 'dayjs';
import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { appDataSource } from '../../infra/database';
import { Session, User } from '../../model';
import { userService, testUtils } from '../';
import { createSession } from './createSession';
import { authenticateSession } from '.';
import { InvalidSessionError, SessionExpiredError, SessionNotFoundError } from '../error';


describe('Authenticate User Session', function()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let userSession: Session;
	let expiredSession: Session;
	const expiryDate = new Date();
	let invalidatedSession: Session;
	let deletedSession: Session;

	before(async function beforeTesting() {
		const sessionRepository = await appDataSource.getRepository(Session);
		testUser = await testUtils.insertTestUser();
		userSession = await createSession(testUser);

		expiredSession = await createSession(testUser);
		expiredSession.dateCreated = dayjs(expiryDate).subtract(2, 'days').toDate();
		expiredSession.expiryDate = new Date();
		await sessionRepository.save(expiredSession);

		invalidatedSession = await createSession(testUser);
		invalidatedSession.dateEnded = new Date();
		await sessionRepository.save(invalidatedSession);

		deletedSession = await createSession(testUser);
		deletedSession.dateDeleted = new Date();
		await sessionRepository.save(deletedSession);
	});


	after(async function tearDown() {
		await userService.deleteUser(testUser.userId!);
	});


	it('should throw an exception when passed an invalid session id', async function ()
	{
		return expect(authenticateSession(testUtils.invalidUuid))
			.to.be.rejectedWith(SessionNotFoundError);
	});


	it('should throw an exception when passed a deleted session id', async function ()
	{
		return expect(authenticateSession(deletedSession.sessionId!))
			.to.be.rejectedWith(SessionNotFoundError);
	});


	it('should throw an exception when passed a non-existent session', async function ()
	{
		return expect(authenticateSession(testUtils.dummyUuid))
			.to.be.rejectedWith(SessionNotFoundError);
	});


	it('should throw an exception when authenticating an expired session', async function ()
	{
		return expect(authenticateSession(expiredSession.sessionId!))
			.to.be.rejectedWith(SessionExpiredError);
	});


	it('should throw an exception when authenticating an invalidated session', async function ()
	{
		return expect(authenticateSession(invalidatedSession.sessionId!))
			.to.be.rejectedWith(InvalidSessionError);
	});


	it('should correctly authenticate a valid session', async function ()
	{
		const validSession = await authenticateSession(userSession.sessionId!);
		expect(validSession.sessionId).to.equal(userSession.sessionId);
	});


	it('should correctly authenticate a session as of an arbitrary date', async function ()
	{
		const validSession = await authenticateSession(expiredSession.sessionId!,
			dayjs(expiryDate).subtract(1, 'hour').toDate());
		expect(validSession.sessionId).to.equal(expiredSession.sessionId);
	});


	it('should raise an exception when an arbitrary authentication date is before the ' +
		'creation of the session', async function ()
	{
		return expect(authenticateSession(invalidatedSession.sessionId!,
			dayjs(invalidatedSession.dateCreated).subtract(1, 'hour').toDate()))
			.to.be.rejectedWith(SessionExpiredError);
	});
});
