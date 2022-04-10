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
	logger.info(`\x1b[33mConnecting to postgresql://${databaseConfig.connection.user}@` +
		`${databaseConfig.connection.host}:${databaseConfig.connection.port}/` +
		`${databaseConfig.databaseName}\x1b[0m`);

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
		],
		extra: {
			ssl: databaseConfig.connection.ssl,
			validateConnection: false,
			trustServerCertificate: true
		}
	});

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
