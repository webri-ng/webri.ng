import { NextFunction, Request, Response } from 'express';
import { webringService } from '../../app';
import { ApiReturnableError } from '../../app/error';
import { webringNotFoundError } from '../api-error-response';
import { createSiteApiResult } from '../model/SiteApiResult';

/**
 * Get sites controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function getSitesController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	const { webringUrl } = req.params;

	try {
		const webring = await webringService.getWebringByUrlOrFail(webringUrl);

		const webringSites = await webringService.getWebringSites(webring.ringId!);

		res.json(webringSites.map(createSiteApiResult));
	} catch (err) {
		if (
			err instanceof ApiReturnableError &&
			err.code === webringNotFoundError.code
		) {
			res.status(404).end();

			return;
		}

		return next(err);
	}
}
