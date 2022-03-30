import { NextFunction, Request, Response } from 'express';
import { logger, webringService } from '../../app';
import { authoriseWebringModeratorAction } from '../../app/authorisation';
import { WebringNotFoundError } from '../../app/error';
import { GetWebringSearchField } from '../../app/webring';
import { RequestSchema } from '../../model';
import { webringNotFoundError } from '../api-error-response';

/** Update Webring request schema. */
export const updateWebringRequestSchema: RequestSchema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	type: 'object',
	properties: {
		name: {
			type: 'string'
		},
		url: {
			type: 'string'
		},
		description: {
			type: 'string'
		},
		privateRing: {
			type: 'boolean'
		},
		tags: {
			'type': 'array',
			'items': {
				'type': 'string'
			}
		}
	},
	required: ['name', 'url', 'description', 'privateRing', 'tags'],
	additionalProperties: false
};

/**
 * Update webring controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns A response object to return to the caller.
 */
export async function updateWebringController(req: Request,
	res: Response,
	next: NextFunction): Promise<Response|void>
{
	try {
		const { name, url, description, privateRing, tags } = req.body;
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

		const updatedWebring = await webringService.updateWebring(webring.ringId!, user.userId,
			name, url, description, privateRing, tags);

		logger.info(`User '${user.userId}' updated webring: '${webringUrl}'`);

		// The redirect redirect implementation is problematic. So simply return the new
		// webring URL, and perform the redirect on the front-end.
		res.json({
			url: `/webring/${updatedWebring.url}`
		});
	} catch (err) {
		return next(err);
	}
}
