import { getUser, GetUserSearchField } from '..';
import { logger, testUtils } from '../..';
import { userNotFoundError } from '../../../api/api-error-response';
import { appDataSource } from '../../../infra/database';
import { RequestMetadata, User } from '../../../model';
import { UserNotFoundError } from '../../error';
import { hashPassword } from '../password';
import { sendResetPaswordEmail } from './sendResetPaswordEmail';

/**
 * Resets a particular user's password, and emails the temporary password to the user.
 * @param {UUID} email The email of the user whose password to reset.
 * @param options Additional options.
 * @throws {UserNotFoundError} If the email provided does not correspond to a real user.
 */
export async function resetPassword(
	email: string,
	options?: Partial<{
		requestMetadata: RequestMetadata;
	}>
): Promise<User> {
	const user: User | null = await getUser(GetUserSearchField.Email, email);
	if (!user) {
		logger.debug('Received password reset request for nonexistent user', {
			email,
			...(options?.requestMetadata ?? {})
		});

		throw new UserNotFoundError(
			userNotFoundError.message,
			userNotFoundError.code,
			userNotFoundError.httpStatus
		);
	}

	const temporaryPassword = testUtils.createRandomPassword();

	// Hash the temporary password, and store in the user entity.
	user.passwordHash = await hashPassword(temporaryPassword);
	user.dateModified = new Date();
	user.passwordSetTime = new Date();
	user.passwordExpiryTime = User.getTempPasswordExpiryDate();
	user.lockedDueToFailedAuth = false;

	logger.info('Reset user password', {
		userId: user.userId,
		email: user.email,
		...(options?.requestMetadata ?? {})
	});

	await sendResetPaswordEmail(user, temporaryPassword);

	return appDataSource.getRepository(User).save(user);
}
