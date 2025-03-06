import { tagService } from '..';
import { Tag, UUID } from '../../model';
import { GetTagSearchField } from '../tag';

export async function getOrCreateWebringTags(
	createdBy: UUID,
	tagNames: string[]
): Promise<Tag[]> {
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
