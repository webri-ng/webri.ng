import { Tag, UUID } from '../../model';
import { createRandomTagName } from './createRandomTagName';
import { appDataSource } from '../../infra/database';

/**
 * Inserts a Tag entity suitable for testing.
 * @param {InsertTestTagOptions} [options] - Options for instantiating the test tag.
 * @returns The Tag entity
 */
export async function insertTestTag(createdBy: UUID,
	name?: string): Promise<Tag>
{
	let tagName = createRandomTagName();
	if (name) {
		tagName = Tag.normaliseName(name);
	}

	return appDataSource.getRepository(Tag).save(new Tag(tagName, createdBy));
}
