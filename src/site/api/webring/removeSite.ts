import { NextFunction, Request, Response } from 'express';
import { logger, webringService } from '../../app';
import { authoriseWebringModeratorAction } from '../../app/authorisation';
import { WebringNotFoundError } from '../../app/error';
import { GetWebringSearchField } from '../../app/webring';
import { RequestSchema } from '../../model';
import { webringNotFoundError } from '../api-error-response';

/** Remove Webring request schema. */
export const removeSiteRequestSchema: RequestSchema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	type: 'object',
	properties: {
		url: {
			type: 'string'
		}
	},
	required: ['url'],
	additionalProperties: false
};

/**
 * Remove site from webring controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function removeSiteController(req: Request,
	res: Response,
	next: NextFunction): Promise<void>
{
	try {
		const { url } = req.body;
		const { webringUrl } = req.params;
		const { user } = res.locals;

		const webring = await webringService.getWebring(GetWebringSearchField.Url, webringUrl);
		if (!webring) {
			throw new WebringNotFoundError(webringNotFoundError.message,
				webringNotFoundError.code, webringNotFoundError.httpStatus);
		}

		// Check the authorisation for this action.
		// Any authorisation failures will raise an exception from inside this function.
		await authoriseWebringModeratorAction(webring, user);

		await webringService.removeSite(webring, url);

		logger.info(`User '${user.userId}' removed site '${url}' from webring '${webringUrl}'`);

		// The redirect redirect implementation is problematic. So simply return the webring
		// URL, and perform the redirect on the front-end.
		res.end();
	} catch (err) {
		return next(err);
	}
}
