import * as dayjs from 'dayjs';
import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { User, Webring } from '../../model';
import { userService, testUtils } from '../';
import { createRandomString } from '../util';
import { InvalidSiteNameError, InvalidSiteUrlError, SiteAlreadyExistsError, WebringNotFoundError } from '../error';
import { siteConfig } from '../../config';
import { addNewSite } from './addNewSite';
import { createRandomWebringUrl } from '../testUtils';

chai.use(chaiAsPromised);

describe('Add site to webring', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testWebring: Webring;
	let nonSerialisedWebring: Webring;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser.userId!);
		nonSerialisedWebring = new Webring(createRandomString(), createRandomString(),
			createRandomWebringUrl(), false, testUser.userId!);
	});


	after(async function tearDown()
	{
		await userService.deleteUser(testUser.userId!);
	});


	it('should raise an exception if a non-serialised webring is provided', async function()
	{
		const name = createRandomString();
		const url = testUtils.createRandomSiteUrl();

		return expect(addNewSite(nonSerialisedWebring,
			name, url, testUser.userId!)).to.be.rejectedWith(WebringNotFoundError);
	});


	it('should raise an exception if an invalid name is provided', async function()
	{
		const name = '';
		const url = testUtils.createRandomSiteUrl();

		return expect(addNewSite(testWebring,
			name, url, testUser.userId!)).to.be.rejectedWith(InvalidSiteNameError);
	});


	it('should raise an exception when passed a name that is too short', async function()
	{
		const name = Array(siteConfig.nameRequirements.minLength - 1).fill('n').join('');
		const url = testUtils.createRandomSiteUrl();

		return expect(addNewSite(testWebring,
			name, url, testUser.userId!)).to.be.rejectedWith(InvalidSiteNameError);
	});


	it('should raise an exception when passed a name that is too long', async function()
	{
		const name = Array(siteConfig.nameRequirements.maxLength + 1).fill('n').join('');
		const url = testUtils.createRandomSiteUrl();

		return expect(addNewSite(testWebring,
			name, url, testUser.userId!)).to.be.rejectedWith(InvalidSiteNameError);
	});

	it('should raise an exception if an invalid URL is provided', async function()
	{
		const name = createRandomString();
		const url = '';

		return expect(addNewSite(testWebring,
			name, url, testUser.userId!)).to.be.rejectedWith(InvalidSiteUrlError);
	});


	it('should add a site to a webring', async function()
	{
		const name = createRandomString();
		const url = testUtils.createRandomSiteUrl();

		const testSite = await addNewSite(testWebring,
			name, url, testUser.userId!);

		expect(testSite.name).to.equal(name);
		expect(testSite.url).to.equal(url);
		expect(testSite.addedBy).to.equal(testUser.userId);
		expect(dayjs(testSite.dateCreated).isSame(new Date(), 'hour')).to.be.true;
		expect(dayjs(testSite.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(testSite.dateDeleted).to.be.null;
	});


	it('should raise an exception if a site with the same URL already exists ' +
		'in this webring', async function()
	{
		const name = createRandomString();
		const url = testUtils.createRandomSiteUrl();

		const testSite = await addNewSite(testWebring,
			name, url, testUser.userId!);

		return expect(addNewSite(testWebring, testSite.name, testSite.url,
			testUser.userId!)).to.be.rejectedWith(SiteAlreadyExistsError);
	});


	it('should normalise a site\'s name', async function()
	{
		const name = "    Anthony's site";
		const url = testUtils.createRandomSiteUrl();

		const testSite = await addNewSite(testWebring,
			name, url, testUser.userId!);

		expect(testSite.name).to.equal('Anthony\'s site');
		expect(testSite.url).to.equal(url);
		expect(testSite.addedBy).to.equal(testUser.userId);
		expect(dayjs(testSite.dateCreated).isSame(new Date(), 'hour')).to.be.true;
		expect(dayjs(testSite.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(testSite.dateDeleted).to.be.null;
	});


	it('should normalise a webring URL', async function()
	{
		const name = createRandomString();
		const url = `   http://www.test-site.com   `;

		const testSite = await addNewSite(testWebring,
			name, url, testUser.userId!);

		expect(testSite.name).to.equal(name);
		expect(testSite.url).to.equal('http://www.test-site.com');
		expect(testSite.addedBy).to.equal(testUser.userId);
		expect(dayjs(testSite.dateCreated).isSame(new Date(), 'hour')).to.be.true;
		expect(dayjs(testSite.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(testSite.dateDeleted).to.be.null;
	});
});
