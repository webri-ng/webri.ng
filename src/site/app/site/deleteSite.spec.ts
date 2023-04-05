import * as dayjs from 'dayjs';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { InvalidIdentifierError, SiteNotFoundError } from '../error';
chai.use(chaiAsPromised);

import { Site, User, Webring } from '../../model';

import { testUtils, userService } from '../';
import { appDataSource } from '../../infra/database';
import { deleteSite } from '.';


describe('Site soft-deletion', function() {
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testWebring: Webring;
	let testSite: Site;
	let testSite2: Site;
	let testSite3: Site;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser.userId!);
		testSite = await testUtils.insertTestSite(testWebring.ringId!, testUser.userId!);
		testSite2 = await testUtils.insertTestSite(testWebring.ringId!, testUser.userId!);
		testSite3 = await testUtils.insertTestSite(testWebring.ringId!, testUser.userId!);
	});


	after(async function afterTesting()
	{
		testUser = await userService.deleteUser(testUser.userId!);
	});


	it('should throw an exception when passed an empty site id', async function() {
		return expect(deleteSite('')).to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should throw an exception when passed a nonexistent site id', async function() {
		return expect(deleteSite(testUtils.dummyUuid)).to.be.rejectedWith(SiteNotFoundError);
	});


	it('should correctly delete a site', async function() {
		const deletedSite = await deleteSite(testSite.siteId!);

		expect(deletedSite.dateDeleted).to.not.be.null;
		expect(dayjs(deletedSite.dateDeleted).isSame(dayjs(), 'minute')).to.be.true;
	});


	it('should correctly delete a site at an arbitrary date', async function() {
		const deletionDate = new Date();
		const deletedTag = await deleteSite(testSite2.siteId!, {
			deletionDate
		});

		expect(deletedTag.dateDeleted).to.not.be.null;
		expect(dayjs(deletedTag.dateDeleted).isSame(deletionDate)).to.be.true;
	});


	it('should correctly delete a site within a transaction', async function() {
		await appDataSource.transaction(async (transactionalEntityManager) => {
			const deletionDate = new Date();
			const deletedTag = await deleteSite(testSite3.siteId!, {
				deletionDate,
				transactionalEntityManager
			});

			expect(deletedTag.dateDeleted).to.not.be.null;
			expect(dayjs(deletedTag.dateDeleted).isSame(deletionDate)).to.be.true;
		});
	});
});
