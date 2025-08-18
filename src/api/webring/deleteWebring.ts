import { Request, Response } from 'express';
import { webringService } from '../../app';
import { authoriseWebringOwnerAction } from '../../app/authorisation';

/**
 * Delete webring controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 */
export async function deleteWebringController(
	req: Request,
	res: Response
): Promise<void> {
	const { user } = res.locals;
	const { webringUrl } = req.params;

	const webring = await webringService.getWebringByUrlOrFail(webringUrl);

	// Check the authorisation for this action. Only the webring's creator is
	// allowed to delete the webring.
	// Any authorisation failures will raise an exception from inside this function.
	authoriseWebringOwnerAction(webring, user, {
		requestMetadata: res.locals.requestMetadata
	});

	await webringService.deleteWebring(webring.ringId!, {
		requestMetadata: res.locals.requestMetadata
	});

	res.end();
}
