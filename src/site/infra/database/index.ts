/**
 * Database connection module.
 * @module infra/database
 */

import { logger } from '../../app/logger';
import { DataSource } from 'typeorm';
import { databaseConfig } from '../../config';
import { NewsUpdate, Session, Site, Tag, User, Webring } from '../../model';
import 'reflect-metadata';

/** The main application's data source. */
export let appDataSource: DataSource;

/**
 * Initialises the database on the configured port.
 * Registers all TypeORM entities.
 * @async
 * @returns The initialised database data source.
 */
export async function initialiseAppDataSource(): Promise<DataSource>
{
	logger.info(`Connecting to postgresql://${databaseConfig.connection.user}@` +
		`${databaseConfig.connection.host}:${databaseConfig.connection.port}/` +
		`${databaseConfig.databaseName}`);

	/** Database SSL configuration */
	let ssl = undefined;
	if (databaseConfig.connection.ssl) {
		ssl = {
			rejectUnauthorized: false
		};
	}

	appDataSource = new DataSource({
		type: 'postgres',
		host: databaseConfig.connection.host,
		port: databaseConfig.connection.port,
		username: databaseConfig.connection.user,
		password: databaseConfig.connection.password,
		database: databaseConfig.databaseName,
		logging: ['error'],
		schema: databaseConfig.schema,
		entities: [
			NewsUpdate, Session, Site, Tag, User, Webring
		],
		ssl
	});

	return appDataSource.initialize();
}


/**
* Closes the database connection.
* @async
* @returns The closed database connection instance.
*/
export async function destroyAppDataSource(): Promise<DataSource>
{
	if (!appDataSource || !appDataSource.isInitialized) {
		throw new Error('Database not connected');
	}

	await appDataSource.destroy();
	logger.info(`Closed database connection.`);

	return appDataSource;
}
