import * as uuid from 'uuid';
import { EntityManager, getRepository, IsNull } from 'typeorm';
import { Site, UUID } from '../../model';
import { InvalidIdentifierError } from '../error';
import { invalidIdentifierError } from '../../api/api-error-response';


/** Additional options for the process. */
export type GetSiteOptions = {
	/**
	* The entity manager managing the transaction the process will be run in.
	* If this option is specified, then the operation will be run with this manager.
	*/
	transactionalEntityManager?: EntityManager;
}

/**
 * Gets an inidividual Site entity.
 * @param {UUID} siteId - The id of the site to get.
 * @param {GetSiteOptions} [options] - Additional options for the process.
 * @returns the Site entity or null if none is found.
 * @throws {InvalidIdentifierError} - If the provided identifier is invalid.
 */
export async function getSite(siteId: UUID,
	options: GetSiteOptions = {}): Promise<Site | null>
{
	if (!uuid.validate(siteId)) {
		throw new InvalidIdentifierError('The provided site id is invalid',
			invalidIdentifierError.code, invalidIdentifierError.httpStatus);
	}

	// If we have been passed a transaction manager, use this.
	if (options.transactionalEntityManager) {
		return options.transactionalEntityManager.findOneBy(Site, {
			siteId,
			dateDeleted: IsNull()
		});
	}

	return getRepository(Site).findOneBy({
		siteId,
		dateDeleted: IsNull()
	});
}
