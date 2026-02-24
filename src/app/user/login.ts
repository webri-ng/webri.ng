import {
	ApiErrorResponseDetails,
	expiredPasswordError,
	lockedAccountDueToAuthFailureError,
	loginAttemptCountExceededError,
	loginFailedError,
	userNotFoundError
} from '../../api/api-error-response';
import { userConfig } from '../../config';
import { appDataSource } from '../../infra/database';
import { RequestMetadata, User } from '../../model';
import { ApiReturnableError } from '../error';
import { logger } from '../logger';
import { getUser, GetUserSearchField } from './getUser';
import { validatePassword } from './password';

/** Convenience method to save the user entity, and raise an error. */
async function saveUserEntityAndThrowError(
	user: User,
	errorDetails: ApiErrorResponseDetails
): Promise<never> {
	await appDataSource.getRepository(User).save(user);

	throw ApiReturnableError.fromApiErrorResponseDetails(errorDetails);
}

/**
 * Authenticates a user login.
 * Throws exceptions on authentication failure which will be propagated upwards and
 * handled by the calling login controller.
 * @param {string} email - The user's login email.
 * @param {string} password - The user's password.
 * @param options Additional options for the request.
 * @returns The authenticated user.
 * @throws {ApiReturnableError} If a user with the supplied email cannot be found.
 * @throws {ApiReturnableError} If the supplied credentials are invalid.
 * @throws {ApiReturnableError} If the supplied password has expired.
 * @throws {ApiReturnableError} If the maximum unsuccessful login attempts
 * have been exceeded.
 * @throws {ApiReturnableError} If the account is locked due to
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

		throw ApiReturnableError.fromApiErrorResponseDetails(userNotFoundError);
	}

	user.dateModified = new Date();
	user.dateLastLoginAttempt = new Date();

	// Check if the user is locked due to too many successive failed login attempts.
	if (user.lockedDueToFailedAuth) {
		logger.info('Login attempt for locked user', {
			email: User.normaliseEmailAddress(email),
			...(options?.requestMetadata ?? {})
		});

		return saveUserEntityAndThrowError(
			user,
			lockedAccountDueToAuthFailureError
		);
	}

	// Validate the user and password combination.
	// Any errors in authentication will raise exceptions from here.
	const passwordValidity = await validatePassword(password, user.passwordHash);
	if (!passwordValidity) {
		logger.info('Failed login for user', {
			userId: user.userId,
			email: user.email,
			...(options?.requestMetadata ?? {})
		});

		// Increment the user's login attempt count.
		user.incorrectPasswordAttemptCount++;

		// If the user has exceeded the maximum unsuccessful login attempt count,
		// lock the account.
		if (
			user.incorrectPasswordAttemptCount >=
			userConfig.maxUnsuccessfulLoginAttempts
		) {
			logger.info(
				'Account locked due to exceeding allowed login attempt threshold',
				{
					userId: user.userId,
					email: user.email,
					...(options?.requestMetadata ?? {})
				}
			);

			user.lockedDueToFailedAuth = true;

			return saveUserEntityAndThrowError(user, loginAttemptCountExceededError);
		}

		return saveUserEntityAndThrowError(user, loginFailedError);
	}

	// Reset the user's login attempt count on successful authentication,
	// even if the password has expired.
	user.incorrectPasswordAttemptCount = 0;

	if (user.hasPasswordExpired()) {
		return saveUserEntityAndThrowError(user, expiredPasswordError);
	}

	user.dateLastLoginSuccess = new Date();

	return appDataSource.getRepository(User).save(user);
}
