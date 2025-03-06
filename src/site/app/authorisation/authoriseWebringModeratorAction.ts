import { logger, webringService } from '..';
import { requestAuthorisationFailedError } from '../../api/api-error-response';
import { RequestMetadata, User, Webring } from '../../model';
import { RingActionNotAuthorisedError } from '../error';

/**
 * Performs an authorisation check on a webring, testing whether the actioning user
 * is a moderator, or owner of the webring in question.
 * @note This function does not return a value. Exceptions are raised to indicate a
 * failure state.
 * @param webring The webring that the owner action is being performed upon.
 * @param user The user acting upon the webring.
 * @param options Additional options for the request
 * @throws {RingActionNotAuthorisedError} If the action is not authorised.
 */
export async function authoriseWebringModeratorAction(
	webring: Readonly<Webring>,
	user: Readonly<User | undefined>,
	options?: Partial<{
		requestMetadata: RequestMetadata;
	}>
): Promise<void> {
	logger.debug('Authorising webring moderator action', {
		webringId: webring.ringId,
		userId: user?.userId,
		...(options?.requestMetadata ?? {})
	});

	if (!user) {
		throw new RingActionNotAuthorisedError(
			requestAuthorisationFailedError.message,
			requestAuthorisationFailedError.code,
			requestAuthorisationFailedError.httpStatus
		);
	}

	const isUserModerator = await webringService.isUserWebringModerator(
		webring,
		user
	);
	if (!isUserModerator) {
		throw new RingActionNotAuthorisedError(
			requestAuthorisationFailedError.message,
			requestAuthorisationFailedError.code,
			requestAuthorisationFailedError.httpStatus
		);
	}
}
