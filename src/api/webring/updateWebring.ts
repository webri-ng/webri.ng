import { Request, Response } from 'express';
import { Schema } from 'ajv';
import { webringService } from '../../app';
import { authoriseWebringModeratorAction } from '../../app/authorisation';

/** Update Webring request schema. */
export const updateWebringRequestSchema: Schema = {
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
			type: 'array',
			items: {
				type: 'string'
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
 */
export async function updateWebringController(
	req: Request,
	res: Response
): Promise<void> {
	const { name, url, description, privateRing, tags } = req.body;
	const { webringUrl } = req.params;
	const { user } = res.locals;

	const webring = await webringService.getWebringByUrlOrFail(webringUrl);

	// Check the authorisation for this action.
	// Any authorisation failures will raise an exception from inside this function.
	await authoriseWebringModeratorAction(webring, user, {
		requestMetadata: res.locals.requestMetadata
	});

	const updatedWebring = await webringService.updateWebring(
		webring.ringId!,
		user.userId,
		name,
		url,
		description,
		privateRing,
		tags,
		{
			requestMetadata: res.locals.requestMetadata
		}
	);

	// The redirect redirect implementation is problematic. So simply return the new
	// webring URL, and perform the redirect on the front-end.
	res.json({
		url: `/webring/${updatedWebring.url}`
	});
}
