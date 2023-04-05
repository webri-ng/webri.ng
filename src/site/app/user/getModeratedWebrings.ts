import { IsNull } from 'typeorm';
import { appDataSource } from '../../infra/database';
import { User, Webring } from '../../model';

/**
 * Fetches an array of webrings that are moderated by this user.
 * This includes both webrings this user has created, and webrings it is an auxillary
 * @param {User} user The user to get the moderated webrings of.
 * @returns An array of webrings moderated by this user.
 */
export async function getModeratedWebrings(user: Readonly<User>): Promise<Webring[]>
{
	const allModeratedWebrings = await user.moderatedWebrings;
	// Filter out any deleted webrings.
	const moderatedWebrings = allModeratedWebrings.filter((webring) => !webring.dateDeleted);

	const createdWebrings = await appDataSource.getRepository(Webring).findBy({
		createdBy: user.userId,
		dateDeleted: IsNull()
	});

	return createdWebrings.concat(moderatedWebrings);
}
