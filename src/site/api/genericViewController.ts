import { NextFunction, Request, Response, RequestHandler } from 'express';

/**
 * Creates generic middleware for rendering views that don't require any particular
 * information from the back-end, other than the currently authenticated user, which is
 * contained within the current response.
 * This implementation cuts down on code duplication.
 * @param {string} viewName The view name to render.
 * @returns The render page middleware.
 */
export function genericViewController(viewName: Readonly<string>): RequestHandler
{
	return function renderGenericView(req: Request,
		res: Response,
		next: NextFunction): void
	{
		try {
			const { user } = res.locals;

			return res.render(viewName, {
				user
			});
		} catch (err) {
			return next(err);
		}
	};
}
