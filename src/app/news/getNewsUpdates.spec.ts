import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import { testUtils } from '..';
import { getNewsUpdates } from './getNewsUpdates';
import { NewsUpdate } from '../../model';
import { appDataSource } from '../../infra/database';

describe('Get news updates', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testNewsUpdate: NewsUpdate;
	let testNewsUpdate2: NewsUpdate;
	let testNewsUpdateList: NewsUpdate[];

	before(async function beforeTesting()
	{
		testNewsUpdate = await appDataSource.getRepository(NewsUpdate)
			.save(new NewsUpdate(
				'Test news update',
				'Test news update content'
			));

		testNewsUpdate2 = await appDataSource.getRepository(NewsUpdate)
			.save(new NewsUpdate(
				'Test news update',
				'Test news update content'
			));

		testNewsUpdateList = await getNewsUpdates();
	});


	after(async function tearDown()
	{
		testNewsUpdate.dateDeleted = new Date();
		testNewsUpdate2.dateDeleted = new Date();

		await appDataSource.getRepository(NewsUpdate).save(testNewsUpdate);
		await appDataSource.getRepository(NewsUpdate).save(testNewsUpdate2);
	});


	it('should return a list of news updates', function()
	{
		expect(testNewsUpdateList).to.be.an('array');
		expect(testNewsUpdateList.length).to.equal(2);
	});


	it('should return updates in descending date order', function()
	{
		expect(testNewsUpdateList[0].dateCreated)
			.to.be.greaterThan(testNewsUpdateList[1].dateCreated);
	});
});
