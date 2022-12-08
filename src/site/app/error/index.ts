import { ApiErrorResponseDetails } from '../../api/api-error-response';

/**
 * This class represents an application exception which can be handled by the API.
 * These exceptions can be caught by the top-level API error handling block. This error
 * handler will return the specified HTTP status, error code, and message in the response
 * payload.
 */
export class ApiReturnableError extends Error {
	/**
	 * Creates an API returnable error instance.
	 * @param message The error message that will be returned via the API.
	 * @param code The API 'error code'.
	 * If an API response is generated as a result of this error, this is the 'code' that
	 * will be attached to the API error response, together with the error message.
	 * @param httpStatus The API response HTTP status.
	 * If an API response is generated as a result of this error, this will be the HTTP
	 * status for this response. This defaults to '400'.
	 */
	constructor(message: string,
		public readonly code: string,
		public readonly httpStatus: number = 400)
	{
		super(message);
	}

	/**
	 * Creates an API returnable `Error` instance from a predefined 'API Error Response'
	 * details object.
	 * @param details - The 'error response details' to create the exception from.
	 * @returns The API returnable `Error` instance.
	 */
	public static fromApiErrorResponseDetails(details: ApiErrorResponseDetails): ApiReturnableError
	{
		return new ApiReturnableError(details.message, details.code, details.httpStatus);
	}
}

export class InvalidIdentifierError extends ApiReturnableError { }

export class InvalidDateError extends ApiReturnableError { }

export class RequestValidationError extends Error { }

export class InvalidSessionError extends Error { }

// These need to be exported _after_ declaring the base `ApiReturnableError` type.
export * from './authentication';
export * from './authorisation';
export * from './email';
export * from './site';
export * from './tag';
export * from './user';
export * from './webring';
