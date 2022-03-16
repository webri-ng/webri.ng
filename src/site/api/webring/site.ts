import { NextFunction, Request, Response } from 'express';
import { webringService } from '../../app';
import { WebringNotFoundError } from '../../app/error';
import { GetNewSiteMethod } from '../../app/webring';
import { globalConfig } from '../../config';

/**
 * Get next site controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns A response object to return to the caller.
 */
 export async function getNewSiteController(req: Request,
	res: Response,
	next: NextFunction): Promise<void>
{
	const { webringUrl, method } = req.params;
	const { index } = req.query;

	let newSiteMethod = GetNewSiteMethod.Next;
	if (method === 'previous') {
		newSiteMethod = GetNewSiteMethod.Previous;
	}

	if (method === 'random') {
		newSiteMethod = GetNewSiteMethod.Random;
	}

	let currentIndex: number|undefined;
	if (index) {
		currentIndex = parseInt(index.toString());
	}

	try {
		const newSite = await webringService.getNewSite(webringUrl, newSiteMethod, currentIndex);

		return res.redirect(303, newSite.url);
	} catch (err) {
		if (err instanceof WebringNotFoundError) {
			return res.redirect(404, globalConfig.baseDomainUrl);
		}

		return next(err);
	}
}
