import {
	expiredPasswordError,
	lockedAccountDueToAuthFailureError,
	loginAttemptCountExceededError,
	loginFailedError,
	userNotFoundError
} from '../../api/api-error-response';
import { userConfig } from '../../config';
import { appDataSource } from '../../infra/database';
import { RequestMetadata, User } from '../../model';
import {
	InvalidUserCredentialsError,
	LoginAttemptCountExceededError,
	LoginDisabledDueToAuthFailureError,
	PasswordExpiredError,
	UserNotFoundError
} from '../error';
import { logger } from '../logger';
import { getUser, GetUserSearchField } from './getUser';
import { validatePassword } from './password';

/**
 * Authenticates a user login.
 * Throws exceptions on authentication failure which will be propagated upwards and
 * handled by the calling login controller.
 * @param {string} email - The user's login email.
 * @param {string} password - The user's password.
 * @param options Additional options for the request.
 * @returns The authenticated user.
 * @throws {UserNotFoundError} - If a user with the supplied email cannot be found.
 * @throws {InvalidUserCredentialsError} - If the supplied credentials are invalid.
 * @throws {PasswordExpiredError} - If the supplied password has expired.
 * @throws {LoginAttemptCountExceededError} - If the maximum unsuccessful login attempts
 * have been exceeded.
 * @throws {LoginDisabledDueToAuthFailureError} - If the account is locked due to
 * too many failed login attempts.
 */
export async function login(
	email: string,
	password: string,
	options?: Partial<{
		requestMetadata: RequestMetadata;
	}>
): Promise<User> {
	/** The authenticated user. */
	let user: User | null = await getUser(
		GetUserSearchField.Email,
		User.normaliseEmailAddress(email)
	);
	if (!user) {
		logger.info('Login attempt for nonexistent user', {
			email: User.normaliseEmailAddress(email),
			...(options?.requestMetadata ?? {})
		});

		throw new UserNotFoundError(
			`User with email '${email}' cannot be found`,
			userNotFoundError.code,
			userNotFoundError.httpStatus
		);
	}

	// Check if the user is locked due to too many successive failed authentication attempts.
	if (user.lockedDueToFailedAuth) {
		logger.info('Login attempt for locked user', {
			email: User.normaliseEmailAddress(email),
			...(options?.requestMetadata ?? {})
		});

		throw new LoginDisabledDueToAuthFailureError(
			lockedAccountDueToAuthFailureError.message,
			lockedAccountDueToAuthFailureError.code,
			lockedAccountDueToAuthFailureError.httpStatus
		);
	}

	// Validate the user and password combination.
	// Any errors in authentication will raise exceptions from here.
	const passwordValidity = await validatePassword(password, user.passwordHash);
	if (!passwordValidity) {
		// Increment the user's login attempt count.
		user.loginAttemptCount++;
		user.dateModified = new Date();

		// If the user has exceeded the maximum unsuccessful login attempt count, lock the
		// account and serialise the user object.
		if (user.loginAttemptCount >= userConfig.maxUnsuccessfulLoginAttempts) {
			logger.info(
				'Account locked due to exceeding allowed login attempt threshold',
				{
					userId: user.userId,
					email: user.email,
					...(options?.requestMetadata ?? {})
				}
			);

			user.lockedDueToFailedAuth = true;
			await appDataSource.getRepository(User).save(user);

			throw new LoginAttemptCountExceededError(
				loginAttemptCountExceededError.message,
				loginAttemptCountExceededError.code,
				loginAttemptCountExceededError.httpStatus
			);
		}

		user = await appDataSource.getRepository(User).save(user);

		throw new InvalidUserCredentialsError(
			loginFailedError.message,
			loginFailedError.code,
			loginFailedError.httpStatus
		);
	}

	// Set the user's login attempt count to 0 on successful authentication.
	user.loginAttemptCount = 0;
	user.dateLastLogin = new Date();
	user.dateModified = new Date();

	user = await appDataSource.getRepository(User).save(user);

	if (user.hasPasswordExpired()) {
		throw new PasswordExpiredError(
			expiredPasswordError.message,
			expiredPasswordError.code,
			expiredPasswordError.httpStatus
		);
	}

	return user;
}
