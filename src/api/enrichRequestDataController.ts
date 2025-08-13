import { NextFunction, Request, Response } from 'express';
import * as uuid from 'uuid';

/**
 * Enriches the incoming request with additional metadata.
 * @param {Request} req - Express request body.
 * @param {Response} res - Express Response.
 * @param {NextFunction} next - Express next middleware handler.
 */
export function enrichRequestDataController(
	req: Request,
	res: Response,
	next: NextFunction
): void {
	res.locals.requestMetadata = {
		requestIp: req.ip,
		requestId: uuid.v6()
	};

	return next(null);
}
