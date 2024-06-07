/**
 * @module infra/logger
 * Logger module.
 * Exports the base logger instance used throughout the application for logging.
 * Use this when printing logging information is needed.
 */

import * as Winston from 'winston';
import { loggingConfig } from '../config';

/** The exported logger instance. */
export const logger: Winston.Logger = Winston.createLogger();

logger.add(new Winston.transports.Console({
	level: loggingConfig.loggingLevel
}));
