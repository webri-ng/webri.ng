import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { User, Webring } from '../../model';
import { testUtils, userService, webringService } from '../';
import { getModeratedWebrings } from '.';

describe("Get user's moderated webrings", function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUser2: User;
	let testUser3: User;
	let testUser4: User;
	let testWebring: Webring;
	let testWebring2: Webring;
	let testDeletedWebring: Webring;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testUser2 = await testUtils.insertTestUser();
		testUser3 = await testUtils.insertTestUser();
		testUser4 = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser.userId!);
		testWebring2 = await testUtils.insertTestWebring(testUser2.userId!, {
			moderators: [testUser, testUser3]
		});
		testDeletedWebring = await testUtils.insertTestWebring(testUser4.userId!, {
			moderators: [testUser, testUser3]
		});

		testDeletedWebring = await webringService.deleteWebring(testDeletedWebring.ringId!);
	});


	after(async function tearDown()
	{
		await userService.deleteUser(testUser.userId!);
		await userService.deleteUser(testUser2.userId!);
		await userService.deleteUser(testUser3.userId!);
		await userService.deleteUser(testUser4.userId!);
	});


	it("should return a user's moderated webrings", async function ()
	{
		let moderatedWebrings = await getModeratedWebrings(testUser);

		expect(moderatedWebrings).to.not.be.undefined;
		expect(moderatedWebrings).to.have.length(2);

		expect(moderatedWebrings.find((webring) => webring.ringId === testWebring.ringId))
			.to.not.be.undefined;

		expect(moderatedWebrings.find((webring) => webring.ringId === testWebring2.ringId))
			.to.not.be.undefined;

		moderatedWebrings = await getModeratedWebrings(testUser2);

		expect(moderatedWebrings).to.not.be.undefined;
		expect(moderatedWebrings).to.have.length(1);

		expect(moderatedWebrings.find((webring) => webring.ringId === testWebring2.ringId))
			.to.not.be.undefined;

		moderatedWebrings = await getModeratedWebrings(testUser3);

		expect(moderatedWebrings).to.not.be.undefined;
		expect(moderatedWebrings).to.have.length(1);

		expect(moderatedWebrings.find((webring) => webring.ringId === testWebring2.ringId))
			.to.not.be.undefined;
	});


	it("should ignore deleted webrings", async function ()
	{
		const moderatedWebrings = await getModeratedWebrings(testUser4);

		expect(moderatedWebrings).to.not.be.undefined;
		expect(moderatedWebrings).to.have.length(0);
	});
});
