/**
 * API.
 * This is the root module where all individual API endpoints are exposed.
 * @module api
 */

import { Router, Request, Response } from 'express';
import { logger } from '../app';
import { rateLimit } from 'express-rate-limit';
import requestErrorHander from './errorHandler';
import { genericViewController } from './genericViewController';
import { indexViewController } from './indexViewController';
import { parseSessionController } from './parseSessionController';
import { userApiRouter, userViewRouter } from './user';
import { viewErrorHandler } from './viewErrorHandler';
import { webringApiRouter, webringViewRouter } from './webring';
import { newsUpdateViewController } from './newsUpdateViewController';
import { newsUpdateFeedController } from './newsUpdateFeedController';
import { requestRateLimitedError } from './api-error-response';
import { loggingConfig, serverConfig } from '../config';
import { healthCheckController } from './healthCheck';

export * as requestErrorHander from './errorHandler';

/** Express Router for handling REST requests. */
export const apiRouter = Router();
/** Express router for serving views. */
export const viewRouter = Router();

const rateLimiter = rateLimit({
	limit: serverConfig.rateLimit,
	// Refers to the IETF proposed rate limit standard headers.
	// See: https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	message: (req: Request, res: Response) => {
		if (loggingConfig.logRateLimiting) {
			logger.debug(`Rate limit exceeded for IP: ${req.ip}`, {
				path: req.path,
				body: req.body,
				ip: req.ip,
			});
		}

		res.status(429).json({
			code: requestRateLimitedError.code,
			error: requestRateLimitedError.message,
			retryable: true,
		});
	},
});

// Rate limiting middleware applied to all API requests.
apiRouter.use(rateLimiter);

// This middleware is included in all requests. This is where the user's session is
// validated, and where the `user` response local variable is populated.
apiRouter.use(parseSessionController);

apiRouter.use('/user', userApiRouter);
apiRouter.use('/webring', webringApiRouter);

apiRouter.get('/health', healthCheckController);

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
viewRouter.get('/donate', genericViewController('donate'));
viewRouter.get('/faq', genericViewController('faq'));
viewRouter.get('/news/feed', newsUpdateFeedController);
viewRouter.get('/news/:updateId', newsUpdateViewController);
viewRouter.use(viewErrorHandler);
