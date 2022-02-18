import { NextFunction, Request, Response } from 'express';
import { logger, createErrorReference } from '../app';
import { unhandledExceptionError } from './api-error-response';

/**
 * Renders the 'unhandled exception page'.
 * @param {Error} err The error raised by the previous controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns The rendered view.
 */
export function unhandledExceptionViewHandler(err: Error | undefined,
	req: Request,
	res: Response,
	next: NextFunction): Response | void
{
	/**
	 * The error 'reference' code to return to the frontend.
	 * This provides a code which can be referenced when talking with support. This makes
	 * finding an error in the logs easier.
	 */
	const errorReference: string = createErrorReference();

	logger.error(`Unhandled error '${errorReference}'`, err);

	return res.status(unhandledExceptionError.httpStatus).render('500', {
		errorMessage: 'An unhandled server error has occurred. ' +
			'If this error persists, please contact support and quote error ' +
			`reference '${errorReference}'`
	});
}
