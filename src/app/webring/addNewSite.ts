import { logger, webringService } from '..';
import {
	siteAlreadyExistsError,
	webringNotFoundError
} from '../../api/api-error-response';
import { appDataSource } from '../../infra/database';
import { RequestMetadata, Site, UUID, Webring } from '../../model';
import { SiteAlreadyExistsError, WebringNotFoundError } from '../error';

/**
 * Adds a new site to a wbebring.
 * This is where Site entities are created.
 * @param {Webring} webring - The webring to add the site to.
 * @param {string} name - The name for the new site.
 * @param {string} url - The URL for the new site.
 * @param {UUID} addedBy - The id of the creating user.
 * @param options - Additional options for the request
 * @returns The newly created site.
 */
export async function addNewSite(
	webring: Readonly<Webring>,
	name: string,
	url: string,
	addedBy: UUID,
	options?: Partial<{
		requestMetadata: RequestMetadata;
	}>
): Promise<Site> {
	if (!webring.ringId) {
		throw new WebringNotFoundError(
			`The specified webring has not been serialised`,
			webringNotFoundError.code,
			webringNotFoundError.httpStatus
		);
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

	const existingSites = await webringService.getWebringSites(webring.ringId);
	if (
		existingSites.find((site) => {
			return site.url === normalisedUrl;
		})
	) {
		throw new SiteAlreadyExistsError(
			siteAlreadyExistsError.message,
			siteAlreadyExistsError.code,
			siteAlreadyExistsError.httpStatus
		);
	}

	const newSite = await appDataSource
		.getRepository(Site)
		.save(new Site(normalisedName, normalisedUrl, webring.ringId, addedBy));

	logger.info('Adding site to webring', {
		siteId: newSite.siteId,
		webringId: webring.ringId,
		siteUrl: newSite.url,
		webringUrl: webring.url,
		userId: addedBy,
		...(options?.requestMetadata ?? {})
	});

	return newSite;
}
