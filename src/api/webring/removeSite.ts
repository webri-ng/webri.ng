import { Request, Response } from 'express';
import { Schema } from 'ajv';
import { webringService } from '../../app';
import { authoriseWebringModeratorAction } from '../../app/authorisation';

/** Remove Webring request schema. */
export const removeSiteRequestSchema: Schema = {
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
 */
export async function removeSiteController(
	req: Request,
	res: Response
): Promise<void> {
	const { url } = req.body;
	const { webringUrl } = req.params;
	const { user } = res.locals;

	const webring = await webringService.getWebringByUrlOrFail(webringUrl);

	// Check the authorisation for this action.
	// Any authorisation failures will raise an exception from inside this function.
	await authoriseWebringModeratorAction(webring, user, {
		requestMetadata: res.locals.requestMetadata
	});

	await webringService.removeSite(webring, url, {
		requestMetadata: res.locals.requestMetadata
	});

	res.end();
}
