import { NextFunction, Request, Response } from 'express';
import { newsService, webringService } from '../app';
import { SearchWebringsSort } from '../app/webring';
import { transformNewsUpdateToViewFormat } from './newsUpdateViewController';

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
		const latestUpdatedWebringCount = 16;
		const latestNewsUpdateCount = 8;

		const { user } = res.locals;

		const webringIndex = await webringService.browse({
			page: 1,
			sortBy: SearchWebringsSort.Modified
		});

		const allNewsUpdates = await newsService.getNewsUpdates();

		const newsUpdates = allNewsUpdates
			.slice(0, latestNewsUpdateCount).map(transformNewsUpdateToViewFormat);

		return res.render('index', {
			user,
			currentPage: webringIndex.currentPage,
			newsUpdates,
			totalPages: 1,
			nextPageNumber: webringIndex.currentPage + 1,
			previousPageNumber: webringIndex.currentPage - 1,
			webrings: webringIndex.webrings.slice(0, latestUpdatedWebringCount)
		});
	} catch (err) {
		return next(err);
	}
}
