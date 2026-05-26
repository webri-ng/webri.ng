import { NextFunction, Request, Response } from 'express';
import { Schema } from 'ajv';
import { webringService } from '../../../app';
import { authoriseWebringModeratorAction } from '../../../app/authorisation';
import { ApiReturnableError } from '../../../app/error';
import { GetWebringSearchField } from '../../../app/webring';

/** Update Webring HTML form request schema. */
export const updateWebringHtmlFormRequestSchema: Schema = {
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
			type: 'string'
		}
	},
	required: ['name', 'url', 'description'],
	additionalProperties: false
};

/**
 * Update webring HTML form controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function updateWebringHtmlFormController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { name, url, description, privateRing } = req.body;
		const { webringUrl } = req.params;
		const { user } = res.locals;

		const webring = await webringService.getWebring(
			GetWebringSearchField.Url,
			webringUrl
		);
		if (!webring) {
			return res.status(404).render('webring/notFound', {
				user
			});
		}

		const { isUserModerator, isUserOwner } =
			await webringService.getUserPermissionsForWebring(webring, user);

		// If it's a private webring, and the user is not authorised, show the 404 page.
		// This is done so that private webrings can't be enumerated by an
		// unauthorised user.
		if (webring.private) {
			if (!(isUserModerator || isUserOwner)) {
				return res.status(404).render('webring/notFound', {
					user
				});
			}
		}

		// Check the authorisation for this action.
		// Any authorisation failures will raise an exception from inside this function.
		await authoriseWebringModeratorAction(webring, user, {
			requestMetadata: res.locals.requestMetadata
		});

		// Preserve existing tags since the HTML form doesn't support tag editing.
		const existingTags = webring.tags.map((tag) => tag.name);

		const updatedWebring = await webringService.updateWebring(
			webring.ringId!,
			user.userId,
			name,
			url,
			description,
			privateRing === 'on',
			existingTags,
			{
				requestMetadata: res.locals.requestMetadata
			}
		);

		res.render('success', {
			pageTitle: 'Update Webring',
			contentTitle: `Updated webring '${updatedWebring.name}'`,
			redirectLink: `/webring/${updatedWebring.url}`
		});
	} catch (error) {
		// In the case of expected errors, re-render the form with the error message.
		if (error instanceof ApiReturnableError) {
			return res.status(error.httpStatus).render('webring/htmlForms/update', {
				errorMessage: error.message,
				webring: {
					url: req.params.webringUrl,
					name: req.body.name,
					description: req.body.description,
					private: req.body.privateRing === 'on'
				}
			});
		}

		return next(error);
	}
}
