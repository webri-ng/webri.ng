import { NextFunction, Request, Response } from 'express';
import { NoAuthenticationError } from '../app/error';

/**
 * Request authentication middleware controller.
 * This middleware authenticates whether a current user session exists.
 * @param {Request} req - Express request body.
 * @param {Response} res - Express Response.
 * @param {NextFunction} next - Express next middleware handler.
 */
export function authenticateSessionController(req: Request,
	res: Response,
	next: NextFunction): Response|void
{
	if (!res.locals.user) {
		return next(new NoAuthenticationError());
	}

	return next(null);
}
