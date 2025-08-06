import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import { tagService, testUtils, userService } from '..';
import { Tag, User } from '../../model';
import { getOrCreateWebringTags } from './getOrCreateWebringTags';

describe('getOrCreateWebringTags', function () {
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testTag: Tag;
	let testTag2: Tag;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
		testTag = await testUtils.insertTestTag(testUser.userId!);
	});

	after(async function tearDown() {
		await userService.deleteUser(testUser.userId!);

		await tagService.deleteTag(testTag.tagId!);
		await tagService.deleteTag(testTag2.tagId!);
	});

	it('should create a new tag if the tag does not already exist', async function () {
		const testTagName = testUtils.createRandomTagName();
		const tagNames = [testTagName];
		const tags = await getOrCreateWebringTags(testUser.userId!, tagNames);
		expect(tags).to.have.lengthOf(1);
		expect(tags[0].name).to.equal(tagNames[0]);

		testTag2 = tags[0];
	});

	it('should add an existing tag', async function () {
		const tagNames = [testTag.name];
		const tags = await getOrCreateWebringTags(testUser.userId!, tagNames);
		expect(tags).to.have.lengthOf(1);
		expect(tags[0].name).to.equal(tagNames[0]);
		expect(tags[0].tagId).to.equal(testTag.tagId);
	});
});
