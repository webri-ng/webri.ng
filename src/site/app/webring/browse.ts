import { search, SearchWebringsMethod, SearchWebringsOptions, SearchWebringsResults } from '.';

/**
 * Browses webrings.
 * @param {SearchWebringsOptions} [options] Options for the process.
 * @returns An array of webrings.
 */
export async function browse(
	options: Readonly<SearchWebringsOptions> = {}): Promise<SearchWebringsResults>
{
	return search(SearchWebringsMethod.All, undefined, options);
}
