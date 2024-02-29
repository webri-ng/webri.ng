import * as dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';
import { newsService } from '../app';
import { NewsUpdate } from '../model';
import { InvalidIdentifierError } from '../app/error';

/**
 * @param newsUpdate The news update to transform.
 * @returns A data structure suitable for displaying in the view.
 */
export function transformNewsUpdateToViewFormat(newsUpdate: NewsUpdate) {
	return {
		title: newsUpdate.title,
		link: `/news/${newsUpdate.updateId}`,
		description: newsUpdate.description,
		content: newsUpdate.content,
		dateCreated: dayjs(newsUpdate.dateCreated).format('YYYY-MM-DD'),
	};
}

/**
 * Index view controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns The rendered index view.
 */
export async function newsUpdateViewController(req: Request,
	res: Response,
	next: NextFunction): Promise<Response|void>
{
	const { user } = res.locals;
	const { updateId } = req.params;

	try {
		const newsUpdate = await newsService.getNewsUpdate(updateId);
		if (!newsUpdate) {
			return res.render('news/notFound', {
				user
			});
		}

		return res.render('news/newsUpdate', {
			newsUpdate: transformNewsUpdateToViewFormat(newsUpdate),
			user
		});
	} catch (err) {
		// If an invalid id is provided in the URL parameter, return a 404.
		if (err instanceof InvalidIdentifierError) {
			return res.render('news/notFound', {
				user
			});
		}

		return next(err);
	}
}
