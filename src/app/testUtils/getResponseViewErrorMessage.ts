import { JSDOM } from 'jsdom';

/**
 * Retrieves the error message from a HTML response.
 * @param responseText The response HTML text.
 * @returns The error message, or null if it's not present.
 */
export function getResponseViewErrorMessage(
	responseText: string
): string | null {
	const dom = new JSDOM(responseText);
	const errorMessageElement =
		dom.window.document.getElementById('error-message');

	if (!errorMessageElement) {
		return null;
	}

	return errorMessageElement?.innerHTML;
}
