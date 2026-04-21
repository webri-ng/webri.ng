import { Site, UUID } from '../../model';
import { EntityManager } from 'typeorm';
import { getSiteOrFail } from '.';
import { appDataSource } from '../../infra/database';

/**
 * Additional options for the process.
 */
export type DeleteSiteOptions = {
	/**
	 * The effective date for the deletion.
	 * Defaults to the current date if not specified.
	 */
	deletionDate?: Date;

	/**
	 * The entity manager managing the transaction this will be run in.
	 * If this option is specified, then the operation will be run with this manager.
	 */
	transactionalEntityManager?: EntityManager;
};

/**
 * Soft-deletes a site entity.
 * @async
 * @param {UUID} siteId - The id of the site to delete.
 * @param {DeleteSiteOptions} [options] - Additional options for the process.
 * @returns The deleted site.
 * @throws {InvalidIdentifierError} If the supplied id is invalid.
 * @throws {SiteNotFoundError} If the specified site cannot be found.
 */
export async function deleteSite(
	siteId: UUID,
	options: DeleteSiteOptions = {}
): Promise<Site> {
	const site = await getSiteOrFail(siteId, {
		transactionalEntityManager: options.transactionalEntityManager || undefined
	});

	const deletionDate: Date = options.deletionDate || new Date();

	site.dateDeleted = deletionDate;
	site.dateModified = new Date();

	if (options.transactionalEntityManager) {
		return options.transactionalEntityManager.save(site);
	}

	return appDataSource.getRepository(Site).save(site);
}
