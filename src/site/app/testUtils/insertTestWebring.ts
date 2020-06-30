import { Tag, UUID, Webring } from '../../model';
import { getRepository } from 'typeorm';
import { createRandomString } from '../util';

/** Additional options for inserting a test webring. */
export interface InsertTestWebringOptions
{
	name?: Readonly<string>;
	description?: Readonly<string>;
	url?: Readonly<string>
	private?: Readonly<boolean>,
	tags?: Tag[]
}


/**
 * Inserts a Webring entity suitable for testing.
 * @param {InsertTestWebringOptions} [options] - Options for instantiating the test webring.
 * @returns The Webring entity
 */
export async function insertTestWebring(createdBy: Readonly<UUID>,
	options: InsertTestWebringOptions = {}): Promise<Webring>
{
	const name = options.name || Webring.normaliseName(createRandomString());
	const description = options.description || createRandomString();
	const url = options.url || Webring.normaliseUrl(createRandomString());
	const privateRing = options.private || false;

	const newWebring = new Webring(name, description, url, privateRing, createdBy);
	newWebring.tags = options.tags || [];

	return getRepository(Webring).save(newWebring);
}
