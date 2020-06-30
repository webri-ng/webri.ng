import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { Tag, User, Webring } from '../../model';
import { testUtils, userService, webringService } from '..';
import { InvalidIdentifierError } from '../error';
import { search, SearchWebringsMethod } from './search';


describe('Search Webrings', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUser2: User;
	let testUser3: User;
	let testUser4: User;

	let testTag1: Tag;
	let testTag2: Tag;
	let testTag3: Tag;
	let testTag4: Tag;
	let testTag5: Tag;

	let testWebring: Webring;
	let testWebring2: Webring;
	let testWebring3: Webring;
	let testWebring4: Webring;
	let testPrivateWebring: Webring;
	let testDeletedWebring: Webring;


	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testUser2 = await testUtils.insertTestUser();
		testUser3 = await testUtils.insertTestUser();
		testUser4 = await testUtils.insertTestUser();

		testTag1 = await testUtils.insertTestTag(testUser.userId || '');
		testTag2 = await testUtils.insertTestTag(testUser.userId || '');
		testTag3 = await testUtils.insertTestTag(testUser.userId || '');
		testTag4 = await testUtils.insertTestTag(testUser.userId || '');
		testTag5 = await testUtils.insertTestTag(testUser.userId || '');

		testWebring = await testUtils.insertTestWebring(testUser?.userId || '', {
			name: 'Test Webring',
			tags: [testTag1]
		});
		testWebring2 = await testUtils.insertTestWebring(testUser?.userId || '', {
			name: 'Test Webring 2',
			tags: [testTag1, testTag2]
		});
		testWebring3 = await testUtils.insertTestWebring(testUser2?.userId || '', {
			tags: [testTag2]
		});
		testWebring4 = await testUtils.insertTestWebring(testUser2?.userId || '', {
			tags: [testTag2]
		});
		testPrivateWebring = await testUtils.insertTestWebring(testUser3?.userId || '', {
			private: true,
			tags: [testTag5]
		});
		testDeletedWebring = await testUtils.insertTestWebring(testUser4?.userId || '', {
			tags: [testTag4]
		});
		testDeletedWebring = await webringService.deleteWebring(testDeletedWebring?.ringId || '');
	});


	after(async function afterTesting()
	{
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser?.userId || '');
		testUser2 = await userService.deleteUser(testUser2?.userId || '');
		testUser3 = await userService.deleteUser(testUser3?.userId || '');
		testUser4 = await userService.deleteUser(testUser4?.userId || '');
	});


	describe('Search webring by tag', function () {
		it('should correctly raise an exception if an invalid tag name is provided',
			async function ()
		{
			return expect(search(SearchWebringsMethod.Tag, ''))
				.to.be.rejectedWith(InvalidIdentifierError);
		});


		it('should correctly return an empty array if no match is found', async function ()
		{
			const results = await search(SearchWebringsMethod.Tag, 'ffffffffffffffffffffffff');
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(0);
		});


		it('should correctly return an empty array if no webrings are tagged with this tag',
			async function ()
		{
			const results = await search(SearchWebringsMethod.Tag, testTag3.name);
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(0);
		});


		it('should correctly ignore deleted webrings', async function ()
		{
			const results = await search(SearchWebringsMethod.Tag, testTag4.name);
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(0);
		});


		it('should correctly ignore private webrings', async function ()
		{
			const results = await search(SearchWebringsMethod.Tag, testTag5.name);
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(0);
		});


		it('should correctly return webrings tagged with a certain tag', async function ()
		{
			let results = await search(SearchWebringsMethod.Tag, testTag1.name);
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(2);
			expect(results.find((ring) => ring.ringId === testWebring.ringId)).to.not.be.undefined;
			expect(results.find((ring) => ring.ringId === testWebring2.ringId)).to.not.be.undefined;

			results = await search(SearchWebringsMethod.Tag, testTag2.name);
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(3);
			expect(results.find((ring) => ring.ringId === testWebring2.ringId)).to.not.be.undefined;
			expect(results.find((ring) => ring.ringId === testWebring3.ringId)).to.not.be.undefined;
			expect(results.find((ring) => ring.ringId === testWebring4.ringId)).to.not.be.undefined;
		});
	});


	describe('Search webring by creator', function ()
	{
		it('should correctly raise an exception if no user id is provided', async function ()
		{
			return expect(search(SearchWebringsMethod.Creator, ''))
				.to.be.rejectedWith(InvalidIdentifierError);
		});


		it('should correctly raise an exception if an invalid user id is provided',
			async function ()
		{
			return expect(search(SearchWebringsMethod.Creator, testUtils.invalidUiid))
				.to.be.rejectedWith(InvalidIdentifierError);
		});


		it('should correctly return an empty array if no match is found', async function ()
		{
			const results = await search(SearchWebringsMethod.Creator, testUtils.dummyUuid);
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(0);
		});


		it('should correctly return an empty array if the specified user has created no webrings',
			async function ()
		{
			const results = await search(SearchWebringsMethod.Creator, testUser3?.userId || '');
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(0);
		});


		it('should correctly ignore deleted webrings', async function ()
		{
			const results = await search(SearchWebringsMethod.Creator, testUser4.userId || '');
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(0);
		});


		it('should correctly ignore private webrings', async function ()
		{
			const results = await search(SearchWebringsMethod.Creator, testUser3.userId || '');
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(0);
		});


		it('should correctly return webrings created by a specified user', async function ()
		{
			let results = await search(SearchWebringsMethod.Creator, testUser?.userId || '');
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(2);
			expect(results.find((ring) => ring.ringId === testWebring.ringId)).to.not.be.undefined;
			expect(results.find((ring) => ring.ringId === testWebring2.ringId)).to.not.be.undefined;

			results = await search(SearchWebringsMethod.Creator, testUser2?.userId || '');
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(2);
			expect(results.find((ring) => ring.ringId === testWebring3.ringId)).to.not.be.undefined;
			expect(results.find((ring) => ring.ringId === testWebring4.ringId)).to.not.be.undefined;
		});
	});


	describe('Search webring by name', function ()
	{
		it('should correctly raise an exception if no name is provided', async function ()
		{
			return expect(search(SearchWebringsMethod.Name, ''))
				.to.be.rejectedWith(InvalidIdentifierError);
		});


		it('should correctly return an empty array if no match is found', async function ()
		{
			const results = await search(SearchWebringsMethod.Name, 'fffffffffffffffff');
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(0);
		});


		it('should correctly ignore deleted webrings', async function ()
		{
			const results = await search(SearchWebringsMethod.Name, testDeletedWebring.name);
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(0);
		});


		it('should correctly ignore private webrings', async function ()
		{
			const results = await search(SearchWebringsMethod.Name, testPrivateWebring.name);
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(0);
		});


		it('should correctly return webrings by name', async function ()
		{
			let results = await search(SearchWebringsMethod.Name, 'Test Webri');
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(2);
			expect(results.find((ring) => ring.ringId === testWebring.ringId)).to.not.be.undefined;
			expect(results.find((ring) => ring.ringId === testWebring2.ringId)).to.not.be.undefined;

			results = await search(SearchWebringsMethod.Name, 'Webring');
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(2);
			expect(results.find((ring) => ring.ringId === testWebring.ringId)).to.not.be.undefined;
			expect(results.find((ring) => ring.ringId === testWebring2.ringId)).to.not.be.undefined;

			results = await search(SearchWebringsMethod.Name, 'ri');
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(2);
			expect(results.find((ring) => ring.ringId === testWebring.ringId)).to.not.be.undefined;
			expect(results.find((ring) => ring.ringId === testWebring2.ringId)).to.not.be.undefined;

			results = await search(SearchWebringsMethod.Name, testWebring3.name);
			expect(results).to.not.be.undefined;
			expect(results).to.have.length(1);
			expect(results.find((ring) => ring.ringId === testWebring3.ringId)).to.not.be.undefined;
		});
	});
});
