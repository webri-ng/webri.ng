import { getRepository } from 'typeorm';
import { expiredPasswordError, lockedAccountDueToAuthFailureError,
	loginAttemptCountExceededError, loginFailedError,
	userNotFoundError } from '../../api/api-error-response';
import { userConfig } from '../../config';
import { User } from '../../model';
import { InvalidUserCredentialsError, LoginAttemptCountExceededError,
	LoginDisabledDueToAuthFailureError, PasswordExpiredError,
	UserNotFoundError } from '../error';
import { logger } from '../logger';
import { getUser, GetUserSearchField } from './getUser';
import { validatePassword } from './password';

/**
 * Authenticates a user login.
 * Throws exceptions on authentication failure which will be propagated upwards and
 * handled by the calling login controller.
 * @param {string} email - The user's login email.
 * @param {string} password - The user's password.
 * @returns The authenticated user.
 * @throws {UserNotFoundError} - If a user with the supplied email cannot be found.
 * @throws {InvalidUserCredentialsError} - If the supplied credentials are invalid.
 * @throws {PasswordExpiredError} - If the supplied password has expired.
 * @throws {LoginAttemptCountExceededError} - If the maximum unsuccessful login attempts
 * have been exceeded.
 * @throws {LoginDisabledDueToAuthFailureError} - If the account is locked due to
 * too many failed login attempts.
 */
export async function login(email: Readonly<string>,
	password: Readonly<string>): Promise<User>
{
	/** The authenticated user. */
	let user: User | null = await getUser(GetUserSearchField.Email,
		User.normaliseEmailAddress(email));
	if (!user) {
		throw new UserNotFoundError(`User with email '${email}' cannot be found`,
			userNotFoundError.code, userNotFoundError.httpStatus);
	}

	// Check if the user is locked due to too many successive failed authentication attempts.
	if (user.lockedDueToFailedAuth) {
		throw new LoginDisabledDueToAuthFailureError(lockedAccountDueToAuthFailureError.message,
			lockedAccountDueToAuthFailureError.code, lockedAccountDueToAuthFailureError.httpStatus);
	}

	// Validate the user and password combination.
	// Any errors in authentication will raise exceptions from here.
	// Migration of legacy passwords is initiated here, which will update the user record.
	const passwordValidity = await validatePassword(password, user.passwordHash);
	if (!passwordValidity) {
		// Increment the user's login attempt count.
		user.loginAttemptCount++;
		user.dateModified = new Date();

		// If the user has exceeded the maximum unsuccessful login attempt count, lock the
		// account and serialise the user object.
		if (user.loginAttemptCount >= userConfig.maxUnsuccessfulLoginAttempts) {
			logger.info(`User account: '${user.userId}' / '${user.email}' locked due to ` +
				'exceeding allowed login attempt count');

			user.lockedDueToFailedAuth = true;
			await getRepository(User).save(user);

			throw new LoginAttemptCountExceededError(loginAttemptCountExceededError.message,
				loginAttemptCountExceededError.code, loginAttemptCountExceededError.httpStatus);
		}

		user = await getRepository(User).save(user);

		throw new InvalidUserCredentialsError(loginFailedError.message, loginFailedError.code,
			loginFailedError.httpStatus);
	}

	// Set the user's login attempt count to 0 on successful authentication.
	user.loginAttemptCount = 0;
	user.dateLastLogin = new Date();
	user.dateModified = new Date();

	user = await getRepository(User).save(user);

	if (user.hasPasswordExpired()) {
		throw new PasswordExpiredError(expiredPasswordError.message, expiredPasswordError.code,
			expiredPasswordError.httpStatus);
	}

	return user;
}
