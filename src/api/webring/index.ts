/**
 * @module api/webring
 * Webring API.
 */

import { Router } from 'express';
import { authenticateSessionController } from '../authenticateSessionController';
import { genericViewController } from '../genericViewController';
import { validateRequestBody } from '../validateRequestBody';
import { addNewSiteController, addNewSiteRequestSchema } from './addNewSite';
import { addNewSiteViewController } from './addNewSiteView';
import { createWebringController, createWebringRequestSchema } from './create';
import { deleteWebringController } from './deleteWebring';
import { updateWebringViewController } from './updateWebringView';
import { removeSiteController, removeSiteRequestSchema } from './removeSite';
import {
	getNextSiteController,
	getPreviousSiteController,
	getRandomSiteController
} from './site';
import {
	updateWebringController,
	updateWebringRequestSchema
} from './updateWebring';
import { webringDetailViewController } from './webringDetailView';
import { deleteWebringViewController } from './deleteWebringView';
import { getSitesController } from './getSites';
import { getWebringsController } from './getWebrings';
import {
	addNewSiteHtmlFormController,
	addNewSiteHtmlFormRequestSchema,
	addNewSiteHtmlFormViewController,
	createWebringHtmlFormController,
	createWebringHtmlFormRequestSchema,
	deleteWebringHtmlFormController,
	deleteWebringHtmlFormViewController,
	updateWebringHtmlFormController,
	updateWebringHtmlFormRequestSchema,
	updateWebringHtmlFormViewController
} from './htmlForms';
import { siteConfig } from '../../config';

export const webringApiRouter: Router = Router();
export const webringViewRouter: Router = Router();

webringViewRouter.post(
	'/form',
	authenticateSessionController,
	validateRequestBody(createWebringHtmlFormRequestSchema),
	createWebringHtmlFormController
);

webringViewRouter.post(
	'/:webringUrl/add/form',
	authenticateSessionController,
	validateRequestBody(addNewSiteHtmlFormRequestSchema),
	addNewSiteHtmlFormController
);

webringViewRouter.post(
	'/:webringUrl/update/form',
	authenticateSessionController,
	validateRequestBody(updateWebringHtmlFormRequestSchema),
	updateWebringHtmlFormController
);

webringViewRouter.post(
	'/:webringUrl/delete/form',
	authenticateSessionController,
	deleteWebringHtmlFormController
);

webringViewRouter.get(
	'/new',
	genericViewController(
		siteConfig.useHtmlForms ? 'webring/htmlForms/new' : 'webring/new'
	)
);

webringViewRouter.get(
	'/:webringUrl/add',
	authenticateSessionController,
	siteConfig.useHtmlForms
		? addNewSiteHtmlFormViewController
		: addNewSiteViewController
);

webringViewRouter.get(
	'/:webringUrl/update',
	authenticateSessionController,
	siteConfig.useHtmlForms
		? updateWebringHtmlFormViewController
		: updateWebringViewController
);

webringViewRouter.get(
	'/:webringUrl/delete',
	authenticateSessionController,
	siteConfig.useHtmlForms
		? deleteWebringHtmlFormViewController
		: deleteWebringViewController
);

webringApiRouter.post(
	'/',
	authenticateSessionController,
	validateRequestBody(createWebringRequestSchema),
	createWebringController
);

webringApiRouter.post(
	'/:webringUrl/add',
	authenticateSessionController,
	validateRequestBody(addNewSiteRequestSchema),
	addNewSiteController
);

webringApiRouter.post(
	'/:webringUrl/remove',
	authenticateSessionController,
	validateRequestBody(removeSiteRequestSchema),
	removeSiteController
);

webringApiRouter.patch(
	'/:webringUrl',
	authenticateSessionController,
	validateRequestBody(updateWebringRequestSchema),
	updateWebringController
);

webringApiRouter.delete(
	'/:webringUrl',
	authenticateSessionController,
	deleteWebringController
);

webringApiRouter.get('/:webringUrl/sites', getSitesController);

webringApiRouter.get('/', getWebringsController);

webringViewRouter.get('/:webringUrl', webringDetailViewController);

webringViewRouter.get('/:webringUrl/next', getNextSiteController);
webringViewRouter.get('/:webringUrl/previous', getPreviousSiteController);
webringViewRouter.get('/:webringUrl/random', getRandomSiteController);
