import { NextFunction, Request, Response } from 'express';
import { webringService } from '../../app';
import { authoriseWebringOwnerAction } from '../../app/authorisation';
import { GetWebringSearchField } from '../../app/webring';


/**
 * Delete webring view controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
 export async function deleteWebringViewController(req: Request,
	res: Response,
	next: NextFunction): Promise<void>
{
	try {
		const { user } = res.locals;
		const { webringUrl } = req.params;

		const webring = await webringService.getWebring(GetWebringSearchField.Url, webringUrl);
		if (!webring) {
			return res.render('webring/notFound', {
				user
			});
		}

		// Check the authorisation for this action.
		// Any authorisation failures will raise an exception from inside this function.
		await authoriseWebringOwnerAction(webring, user);

		return res.render('webring/delete', {
			user,
			webring
		});
	} catch (err) {
		return next(err);
	}
}
