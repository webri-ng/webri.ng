import { NextFunction, Request, Response } from 'express';
import { logger, webringService } from '../../app';
import { authoriseWebringOwnerAction } from '../../app/authorisation';
import { WebringNotFoundError } from '../../app/error';
import { GetWebringSearchField } from '../../app/webring';
import { webringNotFoundError } from '../api-error-response';
import { getRequestMetadata } from '../getRequestMetadata';

/**
 * Delete webring controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function deleteWebringController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { user } = res.locals;
		const { webringUrl } = req.params;

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

		// Check the authorisation for this action. Only the webring's creator is
		// allowed to delete the webring.
		// Any authorisation failures will raise an exception from inside this function.
		authoriseWebringOwnerAction(webring, user, { requestMetadata });

		await webringService.deleteWebring(webring.ringId!, { requestMetadata });

		res.end();
	} catch (err) {
		return next(err);
	}
}
