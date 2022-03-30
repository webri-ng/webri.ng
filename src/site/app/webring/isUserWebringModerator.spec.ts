import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { User, Webring } from '../../model';
import { userService, testUtils } from '../';
import { isUserWebringModerator } from '.';

chai.use(chaiAsPromised);

describe('Is user webring moderator', function ()
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


	it('should return false when passed a user without rights to moderate the webring',
		async function ()
	{
		const result = await isUserWebringModerator(testWebring, testUser2);
		expect(result).to.be.false;
	});


	it('should return true when passed a user that created the webring', async function ()
	{
		const result = await isUserWebringModerator(testWebring, testUser);
		expect(result).to.be.true;
	});


	it('should return true when passed a user that is a moderator of the webring',
		async function ()
	{
		const result = await isUserWebringModerator(testWebring2, testUser);
		expect(result).to.be.true;
	});
});
