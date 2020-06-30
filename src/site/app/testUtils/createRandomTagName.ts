import { createRandomString } from '../util';

/**
 * Creates a random string suitable for use as a test tag name.
 * @returns The randomly created tag name.
 */
export function createRandomTagName(): string
{
	return createRandomString().toLowerCase();
}
