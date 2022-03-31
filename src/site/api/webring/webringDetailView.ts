import { NextFunction, Request, Response } from 'express';
import { webringService } from '../../app';
import { GetWebringSearchField } from '../../app/webring';

/**
 * Webring detail view controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns Renders the view.
 */
 export async function webringDetailViewController(req: Request,
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

		/** Whether the currently authenticated user is a moderator of this webring. */
		const isUserModerator = await webringService.isUserWebringModerator(webring, user);
		/** Whether the currently authenticated user is the owner of this webring. */
		const isUserOwner = webring.createdBy === user.userId;

		return res.render('webring/webring', {
			isUserModerator,
			isUserOwner,
			user,
			webring
		});
	} catch (err) {
		return next(err);
	}
}
