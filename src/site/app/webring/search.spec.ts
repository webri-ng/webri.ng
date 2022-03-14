import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { Tag, User, Webring } from '../../model';
import { testUtils, userService, webringService } from '..';
import { InvalidIdentifierError } from '../error';
import { search, SearchWebringsMethod } from './search';
import { siteConfig } from '../../config';
import { EntityManager, getManager } from 'typeorm';
import dayjs = require('dayjs');
import { SearchWebringsSort } from '.';


describe('Search Webrings', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUser2: User;
	let testUser3: User;
	let testUser4: User;
	let testUser5: User;
	let testUser6: User;

	let testTag1: Tag;
	let testTag2: Tag;
	let testTag3: Tag;
	let testTag4: Tag;
	let testTag5: Tag;
	let testTag6: Tag;
	let testTag7: Tag;

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
		testUser5 = await testUtils.insertTestUser();
		testUser6 = await testUtils.insertTestUser();

		testTag1 = await testUtils.insertTestTag(testUser.userId || '');
		testTag2 = await testUtils.insertTestTag(testUser.userId || '');
		testTag3 = await testUtils.insertTestTag(testUser.userId || '');
		testTag4 = await testUtils.insertTestTag(testUser.userId || '');
		testTag5 = await testUtils.insertTestTag(testUser.userId || '');
		testTag6 = await testUtils.insertTestTag(testUser.userId || '');
		testTag7 = await testUtils.insertTestTag(testUser.userId || '');

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
		testUser5 = await userService.deleteUser(testUser5?.userId || '');
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
			expect(results.totalResults).to.equal(0);
			expect(results.currentPage).to.equal(1);
			expect(results.totalPages).to.equal(0);
			expect(results.webrings).to.have.length(0);
		});


		it('should correctly return an empty array if the specified tag does not exist',
			async function ()
		{
			const results = await search(SearchWebringsMethod.Tag, 'fffffffffffffffff');
			expect(results).to.not.be.undefined;
			expect(results.totalResults).to.equal(0);
			expect(results.currentPage).to.equal(1);
			expect(results.totalPages).to.equal(0);
			expect(results.webrings).to.have.length(0);
		});


		it('should correctly return an empty array if no webrings are tagged with this tag',
			async function ()
		{
			const results = await search(SearchWebringsMethod.Tag, testTag3.name);
			expect(results).to.not.be.undefined;
			expect(results.totalResults).to.equal(0);
			expect(results.currentPage).to.equal(1);
			expect(results.totalPages).to.equal(0);
			expect(results.webrings).to.have.length(0);
		});


		it('should correctly ignore deleted webrings', async function ()
		{
			const results = await search(SearchWebringsMethod.Tag, testTag4.name);
			expect(results).to.not.be.undefined;
			expect(results.totalResults).to.equal(0);
			expect(results.currentPage).to.equal(1);
			expect(results.totalPages).to.equal(0);
			expect(results.webrings).to.have.length(0);
		});


		it('should correctly ignore private webrings', async function ()
		{
			const results = await search(SearchWebringsMethod.Tag, testTag5.name);
			expect(results).to.not.be.undefined;
			expect(results.totalResults).to.equal(0);
			expect(results.currentPage).to.equal(1);
			expect(results.totalPages).to.equal(0);
			expect(results.webrings).to.have.length(0);
		});


		it('should return private webrings if specified', async function ()
		{
			const results = await search(SearchWebringsMethod.Tag, testTag5.name, {
				returnPrivateWebrings: true
			});
			expect(results).to.not.be.undefined;
			expect(results.totalResults).to.equal(1);
			expect(results.currentPage).to.equal(1);
			expect(results.totalPages).to.equal(1);
			expect(results.webrings).to.have.length(1);
		});


		it('should correctly return webrings tagged with a certain tag', async function ()
		{
			let results = await search(SearchWebringsMethod.Tag, testTag1.name);
			expect(results).to.not.be.undefined;
			expect(results.webrings).to.have.length(2);
			expect(results.webrings.find((ring) => ring.ringId === testWebring.ringId)).to.not.be.undefined;
			expect(results.webrings.find((ring) => ring.ringId === testWebring2.ringId)).to.not.be.undefined;

			results = await search(SearchWebringsMethod.Tag, testTag2.name);
			expect(results).to.not.be.undefined;
			expect(results.webrings).to.have.length(3);
			expect(results.webrings.find((ring) => ring.ringId === testWebring2.ringId)).to.not.be.undefined;
			expect(results.webrings.find((ring) => ring.ringId === testWebring3.ringId)).to.not.be.undefined;
			expect(results.webrings.find((ring) => ring.ringId === testWebring4.ringId)).to.not.be.undefined;
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
			return expect(search(SearchWebringsMethod.Creator, testUtils.invalidUuid))
				.to.be.rejectedWith(InvalidIdentifierError);
		});


		it('should correctly return an empty array if no match is found', async function ()
		{
			const results = await search(SearchWebringsMethod.Creator, testUtils.dummyUuid);
			expect(results).to.not.be.undefined;
			expect(results.totalResults).to.equal(0);
			expect(results.currentPage).to.equal(1);
			expect(results.totalPages).to.equal(0);
			expect(results.webrings).to.have.length(0);
		});


		it('should correctly return an empty array if the specified user has created no webrings',
			async function ()
		{
			const results = await search(SearchWebringsMethod.Creator, testUser3?.userId || '');
			expect(results).to.not.be.undefined;
			expect(results.totalResults).to.equal(0);
			expect(results.currentPage).to.equal(1);
			expect(results.totalPages).to.equal(0);
			expect(results.webrings).to.have.length(0);
		});


		it('should correctly ignore deleted webrings', async function ()
		{
			const results = await search(SearchWebringsMethod.Creator, testUser4.userId || '');
			expect(results).to.not.be.undefined;
			expect(results.totalResults).to.equal(0);
			expect(results.currentPage).to.equal(1);
			expect(results.totalPages).to.equal(0);
			expect(results.webrings).to.have.length(0);
		});


		it('should correctly ignore private webrings', async function ()
		{
			const results = await search(SearchWebringsMethod.Creator, testUser3.userId || '');
			expect(results).to.not.be.undefined;
			expect(results.totalResults).to.equal(0);
			expect(results.currentPage).to.equal(1);
			expect(results.totalPages).to.equal(0);
			expect(results.webrings).to.have.length(0);
		});


		it('should return private webrings if specified', async function ()
		{
			const results = await search(SearchWebringsMethod.Creator, testUser3.userId || '', {
				returnPrivateWebrings: true
			});
			expect(results).to.not.be.undefined;
			expect(results.totalResults).to.equal(1);
			expect(results.currentPage).to.equal(1);
			expect(results.totalPages).to.equal(1);
			expect(results.webrings).to.have.length(1);
		});


		it('should correctly return webrings created by a specified user', async function ()
		{
			let results = await search(SearchWebringsMethod.Creator, testUser?.userId || '');
			expect(results).to.not.be.undefined;
			expect(results.webrings).to.have.length(2);
			expect(results.webrings.find((ring) => ring.ringId === testWebring.ringId)).to.not.be.undefined;
			expect(results.webrings.find((ring) => ring.ringId === testWebring2.ringId)).to.not.be.undefined;

			results = await search(SearchWebringsMethod.Creator, testUser2?.userId || '');
			expect(results).to.not.be.undefined;
			expect(results.webrings).to.have.length(2);
			expect(results.webrings.find((ring) => ring.ringId === testWebring3.ringId)).to.not.be.undefined;
			expect(results.webrings.find((ring) => ring.ringId === testWebring4.ringId)).to.not.be.undefined;
		});


		it('should correctly search webrings in a transaction', async function ()
		{
			await getManager().transaction(async (transactionalEntityManager: EntityManager) => {
				let results = await search(SearchWebringsMethod.Creator, testUser?.userId || '', {
					transactionalEntityManager
				});
				expect(results).to.not.be.undefined;
				expect(results.totalResults).to.equal(2);
				expect(results.currentPage).to.equal(1);
				expect(results.totalPages).to.equal(1);
				expect(results.webrings).to.have.length(2);
				expect(results.webrings.find((ring) => ring.ringId === testWebring.ringId)).to.not.be.undefined;
				expect(results.webrings.find((ring) => ring.ringId === testWebring2.ringId)).to.not.be.undefined;
			});
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
			expect(results.webrings).to.have.length(0);
		});


		it('should correctly ignore deleted webrings', async function ()
		{
			const results = await search(SearchWebringsMethod.Name, testDeletedWebring.name);
			expect(results).to.not.be.undefined;
			expect(results.webrings).to.have.length(0);
		});


		it('should correctly ignore private webrings', async function ()
		{
			const results = await search(SearchWebringsMethod.Name, testPrivateWebring.name);
			expect(results).to.not.be.undefined;
			expect(results.webrings).to.have.length(0);
		});


		it('should return private webrings if specified', async function ()
		{
			const results = await search(SearchWebringsMethod.Name, testPrivateWebring.name, {
				returnPrivateWebrings: true
			});
			expect(results).to.not.be.undefined;
			expect(results.webrings).to.have.length(1);
		});


		it('should correctly return webrings by name', async function ()
		{
			let results = await search(SearchWebringsMethod.Name, 'Test Webri');
			expect(results).to.not.be.undefined;
			expect(results.webrings).to.have.length(2);
			expect(results.totalResults).to.equal(2);
			expect(results.searchMethod).to.equal(SearchWebringsMethod.Name);
			expect(results.searchTerm).to.equal('Test Webri');
			expect(results.webrings.find((ring) => ring.ringId === testWebring.ringId)).to.not.be.undefined;
			expect(results.webrings.find((ring) => ring.ringId === testWebring2.ringId)).to.not.be.undefined;

			results = await search(SearchWebringsMethod.Name, 'Webring');
			expect(results).to.not.be.undefined;
			expect(results.webrings).to.have.length(2);
			expect(results.totalResults).to.equal(2);
			expect(results.searchMethod).to.equal(SearchWebringsMethod.Name);
			expect(results.searchTerm).to.equal('Webring');
			expect(results.webrings.find((ring) => ring.ringId === testWebring.ringId)).to.not.be.undefined;
			expect(results.webrings.find((ring) => ring.ringId === testWebring2.ringId)).to.not.be.undefined;

			results = await search(SearchWebringsMethod.Name, 'ring');
			expect(results).to.not.be.undefined;
			expect(results.webrings).to.have.length(2);
			expect(results.totalResults).to.equal(2);
			expect(results.searchMethod).to.equal(SearchWebringsMethod.Name);
			expect(results.searchTerm).to.equal('ring');
			expect(results.webrings.find((ring) => ring.ringId === testWebring.ringId)).to.not.be.undefined;
			expect(results.webrings.find((ring) => ring.ringId === testWebring2.ringId)).to.not.be.undefined;

			results = await search(SearchWebringsMethod.Name, testWebring3.name);
			expect(results).to.not.be.undefined;
			expect(results.totalResults).to.equal(1);
			expect(results.webrings).to.have.length(1);
			expect(results.searchMethod).to.equal(SearchWebringsMethod.Name);
			expect(results.searchTerm).to.equal(testWebring3.name);
			expect(results.webrings.find((ring) => ring.ringId === testWebring3.ringId)).to.not.be.undefined;
		});
	});

	describe('Pagination', function () {
		let totalPublicPages = 3;
		const totalPublicWebrings = siteConfig.webringSearchPageLength * (totalPublicPages - 1) + 3;

		let totalPages = totalPublicPages + 1;
		const totalWebrings = siteConfig.webringSearchPageLength + totalPublicWebrings;

		before(async function beforeTesting() {
			for(let i = 0; i < totalWebrings; i++) {
				await testUtils.insertTestWebring(testUser5?.userId || '', {
					tags: [testTag6],
					private: i > (totalPublicWebrings - 1)
				});
			}
		});

		it('should correctly paginate results',
			async function ()
		{
			let results = await search(SearchWebringsMethod.Creator, testUser5.userId || '');

			expect(results).to.not.be.undefined;
			expect(results.totalResults).to.equal(totalPublicWebrings)
			expect(results.currentPage).to.equal(1);
			expect(results.totalPages).to.equal(totalPublicPages)
			expect(results.webrings).to.have.length(siteConfig.webringSearchPageLength);

			results = await search(SearchWebringsMethod.Creator, testUser5.userId || '', {
				page: totalPublicPages
			});

			expect(results).to.not.be.undefined;
			expect(results.currentPage).to.equal(totalPublicPages);
			expect(results.totalResults).to.equal(totalPublicWebrings)
			expect(results.totalPages).to.equal(totalPublicPages)
			expect(results.webrings).to.have.length(3);
		});

		it('should correctly paginate results and return private webrings',
			async function ()
		{
			let results = await search(SearchWebringsMethod.Creator, testUser5.userId || '', {
				returnPrivateWebrings: true
			});

			expect(results).to.not.be.undefined;
			expect(results.totalResults).to.equal(totalWebrings)
			expect(results.currentPage).to.equal(1);
			expect(results.totalPages).to.equal(totalPages)
			expect(results.webrings).to.have.length(siteConfig.webringSearchPageLength);

			results = await search(SearchWebringsMethod.Creator, testUser5.userId || '', {
				page: totalPages,
				returnPrivateWebrings: true
			});

			expect(results).to.not.be.undefined;
			expect(results.currentPage).to.equal(totalPages);
			expect(results.totalResults).to.equal(totalWebrings)
			expect(results.totalPages).to.equal(totalPages)
			expect(results.webrings).to.have.length(3);
		});


		it('should correctly paginate results when searching by tag',
			async function ()
		{
			let results = await search(SearchWebringsMethod.Tag, testTag6.name || '');

			expect(results).to.not.be.undefined;
			expect(results.currentPage).to.equal(1);
			expect(results.totalResults).to.equal(totalPublicWebrings)
			expect(results.totalPages).to.equal(totalPublicPages)
			expect(results.webrings).to.have.length(siteConfig.webringSearchPageLength);

			results = await search(SearchWebringsMethod.Tag, testTag6.name || '', {
				page: totalPublicPages
			});

			expect(results).to.not.be.undefined;
			expect(results.currentPage).to.equal(totalPublicPages);
			expect(results.totalResults).to.equal(totalPublicWebrings)
			expect(results.totalPages).to.equal(totalPublicPages)
			expect(results.webrings).to.have.length(3);
		});


		it('should correctly paginate results when searching by tag and return private webrings',
			async function ()
		{
			let results = await search(SearchWebringsMethod.Tag, testTag6.name || '', {
				returnPrivateWebrings: true
			});

			expect(results).to.not.be.undefined;
			expect(results.currentPage).to.equal(1);
			expect(results.totalPages).to.equal(totalPages)
			expect(results.totalResults).to.equal(totalWebrings)
			expect(results.webrings).to.have.length(siteConfig.webringSearchPageLength);

			results = await search(SearchWebringsMethod.Tag, testTag6.name || '', {
				page: totalPages,
				returnPrivateWebrings: true
			});

			expect(results).to.not.be.undefined;
			expect(results.currentPage).to.equal(totalPages);
			expect(results.totalResults).to.equal(totalWebrings)
			expect(results.totalPages).to.equal(totalPages)
			expect(results.webrings).to.have.length(3);
		});
	});


	describe('Sorting', function () {
		const totalWebrings = 20;

		before(async function beforeTesting() {
			for(let i = 0; i < totalWebrings; i++) {
				const randomDays = Math.ceil(Math.random() * totalWebrings);
				const dateCreated = dayjs().subtract(randomDays, 'days').toDate();

				await testUtils.insertTestWebring(testUser6?.userId || '', {
					tags: [testTag7],
					dateCreated
				});
			}
		});

		it('should correctly sort results by date created', async function() {
			let results = await search(SearchWebringsMethod.Creator, testUser6.userId || '', {
				sortBy: SearchWebringsSort.Created
			});

			expect(results).to.not.be.undefined;
			expect(results.currentPage).to.equal(1);
			expect(results.totalResults).to.equal(totalWebrings)
			expect(results.webrings).to.have.length(totalWebrings);

			let previousDate:Date = dayjs('2999-01-01').toDate();
			for(const webring of results.webrings) {
				expect(dayjs(webring.dateCreated).isBefore(previousDate)).to.be.true;
				previousDate = webring.dateCreated;
			}
		});

		it('should correctly sort results by date modified', async function() {
			let results = await search(SearchWebringsMethod.Creator, testUser6.userId || '', {
				sortBy: SearchWebringsSort.Modified
			});

			expect(results).to.not.be.undefined;
			expect(results.currentPage).to.equal(1);
			expect(results.totalResults).to.equal(totalWebrings)
			expect(results.webrings).to.have.length(totalWebrings);

			let previousDate:Date = dayjs('2999-01-01').toDate();
			for(const webring of results.webrings) {
				expect(dayjs(webring.dateCreated).isBefore(previousDate)).to.be.true;
				previousDate = webring.dateCreated;
			}
		});

		it('should correctly sort results by date created when searching by tag', async function() {
			let results = await search(SearchWebringsMethod.Tag, testTag7.name || '', {
				sortBy: SearchWebringsSort.Created
			});

			expect(results).to.not.be.undefined;
			expect(results.currentPage).to.equal(1);
			expect(results.totalResults).to.equal(totalWebrings)
			expect(results.webrings).to.have.length(totalWebrings);

			let previousDate:Date = dayjs('2999-01-01').toDate();
			for(const webring of results.webrings) {
				expect(dayjs(webring.dateCreated).isBefore(previousDate)).to.be.true;
				previousDate = webring.dateCreated;
			}
		});

		it('should correctly sort results by date modified when searching by tag', async function() {
			let results = await search(SearchWebringsMethod.Tag, testTag7.name || '', {
				sortBy: SearchWebringsSort.Modified
			});

			expect(results).to.not.be.undefined;
			expect(results.currentPage).to.equal(1);
			expect(results.totalResults).to.equal(totalWebrings)
			expect(results.webrings).to.have.length(totalWebrings);

			let previousDate:Date = dayjs('2999-01-01').toDate();
			for(const webring of results.webrings) {
				expect(dayjs(webring.dateCreated).isBefore(previousDate)).to.be.true;
				previousDate = webring.dateCreated;
			}
		});
	});
});
