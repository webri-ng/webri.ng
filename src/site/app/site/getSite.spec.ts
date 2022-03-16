import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { Site, User, Webring } from '../../model';
import { testUtils, userService } from '../';
import { InvalidIdentifierError } from '../error';
import { getSite } from '.';
import { EntityManager, getManager } from 'typeorm';
import { deleteSite } from './deleteSite';


describe('Get site', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testWebring: Webring;
	let testSite: Site;
	let testDeletedSite: Site;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser?.userId!);
		testSite = await testUtils.insertTestSite(testWebring.ringId!, testUser.userId!);
		testDeletedSite = await testUtils.insertTestSite(testWebring.ringId!, testUser.userId!);
		testDeletedSite = await deleteSite(testDeletedSite.siteId!);
	});


	after(async function afterTesting()
	{
		testUser = await userService.deleteUser(testUser?.userId!);
	});


	it('should throw an exception when passed an empty site id', async function ()
	{
		return expect(getSite('')).to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should throw an exception when passed an invalid site id', async function ()
	{
		return expect(getSite(testUtils.invalidUuid)).to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should correctly get a site by its id', async function ()
	{
		const result = await getSite(testSite?.siteId!);

		expect(result).to.not.be.null;
		expect(result?.siteId).to.equal(testSite?.siteId);
	});


	it('should get a site within a transaction', async function ()
	{
		await getManager().transaction(async (transactionalEntityManager: EntityManager) => {
			const result = await getSite(testSite?.siteId!, {
				transactionalEntityManager
			});

			expect(result).to.not.be.null;
			expect(result?.siteId).to.equal(testSite?.siteId);
		});
	});


	it('should correctly ignore a deleted site', async function ()
	{
		const result = await getSite(testDeletedSite?.siteId!);

		expect(result).to.be.null;
	});
});
