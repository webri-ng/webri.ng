/**
 * Database connection module.
 * @module infra/database
 */

import { logger } from '../../app/logger';
import { Connection, createConnection } from 'typeorm';
import { databaseConfig } from '../../config';
import { Session, Site, Tag, User, Webring } from '../../model';


/** The database connection instance. */
let connection: Connection;

/**
 * Initialises the database on the configured port.
 * Registers all TypeORM entities.
 * @async
 * @returns The initialised database connection instance.
 */
export async function initialiseConnection(): Promise<Connection>
{
	try {
		connection = await createConnection({
			type: 'postgres',
			host: databaseConfig.connection.host,
			port: databaseConfig.connection.port,
			username: databaseConfig.connection.user,
			password: databaseConfig.connection.password,
			database: databaseConfig.databaseName,
			logging: ['error'],
			schema: databaseConfig.schema,
			entities: [
				Session, Site, Tag, User, Webring
			]
		});
	} catch (err) {
		logger.error('Unable to establish database connection');
		logger.warn('If this error is occurring on a first-run, have you remembered to ' +
			'initialise the seed data and application user?');

		throw new Error(`Error initialising database connection: ${(err as Error).message}`);
	}

	logger.info(`\x1b[33mConnected to postgresql://${databaseConfig.connection.user}@` +
		`${databaseConfig.connection.host}:${databaseConfig.connection.port}/` +
		`${databaseConfig.databaseName}\x1b[0m`);

	return connection;
}


/**
* Closes the database connection.
* @async
* @returns The closed database connection instance.
*/
export async function closeConnection(): Promise<Connection>
{
	if (!connection || !connection.isConnected) {
		throw new Error('Database not connected');
	}

	await connection.close();
	logger.info(`\x1b[33mClosed database connection.\x1b[0m`);

	return connection;
}
