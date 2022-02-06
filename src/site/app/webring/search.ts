import * as uuid from 'uuid';
import { EntityManager, FindConditions, getRepository, ILike, IsNull } from 'typeorm';
import { UUID, Webring } from '../../model';
import { InvalidIdentifierError } from '../error';
import { invalidIdentifierError } from '../../api/api-error-response';
import { tagService } from '..';
import { GetTagSearchField } from '../tag';


/** Which search field to use when searching for webrings. */
export enum SearchWebringsMethod {
	Creator,
	Name,
	Tag
}

/** Additional options for the process. */
export interface SearchWebringsOptions {
	/**
	* The entity manager managing the transaction the process will be run in.
	* If this option is specified, then the operation will be run with this manager.
	*/
	transactionalEntityManager?: EntityManager;
	/** Whether to return private webrings. */
	returnPrivateWebrings?: boolean;
}

/**
 * Searches the database for webrings matching specified criteria..
 * @param {SearchWebringsMethod} searchMethod - The method by which to search for
 * matching webrings.
 * @param {UUID | string} identifier - The identifier to search for according to this method.
 * @param {SearchWebringsOptions} [options] - Additional options for the process.
 * @returns the found webrings, or an empty array if none found.
 * @throws {InvalidIdentifierError} - If the provided identifier is invalid.
 */
export async function search(searchMethod: Readonly<SearchWebringsMethod>,
	identifier: Readonly<UUID | string>,
	options: Readonly<SearchWebringsOptions> = {}): Promise<Webring[]>
{
	if (searchMethod === SearchWebringsMethod.Tag) {
		if (!identifier) {
			throw new InvalidIdentifierError('The provided tag is invalid',
				invalidIdentifierError.code, invalidIdentifierError.httpStatus);
		}

		const tag = await tagService.getTag(GetTagSearchField.Name, identifier);
		const taggedWebrings = await tag?.taggedWebrings;
		if (!taggedWebrings) {
			return [];
		}

		return taggedWebrings.filter((webring) => {
			if(options.returnPrivateWebrings !== true && webring.private) {
				return false;
			}

			if (webring.dateDeleted) {
				return false;
			}

			return true;
		});
	}


	/** The search conditions used to get the user entity. */
	const searchConditions: FindConditions<Webring> = {
		dateDeleted: IsNull(),
	};

	// Set the search criteria based on which search field is selected.
	if (searchMethod === SearchWebringsMethod.Name) {
		if (!identifier) {
			throw new InvalidIdentifierError('The provided webring name is invalid',
				invalidIdentifierError.code, invalidIdentifierError.httpStatus);
		}

		searchConditions.name = ILike(`%${identifier}%`);
	} else if (searchMethod === SearchWebringsMethod.Creator) {
		if (!uuid.validate(identifier)) {
			throw new InvalidIdentifierError('The provided user id is invalid',
				invalidIdentifierError.code, invalidIdentifierError.httpStatus);
		}

		searchConditions.createdBy = identifier;
	}

	let webringResuls: Webring[];

	// If we have been passed a transaction manager, use this.
	if (options.transactionalEntityManager) {
		webringResuls = await options.transactionalEntityManager.find(Webring, searchConditions);
	} else {
		webringResuls = await getRepository(Webring).find(searchConditions);
	}

	return webringResuls.filter((webring) => {
		if(options.returnPrivateWebrings !== true && webring.private) {
			return false;
		}

		return true;
	});
}
