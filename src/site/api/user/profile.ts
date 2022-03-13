import { NextFunction, Request, Response } from 'express';
import { webringService } from '../../app';
import { SearchWebringsMethod } from '../../app/webring';
import { User, Webring } from '../../model';

interface ProfileViewData {
	user: User;
	webrings: Webring[];
}


async function getProfileViewData(user: Readonly<User>): Promise<ProfileViewData>
{
	const webrings = await webringService.search(SearchWebringsMethod.Creator, user.userId || '', {
		returnPrivateWebrings: true
	});

	return {
		user,
		webrings
	};
}


/**
 * User profile view controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns The rendered profile view.
 */
 export async function profileViewController(req: Request,
	res: Response,
	next: NextFunction): Promise<void>
{
	const { user } = res.locals;
	const viewData = await getProfileViewData(user);

	return res.render('user/profile', viewData);
}
