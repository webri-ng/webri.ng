import { NextFunction, Request, Response } from 'express';
import { webringService } from '../../../app';
import { authoriseWebringModeratorAction } from '../../../app/authorisation';
import { ApiReturnableError } from '../../../app/error';
import { GetWebringSearchField } from '../../../app/webring';

/**
 * Remove site HTML form controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function removeSiteHtmlFormController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { user } = res.locals;
		const { webringUrl, siteUrl } = req.params;

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

		/** The array of the selected webring's sites. */
		const webringSites = await webringService.getWebringSites(webring.ringId!);
		const siteToRemove = webringSites.find((site) => site.url === siteUrl);
		if (!siteToRemove) {
			return res.status(404).render('webring/notFound', { user });
		}

		await authoriseWebringModeratorAction(webring, user, {
			requestMetadata: res.locals.requestMetadata
		});

		await webringService.removeSite(webring, siteUrl, {
			requestMetadata: res.locals.requestMetadata
		});

		return res.render('success', {
			pageTitle: 'Remove Site',
			contentTitle: `Removed site '${siteUrl}' from webring '${webring.name}'`,
			redirectLink: `/webring/${webring.url}`
		});
	} catch (error) {
		if (error instanceof ApiReturnableError) {
			return res
				.status(error.httpStatus)
				.render('webring/htmlForms/removeSite', {
					errorMessage: error.message,
					webring: { url: req.params.webringUrl },
					site: { url: req.params.siteUrl }
				});
		}

		return next(error);
	}
}
