import * as dayjs from 'dayjs';
import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { Tag, User, Webring } from '../../model';
import { userService, testUtils } from '../';
import { createWebring } from './createWebring';
import { createRandomString } from '../util';
import { InvalidRingNameError, InvalidRingUrlError,
	RingUrlNotUniqueError, TooManyTagsError } from '../error';
import { webringConfig } from '../../config';

chai.use(chaiAsPromised);

describe('Create new webring', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testWebring: Webring;
	let testExistingWebring: Webring;
	let testExistingTag: Tag;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testExistingWebring = await testUtils.insertTestWebring(testUser?.userId || '');
		testExistingTag = await testUtils.insertTestTag(testUser?.userId || '');
	});


	after(async function tearDown()
	{
		await userService.deleteUser(testUser?.userId || '');
	});


	it('should raise an exception if an invalid name is provided', async function()
	{
		const name = '';
		const url = testUtils.createRandomWebringUrl();

		return expect(createWebring(name, url, 'description', false,
			testUser?.userId || '', [])).to.be.rejectedWith(InvalidRingNameError);
	});


	it('should raise an exception when passed a name that is too short', async function()
	{
		const name = Array(webringConfig.nameRequirements.minLength - 1).fill('n').join('');
		const url = testUtils.createRandomWebringUrl();

		return expect(createWebring(name, url, 'description', false,
			testUser?.userId || '', [])).to.be.rejectedWith(InvalidRingNameError);
	});


	it('should raise an exception when passed a name that is too long', async function()
	{
		const name = Array(webringConfig.nameRequirements.maxLength + 1).fill('n').join('');
		const url = testUtils.createRandomWebringUrl();

		return expect(createWebring(name, url, 'description', false,
			testUser?.userId || '', [])).to.be.rejectedWith(InvalidRingNameError);
	});


	it('should raise an exception if an existing webring URL is provided', async function()
	{
		const name = createRandomString();
		const url = testExistingWebring.url;

		return expect(createWebring(name, url, 'description', false,
			testUser?.userId || '', [])).to.be.rejectedWith(RingUrlNotUniqueError);
	});


	it('should raise an exception when passed a URL that is too short', async function()
	{
		const name = createRandomString();
		const url = Array(webringConfig.urlRequirements.minLength - 1).fill('n').join('');

		return expect(createWebring(name, url, 'description', false,
			testUser?.userId || '', [])).to.be.rejectedWith(InvalidRingUrlError);
	});


	it('should raise an exception when passed a URL that is too long', async function()
	{
		const name = createRandomString();
		const url = Array(webringConfig.urlRequirements.maxLength + 1).fill('n').join('');

		return expect(createWebring(name, url, 'description', false,
			testUser?.userId || '', [])).to.be.rejectedWith(InvalidRingUrlError);
	});


	it('should raise an exception if an invalid URL is provided', async function()
	{
		const name = createRandomString();
		const url = '';

		return expect(createWebring(name, url, 'description', false,
			testUser?.userId || '', [])).to.be.rejectedWith(InvalidRingUrlError);
	});


	it('should raise an exception if more tags than the maximum allowed number is specified',
		async function()
	{
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();
		const tags = Array(webringConfig.maxTagCount + 1).fill('').map(() => createRandomString());

		return expect(createWebring(name, url, 'description', false,
			testUser?.userId || '', tags)).to.be.rejectedWith(TooManyTagsError);
	});


	it('should create a webring', async function()
	{
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();

		testWebring = await createWebring(name, url, 'description', false,
			testUser?.userId || '', []);

		expect(testWebring.name).to.equal(name);
		expect(testWebring.url).to.equal(url);
		expect(testWebring.createdBy).to.equal(testUser.userId);
		expect(testWebring.private).to.be.false;
		expect(dayjs(testWebring.dateCreated).isSame(new Date(), 'hour')).to.be.true;
		expect(dayjs(testWebring.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(testWebring.dateDeleted).to.be.null;
		expect(testWebring.tags).to.have.length(0);
	});


	it('should normalise a webring name', async function()
	{
		const name = "    Anthony's webring";
		const url = testUtils.createRandomWebringUrl();

		testWebring = await createWebring(name, url, 'description', false,
			testUser?.userId || '', []);

		expect(testWebring.name).to.equal("Anthony's webring");
		expect(testWebring.url).to.equal(url);
		expect(testWebring.createdBy).to.equal(testUser.userId);
		expect(testWebring.private).to.be.false;
		expect(dayjs(testWebring.dateCreated).isSame(new Date(), 'hour')).to.be.true;
		expect(dayjs(testWebring.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(testWebring.dateDeleted).to.be.null;
		expect(testWebring.tags).to.have.length(0);
	});


	it('should normalise a webring URL', async function()
	{
		const name = createRandomString();
		const url = '   test_url   ';

		testWebring = await createWebring(name, url, 'description', false,
			testUser?.userId || '', []);

		expect(testWebring.name).to.equal(name);
		expect(testWebring.url).to.equal('test_url');
		expect(testWebring.createdBy).to.equal(testUser.userId);
		expect(testWebring.private).to.be.false;
		expect(dayjs(testWebring.dateCreated).isSame(new Date(), 'hour')).to.be.true;
		expect(dayjs(testWebring.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(testWebring.dateDeleted).to.be.null;
		expect(testWebring.tags).to.have.length(0);
	});


	it('should create a webring with new tags', async function() {
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();

		const tag1Text = createRandomString().toLowerCase();
		const tag2Text = createRandomString().toLowerCase();

		testWebring = await createWebring(name, url, 'description', false,
			testUser?.userId || '', [tag1Text, tag2Text]);

		expect(testWebring.name).to.equal(name);
		expect(testWebring.url).to.equal(url);
		expect(testWebring.createdBy).to.equal(testUser.userId);
		expect(testWebring.private).to.be.false;
		expect(dayjs(testWebring.dateCreated).isSame(new Date(), 'hour')).to.be.true;
		expect(dayjs(testWebring.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(testWebring.dateDeleted).to.be.null;
		expect(testWebring.tags).to.have.length(2);

		expect(testWebring.tags.find((tag) => tag.name === tag1Text)).to.not.be.undefined;
		expect(testWebring.tags.find((tag) => tag.name === tag2Text)).to.not.be.undefined;
	});


	it('should create a webring with existing tags', async function() {
		const name = createRandomString();
		const url = testUtils.createRandomWebringUrl();

		const tag1Text = createRandomString().toLowerCase();
		const tag2Text = testExistingTag.name;

		testWebring = await createWebring(name, url, 'description', false,
			testUser?.userId || '', [tag1Text, tag2Text]);

		expect(testWebring.name).to.equal(name);
		expect(testWebring.url).to.equal(url);
		expect(testWebring.createdBy).to.equal(testUser.userId);
		expect(testWebring.private).to.be.false;
		expect(dayjs(testWebring.dateCreated).isSame(new Date(), 'hour')).to.be.true;
		expect(dayjs(testWebring.dateModified).isSame(new Date(), 'hour')).to.be.true;
		expect(testWebring.dateDeleted).to.be.null;
		expect(testWebring.tags).to.have.length(2);

		expect(testWebring.tags.find((tag) => tag.name === tag1Text)).to.not.be.undefined;
		expect(testWebring.tags.find((tag) => tag.tagId === testExistingTag.tagId))
			.to.not.be.undefined;
	});
});
