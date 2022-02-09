import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { Tag, User } from '../../model';
import { testUtils, userService } from '../';
import { InvalidIdentifierError } from '../error';
import { getTag, GetTagSearchField } from '.';
import { EntityManager, getManager } from 'typeorm';
import { deleteTag } from './deleteTag';


describe('Get tag', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testTag: Tag;
	let testTag2: Tag;
	let testDeletedTag: Tag;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testTag = await testUtils.insertTestTag(testUser?.userId || '');
		testTag2 = await testUtils.insertTestTag(testUser?.userId || '');
		testDeletedTag = await testUtils.insertTestTag(testUser?.userId || '');
		testDeletedTag = await deleteTag(testDeletedTag?.tagId || '');
	});


	after(async function afterTesting()
	{
		testUser = await userService.deleteUser(testUser?.userId || '');
	});


	it('should get a tag within a transaction', async function ()
	{
		await getManager().transaction(async (transactionalEntityManager: EntityManager) => {
			const result = await getTag(GetTagSearchField.TagId, testTag?.tagId || '', {
				transactionalEntityManager
			});

			expect(result).to.not.be.null;
			expect(result?.tagId).to.equal(testTag?.tagId);
		});
	});


	describe('Get tag by id', function () {
		it('should throw an exception when passed an empty tag id', async function ()
		{
			return expect(getTag(GetTagSearchField.TagId,
				'')).to.be.rejectedWith(InvalidIdentifierError);
		});


		it('should throw an exception when passed an invalid tag id', async function ()
		{
			return expect(getTag(GetTagSearchField.TagId,
				testUtils.invalidUuid)).to.be.rejectedWith(InvalidIdentifierError);
		});


		it('should correctly get a tag by their id', async function ()
		{
			const result = await getTag(GetTagSearchField.TagId, testTag?.tagId || '');

			expect(result).to.not.be.null;
			expect(result?.tagId).to.equal(testTag?.tagId);
		});


		it('should correctly ignore a deleted tag', async function ()
		{
			const result = await getTag(GetTagSearchField.TagId, testDeletedTag?.tagId || '');

			expect(result).to.be.null;
		});
	});


	describe('Get tag by name', function () {
		it('should throw an exception when passed an invalid name', async function ()
		{
			return expect(getTag(GetTagSearchField.Name, '')).to.be.rejectedWith(InvalidIdentifierError);
		});


		it('should correctly get a tag by its name', async function ()
		{
			const result = await getTag(GetTagSearchField.Name, testTag2?.name || '');

			expect(result).to.not.be.null;
			expect(result?.tagId).to.equal(testTag2?.tagId);
		});


		it('should correctly ignore a deleted tag', async function ()
		{
			const result = await getTag(GetTagSearchField.Name, testDeletedTag?.name || '');

			expect(result).to.be.null;
		});
	});
});
