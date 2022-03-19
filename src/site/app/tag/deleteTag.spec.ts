import * as dayjs from 'dayjs';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { InvalidIdentifierError, TagNotFoundError } from '../error';
chai.use(chaiAsPromised);

import { Tag, User } from '../../model';

import { testUtils } from '../';
import { deleteTag } from '.';
import { EntityManager, getManager } from 'typeorm';


describe('Tag soft-deletion', function() {
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testTag: Tag;
	let testTag2: Tag;
	let testTag3: Tag;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
		testTag = await testUtils.insertTestTag(testUser.userId!);
		testTag2 = await testUtils.insertTestTag(testUser.userId!);
		testTag3 = await testUtils.insertTestTag(testUser.userId!);
	});


	it('should throw an exception when passed an empty tagId', async function() {
		return expect(deleteTag('')).to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should throw an exception when passed a nonexistent tagId', async function() {
		return expect(deleteTag(testUtils.dummyUuid)).to.be.rejectedWith(TagNotFoundError);
	});


	it('should correctly delete a tag', async function() {
		const deletedTag = await deleteTag(testTag.tagId!);

		expect(deletedTag.dateDeleted).to.not.be.null;
		expect(dayjs(deletedTag.dateDeleted).isSame(dayjs(), 'minute')).to.be.true;
	});


	it('should correctly delete a tag at an arbitrary date', async function() {
		const deletionDate = new Date();
		const deletedTag = await deleteTag(testTag2.tagId!, {
			deletionDate
		});

		expect(deletedTag.dateDeleted).to.not.be.null;
		expect(dayjs(deletedTag.dateDeleted).isSame(deletionDate)).to.be.true;
	});


	it('should correctly delete a tag within a transaction', async function() {
		await getManager().transaction(async (transactionalEntityManager: EntityManager) => {
			const deletionDate = new Date();
			const deletedTag = await deleteTag(testTag3.tagId!, {
				deletionDate,
				transactionalEntityManager
			});

			expect(deletedTag.dateDeleted).to.not.be.null;
			expect(dayjs(deletedTag.dateDeleted).isSame(deletionDate)).to.be.true;
		});
	});
});
