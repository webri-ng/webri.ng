import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { User, Webring } from '../../model';
import { userService, testUtils } from '../';
import { RingActionNotAuthorisedError } from '../error';
import { authoriseWebringOwnerAction } from './authoriseWebringOwnerAction';

chai.use(chaiAsPromised);

describe('Authorise webring owner action', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUser2: User;
	let testWebring: Webring;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testUser2 = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser.userId!);
	});


	after(async function tearDown()
	{
		await userService.deleteUser(testUser.userId!);
		await userService.deleteUser(testUser2.userId!);
	});


	it('should raise an exception when passed a user that did not create the webring', function ()
	{
		return expect(() => {
			authoriseWebringOwnerAction(testWebring, testUser2);
		}).to.throw(RingActionNotAuthorisedError);
	});


	it('should not raise an exception when passed a user that created the webring', function ()
	{
		return expect(() => {
			authoriseWebringOwnerAction(testWebring, testUser);
		}).to.not.throw();
	});
});
