import { NextFunction, Request, Response } from 'express';
import { newsService } from '../app';

/**
 * Health check controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns A response object to return to the caller.
 */
export async function healthCheckController(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		// Perform an arbitrary database query to ensure that database functionality
		// is working correctly.
		// This query was chosen on account of having no joins, no side-effects, and
		// a small result set.
		await newsService.getNewsUpdates();

		res.end();
	} catch (err) {
		return next(err);
	}
}
