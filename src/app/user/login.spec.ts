import * as dayjs from 'dayjs';
import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import { appDataSource } from '../../infra/database';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { User } from '../../model';
import { userService, testUtils } from '..';
import { ApiReturnableError } from '../error';
import { userConfig } from '../../config';
import { login } from './login';
import {
	expiredPasswordError,
	invalidEmailAddressError,
	lockedAccountDueToAuthFailureError,
	loginAttemptCountExceededError,
	loginFailedError,
	userNotFoundError
} from '../../api/api-error-response';

describe('User login', function () {
	this.timeout(testUtils.defaultTestTimeout);

	let testExpiredPasswordUser: User;
	let testMaxLoginUser: User;
	let testUser: User;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();

		testExpiredPasswordUser = await testUtils.insertTestUser();
		await appDataSource
			.getRepository(User)
			.update(testExpiredPasswordUser.userId!, {
				passwordExpiryTime: dayjs().subtract(1, 'day').toDate()
			});

		testMaxLoginUser = await testUtils.insertTestUser();
		await appDataSource.getRepository(User).update(testMaxLoginUser.userId!, {
			loginAttemptCount: userConfig.maxUnsuccessfulLoginAttempts - 1
		});
	});

	after(async function tearDown() {
		await userService.deleteUser(testUser.userId!);
		await userService.deleteUser(testExpiredPasswordUser.userId!);
		await userService.deleteUser(testMaxLoginUser.userId!);
	});

	it('should throw an exception when passed a null email', async function () {
		return expect(login('', 'password'))
			.to.eventually.be.rejectedWith(ApiReturnableError)
			.and.have.property('code', invalidEmailAddressError.code);
	});

	it('should throw an exception when passed an email not associated with a user', async function () {
		return expect(login('notpresent@nowhere.com', 'password'))
			.to.eventually.be.rejectedWith(ApiReturnableError)
			.and.have.property('code', userNotFoundError.code);
	});

	it('should throw an exception when passed an invalid password for a valid user', async function () {
		return expect(login(testUser?.email || '', 'incorrectPassword1'))
			.to.eventually.be.rejectedWith(ApiReturnableError)
			.and.have.property('code', loginFailedError.code);
	});

	it('should throw an exception when passed an expired password for a valid user', async function () {
		return expect(login(testExpiredPasswordUser?.email || '', 'password1'))
			.to.eventually.be.rejectedWith(ApiReturnableError)
			.and.have.property('code', expiredPasswordError.code);
	});

	it('should correctly authenticate a login using an email in an incorrect format', async function () {
		const user = await login(`  ${testUser?.email.toUpperCase()}`, 'password1');

		expect(user).to.be.instanceof(User);
		expect(user.userId).to.equal(testUser?.userId);
	});

	it('should throw an exception when a user exceeds the maximum login attempt count', async function () {
		return expect(login(testMaxLoginUser?.email || '', 'incorrectpassword1'))
			.to.eventually.be.rejectedWith(ApiReturnableError)
			.and.have.property('code', loginAttemptCountExceededError.code);
	});

	it(
		'should throw an exception when a user who is locked due to exceeding the login ' +
			'attempt count attempts to login',
		async function () {
			return expect(login(testMaxLoginUser?.email || '', 'password1'))
				.to.eventually.be.rejectedWith(ApiReturnableError)
				.and.have.property('code', lockedAccountDueToAuthFailureError.code);
		}
	);

	describe('Successful login scenario', function () {
		let authenticatedUser: User;

		it('should correctly authenticate a correct login', async function () {
			authenticatedUser = await login(testUser?.email || '', 'password1');

			expect(authenticatedUser).to.be.instanceof(User);
			expect(authenticatedUser.userId).to.equal(testUser?.userId);
			expect(authenticatedUser?.dateLastLogin).to.not.be.null;
		});

		it('should correctly set the last login date for a user', function () {
			expect(authenticatedUser?.dateLastLogin).to.not.be.null;
			expect(dayjs(authenticatedUser?.dateLastLogin).isSame(dayjs(), 'minute'))
				.to.be.true;
		});
	});
});
