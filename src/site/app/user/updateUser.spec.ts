import * as dayjs from 'dayjs';
import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { User } from '../../model';
import { userService, testUtils } from '../';
import { createRandomEmailAddress, createRandomUsername } from '../testUtils';
import { EmailNotUniqueError, InvalidEmailError, InvalidIdentifierError,
	InvalidUsernameError, UsernameNotUniqueError, UserNotFoundError } from '../error';
import { userConfig } from '../../config';
import { updateUser } from './updateUser';

chai.use(chaiAsPromised);

describe('Update user', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testExistingUser: User;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testExistingUser = await testUtils.insertTestUser();
	});


	after(async function tearDown()
	{
		await userService.deleteUser(testUser.userId!);
		await userService.deleteUser(testExistingUser.userId!);
	});


	it('should throw an exception when passed no userId', async function ()
	{
		const email = createRandomEmailAddress();
		const username = createRandomUsername();

		return expect(updateUser('', username, email)).to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should throw an exception when passed an invalid userId', async function ()
	{
		const email = createRandomEmailAddress();
		const username = createRandomUsername();

		return expect(updateUser(testUtils.invalidUuid, username, email))
			.to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should throw an exception when passed a nonexistent userId', async function ()
	{
		const email = createRandomEmailAddress();
		const username = createRandomUsername();

		return expect(updateUser(testUtils.dummyUuid, username, email))
			.to.be.rejectedWith(UserNotFoundError);
	});


	it('should throw an exception when passed a non-unique email', async function ()
	{
		const email = testExistingUser?.email || '';
		const username = createRandomUsername();

		return expect(updateUser(testUser.userId!, username, email))
			.to.be.rejectedWith(EmailNotUniqueError);
	});


	it('should throw an exception when passed a non-unique username', async function ()
	{
		const email = createRandomEmailAddress();
		const username = testExistingUser?.username || '';

		return expect(updateUser(testUser.userId!, username, email))
			.to.be.rejectedWith(UsernameNotUniqueError);
	});


	it('should throw an exception when passed an invalid email', async function ()
	{
		const email = '';
		const username = testExistingUser?.username || '';

		return expect(updateUser(testUser.userId!, username, email))
			.to.be.rejectedWith(InvalidEmailError);
	});


	it('should throw an exception when passed an invalid username that is too short',
		async function ()
	{
		const email = createRandomEmailAddress();
		const username = Array(userConfig.usernameRequirements.minLength - 1)
			.fill('n').join('');

		return expect(updateUser(testUser.userId!, username, email))
			.to.be.rejectedWith(InvalidUsernameError);
	});


	it('should throw an exception when passed an invalid username that is too long',
		async function ()
	{
		const email = createRandomEmailAddress();
		const username = Array(userConfig.usernameRequirements.maxLength + 1)
			.fill('n').join('');

		return expect(updateUser(testUser.userId!, username, email))
			.to.be.rejectedWith(InvalidUsernameError);
	});


	it('should correctly update a customer', async function ()
	{
		const email = createRandomEmailAddress();
		const username = createRandomUsername();

		testUser = await updateUser(testUser.userId!, username, email);
		if (!testUser) {
			throw new Error('User update failed');
		}

		expect(testUser).to.not.be.null;
		expect(testUser.email).to.equal(User.normaliseEmailAddress(email));
		expect(testUser.username).to.equal(User.normaliseUsername(username));
		expect(dayjs(testUser.dateCreated).isSame(testUser.dateCreated)).to.be.true;
		expect(dayjs(testUser.dateModified).isSame(new Date(), 'minute')).to.be.true;
		expect(testUser.dateDeleted).to.be.null;
	});


	it('should correctly update a customer without changing the email', async function ()
	{
		const email = testUser.email;
		const username = createRandomUsername();

		testUser = await updateUser(testUser.userId!, username, email);
		if (!testUser) {
			throw new Error('User update failed');
		}

		expect(testUser).to.not.be.null;
		expect(testUser.email).to.equal(User.normaliseEmailAddress(email));
		expect(testUser.username).to.equal(User.normaliseUsername(username));
		expect(dayjs(testUser.dateCreated).isSame(testUser.dateCreated)).to.be.true;
		expect(dayjs(testUser.dateModified).isSame(new Date(), 'minute')).to.be.true;
		expect(testUser.dateDeleted).to.be.null;
	});


	it('should correctly update a customer without changing the username', async function ()
	{
		const email = createRandomEmailAddress();
		const username = testUser.username;

		testUser = await updateUser(testUser.userId!, username, email);
		if (!testUser) {
			throw new Error('User update failed');
		}

		expect(testUser).to.not.be.null;
		expect(testUser.email).to.equal(User.normaliseEmailAddress(email));
		expect(testUser.username).to.equal(User.normaliseUsername(username));
		expect(dayjs(testUser.dateCreated).isSame(testUser.dateCreated)).to.be.true;
		expect(dayjs(testUser.dateModified).isSame(new Date(), 'minute')).to.be.true;
		expect(testUser.dateDeleted).to.be.null;
	});
});
