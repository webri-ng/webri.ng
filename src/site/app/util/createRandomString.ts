/** Additional options for the process. */
interface CreateRandomStringOptions {
	/** The length of the random string to produce. Defaults to 8. */
	length?: Readonly<number>;
	/**
	 * Whether the resulting string should be restricted to only alphabetic characters.
	 * Defaults to 'false'
	 */
	charactersOnly?: Readonly<boolean>;
}


/**
 * Creates a random string of a specified length.
 * @param {CreateRandomStringOptions} [options] - Additional options for the process.
 * @returns The created random string.
 */
 export function createRandomString(options: CreateRandomStringOptions = {}): string
{
	/**
	 * The ASCII 'Source Characters' array.
	 * These characters are used to construct the randomised string. The method is
	 * implemented in this manner since the numbers and letters are not adjacent in the
	 * ASCII table.
	 */
	const sourceCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' +
		'0123456789_';

	/**
	 * The 'ending index' for each random ASCII character.
	 * If 'characters only' is selected, this will be the length of the array, minus 11, to
	 * take into account the ten ASCII numbers and the underscore.
	 */
	let endingIndex = sourceCharacters.length;
	if (options.charactersOnly) {
		endingIndex = sourceCharacters.length - 11;
	}

	return Array(options.length || 8).fill(0).map(() => {
		return sourceCharacters[Math.floor(Math.random() * endingIndex)];
	}).join('');
}
