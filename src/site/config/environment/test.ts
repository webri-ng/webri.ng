import { Config } from '../config';
import { defaultConfig } from '../defaultConfig';

/**
 * Test environment application configuration.
 */
export const testEnvironmentConfig: Config = Object.assign(defaultConfig, {
	database: {
		schema: process.env.DB_SCHEMA || 'webring',
		databaseName: process.env.DB || 'webring_dev',
		connection: {
			host: process.env.DB_HOST || 'localhost',
			user: process.env.DB_USER || 'webmaster',
			port: parseInt(process.env.DB_PORT || '') || 54327,
			password: process.env.DB_PASS || 'pw',
		},
		pool: {
			min: 5,
			max: 10
		}
	},
	email: {
		from: 'noreply@webri.ng',
		bcc: null,
		transport: {
			name: process.env.EMAIL_TRANSPORT_NAME || 'fakeSMTP',
			host: process.env.EMAIL_TRANSPORT_HOST || 'localhost',
			port: parseInt(process.env.EMAIL_TRANSPORT_PORT || '') || 3725,
			secure: process.env.EMAIL_TRANSPORT_SECURE === '1',
			authMethod: process.env.EMAIL_TRANSPORT_AUTH_METHOD || 'PLAIN',
			auth: {
				user: process.env.EMAIL_TRANSPORT_AUTH_USER || 'user',
				pass: process.env.EMAIL_TRANSPORT_AUTH_PASS || 'pass'
			}
		}
	},
	site: {
		nameRequirements: {
			minLength: 2,
			maxLength: 80
		}
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
			saltRounds: 10
		},
		maxUnsuccessfulLoginAttempts: 3,
	},
});
