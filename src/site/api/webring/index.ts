/**
 * @module webring/api
 * Webring API.
 */

import { Router, NextFunction, Request, Response } from 'express';
import { webringService } from '../../app';
import { GetWebringSearchField } from '../../app/webring';
import { authenticateSessionController } from '../authenticateSessionController';
import { genericViewController } from '../genericViewController';
import { validateRequestBody } from '../validateRequestBody';
import { addNewSiteController, addNewSiteRequestSchema } from './addNewSite';
import { createWebringController, createWebringRequestSchema } from './create';
import { getNewSiteController } from './site';

export const webringApiRouter: Router = Router();
export const webringViewRouter: Router = Router();

webringApiRouter.post('/',
	authenticateSessionController,
	validateRequestBody(createWebringRequestSchema),
	createWebringController);

webringApiRouter.post('/:webringUrl/add',
	authenticateSessionController,
	validateRequestBody(addNewSiteRequestSchema),
	addNewSiteController);

webringViewRouter.get('/new', genericViewController('webring/new'));

webringViewRouter.get('/:webringUrl', webringViewController);
webringViewRouter.get('/:webringUrl/:method(previous|next|random)', getNewSiteController);


export async function webringViewController(req: Request,
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

		return res.render('webring/webring', {
			user,
			webring
		});
	} catch (err) {
		return next(err);
	}
}
