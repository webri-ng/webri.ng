import { NextFunction, Request, Response } from 'express';
import { webringService } from '../../app';
import { authoriseWebringModeratorAction } from '../../app/authorisation';
import { GetWebringSearchField } from '../../app/webring';

/**
 * Update webring view controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns Renders the view.
 */
 export async function updateWebringViewController(req: Request,
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
		await authoriseWebringModeratorAction(webring, user);

		return res.render('webring/update', {
			user,
			webring
		});
	} catch (err) {
		return next(err);
	}
}
