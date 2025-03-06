import { logger, siteService } from '..';
import { siteNotFoundError } from '../../api/api-error-response';
import { RequestMetadata, Site, Webring } from '../../model';
import { SiteNotFoundError } from '../error';
import { getWebringSites } from './getWebringSites';

/**
 * Removes a site from a webring, based upon its URL.
 * @param {UUID} webring The id of the webring to remove the site from.
 * @param {string} siteUrl The url of the site to remove.
 * @param options Additional options for the request
 * @returns The removed site.
 */
export async function removeSite(
	webring: Readonly<Webring>,
	siteUrl: string,
	options?: Partial<{
		requestMetadata: RequestMetadata;
	}>
): Promise<Site> {
	/** The array of the selected webring's sites. */
	const webringSites = await getWebringSites(webring.ringId!);

	/** The site to be removed, if found. */
	const siteToRemove = webringSites.find((site) => site.url === siteUrl);
	if (!siteToRemove) {
		throw new SiteNotFoundError(
			`Site with url '${siteUrl}' cannot be found in this webring`,
			siteNotFoundError.code,
			siteNotFoundError.httpStatus
		);
	}

	logger.info('Removing site from webring', {
		siteId: siteToRemove.siteId,
		siteUrl: siteToRemove.url,
		webringId: webring.ringId,
		webringUrl: webring.url,
		...(options?.requestMetadata ?? {})
	});

	return siteService.deleteSite(siteToRemove.siteId!);
}
