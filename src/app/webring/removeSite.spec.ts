import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { InvalidIdentifierError, SiteNotFoundError } from '../error';
chai.use(chaiAsPromised);

import { Site, User, Webring } from '../../model';
import { removeSite } from '.';
import { createRandomString, testUtils, userService, webringService } from '..';
import { deleteSite } from '../site';
import { createRandomWebringUrl } from '../testUtils';


describe('Remove webring site', function() {
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testWebring: Webring;
	let testWebring2: Webring;
	let nonSerialisedWebring: Webring;

	let testSite: Site;
	let testSite2: Site;
	let testSite3: Site;
	let testSite4: Site;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser.userId!);
		testWebring2 = await testUtils.insertTestWebring(testUser.userId!);
		nonSerialisedWebring = new Webring(createRandomString(), createRandomString(),
			createRandomWebringUrl(), false, testUser.userId!);

		testSite = await testUtils.insertTestSite(testWebring.ringId!, testUser.userId!);
		testSite2 = await testUtils.insertTestSite(testWebring.ringId!, testUser.userId!);

		testSite3 = await testUtils.insertTestSite(testWebring2.ringId!, testUser.userId!);
		testSite4 = await testUtils.insertTestSite(testWebring2.ringId!, testUser.userId!);
		testSite4 = await deleteSite(testSite4.siteId!);
	});


	after(async function afterTesting()
	{
		testUser = await userService.deleteUser(testUser.userId!);
	});

	it('should raise an exception if a non-serialised webring is provided', async function()
	{
		return expect(removeSite(nonSerialisedWebring,
			testSite3.url)).to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should throw an exception when passed a nonexistent url', async function() {
		return expect(removeSite(testWebring, testUtils.dummyUuid))
			.to.be.rejectedWith(SiteNotFoundError);
	});


	it('should throw an exception when passed an empty url', async function() {
		return expect(removeSite(testWebring, ''))
			.to.be.rejectedWith(SiteNotFoundError);
	});


	it('should throw an exception when passed a site from another webring', async function() {
		return expect(removeSite(testWebring, testSite3.url))
			.to.be.rejectedWith(SiteNotFoundError);
	});


	it('should throw an exception when passed a deleted site', async function() {
		return expect(removeSite(testWebring2, testSite4.url))
			.to.be.rejectedWith(SiteNotFoundError);
	});

	it('should correctly remove a site from a webring', async function() {
		testSite = await removeSite(testWebring, testSite.url!);

		const testWebringSites = await webringService.getWebringSites(testWebring.ringId!);
		expect(testWebringSites).to.have.length(1);
		expect(testWebringSites[0].siteId).to.equal(testSite2.siteId);
	});
});
