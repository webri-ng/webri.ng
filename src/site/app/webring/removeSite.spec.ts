import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { InvalidIdentifierError, SiteNotFoundError, WebringNotFoundError } from '../error';
chai.use(chaiAsPromised);

import { Site, User, Webring } from '../../model';
import { removeSite } from '.';
import { testUtils, userService, webringService } from '..';
import { deleteSite } from '../site';


describe('Remove webring site', function() {
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testWebring: Webring;
	let testWebring2: Webring;

	let testSite: Site;
	let testSite2: Site;
	let testSite3: Site;
	let testSite4: Site;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser.userId || '');
		testWebring2 = await testUtils.insertTestWebring(testUser.userId || '');

		testSite = await testUtils.insertTestSite(testWebring.ringId || '', testUser.userId || '');
		testSite2 = await testUtils.insertTestSite(testWebring.ringId || '', testUser.userId || '');

		testSite3 = await testUtils.insertTestSite(testWebring2.ringId || '', testUser.userId || '');
		testSite4 = await testUtils.insertTestSite(testWebring2.ringId || '', testUser.userId || '');
		testSite4 = await deleteSite(testSite4.siteId || '');
	});


	after(async function afterTesting()
	{
		testUser = await userService.deleteUser(testUser?.userId || '');
	});


	it('should throw an exception when passed an empty ringId', async function() {
		return expect(removeSite('', testSite.siteId || ''))
			.to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should throw an exception when passed an invalid ringId', async function() {
		return expect(removeSite(testUtils.invalidUuid, testSite.siteId || ''))
			.to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should throw an exception when passed a nonexistent ringId', async function() {
		return expect(removeSite(testUtils.dummyUuid, testSite.siteId || ''))
			.to.be.rejectedWith(WebringNotFoundError);
	});


	it('should throw an exception when passed a nonexistent siteId', async function() {
		return expect(removeSite(testWebring.ringId || '', testUtils.dummyUuid))
			.to.be.rejectedWith(SiteNotFoundError);
	});


	it('should throw an exception when passed an empty siteId', async function() {
		return expect(removeSite(testWebring.ringId || '', ''))
			.to.be.rejectedWith(SiteNotFoundError);
	});


	it('should throw an exception when passed an invalid siteId', async function() {
		return expect(removeSite(testWebring.ringId || '', testUtils.invalidUuid))
			.to.be.rejectedWith(SiteNotFoundError);
	});


	it('should throw an exception when passed a site from another webring', async function() {
		return expect(removeSite(testWebring.ringId || '', testSite3.siteId || ''))
			.to.be.rejectedWith(SiteNotFoundError);
	});


	it('should throw an exception when passed a deleted site', async function() {
		return expect(removeSite(testWebring2.ringId || '', testSite4.siteId || ''))
			.to.be.rejectedWith(SiteNotFoundError);
	});

	it('should correctly remove a site from a webring', async function() {
		testSite = await removeSite(testWebring.ringId || '', testSite.siteId || '');

		const testWebringSites = await webringService.getWebringSites(testWebring.ringId || '');
		expect(testWebringSites).to.have.length(1);
		expect(testWebringSites[0].siteId).to.equal(testSite2.siteId);
	});
});
