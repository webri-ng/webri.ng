import { Config, LoggingLevel } from './config';

/**
 * The default application configuration.
 * The specific configurations inside this object will be overriden by environment
 * specific configuration options.
 */
 export const defaultConfig: Config = {
	database: {
		schema: process.env.DB_SCHEMA || 'webring',
		databaseName: process.env.DB_NAME || 'webring_dev',
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
	global: {
		baseDomain: 'http://localhost:3000'
	},
	logging: {
		loggingLevel: LoggingLevel.Debug,
		logRequestValidation: true,
	},
	tag: {
		nameRequirements: {
			minLength: 2,
			maxLength: 20
		},
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
			saltRounds: 10,
			resetTokenValidity: [1, 'hour']
		},
		maxUnsuccessfulLoginAttempts: 3,
	},
	session: {
		validityPeriod: [1, 'week'],
		signingKey: 'fff'
	},
	site: {
		nameRequirements: {
			minLength: 2,
			maxLength: 80
		},
	},
	webring: {
		nameRequirements: {
			minLength: 2,
			maxLength: 80
		},
		urlRequirements: {
			minLength: 2,
			maxLength: 24
		},
		maxTagCount: 6
	},
};
