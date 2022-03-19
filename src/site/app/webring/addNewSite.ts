import { getRepository } from 'typeorm';
import { webringNotFoundError } from '../../api/api-error-response';
import { Site, UUID, Webring } from '../../model';
import { WebringNotFoundError } from '../error';

/**
 * Adds a new site to a wbebring.
 * This is where Site entities are created.
 * @param {Webring} webring - The webring to add the site to.
 * @param {string} name - The name for the new site.
 * @param {string} url - The URL for the new site.
 * @param {UUID} addedBy - The id of the creating user.
 * @returns The newly created site.
 */
export async function addNewSite(webring: Readonly<Webring>,
	name: Readonly<string>,
	url: Readonly<string>,
	addedBy: Readonly<UUID>): Promise<Site>
{
	if(!webring.ringId) {
		throw new WebringNotFoundError(`The specified webring has not been serialised`,
			webringNotFoundError.code, webringNotFoundError.httpStatus);
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

	return getRepository(Site).save(new Site(normalisedName, normalisedUrl,
		webring.ringId, addedBy));
}
