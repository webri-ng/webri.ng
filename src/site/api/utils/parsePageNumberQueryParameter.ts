import { QueryParameter } from '.';

/**
 * Parses a 'page number' query parameter, returning a default value of '1' in
 * the case that an invalid value has been provided.
 * @param pageNumberQueryParameter The parameter to parse.
 * @returns The parsed query parameter.
 */
export function parsePageNumberQueryParameter(
	pageNumberQueryParameter: QueryParameter
): number {
	if (!pageNumberQueryParameter) {
		return 1;
	}

	let parsedQueryParameter = 1;

	if (Array.isArray(pageNumberQueryParameter)) {
		parsedQueryParameter = parseInt(pageNumberQueryParameter[0].toString());
	} else {
		parsedQueryParameter = parseInt(pageNumberQueryParameter.toString());
	}

	if (Number.isNaN(parsedQueryParameter)) {
		return 1;
	}

	if (parsedQueryParameter < 1) {
		return 1;
	}

	return parsedQueryParameter;
}
