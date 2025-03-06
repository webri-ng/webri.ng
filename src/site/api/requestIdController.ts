import { NextFunction, Request, Response } from 'express';
import * as uuid from 'uuid';

/**
 * Creates a unique request ID for the incoming request.
 */
export function requestIdController(
	req: Request,
	res: Response,
	next: NextFunction
): void {
	res.locals.requestId = uuid.v6();
	next();
}
