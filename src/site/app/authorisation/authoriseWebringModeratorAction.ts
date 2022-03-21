import { userService } from "..";
import { requestAuthorisationFailedError } from "../../api/api-error-response";
import { User, Webring } from "../../model";
import { RingActionNotAuthorisedError } from "../error";

/**
 * Performs an authorisation check on a webring, testing whether the actioning user
 * is a moderator, or owner of the webring in question.
 * @note This function does not return a value. Exceptions are raised to indicate a
 * failure state.
 * @param webring The webring that the owner action is being performed upon.
 * @param user The user acting upon the webring.
 * @throws {RingActionNotAuthorisedError} If the action is not authorised.
 */
export async function authoriseWebringModeratorAction(webring:Readonly<Webring>,
	user:Readonly<User>):Promise<void>
{
	const moderatedWebrings = await userService.getModeratedWebrings(user);
	// If the webring being actioned upon is in the list of webrings that this
	if(moderatedWebrings.find(moderatedWebring => moderatedWebring.ringId === webring.ringId)) {
		return;
	}

	if(webring.createdBy !== user.userId) {
		throw new RingActionNotAuthorisedError(requestAuthorisationFailedError.message,
			requestAuthorisationFailedError.code, requestAuthorisationFailedError.httpStatus);
	}
}
