import { NextFunction, Request, Response } from 'express';
import { logger, webringService } from '../../app';
import { authoriseWebringOwnerAction } from '../../app/authorisation';
import { GetWebringSearchField } from '../../app/webring';

/**
 * Delete webring controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns A response object to return to the caller.
 */
export async function deleteWebringController(req: Request,
	res: Response,
	next: NextFunction): Promise<Response|void>
{
	try {
		const { user } = res.locals;
		const { webringUrl } = req.params;

		const webring = await webringService.getWebring(GetWebringSearchField.Url, webringUrl);
		if (!webring) {
			return res.status(404).end();
		}

		// Check the authorisation for this action. Only the webring's creator is
		// allowed to delete the webring.
		// Any authorisation failures will raise an exception from inside this function.
		await authoriseWebringOwnerAction(webring, user);

		logger.info(`User ${user.userId} deleted webring: '${webringUrl}'`);

		await webringService.deleteWebring(webring.ringId!);

		res.end();
	} catch (err) {
		return next(err);
	}
}
