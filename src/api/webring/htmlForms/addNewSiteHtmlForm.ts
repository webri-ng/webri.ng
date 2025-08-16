import { NextFunction, Request, Response } from 'express';
import { ApiReturnableError } from '../../../app/error';
import { webringService } from '../../../app';
import { authoriseWebringModeratorAction } from '../../../app/authorisation';
import { webringNotFoundError } from '../../api-error-response';
import { GetWebringSearchField } from '../../../app/webring';
import { Schema } from 'ajv';

/** Create Webring HTML form request schema. */
export const addNewSiteHtmlFormRequestSchema: Schema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	type: 'object',
	properties: {
		name: {
			type: 'string'
		},
		url: {
			type: 'string'
		},
		webringUrl: {
			type: 'string'
		}
	},
	required: ['name', 'url', 'webringUrl'],
	additionalProperties: false
};

/**
 * Add new site to controller for the front-end HTML form.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function addNewSiteHtmlFormController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { name, url } = req.body;
		const { webringUrl } = req.params;
		const { user } = res.locals;

		const webring = await webringService.getWebring(
			GetWebringSearchField.Url,
			webringUrl
		);
		if (!webring) {
			throw ApiReturnableError.fromApiErrorResponseDetails(
				webringNotFoundError
			);
		}

		// Check the authorisation for this action.
		// Any authorisation failures will raise an exception from inside this function.
		await authoriseWebringModeratorAction(webring, user, {
			requestMetadata: res.locals.requestMetadata
		});

		await webringService.addNewSite(webring, name, url, user.userId, {
			requestMetadata: res.locals.requestMetadata
		});

		res.render('success', {
			pageTitle: 'Add Site to Webring',
			contentTitle: 'Add Site to Webring',
			redirectLink: `/webring/${webring.url}`
		});
	} catch (error) {
		// This error can't be handled via the 'addNewSite' view, and needs to be
		// forwarded to the main error handler.
		if (
			error instanceof ApiReturnableError &&
			error.code === webringNotFoundError.code
		) {
			return next(error);
		}

		// In the case of expected errors, re-render the form with the error message.
		if (error instanceof ApiReturnableError) {
			return res
				.status(error.httpStatus)
				.render('webring/htmlForms/addNewSite', {
					errorMessage: error.message,
					// Even though we don't have the full webring info, just return the URL
					// here so that the hidden form field will work correctly.
					webring: {
						url: req.params.webringUrl
					}
				});
		}

		return next(error);
	}
}
