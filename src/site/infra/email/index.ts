import { Readable } from 'stream';
import * as nodemailer from 'nodemailer';
import { emailConfig } from '../../config';
import { logger } from '../../app';


/** Interface type representing the data dependencies for an email attachment. */
 export interface IEmailAttachment {
	/** The name of the attachment file. */
	filename: string|false;
	/** A Node file stream or buffer object representing the attachment file. */
	content: string|Buffer|Readable;
}


/** Interface type representing options for the email sending process. */
export interface IEmailOptions {
	/** The FROM address to use in the SMTP request. */
	from?: string;
	/** Addresses from this value get added to RCPT TO list. */
	bcc?: string;
	/** The email attachments. */
	attachments?: IEmailAttachment[];
}


/** The email transport instance used to send email. */
// eslint-disable-next-line
let emailTransport: nodemailer.Transporter<any>;


/**
 * Initialises the email transport.
 */
function createTransport(): void
{
	logger.debug('Creating email transport');

	emailTransport = nodemailer.createTransport(emailConfig.transport);
}


/**
 * Sends an email via the configured email service.
 *  See: https://nodemailer.com/message/
 * @TODO: Improve error recovery from failed email.
 * @param {string} to - The address to send the email to.
 * @param {string} subject - The subject line for the email.
 * @param {string} htmlContent - The html message content of the email.
 * @param {IEmailOptions} [options] - Additional options for the email sending process.
 */
export async function sendEmail(to: Readonly<string>,
	subject: Readonly<string>,
	htmlContent: Readonly<string>,
	options: Readonly<IEmailOptions> = {}): Promise<void>
{
	if (!emailTransport) {
		createTransport();
	}

	// Verify the SMTP connection is established.
	emailTransport.verify((err) => {
		if (err) {
			logger.error('Error initialising email transport', err);
			throw err;
		}
	});

	await emailTransport.sendMail({
		to,
		from: options.from || emailConfig.from,
		bcc: options.bcc || emailConfig.bcc || undefined,
		subject,
		html: htmlContent,
		attachments: options.attachments || []
	});
}
