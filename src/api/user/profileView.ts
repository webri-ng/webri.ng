import { NextFunction, Request, Response } from 'express';
import { webringService } from '../../app';
import { SearchWebringsMethod, SearchWebringsSort } from '../../app/webring';


/**
 * User profile view controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns The rendered profile view.
 */
 export async function profileViewController(req: Request,
	res: Response,
	_next: NextFunction): Promise<void>
{
	const { user } = res.locals;
	const { page } = req.query;

	let pageNumber: number|undefined;
	if (page) {
		pageNumber = parseInt(page.toString());
	}

	const searchResults = await webringService.search(SearchWebringsMethod.Creator, user.userId!, {
		returnPrivateWebrings: true,
		page: pageNumber,
		sortBy: SearchWebringsSort.Modified
	});

	return res.render('user/profile', {
		user,
		currentPage: searchResults.currentPage,
		totalPages: searchResults.totalPages,
		nextPageNumber: searchResults.currentPage + 1,
		previousPageNumber: searchResults.currentPage - 1,
		webrings: searchResults.webrings
	});
}
