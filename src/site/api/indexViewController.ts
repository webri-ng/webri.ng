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
	const { user } = res.locals;
	const { page } = req.query;

	let pageNumber = 1;
	if (page) {
		pageNumber = parseInt(page.toString());
	}

	const webringIndex = await webringService.browse({
		page: pageNumber,
		sortBy: SearchWebringsSort.Modified
	});

	return res.render('index', {
		user,
		currentPage: webringIndex.currentPage,
		totalPages: webringIndex.totalPages,
		nextPageNumber: webringIndex.currentPage + 1,
		previousPageNumber: webringIndex.currentPage - 1,
		webrings: webringIndex.webrings
	});
}
