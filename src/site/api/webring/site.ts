import { NextFunction, Request, Response } from 'express';
import { webringService } from '../../app';
import { WebringNotFoundError } from '../../app/error';
import { GetNewSiteMethod, GetWebringSearchField } from '../../app/webring';
import { globalConfig } from '../../config';
import { webringNotFoundError } from '../api-error-response';

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
		// Ensure that the specified webring exists.
		const webring = await webringService.getWebring(GetWebringSearchField.Url, webringUrl);
		if (!webring) {
			throw new WebringNotFoundError(`Webring with url '${webringUrl}' cannot be found.`,
				webringNotFoundError.code, webringNotFoundError.httpStatus);
		}

		const newSite = await webringService.getNewSite(webring, newSiteMethod, currentIndex);

		return res.redirect(303, newSite.url);
	} catch (err) {
		if (err instanceof WebringNotFoundError) {
			return res.redirect(404, globalConfig.baseDomainUrl);
		}

		return next(err);
	}
}
