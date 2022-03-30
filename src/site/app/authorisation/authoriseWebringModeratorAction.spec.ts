import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { User, Webring } from '../../model';
import { userService, testUtils } from '../';
import { RingActionNotAuthorisedError } from '../error';
import { authoriseWebringModeratorAction } from './authoriseWebringModeratorAction';

chai.use(chaiAsPromised);

describe('Authorise webring moderator action', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUser2: User;
	let testWebring: Webring;
	let testWebring2: Webring;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testUser2 = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser.userId!);
		testWebring2 = await testUtils.insertTestWebring(testUser2.userId!, {
			moderators: [testUser]
		});
	});


	after(async function tearDown()
	{
		await userService.deleteUser(testUser.userId!);
		await userService.deleteUser(testUser2.userId!);
	});


	it('should raise an exception when passed an undefined user',
		async function ()
	{
		return expect(authoriseWebringModeratorAction(testWebring, undefined))
			.to.be.rejectedWith(RingActionNotAuthorisedError);
	});


	it('should raise an exception when passed a user without rights to moderate the webring',
		async function ()
	{
		return expect(authoriseWebringModeratorAction(testWebring, testUser2))
			.to.be.rejectedWith(RingActionNotAuthorisedError);
	});


	it('should not raise an exception when passed a user that created the webring', async function ()
	{
		return expect(authoriseWebringModeratorAction(testWebring, testUser)).to.not.be.rejected;
	});


	it('should not raise an exception when passed a user that is a moderator of the webring',
		async function ()
	{
		return expect(authoriseWebringModeratorAction(testWebring2, testUser)).to.not.be.rejected;
	});
});
