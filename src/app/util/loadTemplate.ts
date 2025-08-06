import * as pug from 'pug';
import { readFile } from 'fs/promises';
import { logger } from '..';

/**
 * Loads, and compiles a template from its raw `pug` markup file.
 * @param {string} filename - the template filename.
 * @returns The compiled pug template.
 */
export async function loadTemplate(filename: string): Promise<pug.compileTemplate>
{
	logger.debug(`Loading template: ${filename}`);

	const data = await readFile(filename, 'utf8');

	return pug.compile(data, {
		filename
	});
}
