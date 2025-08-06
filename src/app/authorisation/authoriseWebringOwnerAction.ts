import { requestAuthorisationFailedError } from '../../api/api-error-response';
import { RequestMetadata, User, Webring } from '../../model';
import { RingActionNotAuthorisedError } from '../error';
import { logger } from '../logger';

/**
 * Performs an authorisation check on a webring, testing whether the actioning user
 * is the owner of the webring in question.
 * @note This function does not return a value. Exceptions are raised to indicate a
 * failure state.
 * @param webring The webring that the owner action is being performed upon.
 * @param user The user acting upon the webring.
 * @param options Additional options for the request
 * @throws {RingActionNotAuthorisedError} If the action is not authorised.
 */
export function authoriseWebringOwnerAction(
	webring: Readonly<Webring>,
	user: Readonly<User>,
	options?: Partial<{
		requestMetadata: RequestMetadata;
	}>
): void {
	logger.debug('Authorising webring owner action', {
		webringId: webring.ringId,
		userId: user?.userId,
		...(options?.requestMetadata ?? {})
	});

	if (webring.createdBy !== user.userId) {
		throw new RingActionNotAuthorisedError(
			requestAuthorisationFailedError.message,
			requestAuthorisationFailedError.code,
			requestAuthorisationFailedError.httpStatus
		);
	}
}
