import { Config } from '../config';
import { defaultConfig } from '../defaultConfig';

/**
 * Test environment application configuration.
 */
export const testEnvironmentConfig: Config = {
	...defaultConfig,
	global: {
		baseDomainUrl: 'http://localhost:3456'
	},
	server: {
		port: 3456,
	},
};
