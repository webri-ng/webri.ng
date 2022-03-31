import { siteService } from '..';
import { siteNotFoundError } from '../../api/api-error-response';
import { Site, Webring } from '../../model';
import { SiteNotFoundError } from '../error';
import { getWebringSites } from './getWebringSites';

/**
 * Removes a site from a webring, based upon its URL.
 * @param {UUID} webring The id of the webring to remove the site from.
 * @param {string} siteUrl The url of the site to remove.
 * @returns The removed site.
 */
export async function removeSite(webring: Readonly<Webring>,
	siteUrl: Readonly<string>): Promise<Site>
{
	/** The array of the selected webring's sites. */
	const webringSites = await getWebringSites(webring.ringId!);

	/** The site to be removed, if found. */
	const siteToRemove = webringSites.find((site) => site.url === siteUrl);
	if (!siteToRemove) {
		throw new SiteNotFoundError(`Site with url '${siteUrl}' cannot be found in this webring`,
			siteNotFoundError.code, siteNotFoundError.httpStatus);
	}

	return siteService.deleteSite(siteToRemove.siteId!);
}
