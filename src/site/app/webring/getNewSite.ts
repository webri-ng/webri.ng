import { getWebring, GetWebringSearchField } from '.';
import { webringNotFoundError } from '../../api/api-error-response';
import { Site, UUID } from '../../model';
import { WebringNotFoundError } from '../error';
import { getWebringSites } from './getWebringSites';

/** Which method to use when getting the 'new' site. */
export enum GetNewSiteMethod {
	Next,
	Previous,
	Random
}

/**
 * Gets a 'new' site based upon the current index into the webring.
 * This allows a user to select the 'new' site, or 'previous', or a random site within
 * the webring.
 * @param {UUID} webringId - The id of the parent webring to get the next site of.
 * @param {GetNewSiteMethod} method - The 'method' to use for selecting the next site.
 * @param {number} [currentIndex] - The user's current index within the webring. This is
 * not required for getting a random site.
 * @returns The 'new' site.
 */
export async function getNewSite(webringId: Readonly<UUID>,
	method: Readonly<GetNewSiteMethod>,
	currentIndex?: Readonly<number>): Promise<Site>
{
	// Ensure that the specified webring exists.
	const webring = await getWebring(GetWebringSearchField.RingId, webringId);
	if (!webring) {
		throw new WebringNotFoundError(`Webring with id '${webringId}' cannot be found.`,
			webringNotFoundError.code, webringNotFoundError.httpStatus);
	}

	/** The array of the selected webring's sites. */
	const webringSites = await getWebringSites(webringId);

	// Test that if the index is provided, that it is a valid number.
	if (currentIndex !== undefined && ((currentIndex < 0) || isNaN(currentIndex))) {
		return webringSites[0];
	}

	if (method === GetNewSiteMethod.Random) {
		return webringSites[Math.floor(Math.random() * webringSites.length)];
	}

	// If an invalid 'current index' has been provided, return the first site.
	if (currentIndex === undefined || currentIndex >= webringSites.length) {
		return webringSites[0];
	}

	/** The index of the 'next' site to select. */
	let newIndex: number = currentIndex;
	if (method === GetNewSiteMethod.Next) {
		newIndex = newIndex + 1;

		// If the new index is moves past the last entry in the array, return the first.
		if (newIndex === webringSites.length) {
			return webringSites[0];
		}

		return webringSites[newIndex];
	}

	// If the method is 'previous'.
	newIndex = newIndex - 1;

	// If the new index is moves past the first entry in the array, return the last.
	if (newIndex < 0) {
		return webringSites[webringSites.length - 1];
	}

	return webringSites[newIndex];
}
