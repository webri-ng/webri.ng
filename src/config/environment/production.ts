import { Config } from '../config';
import { defaultConfig } from '../defaultConfig';

/**
 * Production environment application configuration.
 */
export const productionEnvironmentConfig: Config = {
	...defaultConfig,
	global: {
		baseDomainUrl: 'https://webri.ng'
	},
	logging: {
		...defaultConfig.logging,
		sentry: {
			enabled: process.env.SENTRY_ENABLED === 'true' || false,
			dsn: process.env.SENTRY_DSN || ''
		}
	}
};
