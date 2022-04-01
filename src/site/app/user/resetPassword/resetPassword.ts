import { getRepository } from 'typeorm';
import { getUser, GetUserSearchField } from '..';
import { logger, testUtils } from '../..';
import { userNotFoundError } from '../../../api/api-error-response';
import { User } from '../../../model';
import { UserNotFoundError } from '../../error';
import { hashPassword } from '../password';
import { sendResetPaswordEmail } from './sendResetPaswordEmail';

/**
 * Resets a particular user's password, and emails the temporary password to the user.
 * @param {UUID} email The email of the user whose password to reset.
 * @throws {UserNotFoundError} If the email provided does not correspond to a real user.
 */
export async function resetPassword(email: Readonly<string>): Promise<User>
{
	const user: User | null = await getUser(GetUserSearchField.Email, email);
	if (!user) {
		throw new UserNotFoundError(userNotFoundError.message,
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
