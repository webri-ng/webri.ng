import * as crypto from 'crypto';
import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { User } from '../../../../model';
import { userService, testUtils } from '../../..';
import { createResetPasswordEmailContent } from './createResetPaswordEmailContent';

chai.use(chaiAsPromised);

describe('Create reset password email content', function ()
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
		await userService.deleteUser(testUser.userId!);
	});


	it('should create the content for a user\'s reset password email', async function ()
	{
		const temporaryPassword = 'aaaa1234';
		const emailContent = await createResetPasswordEmailContent(testUser, temporaryPassword);
		const contentHash = crypto.createHash('md5').update(emailContent).digest('hex');

		expect(contentHash).to.equal('d35e136bcf2080f912e25a3d5743332d');
	});
});
