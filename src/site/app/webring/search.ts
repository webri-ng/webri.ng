import * as uuid from 'uuid';
import { EntityManager, FindConditions, getRepository, ILike, IsNull } from 'typeorm';
import { UUID, Webring } from '../../model';
import { InvalidIdentifierError } from '../error';
import { invalidIdentifierError } from '../../api/api-error-response';
import { tagService } from '..';
import { GetTagSearchField } from '../tag';
import { siteConfig } from '../../config';


/** Which search field to use when searching for webrings. */
export enum SearchWebringsMethod {
	Creator,
	Name,
	Tag
}


export enum SearchWebringsSort {
	Modified,
	Created
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
	/** The 'page' to return.  */
	page?: number;
	/** The length of each page. */
	pageLength?: number;
	sortBy?: SearchWebringsSort;
}


/**
 * A type to encapsulate the result set returned from a webring search operation.
 */
export interface SearchWebringsResults {
	totalResults: number;
	currentPage: number;
	totalPages: number;
	webrings: Webring[];
	searchMethod: SearchWebringsMethod;
	searchTerm: UUID | string;
}


/**
 * Searches the database for webrings matching specified criteria.
 * @param {SearchWebringsMethod} searchMethod The method by which to search for
 * matching webrings.
 * @param {UUID | string} searchTerm The term to search for according to this method.
 * @param {SearchWebringsOptions} [options] Additional options for the process.
 * @returns the found webrings, or an empty array if none found.
 * @throws {InvalidIdentifierError} If the provided identifier is invalid.
 */
export async function search(searchMethod: Readonly<SearchWebringsMethod>,
	searchTerm: Readonly<UUID | string>,
	options: Readonly<SearchWebringsOptions> = {}): Promise<SearchWebringsResults>
{
	/** The results to return from the search. */
	const results: SearchWebringsResults = {
		totalResults: 0,
		currentPage: options.page || 1,
		totalPages: 0,
		webrings: [],
		searchMethod,
		searchTerm
	}

	const resultsPerPage = options.pageLength || siteConfig.webringSearchPageLength;
	const skip = (results.currentPage - 1) * resultsPerPage;

	if (searchMethod === SearchWebringsMethod.Tag) {
		if (!searchTerm) {
			throw new InvalidIdentifierError('The provided tag is invalid',
				invalidIdentifierError.code, invalidIdentifierError.httpStatus);
		}

		const tag = await tagService.getTag(GetTagSearchField.Name, searchTerm);
		if(!tag) {
			return results;
		}

		const taggedWebrings = await tag?.taggedWebrings;
		if (!taggedWebrings.length) {
			return results;
		}

		const allTaggedWebrings = taggedWebrings.filter((webring) => {
			if (options.returnPrivateWebrings !== true && webring.private) {
				return false;
			}

			if (webring.dateDeleted) {
				return false;
			}

			return true;
		});

		results.totalResults = allTaggedWebrings.length;
		results.totalPages = Math.ceil(allTaggedWebrings.length / resultsPerPage);
		results.webrings = allTaggedWebrings.slice(skip, skip + resultsPerPage);
		return results;
	}


	/** The search conditions used to get the user entity. */
	const searchConditions: FindConditions<Webring> = {
		dateDeleted: IsNull(),
		private: false
	};

	if(options.returnPrivateWebrings === true) {
		delete searchConditions.private;
	}

	// Set the search criteria based on which search field is selected.
	if (searchMethod === SearchWebringsMethod.Name) {
		if (!searchTerm) {
			throw new InvalidIdentifierError('The provided webring name is invalid',
				invalidIdentifierError.code, invalidIdentifierError.httpStatus);
		}

		searchConditions.name = ILike(`%${searchTerm}%`);
	}

	if (searchMethod === SearchWebringsMethod.Creator) {
		if (!uuid.validate(searchTerm)) {
			throw new InvalidIdentifierError('The provided user id is invalid',
				invalidIdentifierError.code, invalidIdentifierError.httpStatus);
		}

		searchConditions.createdBy = searchTerm;
	}

	// If we have been passed a transaction manager, use this.
	if (options.transactionalEntityManager) {
		// Get the total count, to compute the total number of pages.
		results.totalResults = await options.transactionalEntityManager.count(Webring, searchConditions);
		results.webrings = await options.transactionalEntityManager.find(Webring, {
			where: searchConditions,
			skip,
			take: resultsPerPage
		});
	} else {
		// Get the total count, to compute the total number of pages.
		results.totalResults = await getRepository(Webring).count(searchConditions)
		results.webrings = await getRepository(Webring).find({
			where: searchConditions,
			skip,
			take: resultsPerPage
		});
	}

	results.totalPages = Math.ceil(results.totalResults / resultsPerPage);
	return results;
}
