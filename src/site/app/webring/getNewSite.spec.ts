import dayjs = require('dayjs');
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { Site, User, Webring } from '../../model';
import { testUtils, userService } from '..';
import { InvalidIdentifierError, WebringNotFoundError } from '../error';
import { getNewSite, GetNewSiteMethod } from '.';


describe('Get new site', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User | null = null;
	let testWebring: Webring | null = null;
	let testSite: Site;
	let testSite2: Site;
	let testSite3: Site;
	let testSite4: Site;
	let testSite5: Site;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser?.userId || '');

		testSite = await testUtils.insertTestSite(testWebring.ringId || '',
			testUser.userId || '', {
				dateCreated: dayjs().subtract(5, 'days').toDate()
			});
		testSite2 = await testUtils.insertTestSite(testWebring.ringId || '',
			testUser.userId || '', {
				dateCreated: dayjs().subtract(4, 'days').toDate()
			});
		testSite3 = await testUtils.insertTestSite(testWebring.ringId || '',
			testUser.userId || '', {
				dateCreated: dayjs().subtract(3, 'days').toDate()
			});
		testSite4 = await testUtils.insertTestSite(testWebring.ringId || '',
			testUser.userId || '', {
				dateCreated: dayjs().subtract(2, 'days').toDate()
			});
		testSite5 = await testUtils.insertTestSite(testWebring.ringId || '',
			testUser.userId || '', {
				dateCreated: dayjs().subtract(1, 'days').toDate()
			});
	});


	after(async function afterTesting()
	{
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser?.userId || '');
	});

	it('should throw an exception when passed an empty webring id', async function ()
	{
		return expect(getNewSite('', GetNewSiteMethod.Next, 0))
			.to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should throw an exception when passed an invalid webring id', async function ()
	{
		return expect(getNewSite(testUtils.invalidUiid, GetNewSiteMethod.Next, 0))
			.to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should throw an exception when passed a nonexistent webring id', async function ()
	{
		return expect(getNewSite(testUtils.dummyUuid, GetNewSiteMethod.Next, 0))
			.to.be.rejectedWith(WebringNotFoundError);
	});


	it('should return the first site when not passed an index and the method is next',
		async function ()
	{
		const nextSite = await getNewSite(testWebring?.ringId || '', GetNewSiteMethod.Next);
		expect(nextSite.siteId).to.equal(testSite.siteId);
	});


	it('should return the first site when not passed an index and the method is previous',
		async function ()
	{
		const nextSite = await getNewSite(testWebring?.ringId || '', GetNewSiteMethod.Previous);
		expect(nextSite.siteId).to.equal(testSite.siteId);
	});


	it('should return the first site when passed a negative index', async function ()
	{
		const nextSite = await getNewSite(testWebring?.ringId || '', GetNewSiteMethod.Next);
		expect(nextSite.siteId).to.equal(testSite.siteId);
	});


	it('should return the first site when passed an invalid index', async function ()
	{
		const nextSite = await getNewSite(testWebring?.ringId || '', GetNewSiteMethod.Next);
		expect(nextSite.siteId).to.equal(testSite.siteId);
	});


	it('should return the first site when passed an index that is too high', async function ()
	{
		const nextSite = await getNewSite(testWebring?.ringId || '',
			GetNewSiteMethod.Next, 5);
		expect(nextSite.siteId).to.equal(testSite.siteId);
	});


	it('should return the next site when passed a valid index', async function ()
	{
		const nextSite = await getNewSite(testWebring?.ringId || '',
			GetNewSiteMethod.Next, 3);
		expect(nextSite.siteId).to.equal(testSite5.siteId);
	});


	it('should return the first site when the method is \'next\' and passed the last index',
		async function ()
	{
		const nextSite = await getNewSite(testWebring?.ringId || '',
			GetNewSiteMethod.Next, 4);
		expect(nextSite.siteId).to.equal(testSite.siteId);
	});


	it('should return the previous site when passed a valid index', async function ()
	{
		const nextSite = await getNewSite(testWebring?.ringId || '',
			GetNewSiteMethod.Previous, 3);
		expect(nextSite.siteId).to.equal(testSite3.siteId);
	});


	it('should return the last site when the method is \'previous\' and passed the first index',
		async function ()
	{
		const nextSite = await getNewSite(testWebring?.ringId || '',
			GetNewSiteMethod.Previous, 0);
		expect(nextSite.siteId).to.equal(testSite5.siteId);
	});


	it('should return a random site', async function ()
	{
		const nextSite = await getNewSite(testWebring?.ringId || '',
			GetNewSiteMethod.Random, 0);
		expect(nextSite).to.not.be.null;
	});
});
