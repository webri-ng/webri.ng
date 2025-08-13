import { NextFunction, Request, Response } from 'express';
import { removeSessionCookieResponse } from '../removeSessionCookieResponse';
import { logger } from '../../app';

/**
 * User logout view controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns A response object to return to the caller.
 */
export function logoutViewController(
	req: Request,
	res: Response,
	_next: NextFunction
): void {
	const { session } = res.locals;

	logger.debug('Logging out user', {
		userId: session.userId,
		sessionId: session.sessionId,
		...(res.locals.requestMetadata ?? {})
	});

	return removeSessionCookieResponse(res, session).redirect(302, '/');
}
