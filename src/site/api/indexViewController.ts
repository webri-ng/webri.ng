import { NextFunction, Request, Response } from 'express';
import { webringService } from '../app';
import { SearchWebringsSort } from '../app/webring';

/**
 * Index view controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns The rendered index view.
 */
export async function indexViewController(req: Request,
	res: Response,
	next: NextFunction): Promise<Response|void>
{
	try {
		const { user } = res.locals;

		const webringIndex = await webringService.browse({
			page: 1,
			sortBy: SearchWebringsSort.Modified
		});

		return res.render('index', {
			user,
			currentPage: webringIndex.currentPage,
			totalPages: 1,
			nextPageNumber: webringIndex.currentPage + 1,
			previousPageNumber: webringIndex.currentPage - 1,
			webrings: webringIndex.webrings.slice(0, 16)
		});
	} catch(err) {
		return next(err);
	}
}
