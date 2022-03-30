import { userService } from '..';
import { User, Webring } from '../../model';

/**
 * Tests whether a particular user is a moderator, or owner of a specified webring.
 * @param webring The webring to check whether the user has moderator privileges for.
 * @param user The user entity in question.
 * @returns A boolean indicating whether the user has moderator privileges for the
 * specified webring.
 */
export async function isUserWebringModerator(webring: Readonly<Webring>,
	user: Readonly<User>): Promise<boolean>
{
	const moderatedWebrings = await userService.getModeratedWebrings(user);
	// If the webring being actioned upon is in the list of webrings that this user
	// moderates, exit without raising any exception.
	if (moderatedWebrings.find(moderatedWebring => moderatedWebring.ringId === webring.ringId)) {
		return true;
	}

	return false;
}
