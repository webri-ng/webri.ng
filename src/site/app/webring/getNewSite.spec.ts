import * as dayjs from 'dayjs';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { Site, User, Webring } from '../../model';
import { createRandomString, testUtils, userService } from '..';
import { InvalidIdentifierError } from '../error';
import { getNewSite, GetNewSiteMethod } from '.';
import { createRandomWebringUrl } from '../testUtils';


describe('Get new site', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testWebring: Webring;
	let testEmptyWebring: Webring;
	let nonSerialisedWebring: Webring;
	let testSite: Site;
	let testSite2: Site;
	let testSite3: Site;
	let testSite4: Site;
	let testSite5: Site;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser.userId!);
		testEmptyWebring = await testUtils.insertTestWebring(testUser.userId!);

		nonSerialisedWebring = new Webring(createRandomString(), createRandomString(),
			createRandomWebringUrl(), false, testUser.userId!);

		testSite = await testUtils.insertTestSite(testWebring.ringId!,
			testUser.userId!, {
				dateCreated: dayjs().subtract(5, 'days').toDate()
			});
		testSite2 = await testUtils.insertTestSite(testWebring.ringId!,
			testUser.userId!, {
				dateCreated: dayjs().subtract(4, 'days').toDate()
			});
		testSite3 = await testUtils.insertTestSite(testWebring.ringId!,
			testUser.userId!, {
				dateCreated: dayjs().subtract(3, 'days').toDate()
			});
		testSite4 = await testUtils.insertTestSite(testWebring.ringId!,
			testUser.userId!, {
				dateCreated: dayjs().subtract(2, 'days').toDate()
			});
		testSite5 = await testUtils.insertTestSite(testWebring.ringId!,
			testUser.userId!, {
				dateCreated: dayjs().subtract(1, 'days').toDate()
			});
	});


	after(async function afterTesting()
	{
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser.userId!);
	});

	it('should raise an exception if a non-serialised webring is provided', async function()
	{
		return expect(getNewSite(nonSerialisedWebring,
			GetNewSiteMethod.Next)).to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should return null if the webring has no sites', async function ()
	{
		const nextSite = await getNewSite(testEmptyWebring, GetNewSiteMethod.Next);
		expect(nextSite).to.be.null;
	});



	it('should return the first site when not passed an index and the method is next',
		async function ()
	{
		const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Next);
		expect(nextSite!.siteId).to.equal(testSite.siteId);
	});


	it('should return the first site when not passed an index and the method is previous',
		async function ()
	{
		const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Previous);
		expect(nextSite!.siteId).to.equal(testSite.siteId);
	});


	it('should return the first site when passed a negative index', async function ()
	{
		const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Next);
		expect(nextSite!.siteId).to.equal(testSite.siteId);
	});


	it('should return the first site when passed an invalid index', async function ()
	{
		const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Next);
		expect(nextSite!.siteId).to.equal(testSite.siteId);
	});


	it('should return the first site when passed an index that is too high', async function ()
	{
		const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Next, 5);
		expect(nextSite!.siteId).to.equal(testSite.siteId);
	});


	it('should return the next site when passed a valid index', async function ()
	{
		const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Next, 3);
		expect(nextSite!.siteId).to.equal(testSite5.siteId);
	});


	it('should return the first site when the method is \'next\' and passed the last index',
		async function ()
	{
		const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Next, 4);
		expect(nextSite!.siteId).to.equal(testSite.siteId);
	});


	it('should return the previous site when passed a valid index', async function ()
	{
		const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Previous, 3);
		expect(nextSite!.siteId).to.equal(testSite3.siteId);
	});


	it('should return the last site when the method is \'previous\' and passed the first index',
		async function ()
	{
		const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Previous, 0);
		expect(nextSite!.siteId).to.equal(testSite5.siteId);
	});


	it('should return a random site', async function ()
	{
		const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Random, 0);
		expect(nextSite).to.not.be.null;
	});
});
