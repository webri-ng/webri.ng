import { Request, Response } from 'express';
import { webringService } from '../../app';
import { authoriseWebringModeratorAction } from '../../app/authorisation';
import { GetWebringSearchField } from '../../app/webring';

/**
 * Add new site view controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 */
export async function addNewSiteViewController(
	req: Request,
	res: Response
): Promise<void> {
	const { user } = res.locals;
	const { webringUrl } = req.params;

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

	return res.render('webring/addNewSite', {
		user,
		webring
	});
}
