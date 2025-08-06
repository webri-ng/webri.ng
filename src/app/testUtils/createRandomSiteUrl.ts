import { createRandomString } from '../util';

/**
 * Creates a random string suitable for use as a site URL.
 * @returns The randomly created URL string.
 */
export function createRandomSiteUrl(): string
{
	return `http://test_site_url_${createRandomString().toLowerCase()}.com`;
}
