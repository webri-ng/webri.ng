import * as dayjs from 'dayjs';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { User } from '.';
import { testUtils } from '../app';
import { InvalidEmailError, InvalidUsernameError } from '../app/error';
import { userConfig } from '../config';
import { stub } from 'sinon';

describe('User Entity', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	it('should correctly generate a temporary password', function ()
	{
		const tempPassword: string = User.generateRandomPassword();

		expect(tempPassword).to.not.be.null;
		expect(tempPassword).to.be.a('String');
	});


	describe('Password expiry date', function()
	{
		it('should correctly set the expiry date if no expiry date is configured', function ()
		{
			const passwordRequirementsStub = stub(userConfig, 'password').value({
				...userConfig.password,
				expiryPeriod: null
			});

			const expirationDate = User.getPasswordExpiryDate();
			expect(expirationDate).to.be.null;

			passwordRequirementsStub.restore();
		});


		it('should correctly set the expiry date as of an arbitrary date', function ()
		{
			const fromDate = new Date();
			const expirationDate = User.getPasswordExpiryDate(fromDate);

			let expectedDate: Date = new Date();
			if (userConfig.password.expiryPeriod) {
				expectedDate = dayjs(fromDate)
					.add(...userConfig.password.expiryPeriod).toDate();
			}

			expect(dayjs(expirationDate).isSame(expectedDate)).to.be.true;
		});
	});


	describe('Temporary password expiry date', function()
	{
		it('should correctly set the temporary expiry date as of an arbitrary date', function ()
		{
			const fromDate = new Date();
			const expirationDate = User.getTempPasswordExpiryDate(fromDate);

			const expectedDate = dayjs(fromDate)
				.add(...userConfig.password.tempPasswordExpiryPeriod).toDate();

			expect(dayjs(expirationDate).isSame(expectedDate)).to.be.true;
		});


		it('should correctly set the temporary expiry date as of the default current date',
			function ()
		{
			const expirationDate = User.getTempPasswordExpiryDate();

			const expectedDate = dayjs()
				.add(...userConfig.password.tempPasswordExpiryPeriod).toDate();

			expect(dayjs(expirationDate).isSame(expectedDate, 'hour')).to.be.true;
		});
	});


	describe('Validate new password', function ()
	{
		it('should throw an exception when an empty password is provided', function ()
		{
			expect(() => User.validateNewPassword('')).to.throw();
		});

		it('should throw an exception when passed a password that is too short', function ()
		{
			expect(() => User.validateNewPassword('no')).to.throw();
		});


		it('should throw an exception when passed a password that is too long.', function ()
		{
			const longPassword = Array(userConfig.password.maxLength + 1)
				.fill('n').join('');
			expect(() => User.validateNewPassword(longPassword)).to.throw();
		});
	});

	describe('Validate email address', function ()
	{
		it('should throw an exception when an empty email is provided', function ()
		{
			expect(() => User.validateEmailAddress('')).to.throw(InvalidEmailError);
		});

		it('should correctly validate a correct email', function ()
		{
			expect(() => User.validateEmailAddress('valid@example.org')).to.not.throw();
		});


		it('should correctly validate an incorrect email', function ()
		{
			expect(() => User.validateEmailAddress('invalid@example')).to.throw(InvalidEmailError);
			expect(() => User.validateEmailAddress('@example.org')).to.throw(InvalidEmailError);
			expect(() => User.validateEmailAddress('a@.org')).to.throw(InvalidEmailError);
		});
	});

	describe('Normalise email address', function ()
	{
		it("should correctly normalise a user's email", function ()
		{
			const normalisedEmail: string = User.normaliseEmailAddress('  TEST@EXAMPLE.ORG');
			expect(normalisedEmail).to.equal('test@example.org');
		});
	});

	describe('Normalise username', function ()
	{
		it('should throw an exception if no username is provided', function ()
		{
			expect(() => User.normaliseUsername('')).to.throw(InvalidUsernameError);
		});

		it("should correctly normalise a user's username", function ()
		{
			const normalisedName: string = User.normaliseUsername(' John    ');
			expect(normalisedName).to.equal('john');
		});
	});

	describe('Validate user name', function ()
	{
		it('should throw an exception if no username is provided', function ()
		{
			expect(() => User.validateUsername('')).to.throw(InvalidUsernameError);
		});

		it('should throw an exception when passed a username that is too short', function ()
		{
			expect(() => User.validateUsername('n')).to.throw(InvalidUsernameError);
		});


		it('should throw an exception when passed a username that is too long', function ()
		{
			const longUsername = Array(userConfig.usernameRequirements.maxLength + 1)
				.fill('n').join('');
			expect(() => User.validateUsername(longUsername)).to.throw(InvalidUsernameError);
		});


		it('should throw an exception when passed a username with invalid characters', function ()
		{
			expect(() => User.validateUsername('Ånthony')).to.throw(InvalidUsernameError);
		});


		it('should throw an exception when passed a username with spaces', function ()
		{
			expect(() => User.validateUsername('Anthony Admin')).to.throw(InvalidUsernameError);
		});


		it('should not throw an exception when passed a valid username', function ()
		{
			expect(() => User.validateUsername('Anthony_Admin')).to.not.throw();
		});
	});


	describe('Test password expiry', function ()
	{
		const username = testUtils.createRandomUsername();
		const email = testUtils.createRandomEmailAddress();

		const testUser = new User(username, email, 'password');

		it('should test whether a user\'s password has expired', function () {
			testUser.passwordExpiryTime = dayjs().add(1, 'day').toDate();
			expect(testUser.hasPasswordExpired()).to.be.false;

			testUser.passwordExpiryTime = dayjs().subtract(1, 'day').toDate();
			expect(testUser.hasPasswordExpired()).to.be.true;
		});

		it('should return false if no expiry date is set', function () {
			testUser.passwordExpiryTime = null;
			expect(testUser.hasPasswordExpired()).to.be.false;
		});
	});
});
