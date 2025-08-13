import { before, describe, it } from 'mocha';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { User, Webring } from '../../model';
import { testUtils, userService } from '../../app';
import { getUserPermissionsForWebring } from './getUserPermissionsForWebring';

chai.use(chaiAsPromised);

describe('Get User Permissions for Webring', function () {
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUser2: User;
	let testPrivateWebring: Webring;
	let testPublicWebring: Webring;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
		testUser2 = await testUtils.insertTestUser();
		testPrivateWebring = await testUtils.insertTestWebring(testUser.userId!, {
			private: true,
			moderators: [testUser2]
		});
		testPublicWebring = await testUtils.insertTestWebring(testUser.userId!);
	});

	after(async function afterTesting() {
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser.userId!);
		testUser2 = await userService.deleteUser(testUser2.userId!);
	});

	it('should return false for all permissions when no user is provided', async function () {
		const result = await getUserPermissionsForWebring(
			testPublicWebring,
			undefined
		);
		expect(result).to.deep.equal({
			isUserModerator: false,
			isUserOwner: false
		});
	});

	it('should return when the user is the owner', async function () {
		const result = await getUserPermissionsForWebring(
			testPublicWebring,
			testUser
		);
		expect(result).to.deep.equal({
			isUserModerator: true,
			isUserOwner: true
		});
	});

	it('should return when the user is a moderator', async function () {
		const result = await getUserPermissionsForWebring(
			testPrivateWebring,
			testUser2
		);
		expect(result).to.deep.equal({
			isUserModerator: true,
			isUserOwner: false
		});
	});
});
