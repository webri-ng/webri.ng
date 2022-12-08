import { Tag, UUID } from '../../model';
import { getRepository } from 'typeorm';
import { createRandomTagName } from './createRandomTagName';

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

	return getRepository(Tag).save(new Tag(tagName, createdBy));
}
