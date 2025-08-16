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
import { getNewSiteController } from './site';
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
	createWebringHtmlFormRequestSchema
} from './htmlForms';
import { siteConfig } from '../../config';

export const webringApiRouter: Router = Router();
export const webringViewRouter: Router = Router();

if (siteConfig.useHtmlForms) {
	webringViewRouter.get('/new', genericViewController('webring/htmlForms/new'));

	webringViewRouter.get(
		'/:webringUrl/add',
		authenticateSessionController,
		addNewSiteHtmlFormViewController
	);
} else {
	webringViewRouter.get('/new', genericViewController('webring/new'));

	webringViewRouter.get(
		'/:webringUrl/add',
		authenticateSessionController,
		addNewSiteViewController
	);
}

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

webringViewRouter.get('/:webringUrl', webringDetailViewController);

webringViewRouter.get(
	'/:webringUrl/:method(previous|next|random)',
	getNewSiteController
);

webringViewRouter.get(
	'/:webringUrl/update',
	authenticateSessionController,
	updateWebringViewController
);

webringViewRouter.get(
	'/:webringUrl/delete',
	authenticateSessionController,
	deleteWebringViewController
);
