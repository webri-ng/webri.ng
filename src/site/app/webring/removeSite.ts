import { siteService } from '..';
import { siteNotFoundError } from '../../api/api-error-response';
import { Site, UUID, Webring } from '../../model';
import { SiteNotFoundError } from '../error';
import { getWebringSites } from './getWebringSites';


/**
 * Removes a site from a webring.
 * @param {UUID} webring - The id of the webring to remove the site from.
 * @param {UUID} siteId - The id of the site to remove.
 * @returns The removed site.
 */
export async function removeSite(webring: Readonly<Webring>,
	siteId: Readonly<UUID>): Promise<Site>
{
	/** The array of the selected webring's sites. */
	const webringSites = await getWebringSites(webring.ringId!);

	/** The site to be removed. */
	const siteToRemove = webringSites.find((site) => site.siteId === siteId);
	if (!siteToRemove) {
		throw new SiteNotFoundError(`Site with id '${siteId}' cannot be found in this webring`,
			siteNotFoundError.code, siteNotFoundError.httpStatus);
	}

	return siteService.deleteSite(siteToRemove.siteId!);
}
