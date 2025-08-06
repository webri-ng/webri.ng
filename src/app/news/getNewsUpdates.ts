import { IsNull } from 'typeorm';
import { appDataSource } from '../../infra/database';
import { NewsUpdate } from '../../model';

/**
 * Gets the latest news updates.
 * @returns An array of the latest news updates, sorted by date created in descending order.
 */
export async function getNewsUpdates(): Promise<NewsUpdate[]> {
	return appDataSource.getRepository(NewsUpdate).find({
		where: {
			dateDeleted: IsNull()
		},
		order: {
			dateCreated: 'DESC'
		}
	});
}
