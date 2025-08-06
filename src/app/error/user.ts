import { ApiReturnableError } from '.';

export class UserNotFoundError extends ApiReturnableError { }

export class InvalidUsernameError extends ApiReturnableError { }

export class InvalidPasswordError extends ApiReturnableError { }

export class PasswordExpiredError extends ApiReturnableError { }

export class InvalidEmailError extends ApiReturnableError { }

export class EmailNotUniqueError extends ApiReturnableError { }

export class UsernameNotUniqueError extends ApiReturnableError { }

export class InvalidUserCredentialsError extends ApiReturnableError { }

export class UserActionNotAuthorisedError extends ApiReturnableError { }

export class PermissionGroupNotFoundError extends ApiReturnableError { }

export class LoginAttemptCountExceededError extends ApiReturnableError { }

/**
 * Error propagated back to the API boundary when an account is disabled due to exceeding the
 * threshold of successive authentication failures.
 */
export class LoginDisabledDueToAuthFailureError extends ApiReturnableError { }
