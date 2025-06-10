import { NextFunction, Request, Response } from 'express';
import { webringService } from '../../../app';
import { ApiReturnableError } from '../../../app/error';
import { Schema } from 'ajv';

/** Create Webring request schema. */
export const createWebringHtmlFormRequestSchema: Schema = {
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
 * Create webring HTML-form controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function createWebringHtmlFormController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { name, url, description, privateRing } = req.body;
		const { userId } = res.locals.user;

		const newWebring = await webringService.createWebring(
			name,
			url,
			description,
			privateRing === 'on',
			userId,
			[],
			{
				requestMetadata: res.locals.requestMetadata
			}
		);

		res.render('success', {
			pageTitle: 'Create Webring',
			contentTitle: `Created webring '${newWebring.name}'`,
			redirectLink: `/webring/${newWebring.url}`
		});
	} catch (error) {
		// In the case of expected errors, re-render the form with the error message.
		if (error instanceof ApiReturnableError) {
			return res.status(error.httpStatus).render('webring/create', {
				errorMessage: error.message
			});
		}

		return next(error);
	}
}
