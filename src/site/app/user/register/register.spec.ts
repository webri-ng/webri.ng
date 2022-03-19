import * as dayjs from 'dayjs';
import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { register } from './register';
import { User } from '../../../model';
import { userService, testUtils } from '../../';
import { createRandomEmailAddress, createRandomUsername,
	testPasswordText } from '../../testUtils';
import { EmailNotUniqueError, InvalidEmailError, InvalidPasswordError,
	InvalidUsernameError, UsernameNotUniqueError } from '../../error';
import { userConfig } from '../../../config';
import { validatePassword } from '../password';

chai.use(chaiAsPromised);

describe('User registration', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testExistingUser: User;

	before(async function beforeTesting()
	{
		testExistingUser = await testUtils.insertTestUser();
	});


	after(async function tearDown()
	{
		await userService.deleteUser(testUser.userId!);
		await userService.deleteUser(testExistingUser.userId!);
	});


	it('should throw an exception when passed a non-unique email', async function ()
	{
		return expect(register(createRandomUsername(),
			testExistingUser?.email || '', 'password')).to.be.rejectedWith(EmailNotUniqueError);
	});


	it('should throw an exception when passed a non-unique username', async function ()
	{
		return expect(register(testExistingUser?.username || '',
			createRandomEmailAddress(), 'password')).to.be.rejectedWith(UsernameNotUniqueError);
	});


	it('should throw an exception when passed an invalid email', async function ()
	{
		return expect(register(createRandomUsername(),
			'', 'password')).to.be.rejectedWith(InvalidEmailError);
	});


	it('should throw an exception when passed an invalid username that is too short',
		async function ()
	{
		const email = createRandomEmailAddress();
		const username = Array(userConfig.usernameRequirements.minLength - 1)
			.fill('n').join('');

		return expect(register(username, email,
			'password')).to.be.rejectedWith(InvalidUsernameError);
	});


	it('should throw an exception when passed an invalid username that is too long',
		async function ()
	{
		const longUsername = Array(userConfig.usernameRequirements.maxLength + 1)
			.fill('n').join('');
		return expect(register(longUsername, createRandomEmailAddress(),
			'password')).to.be.rejectedWith(InvalidUsernameError);
	});

	it('should throw an exception when passed a password that is too short',
		async function ()
	{
		const shortPassword = Array(userConfig.password.minLength - 1)
			.fill('n').join('');

		return expect(register(createRandomUsername(), createRandomEmailAddress(),
			shortPassword)).to.be.rejectedWith(InvalidPasswordError);
	});


	it('should throw an exception when passed a password that is too long', async function ()
	{
		const longPassword = Array(userConfig.password.maxLength + 1)
			.fill('n').join('');
		return expect(register(createRandomUsername(), createRandomEmailAddress(),
			longPassword)).to.be.rejectedWith(InvalidPasswordError);
	});

	it('should correctly register a new customer', async function ()
	{
		const email = createRandomEmailAddress();
		const username = createRandomUsername();

		testUser = await register(username, email, testPasswordText);
		if (!testUser) {
			throw new Error('User registration failed');
		}

		expect(testUser).to.not.be.null;
		expect(testUser.email).to.equal(User.normaliseEmailAddress(email));
		expect(testUser.username).to.equal(User.normaliseUsername(username));
		expect(dayjs(testUser.dateCreated).isSame(new Date(), 'hour')).to.be.true;
		expect(dayjs(testUser.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(dayjs(testUser.passwordSetTime).isSame(new Date(), 'hour')).to.be.true;
		expect(dayjs(testUser.passwordExpiryTime)
			.isSame(User.getPasswordExpiryDate(testUser.dateCreated))).to.be.true;
		expect(testUser.dateDeleted).to.be.null;

		const passwordValidity = await validatePassword(testPasswordText, testUser.passwordHash);
		expect(passwordValidity).to.be.true;
	});
});
