import * as dayjs from 'dayjs';
import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { User } from '../../model';
import { userService, testUtils } from '../';
import { InvalidIdentifierError, InvalidPasswordError,
	UserNotFoundError } from '../error';
import { userConfig } from '../../config';
import { validatePassword } from './password';
import { updatePassword } from '.';

chai.use(chaiAsPromised);

describe('Update user password', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
	});


	after(async function tearDown()
	{
		await userService.deleteUser(testUser?.userId || '');
	});


	it('should throw an exception when passed no userId', async function ()
	{
		const newPassword = testUtils.createRandomPassword();

		return expect(updatePassword('', newPassword))
			.to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should throw an exception when passed an invalid userId', async function ()
	{
		const newPassword = testUtils.createRandomPassword();

		return expect(updatePassword(testUtils.invalidUiid, newPassword))
			.to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should throw an exception when passed a nonexistent userId', async function ()
	{
		const newPassword = testUtils.createRandomPassword();

		return expect(updatePassword(testUtils.dummyUuid, newPassword))
			.to.be.rejectedWith(UserNotFoundError);
	});


	it('should throw an exception when passed a password that is too short',
		async function ()
	{
		const shortPassword = Array(userConfig.password.minLength - 1)
			.fill('n').join('');

		return expect(updatePassword(testUser?.userId || '',
			shortPassword)).to.be.rejectedWith(InvalidPasswordError);
	});


	it('should throw an exception when passed a password that is too long', async function ()
	{
		const longPassword = Array(userConfig.password.maxLength + 1)
			.fill('n').join('');

		return expect(updatePassword(testUser?.userId || '',
			longPassword)).to.be.rejectedWith(InvalidPasswordError);
	});


	it("should correctly update a customer's password", async function ()
	{
		const newPassword = testUtils.createRandomPassword();

		testUser = await updatePassword(testUser.userId || '', newPassword);

		expect(testUser).to.not.be.null;
		expect(dayjs(testUser.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(dayjs(testUser.passwordSetTime).isSame(new Date(), 'hour')).to.be.true;
		expect(dayjs(testUser.passwordExpiryTime)
			.isSame(User.getPasswordExpiryDate(new Date()), 'hour')).to.be.true;

		const passwordValidity = await validatePassword(newPassword, testUser.passwordHash);
		expect(passwordValidity).to.be.true;
	});
});
