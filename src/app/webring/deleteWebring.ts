import { RequestMetadata, Site, UUID, Webring } from '../../model';
import { EntityManager } from 'typeorm';
import { ApiReturnableError } from '../error';
import { webringNotFoundError } from '../../api/api-error-response';
import { getWebring } from '.';
import { GetWebringSearchField } from './getWebring';
import { getWebringSites } from './getWebringSites';
import { logger, siteService } from '..';
import { appDataSource } from '../../infra/database';

/**
 * Soft-deletes a user.
 * Cascades to all the user's rings.
 * @async
 * @param {UUID} webringId - The id of the webring to delete.
 * @param {DeleteWebringOptions} [options] - Additional options for the process.
 * @returns The deleted webring.
 * @throws {ApiReturnableError} - If the supplied id is invalid.
 * @throws {ApiReturnableError} - If the specified webring cannot be found.
 */
export async function deleteWebring(
	webringId: UUID,
	options?: Partial<{
		/**
		 * The effective date for the deletion.
		 * Defaults to the current date if not specified.
		 */
		deletionDate: Date;

		/**
		 * The entity manager managing the transaction this will be run in.
		 * If this option is specified, then the operation will be run with this manager.
		 */
		transactionalEntityManager: EntityManager;
		requestMetadata: RequestMetadata;
	}>
): Promise<Webring> {
	const webring: Webring | null = await getWebring(
		GetWebringSearchField.RingId,
		webringId,
		{
			transactionalEntityManager: options?.transactionalEntityManager
		}
	);
	if (!webring) {
		throw ApiReturnableError.fromApiErrorResponseDetails(webringNotFoundError);
	}

	const deletionDate: Date = options?.deletionDate ?? new Date();

	// Delete all of this webring's sites.
	const webringSites: Site[] = await getWebringSites(webringId);
	for (const site of webringSites) {
		await siteService.deleteSite(site.siteId!, {
			transactionalEntityManager: options?.transactionalEntityManager
		});
	}

	webring.dateDeleted = deletionDate;
	webring.dateModified = new Date();

	logger.info('Deleting webring', {
		webringId: webring.ringId,
		webringUrl: webring.url,
		...(options?.requestMetadata ?? {})
	});

	if (options?.transactionalEntityManager) {
		return options.transactionalEntityManager.save(webring);
	}

	return appDataSource.getRepository(Webring).save(webring);
}
