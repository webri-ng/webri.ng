import { sendEmail } from '../../../../infra/email';
import { User } from '../../../../model';
import { createRegistrationEmailContent } from './createRegistrationEmailContent';

/**
 * Sends the registration email for a new user.
 * @param {User} user - The new user to send the registration email to.
 */
export async function sendRegistrationEmail(user: Readonly<User>): Promise<void>
{
	const title = 'Welcome to Webri.ng!';
	const htmlContent = await createRegistrationEmailContent(user);

	await sendEmail(user.email, title, htmlContent);
}
