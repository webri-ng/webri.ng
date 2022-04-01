import { getRepository } from 'typeorm';
import { getUser, GetUserSearchField } from '..';
import { logger, testUtils } from '../..';
import { userNotFoundError } from '../../../api/api-error-response';
import { User, UUID } from '../../../model';
import { UserNotFoundError } from '../../error';
import { hashPassword } from '../password';
import { sendResetPaswordEmail } from './sendResetPaswordEmail';

/**
 * Resets a particular user's password, and emails the temporary password to the user.
 * @param {UUID} userId The id of the user whose password to reset.
 */
export async function resetPassword(userId: Readonly<UUID>): Promise<User>
{
	const user: User | null = await getUser(GetUserSearchField.UserId, userId);
	if (!user) {
		throw new UserNotFoundError(`User with id '${userId}' cannot be found`,
			userNotFoundError.code, userNotFoundError.httpStatus);
	}

	const temporaryPassword = testUtils.createRandomPassword();

	// Hash the temporary password, and store in the user entity.
	user.passwordHash = await hashPassword(temporaryPassword);
	user.dateModified = new Date();
	user.passwordSetTime = new Date();
	user.passwordExpiryTime = User.getTempPasswordExpiryDate();

	logger.info(`Reset password for user: '${user.username}'`);

	await sendResetPaswordEmail(user, temporaryPassword);

	return getRepository(User).save(user);
}
