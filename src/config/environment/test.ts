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
		rateLimit: 9999,
		trustProxy: false
	},
	user: {
		usernameRequirements: {
			minLength: 2,
			maxLength: 80
		},
		password: {
			minLength: 8,
			maxLength: 128,
			tempPasswordExpiryPeriod: [1, 'day'],
			expiryPeriod: [3, 'months'],
			saltRounds: 10,
			resetTokenValidity: [1, 'hour']
		},
		maxUnsuccessfulLoginAttempts: 3,
	},
};
