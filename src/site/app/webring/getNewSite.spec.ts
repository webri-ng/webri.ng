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
	let testWebringWithOneSite: Webring;
	let testWebringWithTwoSites: Webring;
	let testEmptyWebring: Webring;
	let nonSerialisedWebring: Webring;
	let testSite: Site;
	let testSite2: Site;
	let testSite3: Site;
	let testSite4: Site;
	let testSite5: Site;
	let testSite6: Site;
	let testSite7: Site;
	let testSite8: Site;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser.userId!);
		testWebringWithOneSite = await testUtils.insertTestWebring(testUser.userId!);
		testWebringWithTwoSites = await testUtils.insertTestWebring(testUser.userId!);
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

		testSite6 = await testUtils.insertTestSite(testWebringWithOneSite.ringId!,
			testUser.userId!, {
				dateCreated: dayjs().subtract(1, 'days').toDate()
			});

		testSite7 = await testUtils.insertTestSite(testWebringWithTwoSites.ringId!,
			testUser.userId!, {
				dateCreated: dayjs().subtract(2, 'days').toDate()
			});
		testSite8 = await testUtils.insertTestSite(testWebringWithTwoSites.ringId!,
			testUser.userId!, {
				dateCreated: dayjs().subtract(1, 'days').toDate()
			});
	});


	after(async function afterTesting()
	{
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser.userId!);
	});

	it('should raise an exception if a non-serialised webring is provided',
		async function()
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


	it('should return the first site if the webring only has a single site',
		async function ()
	{
		const nextSite = await getNewSite(testWebringWithOneSite, GetNewSiteMethod.Next);
		expect(nextSite!.siteId).to.equal(testSite6.siteId);
	});


	describe('When passed a site index', function () {
		it('should return the first site when not passed an index and the method is previous',
		async function ()
		{
			const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Previous);
			expect(nextSite!.siteId).to.equal(testSite.siteId);
		});


		it('should return the first site when passed a negative index', async function ()
		{
			const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Next, -1);
			expect(nextSite!.siteId).to.equal(testSite.siteId);
		});


		it('should return the first site when passed an invalid index', async function ()
		{
			const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Next, NaN);
			expect(nextSite!.siteId).to.equal(testSite.siteId);
		});


		it('should return the first site when passed an index that is too high',
			async function ()
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
	});

	describe('When passed a site URL', function () {
		it('should return the next site when passed a valid URL', async function ()
		{
			const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Next,
				undefined, testSite4.url);
			expect(nextSite!.siteId).to.equal(testSite5.siteId);
		});


		it('should return the first site when the method is \'next\' and passed the last URL',
			async function ()
		{
			const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Next,
				undefined, testSite5.url);
			expect(nextSite!.siteId).to.equal(testSite.siteId);
		});


		it('should return the first site when passed a nonexistent URL',
			async function ()
		{
			const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Next,
				undefined, 'fffff');
			expect(nextSite!.siteId).to.equal(testSite.siteId);
		});


		it('should return the previous site when passed a valid URL', async function ()
		{
			const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Previous,
				undefined, testSite4.url);
			expect(nextSite!.siteId).to.equal(testSite3.siteId);
		});


		it('should return the correct site when passed a valid URL without the protocol',
			async function ()
		{
			const nonNormalisedUrl = testSite4.url.replace('https://', '');

			const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Previous,
				undefined, nonNormalisedUrl);
			expect(nextSite!.siteId).to.equal(testSite3.siteId);
		});


		it('should return the last site when the method is \'previous\' and passed the first URL',
			async function ()
		{
			const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Previous,
				undefined, testSite.url);
			expect(nextSite!.siteId).to.equal(testSite5.siteId);
		});


		it('should override the index when passed a URL',
			async function ()
		{
			const nextSite = await getNewSite(testWebring, GetNewSiteMethod.Next,
				3, testSite.url);
			expect(nextSite!.siteId).to.equal(testSite2.siteId);
		});
	});


	describe('Get a random site', function () {
		it('should return a different site to the current', async function ()
		{
			let nextSite = await getNewSite(testWebringWithTwoSites, GetNewSiteMethod.Random, 0);
			expect(nextSite?.siteId).to.equal(testSite8.siteId);

			nextSite = await getNewSite(testWebringWithTwoSites, GetNewSiteMethod.Random, 1);
			expect(nextSite?.siteId).to.equal(testSite7.siteId);
		});
	})
});
