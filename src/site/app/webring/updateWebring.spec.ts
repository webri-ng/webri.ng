import * as dayjs from 'dayjs';
import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { Tag, User, Webring } from '../../model';
import { userService, testUtils } from '../';
import { createRandomString } from '../util';
import { InvalidIdentifierError, InvalidRingNameError, InvalidRingUrlError,
	RingUrlNotUniqueError, TooManyTagsError, WebringNotFoundError } from '../error';
import { webringConfig } from '../../config';
import { updateWebring } from './updateWebring';

chai.use(chaiAsPromised);

describe('Update webring', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testWebring: Webring;
	let testWebring2: Webring;
	let testExistingTag: Tag;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser?.userId!);
		testWebring2 = await testUtils.insertTestWebring(testUser?.userId!);
		testExistingTag = await testUtils.insertTestTag(testUser?.userId!);
	});


	after(async function tearDown()
	{
		await userService.deleteUser(testUser?.userId!);
	});


	it('should raise an exception if no webring id is provided', async function()
	{
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();

		return expect(updateWebring('', testUser?.userId!,
			name, url, 'description', false, [])).to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should raise an exception if an invalid webring id is provided', async function()
	{
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();

		return expect(updateWebring(testUtils.invalidUuid, testUser?.userId!,
			name, url, 'description', false, [])).to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should raise an exception if a nonexistent webring id is provided', async function()
	{
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();

		return expect(updateWebring(testUtils.dummyUuid, testUser?.userId!,
			name, url, 'description', false, [])).to.be.rejectedWith(WebringNotFoundError);
	});


	it('should raise an exception if an invalid name is provided', async function()
	{
		const name = '';
		const url = testUtils.createRandomWebringUrl();

		return expect(updateWebring(testWebring.ringId!, testUser?.userId!,
			name, url, 'description', false, [])).to.be.rejectedWith(InvalidRingNameError);
	});


	it('should raise an exception when passed a name that is too short', async function()
	{
		const name = Array(webringConfig.nameRequirements.minLength - 1).fill('n').join('');
		const url = testUtils.createRandomWebringUrl();

		return expect(updateWebring(testWebring.ringId!, testUser?.userId!,
			name, url, 'description', false, [])).to.be.rejectedWith(InvalidRingNameError);
	});


	it('should raise an exception when passed a name that is too long', async function()
	{
		const name = Array(webringConfig.nameRequirements.maxLength + 1).fill('n').join('');
		const url = testUtils.createRandomWebringUrl();

		return expect(updateWebring(testWebring.ringId!, testUser?.userId!,
			name, url, 'description', false, [])).to.be.rejectedWith(InvalidRingNameError);
	});


	it('should raise an exception if an existing webring URL is provided', async function()
	{
		const name = createRandomString();
		const url = testWebring2.url;

		return expect(updateWebring(testWebring.ringId!, testUser?.userId!,
			name, url, 'description', false, [])).to.be.rejectedWith(RingUrlNotUniqueError);
	});


	it('should raise an exception when passed a URL that is too short', async function()
	{
		const name = createRandomString();
		const url = Array(webringConfig.urlRequirements.minLength - 1).fill('n').join('');

		return expect(updateWebring(testWebring.ringId!, testUser?.userId!,
			name, url, 'description', false, [])).to.be.rejectedWith(InvalidRingUrlError);
	});


	it('should raise an exception when passed a URL that is too long', async function()
	{
		const name = createRandomString();
		const url = Array(webringConfig.urlRequirements.maxLength + 1).fill('n').join('');

		return expect(updateWebring(testWebring.ringId!, testUser?.userId!,
			name, url, 'description', false, [])).to.be.rejectedWith(InvalidRingUrlError);
	});


	it('should raise an exception if an empty URL is provided', async function()
	{
		const name = createRandomString();
		const url = '';

		return expect(updateWebring(testWebring.ringId!, testUser?.userId!,
			name, url, 'description', false, [])).to.be.rejectedWith(InvalidRingUrlError);
	});


	it('should raise an exception if more tags than the maximum allowed number is specified',
		async function()
	{
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();
		const tags = Array(webringConfig.maxTagCount + 1).map(() => createRandomString());

		return expect(updateWebring(testWebring.ringId!, testUser?.userId!,
			name, url, 'description', false, tags)).to.be.rejectedWith(TooManyTagsError);
	});


	it('should update a webring', async function()
	{
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();
		const description = createRandomString();

		testWebring = await updateWebring(testWebring.ringId!, testUser?.userId!,
			name, url, description, false, []);

		expect(testWebring.name).to.equal(name);
		expect(testWebring.url).to.equal(url);
		expect(testWebring.description).to.equal(description);
		expect(testWebring.createdBy).to.equal(testUser.userId);
		expect(testWebring.private).to.be.false;
		expect(dayjs(testWebring.dateCreated).isSame(testWebring.dateCreated)).to.be.true;
		expect(dayjs(testWebring.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(testWebring.dateDeleted).to.be.null;
		expect(testWebring.tags).to.have.length(0);
	});


	it('should normalise a webring name', async function()
	{
		const name = "    Anthony's webring";
		const url = testUtils.createRandomWebringUrl();
		const description = createRandomString();

		testWebring = await updateWebring(testWebring.ringId!, testUser?.userId!,
			name, url, description, false, []);

		expect(testWebring.name).to.equal("Anthony's webring");
		expect(testWebring.url).to.equal(url);
		expect(testWebring.description).to.equal(description);
		expect(testWebring.createdBy).to.equal(testUser.userId);
		expect(testWebring.private).to.be.false;
		expect(dayjs(testWebring.dateCreated).isSame(testWebring.dateCreated)).to.be.true;
		expect(dayjs(testWebring.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(testWebring.dateDeleted).to.be.null;
		expect(testWebring.tags).to.have.length(0);
	});


	it('should normalise a webring URL', async function()
	{
		const name = createRandomString();
		const url = '   test_url   ';
		const description = createRandomString();

		testWebring = await updateWebring(testWebring.ringId!, testUser?.userId!,
			name, url, description, false, []);

		expect(testWebring.name).to.equal(name);
		expect(testWebring.url).to.equal('test_url');
		expect(testWebring.description).to.equal(description);
		expect(testWebring.createdBy).to.equal(testUser.userId);
		expect(testWebring.private).to.be.false;
		expect(dayjs(testWebring.dateCreated).isSame(testWebring.dateCreated)).to.be.true;
		expect(dayjs(testWebring.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(testWebring.dateDeleted).to.be.null;
		expect(testWebring.tags).to.have.length(0);
	});


	it('should update a webring to add new tags', async function() {
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();
		const description = createRandomString();

		const tag1Text = createRandomString().toLowerCase();
		const tag2Text = createRandomString().toLowerCase();
		const tags = [tag1Text, tag2Text];

		testWebring = await updateWebring(testWebring.ringId!, testUser?.userId!,
			name, url, description, false, tags);

		expect(testWebring.name).to.equal(name);
		expect(testWebring.url).to.equal(url);
		expect(testWebring.description).to.equal(description);
		expect(testWebring.createdBy).to.equal(testUser.userId);
		expect(testWebring.private).to.be.false;
		expect(dayjs(testWebring.dateCreated).isSame(testWebring.dateCreated)).to.be.true;
		expect(dayjs(testWebring.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(testWebring.dateDeleted).to.be.null;
		expect(testWebring.tags).to.have.length(2);

		expect(testWebring.tags.find((tag) => tag.name === tag1Text)).to.not.be.undefined;
		expect(testWebring.tags.find((tag) => tag.name === tag2Text)).to.not.be.undefined;
	});


	it('should update a webring with existing tags', async function() {
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();
		const description = createRandomString();

		const tag1Text = createRandomString().toLowerCase();
		const tag2Text = testExistingTag.name;
		const tags = [tag1Text, tag2Text];

		testWebring = await updateWebring(testWebring.ringId!, testUser?.userId!,
			name, url, description, false, tags);

		expect(testWebring.name).to.equal(name);
		expect(testWebring.url).to.equal(url);
		expect(testWebring.description).to.equal(description);
		expect(testWebring.createdBy).to.equal(testUser.userId);
		expect(testWebring.private).to.be.false;
		expect(dayjs(testWebring.dateCreated).isSame(testWebring.dateCreated)).to.be.true;
		expect(dayjs(testWebring.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(testWebring.dateDeleted).to.be.null;
		expect(testWebring.tags).to.have.length(2);

		expect(testWebring.tags.find((tag) => tag.name === tag1Text)).to.not.be.undefined;
		expect(testWebring.tags.find((tag) => tag.tagId === testExistingTag.tagId))
			.to.not.be.undefined;
	});
});
