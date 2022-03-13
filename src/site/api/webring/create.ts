import { NextFunction, Request, Response } from 'express';
import { logger, webringService } from '../../app';
import { RequestSchema } from '../../model';

/** Create Webring request schema. */
export const createWebringRequestSchema: RequestSchema = {
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
 * Create webring controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns A response object to return to the caller.
 */
export async function createWebringController(req: Request,
	res: Response,
	next: NextFunction): Promise<Response|void>
{
	try {
		const { name, url, description, privateRing, tags } = req.body;
		const { userId } = res.locals.user;

		const newWebring = await webringService.createWebring(name, url, description,
			privateRing, userId, tags);

		logger.info(`Created new webring: '${newWebring.url}/${newWebring.ringId}'`);

		// The redirect redirect implementation is problematic. So simply return the new
		// webring URL, and perform the redirect on the front-end.
		res.json({
			url: newWebring.url
		});
	} catch (err) {
		return next(err);
	}
}
