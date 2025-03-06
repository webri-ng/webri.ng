import { logger, tagService } from '..';
import {
	invalidRingUrlNotUniqueError,
	tooManyTagsError
} from '../../api/api-error-response';
import { webringConfig } from '../../config';
import { appDataSource } from '../../infra/database';
import { RequestMetadata, Tag, UUID, Webring } from '../../model';
import { RingUrlNotUniqueError, TooManyTagsError } from '../error';
import { GetTagSearchField } from '../tag';
import { getWebring } from '.';
import { GetWebringSearchField } from './getWebring';

/**
 * Creates the specified array of tags for a new webring.
 * This fetches any existing tags, and creates any nonexistent tags.
 */
async function createTags(createdBy: UUID, tagNames: string[]): Promise<Tag[]> {
	// Initialise the new webring's tag array.
	// @typeORM: Even though it's best not to initialise relation properties, e.g:
	// https://typeorm.io/#/relations-faq/avoid-relation-property-initializers
	// This won't cause any issues.
	const tags = [];

	// Parse the tag array, creating each tag if it doesn't already exist.
	for (const tagName of tagNames) {
		/** The 'normalised' version of the tag name. */
		const normalisedTagName = Tag.normaliseName(tagName);

		/** The specified tag to add to the new webring. */
		let tag = await tagService.getTag(
			GetTagSearchField.Name,
			normalisedTagName
		);
		// If the tag does not already exist, create it.
		if (!tag) {
			tag = await tagService.createTag(normalisedTagName, createdBy);
		}

		tags.push(tag);
	}

	return tags;
}

/**
 * Creates a new webring.
 * @param {string} name - The name for the webring.
 * @param {string} url - The url for the webring.
 * @param {string} description - The description for the webring.
 * @param {boolean} privateRing - Whether the ring should be considered 'private'.
 * @param {UUID} createdBy - The id of the authenticated user creating this webring.
 * @param {Tag[]} tags - The tags for the webring.
 * @param options - Additional options.
 * @returns The created webring entity.
 */
export async function createWebring(
	name: string,
	url: string,
	description: string,
	privateRing: boolean,
	createdBy: UUID,
	tags: string[],
	options?: Partial<{
		requestMetadata: RequestMetadata;
	}>
): Promise<Webring> {
	/**
	 * 'Normalised' webring URL.
	 * This ensures that the webring URL is stored in a valid format.
	 */
	const normalisedUrl = Webring.normaliseUrl(url);
	// Validate the normalised webring url. Raises an exception on validation failure.
	Webring.validateUrl(normalisedUrl);

	// If a webring exists with this URL, raise an exception.
	const existingWebring = await getWebring(
		GetWebringSearchField.Url,
		normalisedUrl
	);
	if (existingWebring) {
		throw new RingUrlNotUniqueError(
			invalidRingUrlNotUniqueError.message,
			invalidRingUrlNotUniqueError.code,
			invalidRingUrlNotUniqueError.httpStatus
		);
	}

	/**
	 * 'Normalised' webring name.
	 * This ensures that the webring name is stored in a valid format.
	 */
	const normalisedName = Webring.normaliseName(name);
	// Validate the normalised webring name. Raises an exception on validation failure.
	Webring.validateName(normalisedName);

	// Validate the number of tags is acceptable.
	if (tags.length > webringConfig.maxTagCount) {
		throw new TooManyTagsError(
			tooManyTagsError.message,
			tooManyTagsError.code,
			tooManyTagsError.httpStatus
		);
	}

	/** The newly created webring entity. */
	const newWebring: Webring = new Webring(
		normalisedName,
		description,
		normalisedUrl,
		privateRing,
		createdBy
	);

	newWebring.tags = await createTags(createdBy, tags);

	// Initialise the webring's moderators.
	newWebring.moderators = [];

	logger.info(`Created new webring`, {
		webringUrl: newWebring.url,
		webringId: newWebring.ringId,
		userId: createdBy,
		...(options?.requestMetadata ?? {})
	});

	return appDataSource.getRepository(Webring).save(newWebring);
}
