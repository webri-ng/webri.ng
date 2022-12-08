import { sendEmail } from '../../../../infra/email';
import { User } from '../../../../model';
import { createResetPasswordEmailContent } from './createResetPaswordEmailContent';

/**
 * Sends the reset password email to a user.
 * @param {User} user The new user to send the registration email to.
 * @param {string} temporaryPassword The user's new temporary password.
 */
export async function sendResetPaswordEmail(user: Readonly<User>,
	temporaryPassword: string): Promise<void>
{
	const title = 'Your Webri.ng password has been reset';
	const htmlContent = await createResetPasswordEmailContent(user, temporaryPassword);

	await sendEmail(user.email, title, htmlContent);
}
