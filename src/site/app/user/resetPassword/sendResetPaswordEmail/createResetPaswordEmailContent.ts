import * as pug from 'pug';
import { User } from '../../../../model';
import { loadTemplate } from '../../../util';

/** The compiled reset password email template. */
export let compiledResetPasswordEmailTemplate: pug.compileTemplate | undefined;

/**
 * Creates the HTML string containing the compiled reset password email content.
 * @param {User} user The user to create the email content for.
 * @param {string} temporaryPassword The user's new temporary password.
 * @returns The compiled email content in string form.
 */
export async function createResetPasswordEmailContent(user: Readonly<User>,
	temporaryPassword: Readonly<string>): Promise<string>
{
	if (!compiledResetPasswordEmailTemplate) {
		compiledResetPasswordEmailTemplate = await loadTemplate('template/resetPassword.pug');
	}

	return compiledResetPasswordEmailTemplate({
		username: user.username,
		temporaryPassword
	});
}
