
import { NextFunction, Request, Response } from 'express';

export function dummyController(req: Request,
	res: Response,
	next: NextFunction): Response
{
	return res.status(404).end('Not implemented');
}
