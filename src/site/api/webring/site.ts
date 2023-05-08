import { NextFunction, Request, Response } from 'express';
import { webringService } from '../../app';
import { SiteNotFoundError, WebringNotFoundError } from '../../app/error';
import { GetNewSiteMethod, GetWebringSearchField } from '../../app/webring';
import { globalConfig } from '../../config';
import { siteNotFoundError, webringNotFoundError } from '../api-error-response';

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
	const { index, via } = req.query;

	let newSiteMethod = GetNewSiteMethod.Next;
	if (method === 'previous') {
		newSiteMethod = GetNewSiteMethod.Previous;
	}

	if (method === 'random') {
		newSiteMethod = GetNewSiteMethod.Random;
	}

	let currentIndex: number | undefined;
	if (index) {
		if (Array.isArray(index)) {
			currentIndex = parseInt(index[0].toString());
		} else {
			currentIndex = parseInt(index.toString());
		}
	}

	let referringUrl: string | undefined;
	if (via) {
		if (Array.isArray(via)) {
			referringUrl = via[0].toString();
		} else {
			referringUrl = via.toString();
		}
	}

	try {
		// Ensure that the specified webring exists.
		const webring = await webringService.getWebring(GetWebringSearchField.Url, webringUrl);
		if (!webring) {
			throw new WebringNotFoundError(`Webring with url '${webringUrl}' cannot be found.`,
				webringNotFoundError.code, webringNotFoundError.httpStatus);
		}

		const newSite = await webringService.getNewSite(webring, newSiteMethod,
			currentIndex, referringUrl);
		// If the new site cannot be retrieved, redirect to the home page.
		if (!newSite) {
			throw new SiteNotFoundError('This webring has no sites added',
				siteNotFoundError.code, siteNotFoundError.httpStatus);
		}

		return res.redirect(303, newSite.url);
	} catch (err) {
		if (err instanceof WebringNotFoundError || SiteNotFoundError) {
			return res.redirect(404, globalConfig.baseDomainUrl);
		}

		return next(err);
	}
}
