import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { Tag, User } from '../../model';
import { userService, testUtils, tagService } from '../';
import { createTag } from './createTag';
import { InvalidTagNameError, TagNameAlreadyExists } from '../error';
import { appDataSource } from '../../infra/database';

chai.use(chaiAsPromised);

describe('Tag creation', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testExistingTag: Tag;
	let testTag: Tag;
	let testTag2: Tag;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testExistingTag = await testUtils.insertTestTag(testUser.userId!);
	});


	after(async function tearDown()
	{
		await userService.deleteUser(testUser.userId!);
		await tagService.deleteTag(testTag.tagId!);
		await tagService.deleteTag(testTag2.tagId!);
	});


	it('should raise an exception when no name is provided', async function() {
		return expect(createTag('', testUser.userId!))
			.to.be.rejectedWith(InvalidTagNameError);
	});

	it('should raise an exception when an invalid name is provided', async function() {
		return expect(createTag('ff ff', testUser.userId!))
			.to.be.rejectedWith(InvalidTagNameError);
	});


	it('should raise an exception when an existing name is provided', async function() {
		return expect(createTag(testExistingTag.name, testUser.userId!))
			.to.be.rejectedWith(TagNameAlreadyExists);
	});


	it('should create a tag within a transaction', async function() {
		await appDataSource.transaction(async (transactionalEntityManager) => {
			const tagName = `testtag${Date.now()}`;

			testTag = await createTag(tagName, testUser.userId!, {
				transactionalEntityManager
			});

			expect(testTag).to.not.be.null;
			expect(testTag.name).to.equal(tagName);
			expect(testTag.createdBy).to.equal(testUser?.userId);
		});
	});


	it('should create a tag', async function() {
		const tagName = `testtag${Date.now()}`;

		testTag2 = await createTag(tagName, testUser.userId!);

		expect(testTag2).to.not.be.null;
		expect(testTag2.name).to.equal(tagName);
		expect(testTag2.createdBy).to.equal(testUser?.userId);
	});
});
