import { Request, Response } from 'express';
import { webringService } from '../../app';
import { GetWebringSearchField } from '../../app/webring';

/**
 * Webring detail view controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 */
export async function webringDetailViewController(
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

	// If there is no authenticated user, these will both be false.
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

	/** The webring's sites. */
	const sites = await webringService.getWebringSites(webring.ringId!);

	return res.render('webring/webring', {
		isUserModerator,
		isUserOwner,
		user,
		sites,
		webring
	});
}
