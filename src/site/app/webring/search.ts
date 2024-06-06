import * as uuid from 'uuid';
import { EntityManager, FindManyOptions, ILike, IsNull } from 'typeorm';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { appDataSource } from '../../infra/database';
import { UUID, Webring } from '../../model';
import { InvalidIdentifierError } from '../error';
import { invalidIdentifierError } from '../../api/api-error-response';
import { tagService } from '..';
import { GetTagSearchField } from '../tag';
import { siteConfig } from '../../config';
import dayjs = require('dayjs');


/** Which search field to use when searching for webrings. */
export enum SearchWebringsMethod {
	All,
	Creator,
	Name,
	Tag
}


export enum SearchWebringsSort {
	Alphabetical,
	Created,
	Modified
}


/** Additional options for the process. */
export type SearchWebringsOptions = {
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
export type SearchWebringsResults = {
	totalResults: number;
	currentPage: number;
	totalPages: number;
	webrings: Webring[];
	searchMethod: SearchWebringsMethod;
	searchTerm: UUID | string | undefined;
}


/**
 * Searches the database for webrings tagged with a certain tag.
 * This is called by the main search function, as the logic is entirely different for
 * tagged webrings.
 * @private
 * @param {SearchWebringsMethod} searchMethod The method by which to search for
 * matching webrings.
 * @param {UUID | string | undefined} searchTerm The term to search for according to this method.
 * @param {SearchWebringsOptions} [options] Additional options for the process.
 * @returns the found webrings, or an empty array if none found.
 * @throws {InvalidIdentifierError} If the provided identifier is invalid.
 */
async function searchTaggedWebrings(searchMethod: SearchWebringsMethod,
	searchTerm: UUID | string | undefined,
	options: SearchWebringsOptions): Promise<SearchWebringsResults>
{
	/** The results to return from the search. */
	const results: SearchWebringsResults = {
		totalResults: 0,
		currentPage: options.page || 1,
		totalPages: 0,
		webrings: [],
		searchMethod,
		searchTerm
	};

	const resultsPerPage = options.pageLength || siteConfig.webringSearchPageLength;
	const skip = (results.currentPage - 1) * resultsPerPage;

	if (!searchTerm) {
		throw new InvalidIdentifierError('The provided tag is invalid',
			invalidIdentifierError.code, invalidIdentifierError.httpStatus);
	}

	const tag = await tagService.getTag(GetTagSearchField.Name, searchTerm);
	if (!tag) {
		return results;
	}

	const allTaggedWebrings = await tag?.taggedWebrings;
	if (!allTaggedWebrings.length) {
		return results;
	}

	// Filter out deleted webrings, and private webrings, if selected.
	const taggedWebrings = allTaggedWebrings.filter((webring) => {
		if (options.returnPrivateWebrings !== true && webring.private) {
			return false;
		}

		if (webring.dateDeleted) {
			return false;
		}

		return true;
	});

	if (options.sortBy === SearchWebringsSort.Alphabetical) {
		taggedWebrings.sort((a, b) => a.name.localeCompare(b.name));
	}

	if (options.sortBy === SearchWebringsSort.Created) {
		taggedWebrings.sort((a, b) => dayjs(b.dateCreated).diff(a.dateCreated));
	}

	if (options.sortBy === SearchWebringsSort.Modified) {
		taggedWebrings.sort((a, b) => dayjs(b.dateModified).diff(a.dateModified));
	}

	results.totalResults = taggedWebrings.length;
	results.totalPages = Math.ceil(taggedWebrings.length / resultsPerPage);
	results.webrings = taggedWebrings.slice(skip, skip + resultsPerPage);
	return results;
}

/**
 * Searches the database for webrings matching specified criteria.
 * @param {SearchWebringsMethod} searchMethod The method by which to search for
 * matching webrings.
 * @param {UUID | string |undefined} searchTerm The term to search for according to this method.
 * @param {SearchWebringsOptions} [options] Additional options for the process.
 * @returns the found webrings, or an empty array if none found.
 * @throws {InvalidIdentifierError} If the provided identifier is invalid.
 */
export async function search(searchMethod: SearchWebringsMethod,
	searchTerm?: UUID | string | undefined,
	options: SearchWebringsOptions = {}): Promise<SearchWebringsResults>
{
	/** The results to return from the search. */
	const results: SearchWebringsResults = {
		totalResults: 0,
		currentPage: options.page || 1,
		totalPages: 0,
		webrings: [],
		searchMethod,
		searchTerm
	};

	if (searchMethod === SearchWebringsMethod.Tag) {
		return searchTaggedWebrings(searchMethod, searchTerm || '', options);
	}

	const resultsPerPage = options.pageLength || siteConfig.webringSearchPageLength;
	const skip = (results.currentPage - 1) * resultsPerPage;

	/** The search conditions used to get the user entity. */
	const searchConditions: FindOptionsWhere<Webring> = {
		dateDeleted: IsNull(),
		private: false
	};

	if (options.returnPrivateWebrings === true) {
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
		if (!uuid.validate(searchTerm || '')) {
			throw new InvalidIdentifierError('The provided user id is invalid',
				invalidIdentifierError.code, invalidIdentifierError.httpStatus);
		}

		searchConditions.createdBy = searchTerm;
	}

	/**
	 * Query conditions object.
	 * This is where the final database query is constructed.
	 */
	const queryOptions: FindManyOptions<Webring> = {
		where: searchConditions,
		skip,
		take: resultsPerPage,
		order: undefined
	};

	queryOptions.order = {};
	if (options.sortBy === SearchWebringsSort.Alphabetical) {
		queryOptions.order.name = 'ASC';
	}

	if (options.sortBy === SearchWebringsSort.Created) {
		queryOptions.order.dateCreated = 'DESC';
	}

	if (options.sortBy === SearchWebringsSort.Modified) {
		queryOptions.order.dateModified = 'DESC';
	}

	// If we have been passed a transaction manager, use this.
	if (options.transactionalEntityManager) {
		// Get the total count, to compute the total number of pages.
		const [webrings, totalResults] = await options.transactionalEntityManager
			.findAndCount(Webring, queryOptions);

		results.totalResults = totalResults;
		results.webrings = webrings;
	} else {
		// Get the total count, to compute the total number of pages.
		const [webrings, totalResults] = await appDataSource.getRepository(Webring)
			.findAndCount(queryOptions);

		results.totalResults = totalResults;
		results.webrings = webrings;
	}

	results.totalPages = Math.ceil(results.totalResults / resultsPerPage);
	return results;
}
