import * as pug from 'pug';
import { User } from '../../../../model';
import { loadEmailTemplate } from '../../../util';

/** The compiled registration email template. */
export let compiledRegistrationEmailTemplate: pug.compileTemplate | undefined;

/**
 * Creates the HTML string containing the compiled registration email content for a new user.
 * @param {User} user - The user to create the registration email content for.
 * @returns The compiled registration email content in string form.
 */
export async function createRegistrationEmailContent(user: Readonly<User>): Promise<string>
{
	if (!compiledRegistrationEmailTemplate) {
		compiledRegistrationEmailTemplate = await loadEmailTemplate('template/registration.pug');
	}

	return compiledRegistrationEmailTemplate({
		username: user.username
	});
}
