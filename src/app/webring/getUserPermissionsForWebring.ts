import { User, Webring } from '../../model';
import { isUserWebringModerator } from './isUserWebringModerator';

/**
 * Get user permissions for a specific webring.
 * If there is no authenticated user, then no permissions will be indicated by
 * the result.
 * @param webring The webring to check permissions for.
 * @param user The user to check permissions for.
 * @returns An object containing the user's permissions for the webring.
 */
export async function getUserPermissionsForWebring(
	webring: Readonly<Webring>,
	user: Readonly<User | undefined>
): Promise<{
	isUserModerator: boolean;
	isUserOwner: boolean;
}> {
	if (!user) {
		return {
			isUserModerator: false,
			isUserOwner: false
		};
	}

	const isUserModerator = await isUserWebringModerator(webring, user);

	const isUserOwner = webring.doesUserOwnThisWebring(user);

	return {
		isUserModerator,
		isUserOwner
	};
}
