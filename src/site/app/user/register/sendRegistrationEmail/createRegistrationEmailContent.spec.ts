import * as crypto from 'crypto';
import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { User } from '../../../../model';
import { userService, testUtils } from '../../../';
import { createRegistrationEmailContent } from './createRegistrationEmailContent';

chai.use(chaiAsPromised);

describe('Customer registration', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser({
			username: 'test_registration_email_user'
		});
	});


	after(async function tearDown()
	{
		await userService.deleteUser(testUser?.userId || '');
	});


	it('should create the content for a user\'s registration email', async function ()
	{
		const emailContent = await createRegistrationEmailContent(testUser);
		const contentHash = crypto.createHash('md5').update(emailContent).digest('hex');

		expect(contentHash).to.equal('f62cfb074a901439964007ee7775714e');
	});
});
