
import { NextFunction, Request, Response } from 'express';

/**
 * Dummy controller.
 * Used as a placeholder for future implementation.
 * @deprecated
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns Renders the view.
 */
export function dummyController(req: Request,
	res: Response,
	next: NextFunction): Response
{
	return res.status(404).end('Not implemented');
}
