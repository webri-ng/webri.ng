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
		let isUserModerator = false;
		/** Whether the currently authenticated user is the owner of this webring. */
		let isUserOwner = false;

		if(user) {
			isUserModerator = await webringService.isUserWebringModerator(webring, user);
			isUserOwner = webring.createdBy === user.userId;
		}

		// If this is a private webring, and the user is not authorised, redirect to a
		// 'not found' page.
		if (webring.private) {
			if(!(isUserModerator || isUserOwner)) {
				return res.status(404).render('webring/notFound', {
					user
				});
			}
		}

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
