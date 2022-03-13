import { NextFunction, Request, Response } from 'express';
import { removeSessionCookieResponse } from '../removeSessionCookieResponse';

/**
 * User logout view controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns A response object to return to the caller.
 */
export async function logoutViewController(req: Request,
	res: Response,
	next: NextFunction): Promise<Response|void>
{
	const { session } = res.locals;

	console.log(session);

	return removeSessionCookieResponse(res, session).redirect(302, '/');
}
