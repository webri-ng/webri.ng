import { NextFunction, Request, Response } from 'express';
import { webringService } from '../../app';
import { WebringNotFoundError } from '../../app/error';
import { GetWebringSearchField } from '../../app/webring';
import { webringNotFoundError } from '../api-error-response';
import { createSiteApiResult } from '../model/SiteApiResult';

/**
 * Get sites controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function getSitesController(req: Request,
	res: Response,
	next: NextFunction): Promise<void> {
	const { webringUrl } = req.params;

	try {
		// Ensure that the specified webring exists.
		const webring = await webringService.getWebring(
			GetWebringSearchField.Url,
			webringUrl
		);
		if (!webring) {
			throw new WebringNotFoundError(`Webring with url '${webringUrl}' cannot be found.`,
				webringNotFoundError.code, webringNotFoundError.httpStatus);
		}

		const webringSites = await webringService.getWebringSites(webring.ringId!);

		res.json(webringSites.map(createSiteApiResult));
	} catch (err) {
		if (err instanceof WebringNotFoundError) {
			res.status(404).end();

			return;
		}

		return next(err);
	}
}
