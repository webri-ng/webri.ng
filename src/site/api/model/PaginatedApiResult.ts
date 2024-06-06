export type PaginatedApiResult<ResultType> = {
	totalItems: number;
	data: ResultType[];
}
