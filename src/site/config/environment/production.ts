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
	server: {
		port: parseInt(process.env.PORT || ''),
		rateLimit: 100,
		trustProxy: 1
	},
};
