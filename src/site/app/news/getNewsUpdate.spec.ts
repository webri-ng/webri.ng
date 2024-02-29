import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import { testUtils } from '..';
import { appDataSource } from '../../infra/database';
import { NewsUpdate } from '../../model';
import { getNewsUpdate } from './getNewsUpdate';
import { dummyUuid, invalidUuid } from '../testUtils';
import { InvalidIdentifierError } from '../error';

describe('Get news update', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testNewsUpdate: NewsUpdate;

	before(async function beforeTesting()
	{
		testNewsUpdate = await appDataSource.getRepository(NewsUpdate)
			.save(new NewsUpdate(
				'Test news update',
				'Test news update content'
			));
	});


	after(async function tearDown()
	{
		testNewsUpdate.dateDeleted = new Date();

		await appDataSource.getRepository(NewsUpdate).save(testNewsUpdate);
	});


	it('should return the specified news update', async function ()
	{
		const newsUpdate = await getNewsUpdate(testNewsUpdate.updateId!);
		expect(newsUpdate?.updateId).to.equal(testNewsUpdate.updateId);
	});


	it('should return null when the news update does not exist', async function ()
	{
		const newsUpdate = await getNewsUpdate(dummyUuid);
		expect(newsUpdate).to.be.null;
	});


	it('should raise the appropriate error when an invalid id is specified',
	async function ()
	{
		return expect(getNewsUpdate(invalidUuid)).to.be
			.rejectedWith(InvalidIdentifierError);
	});
});
