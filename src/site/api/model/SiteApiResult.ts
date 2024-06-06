import { Site } from "../../model";

export type SiteApiResult = {
	name: string;
	url: string;
}

export function createSiteApiResult(site: Site): SiteApiResult {
	return {
		name: site.name,
		url: site.url
	};
}
