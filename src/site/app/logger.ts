/**
 * @module infra/logger
 * Logger module.
 * Exports the base logger instance used throughout the application for logging.
 * Use this when printing logging information is needed.
 */

import * as Winston from 'winston';
import { loggingConfig } from '../config';
import { Format } from 'logform';


/** The standard logging format to use. */
const defaultLoggerFormat: Format = Winston.format.combine(
	Winston.format.timestamp({
		format: 'YYYY-MM-DD HH:mm:ss'
	}),
	Winston.format.printf(({ level, message, timestamp }) => {
		return `[${timestamp}] [${level}]: ${message}`;
	})
);


/** The exported logger instance. */
export const logger: Winston.Logger = Winston.createLogger({
	format: defaultLoggerFormat
});

logger.add(new Winston.transports.Console({
	level: loggingConfig.loggingLevel
}));
