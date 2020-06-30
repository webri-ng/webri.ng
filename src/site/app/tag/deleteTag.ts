import { Tag, UUID } from '../../model';
import { getRepository, EntityManager } from 'typeorm';
import { tagNotFoundError } from '../../api/api-error-response';
import { getTag, GetTagSearchField } from './getTag';
import { TagNotFoundError } from '../error';


/**
 * Additional options for the process.
 */
export interface DeleteTagOptions
{
	/**
	 * The effective date for the deletion.
	 * Defaults to the current date if not specified.
	 */
	deletionDate?: Date;

	/**
	 * The entity manager managing the transaction this will be run in.
	 * If this option is specified, then the operation will be run with this manager.
	 */
	transactionalEntityManager?: EntityManager;
}


/**
 * Soft-deletes a tag entity.
 * @async
 * @param {UUID} tagId - The id of the tag to delete.
 * @param {DeleteTagOptions} [options] - Additional options for the process.
 * @returns The deleted tag.
 * @throws {InvalidIdentifierError} If the supplied id is invalid.
 * @throws {TagNotFoundError} If the specified tag cannot be found.
 */
export async function deleteTag(tagId: UUID,
	options: DeleteTagOptions = {}): Promise<Tag>
{
	const tag: Tag | null = await getTag(GetTagSearchField.TagId, tagId, {
		transactionalEntityManager: options.transactionalEntityManager || undefined
	});
	if (!tag) {
		throw new TagNotFoundError(`Tag with id '${tagId}' cannot be found`,
			tagNotFoundError.code, tagNotFoundError.httpStatus);
	}

	const deletionDate: Date = options.deletionDate || new Date();

	tag.dateDeleted = deletionDate;
	tag.dateModified = new Date();

	if (options.transactionalEntityManager) {
		return options.transactionalEntityManager.save(tag);
	}

	return getRepository(Tag).save(tag);
}
