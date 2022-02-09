import { createRandomString } from ".";

/**
 * Creates an error 'reference' string suitable for returning as part of an API response.
 * @returns The error reference string.
 */
export function createErrorReference(): string
{
	return `ERR-${createRandomString().toUpperCase()}`;
}
