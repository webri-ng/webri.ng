import { QueryParameter } from ".";
import { siteConfig } from "../../config";

/**
 * Parses a 'page length' query parameter, returning the default value in
 * the case that an invalid value has been provided.
 * @param pageLengthQueryParameter The parameter to parse.
 * @returns The parsed query parameter.
 */
export function parsePageLengthQueryParameter(
	pageLengthQueryParameter: QueryParameter
): number {
	if (!pageLengthQueryParameter) {
		return siteConfig.defaultPageLength;
	}

	let parsedQueryParameter: number = siteConfig.defaultPageLength;

	if (Array.isArray(pageLengthQueryParameter)) {
		parsedQueryParameter = parseInt(pageLengthQueryParameter[0].toString());
	} else {
		parsedQueryParameter = parseInt(pageLengthQueryParameter.toString());
	}

	if (Number.isNaN(parsedQueryParameter)) {
		return siteConfig.defaultPageLength;
	}

	if (parsedQueryParameter > siteConfig.maximumPageLength) {
		return siteConfig.maximumPageLength;
	}

	if (parsedQueryParameter < 1) {
		return siteConfig.defaultPageLength;
	}

	return parsedQueryParameter;
}
