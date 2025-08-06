import { createRandomString } from '../util';

/**
 * Creates a random string suitable for use as a webring URL.
 * @returns The randomly created URL string.
 */
export function createRandomWebringUrl(): string
{
	return `test_url_${createRandomString().toLowerCase()}`;
}
