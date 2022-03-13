import { NextFunction, Request, Response } from 'express';
import { sessionService, userService } from '../app';
import { GetUserSearchField } from '../app/user';

/**
 * Session parsing middleware controller.
 * This middleware reads the session cookie sent with requests.
 * This is where the authenticated user instance is populated.
 * The `user`, and `session` response local variables are populated here.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function parseSessionController(req: Request,
	res: Response,
	next: NextFunction): Promise<Response|void>
{
	try {
		if (!req.cookies?.session) {
			return next(null);
		}

		const sessionId = req.cookies.session;

		// Authenticate the session. This function call will throw in the case of any error.
		// If the session has expired, an error will be raised here.
		const session = await sessionService.authenticateSession(sessionId);

		// Get the user attached to the session.
		// The result is not checked to improve the test coverage. We can be sure the
		// data is consistent thanks to the database enforcing referential integrity.
		const user = await userService.getUser(GetUserSearchField.UserId, session.userId);

		// Populate the local `user`, and `session` entries in the Express response.
		res.locals.user = user;
		res.locals.session = session;

		return next(null);
	} catch (err) {
		return next(err);
	}
}
