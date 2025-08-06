import { Webring } from '../../model';

export type WebringApiResult = {
	name: string;
	url: string;
	description: string;
}

export function createWebringApiResult(webring: Webring): WebringApiResult {
	return {
		name: webring.name,
		url: webring.url,
		description: webring.description
	};
}
