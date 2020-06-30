import { getWebring, GetWebringSearchField } from '.';
import { siteService } from '..';
import { siteNotFoundError, webringNotFoundError } from '../../api/api-error-response';
import { Site, UUID } from '../../model';
import { SiteNotFoundError, WebringNotFoundError } from '../error';
import { getWebringSites } from './getWebringSites';


/**
 * Removes a site from a webring.
 * @param {UUID} webringId - The id of the webring to remove the site from.
 * @param {UUID} siteId - The id of the site to remove.
 * @returns The removed site.
 */
export async function removeSite(webringId: Readonly<UUID>,
	siteId: Readonly<UUID>): Promise<Site>
{
	// Ensure that the specified webring exists.
	const webring = await getWebring(GetWebringSearchField.RingId, webringId);
	if (!webring) {
		throw new WebringNotFoundError(`Webring with id '${webringId}' cannot be found.`,
			webringNotFoundError.code, webringNotFoundError.httpStatus);
	}

	/** The array of the selected webring's sites. */
	const webringSites = await getWebringSites(webringId);

	/** The site to be removed. */
	const siteToRemove = webringSites.find((site) => site.siteId === siteId);
	if (!siteToRemove) {
		throw new SiteNotFoundError(`Site with id '${siteId}' cannot be found in this webring`,
			siteNotFoundError.code, siteNotFoundError.httpStatus);
	}

	return siteService.deleteSite(siteToRemove.siteId || '');
}
