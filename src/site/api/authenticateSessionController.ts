import { NextFunction, Request, Response } from 'express';
import { sessionService, userService } from '../app';
import { NoAuthenticationError, SessionExpiredError, SessionNotFoundError,
	UserNotFoundError } from '../app/error';
import { GetUserSearchField } from '../app/user';
import { loginExpiredError, requestAuthenticationFailedError,
	userNotFoundError } from './api-error-response';

/**
 * Request authentication middleware controller.
 * This middleware authenticates the session cookie sent with requests.
 * This is where the authenticated user instance is populated.
 * The `user` response local var is populated here.
 * @param {Request} req - Express request body.
 * @param {Response} res - Express Response.
 * @param {NextFunction} next - Express next middleware handler.
 */
 export async function authenticateSessionController(req: Request,
	res: Response,
	next: NextFunction): Promise<Response|void>
{
	try {
		if (!req.cookies?.session) {
			throw new NoAuthenticationError();
		}

		const sessionId = req.cookies.session;

		// Authenticate the session. This function call will throw in the case of any error.
		const session = await sessionService.authenticateSession(sessionId);

		// Get the user attached to the session.
		const user = await userService.getUser(GetUserSearchField.UserId, session.userId);
		if (!user) {
			throw new UserNotFoundError(userNotFoundError.message, userNotFoundError.code);
		}

		// Populate the local 'user' entry in the Express response.
		res.locals.user = user;

		return next(null);
	} catch (err) {
		if (err instanceof NoAuthenticationError ||
			err instanceof SessionNotFoundError ||
			err instanceof UserNotFoundError)
		{
			return res.status(requestAuthenticationFailedError.httpStatus).json({
				code: requestAuthenticationFailedError.code,
				error: requestAuthenticationFailedError.message,
			});
		}

		if (err instanceof SessionExpiredError) {
			return res.status(loginExpiredError.httpStatus).json({
				code: loginExpiredError.code,
				error: loginExpiredError.message,
			});
		}

		return next(err);
	}
}
