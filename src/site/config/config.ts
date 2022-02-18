/**
 * Environment specific configuration.
 * @module config
 */

/**
 * 'Duration' tuple type which is parseable by momentjs/dayjs as a serialised Duration.
 * Can be used via dayjs().add(...timePeriod);
 */
type Duration = [number, string];


export interface DatabaseConfig {
	schema: string;
	databaseName: string;
	connection: {
		host: string;
		user: string;
		port: number;
		password: string;
	};
	pool: {
		min: number;
		max: number;
	};
}


export interface EmailTransportConfig {
	name: string;
	host: string;
	port: number;
	secure: boolean;
	authMethod: string;
	auth: {
		user: string;
		pass: string;
	};
}


export interface EmailConfig {
	from: string;
	bcc: string | null;
	transport: EmailTransportConfig;
}


export interface GlobalConfig {
	/**
	 * The URL of the site's domain.
	 * In the case that a bad URL parameter is passed, and the resulting URI becomes invalid,
	 * and unservable, the server will redirect back to the base site.
	 */
	baseDomainUrl: string;
}


/**
 * The logging level passed to Winston.
 * @enum {string}
 */
export enum LoggingLevel {
	Debug = 'debug',
	Info = 'info',
	Error = 'error'
}

/** Logging settings passed to the logging service. */
export interface LoggingConfig {
	loggingLevel: LoggingLevel;
	logRequestValidation: boolean;
}


export interface TagConfig {
	nameRequirements: {
		minLength: number;
		maxLength: number;
	};
}


export interface UserConfig {
	usernameRequirements: {
		minLength: number;
		maxLength: number;
	};
	password: {
		minLength: number;
		maxLength: number;
		expiryPeriod?: Duration;
		tempPasswordExpiryPeriod: Duration;
		saltRounds: number;
		resetTokenValidity: Duration;
	};
	/** The number of unsuccessful login attempts before a user's account is locked. */
	maxUnsuccessfulLoginAttempts: number;
}


export interface SessionConfig {
	validityPeriod: Duration;
	signingKey: string;
}


export interface SiteConfig {
	nameRequirements: {
		minLength: number;
		maxLength: number;
	};
}


export interface WebringConfig {
	nameRequirements: {
		minLength: number;
		maxLength: number;
	};
	urlRequirements: {
		minLength: number;
		maxLength: number;
	};
	/** The maximum number of tags that can be applied to a webring. */
	maxTagCount: number;
}


export interface ServerConfig {
	port: number;
	/**
	 * The CORS white-list.
	 * Refer to documentation for the CORS module for the types of values that are supported
	 * here. If no value is specified, this will default to a boolean value of `true`, which
	 * will whitelist all requests.
	 */
	// tslint:disable-next-line
	corsWhitelist?: RegExp|boolean|RegExp[]|string[];
}


export interface Config
{
	database: DatabaseConfig;
	email: EmailConfig;
	global: GlobalConfig;
	logging: LoggingConfig;
	server: ServerConfig;
	session: SessionConfig;
	site: SiteConfig;
	tag: TagConfig;
	user: UserConfig;
	webring: WebringConfig;
}
