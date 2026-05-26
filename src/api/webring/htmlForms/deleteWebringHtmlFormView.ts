import { NextFunction, Request, Response } from 'express';
import { webringService } from '../../../app';
import { authoriseWebringOwnerAction } from '../../../app/authorisation';
import { GetWebringSearchField } from '../../../app/webring';

/**
 * Delete webring HTML form view controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function deleteWebringHtmlFormViewController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { user } = res.locals;
		const { webringUrl } = req.params;

		const webring = await webringService.getWebring(
			GetWebringSearchField.Url,
			webringUrl
		);
		if (!webring) {
			return res.status(404).render('webring/notFound', { user });
		}

		const { isUserModerator, isUserOwner } =
			await webringService.getUserPermissionsForWebring(webring, user);

		if (webring.private) {
			if (!(isUserModerator || isUserOwner)) {
				return res.status(404).render('webring/notFound', { user });
			}
		}

		await authoriseWebringOwnerAction(webring, user, {
			requestMetadata: res.locals.requestMetadata
		});

		return res.render('webring/htmlForms/delete', { user, webring });
	} catch (error) {
		return next(error);
	}
}
