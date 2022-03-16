import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { User, Webring } from '../../model';
import { testUtils, userService, webringService } from '..';
import { search, SearchWebringsMethod } from './search';
import { siteConfig } from '../../config';
import dayjs = require('dayjs');
import { browse, SearchWebringsSort } from '.';


describe('Browse Webrings', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;

	let testDeletedWebring: Webring;
	const totalPublicPages = 3;
	const totalPublicWebrings = siteConfig.webringSearchPageLength * (totalPublicPages - 1) + 3;

	const totalPages = totalPublicPages + 1;
	const totalWebrings = siteConfig.webringSearchPageLength + totalPublicWebrings;


	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();

		for (let i = 0; i < totalWebrings; i++) {
			const randomDays = Math.ceil(Math.random() * totalWebrings);
			const dateCreated = dayjs().subtract(randomDays, 'days').toDate();

			await testUtils.insertTestWebring(testUser?.userId!, {
				private: i > (totalPublicWebrings - 1),
				dateCreated
			});
		}

		testDeletedWebring = await testUtils.insertTestWebring(testUser?.userId!, {
		});
		testDeletedWebring = await webringService.deleteWebring(testDeletedWebring?.ringId!);
	});


	after(async function afterTesting()
	{
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser?.userId!);
	});

	it('should correctly return all webrings', async function ()
	{
		const results = await search(SearchWebringsMethod.All);
		expect(results).to.not.be.undefined;
		expect(results.totalResults).to.equal(totalPublicWebrings);
		expect(results.currentPage).to.equal(1);
		expect(results.totalPages).to.equal(totalPublicPages);
		expect(results.webrings).to.have.length(siteConfig.webringSearchPageLength);
	});


	it('should correctly return private webrings', async function ()
	{
		const results = await search(SearchWebringsMethod.All, undefined, {
			returnPrivateWebrings: true
		});
		expect(results).to.not.be.undefined;
		expect(results.totalResults).to.equal(totalWebrings);
		expect(results.currentPage).to.equal(1);
		expect(results.totalPages).to.equal(totalPages);
		expect(results.webrings).to.have.length(siteConfig.webringSearchPageLength);
	});


	it('should not return deleted webrings', async function ()
	{
		const results = await search(SearchWebringsMethod.All, undefined, {
			returnPrivateWebrings: true,
			pageLength: totalWebrings
		});
		expect(results).to.not.be.undefined;
		expect(results.totalResults).to.equal(totalWebrings);
		expect(results.currentPage).to.equal(1);
		expect(results.totalPages).to.equal(1);
		expect(results.webrings).to.have.length(totalWebrings);
		expect(results.webrings.find((webring) => {
			return webring.ringId === testDeletedWebring.ringId
		})).to.be.undefined;
	});

	it('should correctly paginate results', async function ()
	{
		let results = await browse();

		expect(results).to.not.be.undefined;
		expect(results.totalResults).to.equal(totalPublicWebrings);
		expect(results.currentPage).to.equal(1);
		expect(results.totalPages).to.equal(totalPublicPages);
		expect(results.webrings).to.have.length(siteConfig.webringSearchPageLength);

		results = await browse({
			page: totalPublicPages
		});

		expect(results).to.not.be.undefined;
		expect(results.currentPage).to.equal(totalPublicPages);
		expect(results.totalResults).to.equal(totalPublicWebrings);
		expect(results.totalPages).to.equal(totalPublicPages);
		expect(results.webrings).to.have.length(3);
	});

	it('should correctly paginate results and return private webrings', async function ()
	{
		let results = await browse({
			returnPrivateWebrings: true
		});

		expect(results).to.not.be.undefined;
		expect(results.totalResults).to.equal(totalWebrings);
		expect(results.currentPage).to.equal(1);
		expect(results.totalPages).to.equal(totalPages);
		expect(results.webrings).to.have.length(siteConfig.webringSearchPageLength);

		results = await browse({
			page: totalPages,
			returnPrivateWebrings: true
		});

		expect(results).to.not.be.undefined;
		expect(results.currentPage).to.equal(totalPages);
		expect(results.totalResults).to.equal(totalWebrings);
		expect(results.totalPages).to.equal(totalPages);
		expect(results.webrings).to.have.length(3);
	});


	describe('Sorting', function () {
		it('should correctly sort results by date created', async function() {
			const results = await browse({
				sortBy: SearchWebringsSort.Created
			});

			expect(results).to.not.be.undefined;
			expect(results.currentPage).to.equal(1);
			expect(results.totalResults).to.equal(totalPublicWebrings);
			expect(results.webrings).to.have.length(siteConfig.webringSearchPageLength);

			let previousDate: Date = dayjs('2999-01-01').toDate();
			for (const webring of results.webrings) {
				expect(dayjs(webring.dateCreated).isBefore(previousDate)).to.be.true;
				previousDate = webring.dateCreated;
			}
		});

		it('should correctly sort results by date modified', async function() {
			const results = await browse({
				sortBy: SearchWebringsSort.Modified
			});

			expect(results).to.not.be.undefined;
			expect(results.currentPage).to.equal(1);
			expect(results.totalResults).to.equal(totalPublicWebrings);
			expect(results.webrings).to.have.length(siteConfig.webringSearchPageLength);

			let previousDate: Date = dayjs('2999-01-01').toDate();
			for (const webring of results.webrings) {
				expect(dayjs(webring.dateCreated).isBefore(previousDate)).to.be.true;
				previousDate = webring.dateCreated;
			}
		});
	});
});
