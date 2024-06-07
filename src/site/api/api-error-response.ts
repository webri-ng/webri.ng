/**
 * Contains details used in the creation of API handled exceptions.
 * @module api-error-response
 */

/**
 * API Error Response type.
 * Contains the details necessary to create an API handled exception.
 */
export type ApiErrorResponseDetails = {
	/** The API response HTTP status. */
	httpStatus: number;
	/** The API 'error code'. */
	code: string;
	/** The API 'error message'. */
	message: string;
}

/**
 * Error details associated with an unhandled application exception.
 * Used when sending a 500 HTTP response from the API.
 */
export const unhandledExceptionError: ApiErrorResponseDetails = {
	httpStatus: 500,
	code: 'unhandled-exception',
	message: 'An unhandled server error has occurred'
};

/** The error message sent back to the client when a request body has failed validation. */
export const requestValidationError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-request-validation-failed',
	message: 'Request validation error'
};

/** Error when a bad request has been sent to the server. */
export const badRequestError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-bad-request',
	message: 'Bad request'
};

/** Generic error when an invalid identifier is provided. */
export const invalidIdentifierError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-invalid-identifier',
	message: 'An invalid identifier was provided'
};

/** Error when a request fails authorisation. */
export const requestAuthorisationFailedError: ApiErrorResponseDetails = {
	httpStatus: 403,
	code: 'err-authorisation-failed',
	message: 'Authorisation failed'
};

/** Error when a request cannot be authenticated. */
export const requestAuthenticationFailedError: ApiErrorResponseDetails = {
	httpStatus: 401,
	code: 'err-authentication-failed',
	message: 'Authentication failed'
};

/** Error message for when invalid form data has been passed to Multer. */
export const invalidFormDataError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-invalid-form-data',
	message: 'Invalid form data'
};

/** Error when an authentication token has expired. */
export const loginExpiredError: ApiErrorResponseDetails = {
	httpStatus: 401,
	code: 'err-login-expired',
	message: 'Login expired'
};

/** Error when an invalid password is provided during a password update operation. */
export const invalidNewPasswordError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-invalid-new-password',
	message: 'The password provided is invalid'
};

/** Error when the password is provided during a password update operation is too short. */
export const invalidNewPasswordTooShortError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-invalid-new-password',
	message: 'The password provided does not meet minimum length requirements'
};

/** Error when the password is provided during a password update operation is too short. */
export const invalidNewPasswordTooLongError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-invalid-new-password',
	message: 'The password provided does not meet maximum length requirements'
};

/** Error when an update to a user is requested with an email which is already in use. */
export const emailNotUniqueError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-email-not-unique',
	message: 'An account with this email already exists'
};

/** Error when an invalid email address is provided. */
export const invalidEmailAddressError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-email-invalid',
	message: 'Email address provided is invalid'
};

/** Error when a specified user id does not match any user entity. */
export const userNotFoundError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-user-not-found',
	message: 'The specified user cannot be found'
};

/** Error when an update to a user is requested with a username which is already in use. */
export const usernameNotUniqueError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-username-not-unique',
	message: 'An account with this username already exists'
};

/** Error when an invalid username is provided. */
export const invalidUsernameError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-username-invalid',
	message: 'Invalid username provided'
};

/** Error when a provided username is too short. */
export const invalidUsernameTooShortError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-username-invalid',
	message: 'The username provided does not meet minimum length requirements'
};

/** Error when a provided username is too long. */
export const invalidUsernameTooLongError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-username-invalid',
	message: 'The username provided does not meet maximum length requirements'
};

/** Error when a provided username contains invalid characters. */
export const invalidUsernameCharacters: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-username-invalid',
	message: 'The username provided contains invalid characters'
};

/** Generic error messsage for when a customer login has failed. */
export const loginFailedError: ApiErrorResponseDetails = {
	httpStatus: 401,
	code: 'err-login-failed',
	message: 'Login failed, please check your details and try again'
};

/** Error when a customer's password has expired. */
export const expiredPasswordError: ApiErrorResponseDetails = {
	httpStatus: 401,
	code: 'err-password-expired',
	message: 'Your password has expired, please reset it'
};

/** Error when a customer's password has expired. */
export const loginAttemptCountExceededError: ApiErrorResponseDetails = {
	httpStatus: 401,
	code: 'err-maximum-login-count-exceeded',
	message: 'Maximum number of incorrect login attempts has been exceeded'
};

/** Error when a locked user account attempts to login. */
export const lockedAccountDueToAuthFailureError: ApiErrorResponseDetails = {
	httpStatus: 401,
	code: 'err-account-locked',
	message: 'This account is locked. Please reset your password'
};

/** Error when an invalid webring name is provided. */
export const invalidRingNameError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-ring-name-invalid',
	message: 'The webring name provided is invalid'
};

/** Error when the ring name provided is too short. */
export const invalidRingNameTooShortError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-ring-name-invalid',
	message: 'The webring name provided does not meet minimum length requirements'
};

/** Error when the ring name contains invalid characters. */
export const invalidRingNameCharacters: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-ring-name-invalid',
	message: 'The webring name provided contains invalid characters'
};

/** Error when the ring name provided is too long. */
export const invalidRingNameTooLongError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-ring-name-invalid',
	message: 'The webring name provided does not meet maximum length requirements'
};

/** Error when an invalid webring URL is provided. */
export const invalidRingUrlError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-ring-url-invalid',
	message: 'The webring URL provided is invalid'
};

/** Error when the ring URL provided is too short. */
export const invalidRingUrlTooShortError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-ring-url-invalid',
	message: 'The webring URL provided does not meet minimum length requirements'
};

/** Error when the ring URL provided is too long. */
export const invalidRingUrlTooLongError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-ring-url-invalid',
	message: 'The webring URL provided does not meet maximum length requirements'
};

/** Error when the ring URL provided is too long. */
export const invalidRingUrlNotUniqueError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-ring-url-invalid',
	message: 'The webring URL provided already exists'
};

/** Error when too many tags are applied to webring. */
export const tooManyTagsError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-too-many-tags',
	message: 'Too many tags provided'
};

/** Error when an invalid webring name is provided. */
export const invalidTagNameError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-tag-name-invalid',
	message: 'The tag name provided is invalid'
};

/** Error when the ring name provided is too short. */
export const invalidTagNameTooShortError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-tag-name-invalid',
	message: 'The tag name provided does not meet minimum length requirements'
};

/** Error when the ring name provided is too long. */
export const invalidTagNameTooLongError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-tag-name-invalid',
	message: 'The tag name provided does not meet maximum length requirements'
};

/** Error when a specified webring id does not match any webring entity. */
export const webringNotFoundError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-webring-not-found',
	message: 'The specified webring cannot be found'
};

/** Error when a specified tag cannot be found. */
export const tagNotFoundError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-tag-not-found',
	message: 'The tag specified cannot be found'
};

/** Error when an invalid site name is provided. */
export const invalidSiteNameError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-site-name-invalid',
	message: 'The site name provided is invalid'
};

/** Error when the site name provided is too short. */
export const invalidSiteNameTooShortError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-site-name-invalid',
	message: 'The webring name provided does not meet minimum length requirements'
};

/** Error when the site name provided is too long. */
export const invalidSiteNameTooLongError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-site-name-invalid',
	message: 'The site name provided does not meet maximum length requirements'
};

/** Error when the site name contains invalid characters. */
export const invalidSiteNameCharacters: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-site-name-invalid',
	message: 'The site name provided contains invalid characters'
};

/** Error when an invalid site URL is provided. */
export const invalidSiteUrlError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-site-url-invalid',
	message: 'The site URL provided is invalid'
};

/** Error when a specified site cannot be found. */
export const siteNotFoundError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-site-not-found',
	message: 'The specified site cannot be found'
};

/** Error when an invalid index into a webring is passed. */
export const invalidSiteIndexError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-invalid-site-index',
	message: 'The specified site index is invalid'
};

/** Error when a site already exists in a webring. */
export const siteAlreadyExistsError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-site-already-exists',
	message: 'A site with the URL specified already exists in this webring'
};

/** Error when a user is changing password and supplies an incorrect existing password. */
export const invalidExistingPasswordError: ApiErrorResponseDetails = {
	httpStatus: 400,
	code: 'err-invalid-existing-password',
	message: 'The existing password supplied is incorrect'
};

export const requestRateLimitedError: ApiErrorResponseDetails = {
	httpStatus: 429,
	code: 'err-rate-limited',
	message: 'Too many requests, please try again later.'
};
