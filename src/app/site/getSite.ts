import * as uuid from 'uuid';
import { EntityManager, IsNull } from 'typeorm';
import { Site, UUID } from '../../model';
import { ApiReturnableError } from '../error';
import {
	invalidIdentifierError,
	invalidSiteIdErrorMessage,
	siteNotFoundError
} from '../../api/api-error-response';
import { appDataSource } from '../../infra/database';

/** Additional options for the process. */
export type GetSiteOptions = {
	/**
	 * The entity manager managing the transaction the process will be run in.
	 * If this option is specified, then the operation will be run with this manager.
	 */
	transactionalEntityManager?: EntityManager;
};

/**
 * Gets an individual Site entity.
 * @param {UUID} siteId - The id of the site to get.
 * @param {GetSiteOptions} [options] - Additional options for the process.
 * @returns the Site entity or null if none is found.
 * @throws {ApiReturnableError} If the provided identifier is invalid.
 */
export async function getSite(
	siteId: UUID,
	options: GetSiteOptions = {}
): Promise<Site | null> {
	if (!uuid.validate(siteId)) {
		throw new ApiReturnableError(
			invalidSiteIdErrorMessage,
			invalidIdentifierError.code,
			invalidIdentifierError.httpStatus
		);
	}

	// If we have been passed a transaction manager, use this.
	if (options.transactionalEntityManager) {
		return options.transactionalEntityManager.findOneBy(Site, {
			siteId,
			dateDeleted: IsNull()
		});
	}

	return appDataSource.getRepository(Site).findOneBy({
		siteId,
		dateDeleted: IsNull()
	});
}

export async function getSiteOrFail(
	siteId: UUID,
	options?: GetSiteOptions
): Promise<Site> {
	const site = await getSite(siteId, options);
	if (!site) {
		throw ApiReturnableError.fromApiErrorResponseDetails(siteNotFoundError);
	}

	return site;
}
