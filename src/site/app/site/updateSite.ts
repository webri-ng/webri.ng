import { getRepository } from 'typeorm';
import { getSite } from '.';
import { siteNotFoundError } from '../../api/api-error-response';
import { Site, UUID } from '../../model';
import { SiteNotFoundError } from '../error';

/**
 * Updates an existing site entity.
 * @param {UUID} siteId - The id of the site to update.
 * @param {string} name - The name for the new site.
 * @param {string} url - The URL for the new site.
 * @returns The newly created site.
 */
export async function updateSite(siteId: UUID,
	name: string,
	url: string): Promise<Site>
{
	const site = await getSite(siteId);
	if (!site) {
		throw new SiteNotFoundError(`Site with id '${siteId}' cannot be found`,
			siteNotFoundError.code, siteNotFoundError.httpStatus);
	}

	/**
	 * 'Normalised' site URL.
	 * This ensures that the site URL is stored in a valid format.
	 */
	const normalisedUrl = Site.normaliseUrl(url);
	// Validate the normalised site url. Raises an exception on validation failure.
	Site.validateUrl(normalisedUrl);

	/**
	 * 'Normalised' site name.
	 * This ensures that the site name is stored in a valid format.
	 */
	const normalisedName = Site.normaliseName(name);
	// Validate the normalised site name. Raises an exception on validation failure.
	Site.validateName(normalisedName);

	site.name = normalisedName;
	site.url = normalisedUrl;
	site.dateModified = new Date();

	return getRepository(Site).save(site);
}
