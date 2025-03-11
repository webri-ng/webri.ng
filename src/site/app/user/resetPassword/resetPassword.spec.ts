import * as dayjs from 'dayjs';
import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { User } from '../../../model';
import { userService, testUtils } from '../../';
import { InvalidIdentifierError, UserNotFoundError } from '../../error';
import { resetPassword } from '.';
import { appDataSource } from '../../../infra/database';

chai.use(chaiAsPromised);

describe('Reset user password', function () {
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
	});

	after(async function tearDown() {
		await userService.deleteUser(testUser.userId!);
	});

	it('should throw an exception when passed no userId', async function () {
		return expect(resetPassword('')).to.be.rejectedWith(InvalidIdentifierError);
	});

	it('should throw an exception when passed a nonexistent userId', async function () {
		return expect(resetPassword(testUtils.dummyUuid)).to.be.rejectedWith(
			UserNotFoundError
		);
	});

	it("should correctly reset a customer's password", async function () {
		testUser = await resetPassword(testUser.email);

		expect(testUser).to.not.be.null;
		expect(dayjs(testUser.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(dayjs(testUser.passwordSetTime).isSame(new Date(), 'hour')).to.be
			.true;
		expect(
			dayjs(testUser.passwordExpiryTime).isSame(
				User.getTempPasswordExpiryDate(),
				'hour'
			)
		).to.be.true;

		//@TODO: Improve verification of reset temporary password.
	});

	it('should correctly unlock a locked user account', async function () {
		testUser.lockedDueToFailedAuth = true;
		await appDataSource.getRepository(User).save(testUser);

		testUser = await resetPassword(testUser.email);

		expect(testUser).to.not.be.null;
		expect(testUser.lockedDueToFailedAuth).to.be.false;
	});
});
