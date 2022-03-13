import { Config } from '../config';
import { defaultConfig } from '../defaultConfig';

/**
 * Test environment application configuration.
 */
export const testEnvironmentConfig: Config = {
	...defaultConfig,
	email: {
		from: 'noreply@webri.ng',
		bcc: null,
		transport: {
			name: 'fakeSMTP',
			host: 'localhost',
			port: 3725,
			secure: false
		}
	},
	global: {
		baseDomainUrl: 'http://localhost:3456'
	},
	server: {
		port: 3456,
	},
	user: {
		usernameRequirements: {
			minLength: 2,
			maxLength: 80
		},
		password: {
			minLength: 8,
			maxLength: 128,
			tempPasswordExpiryPeriod: [1, 'week'],
			expiryPeriod: [3, 'months'],
			saltRounds: 10,
			resetTokenValidity: [1, 'hour']
		},
		maxUnsuccessfulLoginAttempts: 3,
	},
};
