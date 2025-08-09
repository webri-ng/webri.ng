import * as uuid from 'uuid';
import { appDataSource } from '../../infra/database';
import { NewsUpdate, UUID } from '../../model';
import { ApiReturnableError } from '../error';
import {
	invalidIdentifierError,
	invalidNewsUpdateIdErrorMessage
} from '../../api/api-error-response';

/**
 * Gets an individual news update by its id field.
 * @param updateId The id of the news update to retrieve.
 * @returns The specified news update, or null if it does not exist.
 */
export async function getNewsUpdate(
	updateId: UUID
): Promise<NewsUpdate | null> {
	if (!uuid.validate(updateId)) {
		throw new ApiReturnableError(
			invalidNewsUpdateIdErrorMessage,
			invalidIdentifierError.code,
			invalidIdentifierError.httpStatus
		);
	}

	return appDataSource.getRepository(NewsUpdate).findOneBy({
		updateId
	});
}
