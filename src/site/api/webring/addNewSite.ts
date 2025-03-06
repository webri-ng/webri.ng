import { NextFunction, Request, Response } from 'express';
import { webringService } from '../../app';
import { authoriseWebringModeratorAction } from '../../app/authorisation';
import { WebringNotFoundError } from '../../app/error';
import { GetWebringSearchField } from '../../app/webring';
import { RequestSchema } from '../../model';
import { webringNotFoundError } from '../api-error-response';
import { getRequestMetadata } from '../getRequestMetadata';

/** Create Webring request schema. */
export const addNewSiteRequestSchema: RequestSchema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	type: 'object',
	properties: {
		name: {
			type: 'string'
		},
		url: {
			type: 'string'
		}
	},
	required: ['name', 'url'],
	additionalProperties: false
};

/**
 * Add new site to webring controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function addNewSiteController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { name, url } = req.body;
		const { webringUrl } = req.params;
		const { user } = res.locals;

		const requestMetadata = getRequestMetadata(req, res);

		const webring = await webringService.getWebring(
			GetWebringSearchField.Url,
			webringUrl
		);
		if (!webring) {
			throw new WebringNotFoundError(
				webringNotFoundError.message,
				webringNotFoundError.code,
				webringNotFoundError.httpStatus
			);
		}

		// Check the authorisation for this action.
		// Any authorisation failures will raise an exception from inside this function.
		await authoriseWebringModeratorAction(webring, user, { requestMetadata });

		await webringService.addNewSite(webring, name, url, user.userId, {
			requestMetadata
		});

		// The redirect redirect implementation is problematic. So simply return the webring
		// URL, and perform the redirect on the front-end.
		res.json({
			url: `/webring/${webring.url}`
		});
	} catch (err) {
		return next(err);
	}
}
