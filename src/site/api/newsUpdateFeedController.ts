import { NextFunction, Request, Response } from 'express';
import { newsService } from '../app';
import { globalConfig } from '../config';

/**
 * News update feed controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function newsUpdateFeedController(req: Request,
	res: Response,
	next: NextFunction): Promise<void>
{
	try {
		const allNewsUpdates = await newsService.getNewsUpdates();

		const newsUpdates = allNewsUpdates.map(newsUpdate => ({
			guid: newsUpdate.updateId,
			description: newsUpdate.description,
			link: `${globalConfig.baseDomainUrl}/news/${newsUpdate.updateId}`,
			pubDate: newsUpdate.dateCreated.toUTCString(),
			title: newsUpdate.title
		}));

		res.type('xml');

		return res.render('newsUpdateFeed', {
			lastBuildDate: allNewsUpdates[0].dateCreated.toUTCString(),
			link: globalConfig.baseDomainUrl,
			newsUpdates
		});
	} catch (err) {
		return next(err);
	}
}
