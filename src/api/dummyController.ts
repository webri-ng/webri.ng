import { Request, Response } from 'express';

/**
 * Dummy controller.
 * Used as a placeholder for future implementation.
 * @deprecated
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @returns Renders the view.
 */
export function dummyController(_req: Request, res: Response): Response {
	return res.status(404).end('Not implemented');
}
