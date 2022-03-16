import { Tag, UUID } from '../../model';
import { getTag } from '.';
import { GetTagSearchField } from './getTag';
import { TagNameAlreadyExists } from '../error';
import { EntityManager, getRepository } from 'typeorm';


/** Additional options for the process. */
export type CreateTagOptions = {
	/**
	* The entity manager managing the transaction this will be run in.
	* If this option is specified, then the operation will be run with this manager.
	*/
	transactionalEntityManager?: EntityManager;
}


/**
 * Creates a tag entity.
 * @param {string} name - The name for the new tag.
 * @param {UUID} createdBy - The id of the creating user.
 * @param {CreateTagOptions} [options] Additional options for the creation process.
 * @returns The newly created tag.
 * @throws {TagNameAlreadyExists} If the specified tag name already exists.
 */
export async function createTag(name: Readonly<string>,
	createdBy: Readonly<UUID>,
	options: CreateTagOptions = {}): Promise<Tag>
{
	/**
	 * 'Normalised' tag name.
	 * This ensures that the tag name is stored in a valid format.
	 */
	const normalisedName = Tag.normaliseName(name);
	// Validate the normalised tag name. Raises an exception on validation failure.
	Tag.validateName(normalisedName);

	const existingTag = await getTag(GetTagSearchField.Name, normalisedName);
	if (existingTag) {
		throw new TagNameAlreadyExists(`Tag name '${normalisedName}' already exists`);
	}

	const newTag = new Tag(normalisedName, createdBy);

	if (options.transactionalEntityManager) {
		return options.transactionalEntityManager.save(newTag);
	}

	return getRepository(Tag).save(newTag);
}
