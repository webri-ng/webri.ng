import { NextFunction, Request, Response } from 'express';
import { webringService } from '../../app';
import { ApiReturnableError } from '../../app/error';
import { GetNewSiteMethod } from '../../app/webring';
import { globalConfig } from '../../config';
import {
	siteNotFoundError,
	webringHasNoSitesErrorMessage,
	webringNotFoundError
} from '../api-error-response';

export const getNextSiteController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => getNewSiteController(GetNewSiteMethod.Next, req, res, next);

export const getPreviousSiteController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => getNewSiteController(GetNewSiteMethod.Previous, req, res, next);

export const getRandomSiteController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => getNewSiteController(GetNewSiteMethod.Random, req, res, next);

/**
 * @note: Express automatically decodes URI components in the query parameters,
 * so we don't need to decode them ourselves.
 */
function getReferringUrlFromRequest(req: Request): string | undefined {
	const { via } = req.query;

	if (!via) {
		return undefined;
	}

	if (Array.isArray(via)) {
		return via[0].toString();
	}

	return via.toString();
}

function getIndexFromRequest(req: Request): number | undefined {
	const { index } = req.query;

	if (!index) {
		return undefined;
	}

	let currentIndex: number;
	if (Array.isArray(index)) {
		currentIndex = parseInt(index[0].toString());
	} else {
		currentIndex = parseInt(index.toString());
	}

	if (Number.isNaN(currentIndex)) {
		return undefined;
	}

	return currentIndex;
}

/**
 * Get next site controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
async function getNewSiteController(
	newSiteMethod: GetNewSiteMethod,
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	const { webringUrl } = req.params;

	const currentIndex = getIndexFromRequest(req);
	const referringUrl = getReferringUrlFromRequest(req);

	try {
		const webring = await webringService.getWebringByUrlOrFail(webringUrl);

		const newSite = await webringService.getNewSite(
			webring,
			newSiteMethod,
			currentIndex,
			referringUrl
		);
		// If the new site cannot be retrieved, redirect to the home page.
		if (!newSite) {
			throw new ApiReturnableError(
				webringHasNoSitesErrorMessage,
				siteNotFoundError.code,
				siteNotFoundError.httpStatus
			);
		}

		return res.redirect(303, newSite.url);
	} catch (err) {
		if (
			err instanceof ApiReturnableError &&
			(err.code === webringNotFoundError.code ||
				err.code === siteNotFoundError.code)
		) {
			return res.redirect(404, globalConfig.baseDomainUrl);
		}

		return next(err);
	}
}
