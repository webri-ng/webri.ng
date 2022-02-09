import { Config } from './config';
import { defaultConfig } from './defaultConfig';
import { testEnvironmentConfig } from './environment/test';

/** The environment setting, as fetched from the `NODE_ENV` environment variable. */
const ENVIRONMENT: string = process.env.NODE_ENV || 'development';

/** The environment-specific configuration. */
const environmentConfigs: { [key: string]: Config; } = {
	test: testEnvironmentConfig,
	development: defaultConfig,
	production: defaultConfig,
	staging: defaultConfig,
};

/**
 * The base global config instance.
 * This will be overriden by environment-specific config if a config matching the
 * environment name is found.
 */
let applicationConfig: Config = defaultConfig;


// If a config matching this environment is found, override the default config.
if (environmentConfigs[ENVIRONMENT]) {
	applicationConfig = environmentConfigs[ENVIRONMENT];
}

export * from './config';
export const databaseConfig = applicationConfig.database;
export const emailConfig = applicationConfig.email;
export const globalConfig = applicationConfig.global;
export const loggingConfig = applicationConfig.logging;
export const siteConfig = applicationConfig.site;
export const tagConfig = applicationConfig.tag;
export const userConfig = applicationConfig.user;
export const sessionConfig = applicationConfig.session;
export const webringConfig = applicationConfig.webring;
