import { NextFunction, Request, Response } from 'express';
import { webringService } from '../app';
import { SearchWebringsMethod } from '../app/webring';
import { User, Webring } from '../model';

interface IndexViewData {
	webrings: Webring[]
}

export async function getIndexViewData(): Promise<IndexViewData>
{
	return {
		webrings: []
	};
}

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

		const viewData = await getIndexViewData();

		return res.render('index', {
			...viewData,
			user
		});
	} catch (err) {
		return next(err);
	}
}
