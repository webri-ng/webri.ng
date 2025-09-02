import { Request, Response } from 'express';
import { Schema } from 'ajv';
import { webringService } from '../../app';
import { authoriseWebringModeratorAction } from '../../app/authorisation';

/** Create Webring request schema. */
export const addNewSiteRequestSchema: Schema = {
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
 */
export async function addNewSiteController(
	req: Request,
	res: Response
): Promise<void> {
	const { name, url } = req.body;
	const { webringUrl } = req.params;
	const { user } = res.locals;

	const webring = await webringService.getWebringByUrlOrFail(webringUrl);

	// Check the authorisation for this action.
	// Any authorisation failures will raise an exception from inside this function.
	await authoriseWebringModeratorAction(webring, user, {
		requestMetadata: res.locals.requestMetadata
	});

	await webringService.addNewSite(webring, name, url, user.userId, {
		requestMetadata: res.locals.requestMetadata
	});

	// The redirect redirect implementation is problematic. So simply return the webring
	// URL, and perform the redirect on the front-end.
	res.json({
		url: `/webring/${webring.url}`
	});
}
