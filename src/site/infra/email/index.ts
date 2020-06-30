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
	options: IEmailOptions = {}): Promise<void>
{
	logger.debug({
		to,
		subject,
		htmlContent,
		options
	});

	/*
	if (!emailTransport) {
		logger.debug('Email transport does not exist');
		createTransport();
	}

	// Verify the SMTP connection is established.
	emailTransport.verify((err) => {
		if(err) {
			throw new Error(`Error initialising email transport: ${err.message}`);
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

	return new EmailResult(to, subject, htmlContent, true);
	*/
}
