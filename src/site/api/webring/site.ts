import { NextFunction, Request, Response } from 'express';
import { webringService } from '../../app';
import { InvalidIdentifierError, WebringNotFoundError } from '../../app/error';
import { GetNewSiteMethod } from '../../app/webring';
import { globalConfig } from '../../config';

/**
 * Get random site event handler.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns A response object to return to the caller.
 */
export async function getRandomSiteController(req: Request,
	res: Response,
	next: NextFunction): Promise<Response|void>
{
	const { webringId } = req.params;

	try {
		const newSite = await webringService.getNewSite(webringId || '', GetNewSiteMethod.Random);

		return res.redirect(newSite.url);
	} catch (err) {
		if (err instanceof WebringNotFoundError || err instanceof InvalidIdentifierError) {
			return res.redirect(globalConfig.baseDomainUrl);
		}

		// Proceed to rendering the 'unhandled exception' view if this error has not been handled.
		return next(err);
	}
}


/**
 * Get previous site event handler.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns A response object to return to the caller.
 */
export async function getPreviousSiteController(req: Request,
	res: Response,
	next: NextFunction): Promise<Response|void>
{
	const { webringId } = req.params;
	const { index } = req.query;

	let currentIndex: number|undefined;
	if (index) {
		currentIndex = parseInt(index.toString());
	}

	try {
		const newSite = await webringService.getNewSite(webringId || '', GetNewSiteMethod.Previous,
			currentIndex);

		return res.redirect(newSite.url);
	} catch (err) {
		if (err instanceof WebringNotFoundError || err instanceof InvalidIdentifierError) {
			return res.redirect(globalConfig.baseDomainUrl);
		}

		return next(err);
	}
}


/**
 * Get next site event handler.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns A response object to return to the caller.
 */
export async function getNextSiteController(req: Request,
	res: Response,
	next: NextFunction): Promise<Response|void>
{
	const { webringId } = req.params;
	const { index } = req.query;

	let currentIndex: number|undefined;
	if (index) {
		currentIndex = parseInt(index.toString());
	}

	try {
		const newSite = await webringService.getNewSite(webringId || '', GetNewSiteMethod.Next,
			currentIndex);

		return res.redirect(newSite.url);
	} catch (err) {
		if (err instanceof WebringNotFoundError || err instanceof InvalidIdentifierError) {
			return res.redirect(globalConfig.baseDomainUrl);
		}

		return next(err);
	}
}
