import * as pug from 'pug';
import { readFile } from 'fs/promises';
import { logger } from '..';

/**
 * Loads, and compiles an email template from its raw `pug` markup file.
 * @param {string} filename - the template filename.
 * @returns The compiled pug template.
 */
export async function loadEmailTemplate(filename: Readonly<string>): Promise<pug.compileTemplate>
{
	logger.debug(`Loading email template: ${filename}`);

	const data = await readFile(filename, 'utf8');

	return pug.compile(data, {
		filename
	});
}
