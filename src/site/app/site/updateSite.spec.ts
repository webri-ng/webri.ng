import * as dayjs from 'dayjs';
import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { Site, User, Webring } from '../../model';
import { userService, testUtils } from '../';
import { createRandomString } from '../util';
import { InvalidIdentifierError, InvalidSiteNameError, InvalidSiteUrlError,
	SiteNotFoundError } from '../error';
import { siteConfig } from '../../config';
import { updateSite } from './updateSite';

chai.use(chaiAsPromised);

describe('Add site to webring', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testWebring: Webring;
	let testSite: Site;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser.userId!);
		testSite = await testUtils.insertTestSite(testWebring.ringId!,
			testUser.userId!);
	});


	after(async function tearDown()
	{
		await userService.deleteUser(testUser.userId!);
	});


	it('should raise an exception if no site id is provided', async function()
	{
		const name = '';
		const url = testUtils.createRandomSiteUrl();

		return expect(updateSite('', name, url)).to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should raise an exception if an invalid site id is provided', async function()
	{
		const name = '';
		const url = testUtils.createRandomSiteUrl();

		return expect(updateSite(testUtils.invalidUuid, name, url))
			.to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should raise an exception if a nonexistent site id is provided', async function()
	{
		const name = '';
		const url = testUtils.createRandomSiteUrl();

		return expect(updateSite(testUtils.dummyUuid,
			name, url)).to.be.rejectedWith(SiteNotFoundError);
	});


	it('should raise an exception if an invalid name is provided', async function()
	{
		const name = '';
		const url = testUtils.createRandomSiteUrl();

		return expect(updateSite(testSite.siteId!,
			name, url)).to.be.rejectedWith(InvalidSiteNameError);
	});


	it('should raise an exception when passed a name that is too short', async function()
	{
		const name = Array(siteConfig.nameRequirements.minLength - 1).fill('n').join('');
		const url = testUtils.createRandomSiteUrl();

		return expect(updateSite(testSite.siteId!,
			name, url)).to.be.rejectedWith(InvalidSiteNameError);
	});


	it('should raise an exception when passed a name that is too long', async function()
	{
		const name = Array(siteConfig.nameRequirements.maxLength + 1).fill('n').join('');
		const url = testUtils.createRandomSiteUrl();

		return expect(updateSite(testSite.siteId!,
			name, url)).to.be.rejectedWith(InvalidSiteNameError);
	});

	it('should raise an exception if an invalid URL is provided', async function()
	{
		const name = createRandomString();
		const url = '';

		return expect(updateSite(testSite.siteId!,
			name, url)).to.be.rejectedWith(InvalidSiteUrlError);
	});


	it('should update a site', async function()
	{
		const name = createRandomString();
		const url = testUtils.createRandomSiteUrl();

		testSite = await updateSite(testSite.siteId!, name, url);

		expect(testSite.name).to.equal(Site.normaliseName(name));
		expect(testSite.url).to.equal(Site.normaliseUrl(url));
		expect(dayjs(testSite.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(testSite.dateDeleted).to.be.null;
	});


	it('should normalise a site\'s name', async function()
	{
		const name = "    Anthony's site";
		const url = testUtils.createRandomSiteUrl();

		testSite = await updateSite(testSite.siteId!, name, url);

		expect(testSite.name).to.equal(`Anthony's site`);
		expect(testSite.url).to.equal(Site.normaliseUrl(url));
		expect(dayjs(testSite.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(testSite.dateDeleted).to.be.null;
	});


	it('should normalise a webring URL', async function()
	{
		const name = createRandomString();
		const url = `   http://www.test-site.com   `;

		testSite = await updateSite(testSite.siteId!, name, url);

		expect(testSite.name).to.equal(Site.normaliseName(name));
		expect(testSite.url).to.equal(`http://www.test-site.com`);
		expect(dayjs(testSite.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(testSite.dateDeleted).to.be.null;
	});
});
