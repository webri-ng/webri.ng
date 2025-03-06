import { NextFunction, Request, Response, RequestHandler } from 'express';
import { RequestMetadata } from '../model';

/**
 * Returns the metadata for the current request.
 */
export function getRequestMetadata(
	req: Request,
	res: Response,
): RequestMetadata {
	return {
		requestIp: req.ip,
		requestId: res.locals.requestId,
	};
}
