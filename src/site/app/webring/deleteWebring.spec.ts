import * as dayjs from 'dayjs';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { InvalidIdentifierError, WebringNotFoundError } from '../error';
chai.use(chaiAsPromised);

import { Site, User, Webring } from '../../model';
import { deleteWebring } from '.';
import { testUtils, userService } from '..';
import { EntityManager, getManager, getRepository } from 'typeorm';


describe('Webring soft-deletion', function() {
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testWebring: Webring;
	let testWebring2: Webring;
	let testWebring3: Webring;

	let testSite: Site | undefined;
	let testSite2: Site | undefined;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser.userId || '');
		testWebring2 = await testUtils.insertTestWebring(testUser.userId || '');
		testWebring3 = await testUtils.insertTestWebring(testUser.userId || '');

		testSite = await testUtils.insertTestSite(testWebring.ringId || '', testUser.userId || '');
		testSite2 = await testUtils.insertTestSite(testWebring.ringId || '', testUser.userId || '');
	});


	after(async function afterTesting()
	{
		testUser = await userService.deleteUser(testUser?.userId || '');
	});


	it('should throw an exception when passed an empty ringId', async function() {
		return expect(deleteWebring('')).to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should throw an exception when passed an invalid ringId', async function() {
		return expect(deleteWebring(testUtils.invalidUiid))
			.to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should throw an exception when passed a nonexistent ringId', async function() {
		return expect(deleteWebring(testUtils.dummyUuid)).to.be.rejectedWith(WebringNotFoundError);
	});


	describe('should correctly delete a webring', function() {
		it('should correctly delete the webring entity', async function() {
			const deletedWebring = await deleteWebring(testWebring?.ringId || '');

			expect(deletedWebring.dateDeleted).to.not.be.null;
			expect(dayjs(deletedWebring.dateDeleted).isSame(dayjs(), 'minute')).to.be.true;
		});

		it('should correctly delete a webring\'s sites', async function() {
			testSite = await getRepository(Site).findOne(testSite?.siteId);
			expect(testSite?.dateDeleted).to.not.be.null;
			expect(dayjs(testSite?.dateDeleted).isSame(dayjs(), 'minute')).to.be.true;

			testSite2 = await getRepository(Site).findOne(testSite2?.siteId);
			expect(testSite2?.dateDeleted).to.not.be.null;
			expect(dayjs(testSite2?.dateDeleted).isSame(dayjs(), 'minute')).to.be.true;
		});
	});


	it('should correctly delete a webring at an arbitrary date', async function() {
		const deletionDate = new Date();
		const deletedWebring = await deleteWebring(testWebring2?.ringId || '', {
			deletionDate
		});

		expect(deletedWebring.dateDeleted).to.not.be.null;
		expect(dayjs(deletedWebring.dateDeleted).isSame(deletionDate)).to.be.true;
	});


	it('should correctly delete a webring within a transaction', async function() {
		await getManager().transaction(async (transactionalEntityManager: EntityManager) => {
			const deletionDate = new Date();
			const deletedWebring = await deleteWebring(testWebring3?.ringId || '', {
				deletionDate,
				transactionalEntityManager
			});

			expect(deletedWebring.dateDeleted).to.not.be.null;
			expect(dayjs(deletedWebring.dateDeleted).isSame(deletionDate)).to.be.true;
		});
	});
});
