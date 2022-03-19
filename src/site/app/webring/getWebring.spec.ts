import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { User, Webring } from '../../model';
import { testUtils, userService, webringService } from '..';
import { InvalidIdentifierError } from '../error';
import { getWebring } from '.';
import { EntityManager, getManager } from 'typeorm';
import { GetWebringSearchField } from './getWebring';


describe('Get Webring', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testWebring: Webring;
	let testWebring2: Webring;
	let testDeletedWebring: Webring;


	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser.userId!);
		testWebring2 = await testUtils.insertTestWebring(testUser.userId!);
		testDeletedWebring = await testUtils.insertTestWebring(testUser.userId!);
		testDeletedWebring = await webringService.deleteWebring(testDeletedWebring.ringId!);
	});


	after(async function afterTesting()
	{
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser.userId!);
	});


	it('should get a webring within a transaction', async function ()
	{
		await getManager().transaction(async (transactionalEntityManager: EntityManager) => {
			const result = await getWebring(GetWebringSearchField.RingId, testWebring.ringId!, {
				transactionalEntityManager
			});

			expect(result).to.not.be.null;
			expect(result?.ringId).to.equal(testWebring?.ringId);
		});
	});


	describe('Get user by id', function () {
		it('should throw an exception when passed an empty webring id', async function ()
		{
			return expect(getWebring(GetWebringSearchField.RingId, '')).to.be
				.rejectedWith(InvalidIdentifierError);
		});


		it('should throw an exception when passed an invalid webring id', async function ()
		{
			return expect(getWebring(GetWebringSearchField.RingId, testUtils.invalidUuid)).to.be
				.rejectedWith(InvalidIdentifierError);
		});


		it('should correctly get a webring by its id', async function ()
		{
			const result = await getWebring(GetWebringSearchField.RingId, testWebring.ringId!);

			expect(result).to.not.be.null;
			expect(result?.ringId).to.equal(testWebring?.ringId);
		});


		it('should correctly ignore a deleted webring', async function ()
		{
			const result = await getWebring(GetWebringSearchField.RingId,
				testDeletedWebring.ringId!);

			expect(result).to.be.null;
		});
	});


	describe('Get user by url', function () {
		it('should throw an exception when passed an invalid webring url', async function ()
		{
			return expect(getWebring(GetWebringSearchField.Url, '')).to.be
				.rejectedWith(InvalidIdentifierError);
		});


		it('should correctly get a webring by its url', async function ()
		{
			const result = await getWebring(GetWebringSearchField.Url, testWebring2.url || '');

			expect(result).to.not.be.null;
			expect(result?.ringId).to.equal(testWebring2?.ringId);
		});


		it('should correctly ignore a deleted webring', async function ()
		{
			const result = await getWebring(GetWebringSearchField.Url, testDeletedWebring.url || '');

			expect(result).to.be.null;
		});
	});
});
