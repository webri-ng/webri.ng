/**
 * API.
 * This is the root module where all individual API endpoints are exposed.
 * @module api
 */

import { Router } from 'express';
import requestErrorHander from './errorHandler';
import { genericViewController } from './genericViewController';
import { indexViewController } from './indexViewController';
import { parseSessionController } from './parseSessionController';
import { userApiRouter, userViewRouter } from './user';
import { viewErrorHandler } from './viewErrorHandler';
import { webringApiRouter, webringViewRouter } from './webring';
import { newsUpdateViewController } from './newsUpdateViewController';

export * as requestErrorHander from './errorHandler';

/** Express Router for handling REST requests. */
export const apiRouter = Router();
/** Express router for serving views. */
export const viewRouter = Router();

// This middleware is included in all request, this is where the user's session is
// validated, and where the `user` response local variable is populated.
apiRouter.use(parseSessionController);

apiRouter.use('/user', userApiRouter);
apiRouter.use('/webring', webringApiRouter);

// This is the main request error handling middleware.
// All API handleable exceptions are caught by this middleware, and the response sent
// to the client.
apiRouter.use(requestErrorHander);


// This middleware is included in all request, this is where the user's session is
// validated, and where the `user` response local variable is populated.
viewRouter.use(parseSessionController);
viewRouter.use('/user', userViewRouter);
viewRouter.use('/webring', webringViewRouter);
viewRouter.get('/', indexViewController);
viewRouter.get('/contact', genericViewController('contact'));
viewRouter.get('/faq', genericViewController('faq'));
viewRouter.get('/news/:updateId', newsUpdateViewController);
viewRouter.use(viewErrorHandler);
