/**
 * @module infra/logger
 * Logger module.
 * Exports the base logger instance used throughout the application for logging.
 * Use this when printing logging information is needed.
 */

import * as Winston from 'winston';
import * as Transport from 'winston-transport';
import * as Sentry from '@sentry/node';
import { applicationEnvironment, loggingConfig } from '../config';

/** The exported logger instance. */
export const logger: Winston.Logger = Winston.createLogger();

logger.add(
	new Winston.transports.Console({
		level: loggingConfig.loggingLevel
	})
);

if (loggingConfig.sentry?.enabled && loggingConfig.sentry.dsn) {
	logger.debug('Initializing Sentry logging transport');

	Sentry.init({
		dsn: loggingConfig.sentry.dsn,
		enableLogs: true,
		environment: applicationEnvironment
	});

	const SentryWinstonTransport = Sentry.createSentryWinstonTransport(Transport);

	logger.add(
		new SentryWinstonTransport({
			level: loggingConfig.loggingLevel
		})
	);
}
