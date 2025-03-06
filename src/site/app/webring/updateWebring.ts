import { getWebring, GetWebringSearchField } from '.';
import { logger, tagService } from '..';
import {
	invalidRingUrlNotUniqueError,
	tooManyTagsError,
	webringNotFoundError
} from '../../api/api-error-response';
import { webringConfig } from '../../config';
import { appDataSource } from '../../infra/database';
import { RequestMetadata, Tag, UUID, Webring } from '../../model';
import {
	RingUrlNotUniqueError,
	TooManyTagsError,
	WebringNotFoundError
} from '../error';
import { GetTagSearchField } from '../tag';

/**
 * Updates an already existing webring.
 * @param {UUID} webringId - The id of the webring being edited.
 * @param {User} editingUserId - The id of the authenticated user doing the editing.
 * @param {string} name - The new name for the webring.
 * @param {string} url - The new url for the webring.
 * @param {string} description - The new description for the webring.
 * @param {boolean} privateRing - Whether the ring should be considered 'private'.
 * @param {Tag[]} tags - The new tags for the webring.
 * @param options - Additional options for the request
 * @returns The updated webring entity.
 */
export async function updateWebring(
	webringId: UUID,
	editingUserId: UUID,
	name: string,
	url: string,
	description: string,
	privateRing: boolean,
	tags: string[],
	options?: Partial<{
		requestMetadata: RequestMetadata;
	}>
): Promise<Webring> {
	// Ensure that the specified webring exists.
	const webring = await getWebring(GetWebringSearchField.RingId, webringId);
	if (!webring) {
		throw new WebringNotFoundError(
			`Webring with id '${webringId}' cannot be found.`,
			webringNotFoundError.code,
			webringNotFoundError.httpStatus
		);
	}

	/**
	 * 'Normalised' webring URL.
	 * This ensures that the webring URL is stored in a valid format.
	 */
	const normalisedUrl = Webring.normaliseUrl(url);
	// Validate the normalised webring url. Raises an exception on validation failure.
	Webring.validateUrl(normalisedUrl);

	// If a webring exists with this URL, raise an exception.
	// Ensure that the matching webring is not the webring being edited.
	const existingWebring = await getWebring(
		GetWebringSearchField.Url,
		normalisedUrl
	);
	if (existingWebring && existingWebring.ringId !== webringId) {
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

	// Set the webring's tags.
	// @typeORM: Even though it's best not to initialise relation properties, e.g:
	// https://typeorm.io/#/relations-faq/avoid-relation-property-initializers
	// This won't cause any issues.
	const webringTags: Tag[] = [];

	// Parse the tag array, creating each tag if it doesn't already exist.
	for (const tagName of tags) {
		/** The 'normalised' version of the tag name. */
		const normalisedTagName = Tag.normaliseName(tagName);

		/** The specified tag to add to the new webring. */
		let tag = await tagService.getTag(
			GetTagSearchField.Name,
			normalisedTagName
		);
		// If the tag does not already exist, create it.
		if (!tag) {
			tag = await tagService.createTag(normalisedTagName, editingUserId);
		}

		webringTags.push(tag);
	}

	webring.name = normalisedName;
	webring.description = description;
	webring.url = normalisedUrl;
	webring.private = privateRing;
	webring.tags = webringTags;
	webring.dateModified = new Date();

	logger.info('Updating webring', {
		webringUrl: webring.url,
		webringId: webring.ringId,
		userId: editingUserId,
		...(options?.requestMetadata ?? {})
	});

	return appDataSource.getRepository(Webring).save(webring);
}
