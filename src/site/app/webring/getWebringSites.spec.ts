import * as dayjs from 'dayjs';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { Site, User, Webring } from '../../model';
import { siteService, testUtils, userService } from '..';
import { EntityManager, getManager } from 'typeorm';
import { getWebringSites } from './getWebringSites';
import { InvalidIdentifierError } from '../error';


describe('Get Webring Sites', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testWebring: Webring;
	let testWebring2: Webring;

	let testSite: Site;
	let testSite2: Site;
	let testSite3: Site;
	let testSite4: Site;
	let testSite5: Site;
	let testDeletedSite: Site;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser.userId!);
		testWebring2 = await testUtils.insertTestWebring(testUser.userId!);

		testSite = await testUtils.insertTestSite(testWebring.ringId!, testUser.userId!, {
			dateCreated: dayjs().subtract(2, 'days').toDate()
		});
		testSite2 = await testUtils.insertTestSite(testWebring.ringId!, testUser.userId!, {
			dateCreated: dayjs().subtract(1, 'days').toDate()
		});
		testSite5 = await testUtils.insertTestSite(testWebring.ringId!, testUser.userId!, {
			dateCreated: dayjs().subtract(4, 'days').toDate()
		});

		testSite3 = await testUtils.insertTestSite(testWebring2.ringId!, testUser.userId!);
		testSite4 = await testUtils.insertTestSite(testWebring2.ringId!, testUser.userId!);

		testDeletedSite = await testUtils.insertTestSite(testWebring2.ringId!, testUser.userId!);
		await siteService.deleteSite(testDeletedSite.siteId!);
	});


	after(async function afterTesting()
	{
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser.userId!);
	});

	it('should throw an exception when passed an empty ringId', async function() {
		return expect(getWebringSites('')).to.be.rejectedWith(InvalidIdentifierError);
	});

	it('should correctly get the sites for a webring', async function ()
	{
		const results = await getWebringSites(testWebring.ringId!);

		expect(results).not.to.be.undefined;
		expect(results).to.have.length(3);
		expect(results.find((site) => site.siteId === testSite.siteId)).to.not.be.undefined;
		expect(results.find((site) => site.siteId === testSite2.siteId)).to.not.be.undefined;
		expect(results.find((site) => site.siteId === testSite5.siteId)).to.not.be.undefined;
	});


	it('should correctly return the sites for a webring in the order they were added', async function ()
	{
		const results = await getWebringSites(testWebring.ringId!);

		expect(results).not.to.be.undefined;
		expect(results).to.have.length(3);
		expect(results[0].siteId).to.equal(testSite5.siteId);
		expect(results[1].siteId).to.equal(testSite.siteId);
		expect(results[2].siteId).to.equal(testSite2.siteId);
	});


	it('should correctly ignore deleted sites', async function ()
	{
		const results = await getWebringSites(testWebring2.ringId!);

		expect(results).not.to.be.undefined;
		expect(results).to.have.length(2);
		expect(results.find((site) => site.siteId === testSite3.siteId)).to.not.be.undefined;
		expect(results.find((site) => site.siteId === testSite4.siteId)).to.not.be.undefined;
		expect(results.find((site) => site.siteId === testDeletedSite.siteId)).to.be.undefined;
	});


	it('should get a webring\'s sites within a transaction', async function ()
	{
		await getManager().transaction(async (transactionalEntityManager: EntityManager) => {
			const results = await getWebringSites(testWebring2.ringId!, {
				transactionalEntityManager
			});

			expect(results).not.to.be.undefined;
			expect(results).to.have.length(2);
			expect(results.find((site) => site.siteId === testSite3.siteId)).to.not.be.undefined;
			expect(results.find((site) => site.siteId === testSite4.siteId)).to.not.be.undefined;
			expect(results.find((site) => site.siteId === testDeletedSite.siteId)).to.be.undefined;
		});
	});
});
