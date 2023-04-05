import { Site, UUID } from '../../model';
import { createRandomString } from '../util';
import { createRandomSiteUrl } from '.';
import { appDataSource } from '../../infra/database';


/** Additional options for inserting a test site. */
export type InsertTestSiteOptions = {
	name?: string;
	url?: string;
	dateCreated?: Date;
}


/**
 * Inserts a site entity suitable for testing.
 * @param {UUID} webringId - The id of the parent webring.
 * @param {UUID} addedBy - The id of the adding user.
 * @param {InsertTestSiteOptions} [options] - Options for instantiating the test webring.
 * @returns The Webring entity
 */
export async function insertTestSite(webringId: UUID,
	addedBy: UUID,
	options: InsertTestSiteOptions = {}): Promise<Site>
{
	const name = options.name || Site.normaliseName(createRandomString());
	const url = options.url || createRandomSiteUrl();

	const newSite = new Site(name, url, webringId, addedBy);
	newSite.dateCreated = options.dateCreated || new Date();

	return appDataSource.getRepository(Site).save(newSite);
}
