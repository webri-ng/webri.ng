import { ApiReturnableError } from '.';

export class InvalidTagNameError extends ApiReturnableError { }

export class TagNotFoundError extends ApiReturnableError { }

/**
 * Error when a tag name already exists in the database.
 * Since this is not triggered directly by a user action, it is not API returnable.
 */
export class TagNameAlreadyExists extends Error { }
