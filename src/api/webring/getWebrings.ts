import { Request, Response } from 'express';
import { webringService } from '../../app';
import { SearchWebringsSort } from '../../app/webring';
import {
	parsePageLengthQueryParameter,
	parsePageNumberQueryParameter
} from '../utils';
import {
	PaginatedApiResult,
	WebringApiResult,
	createWebringApiResult
} from '../model';

/**
 * Get all webrings API controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 */
export async function getWebringsController(
	req: Request,
	res: Response
): Promise<void> {
	const page = parsePageNumberQueryParameter(req.query.page);
	const pageLength = parsePageLengthQueryParameter(req.query.page_length);

	const allWebrings = await webringService.browse({
		page,
		pageLength,
		sortBy: SearchWebringsSort.Alphabetical
	});

	const results: PaginatedApiResult<WebringApiResult> = {
		totalItems: allWebrings.totalResults,
		data: allWebrings.webrings.map(createWebringApiResult)
	};

	res.json(results);
}
