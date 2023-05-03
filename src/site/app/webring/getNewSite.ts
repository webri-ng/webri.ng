import { Site, Webring } from '../../model';
import { getWebringSites } from './getWebringSites';

/** Which method to use when getting the 'new' site. */
export enum GetNewSiteMethod {
	Next,
	Previous,
	Random
}

/**
 * Validates a specified webring index value.
 * @param currentIndex - The user's current index within the webring.
 * @param webringSites - The array of all the webring's sites.
 * @returns A boolean indicating whether the specified value is valid.
 */
function isIndexValid(currentIndex: number, webringSites: Site[]): boolean {
	if (isNaN(currentIndex)) {
		return false;
	}

	if (currentIndex < 0 || currentIndex >= webringSites.length) {
		return false;
	}

	return true;
}


/**
 * Fetches a random site from the webring.
 * This will always pick a different index than the current index.
 * This relies on the fact that the service has already validated that the
 * webring has more than one site.
 * @param currentIndex - The user's current index within the webring.
 * @param webringSites - The array of all the webring's sites.
 * @returns The random site.
 */
function getRandomSite(currentIndex: number|undefined, webringSites: Site[]): Site {
	let randomIndex = 0;

	do {
		randomIndex = Math.floor(Math.random() * webringSites.length);
	} while (randomIndex === currentIndex);

	return webringSites[randomIndex];
}


/**
 * Fetches the 'next' site in the webring.
 * @param currentIndex - The user's current index within the webring.
 * @param webringSites - The array of all the webring's sites.
 * @returns The next site.
 */
function getNextSite(currentIndex: number, webringSites: Site[]): Site {
	/** The index of the 'next' site to select. */
	const newIndex = currentIndex + 1;

	// If the new index is moves past the last entry in the array, return the first.
	if (newIndex === webringSites.length) {
		return webringSites[0];
	}

	return webringSites[newIndex];
}


/**
 * Fetches the 'previous' site in the webring.
 * @param currentIndex - The user's current index within the webring.
 * @param webringSites - The array of all the webring's sites.
 * @returns The previous site.
 */
function getPreviousSite(currentIndex: number, webringSites: Site[]): Site {
	// If the current index is 0, return the last site.
	if (currentIndex === 0) {
		return webringSites[webringSites.length - 1];
	}

	return webringSites[currentIndex - 1];
}


/**
 * Gets the current index into the webring based upon the referring URL.
 * @param referringUrl - The referring URL to get the index for.
 * @param webringSites - The array of all the webring's sites.
 * @returns The index of the site with the specified URL, or undefined if it
 * doesn't exist.
 */
function getIndexFromUrl(referringUrl: string, webringSites: Site[]):number | undefined {
	const normalisedUrl = Site.normaliseUrl(referringUrl);

	const index = webringSites.findIndex((site) => site.url === normalisedUrl);
	if (index === -1) {
		return undefined;
	}

	return index;
}


/**
 * Gets a 'new' site based upon the current index into the webring.
 * This allows a user to select the 'new' site, or 'previous', or a random site within
 * the webring.
 * @param {string} webring - The url of the parent webring to get the next site of.
 * @param {GetNewSiteMethod} method - The 'method' to use for selecting the next site.
 * @param {number} [index] - The user's current index within the webring. This is
 * not required for getting a random site.
 * @param {string} [referringUrl] - The URL of the 'referring' site. If present
 * this will be used to determine the current 'index' within the webring.
 * This parameter will override the `index` parameter. Both parameters are allowed
 * so as to provide backwards compatibility with the original system of specifying
 * an index.
 * @returns The 'new' site, or null if there is no next site to return.
 */
export async function getNewSite(webring: Readonly<Webring>,
	method: GetNewSiteMethod,
	index?: number,
	referringUrl?: string): Promise<Site|null>
{
	/** The array of the selected webring's sites. */
	const webringSites = await getWebringSites(webring.ringId!);
	if (!webringSites.length) {
		return null;
	}

	// If the webring only has a single site, just return that.
	if (webringSites.length === 1) {
		return webringSites[0];
	}

	let currentIndex: number | undefined = index;

	// If the referring URL is provided, this takes precedence over the specified index
	// and will be used to determine the current index.
	if (referringUrl) {
		currentIndex = getIndexFromUrl(referringUrl, webringSites);
	}

	if (method === GetNewSiteMethod.Random) {
		return getRandomSite(currentIndex, webringSites);
	}

	// If no index is provided, and the method is not 'random', return the first site.
	if(currentIndex === undefined) {
		return webringSites[0];
	}

	// If an invalid 'current index' has been provided, return the first site.
	if (!isIndexValid(currentIndex, webringSites)) {
		return webringSites[0];
	}

	if (method === GetNewSiteMethod.Next) {
		return getNextSite(currentIndex, webringSites);
	}

	return getPreviousSite(currentIndex, webringSites);
}
