import { Config } from './config';
import { defaultConfig } from './defaultConfig';
import { productionEnvironmentConfig } from './environment/production';
import { testEnvironmentConfig } from './environment/test';

/**
 * The application's current environment.
 * This is computed from the `NODE_ENV` environment variable.
 */
export const applicationEnvironment: string = process.env.NODE_ENV || 'development';

/** The environment-specific configuration. */
const environmentConfigs: { [key: string]: Config; } = {
	test: testEnvironmentConfig,
	development: defaultConfig,
	production: productionEnvironmentConfig,
	staging: defaultConfig,
};

/**
 * The base global config instance.
 * This will be overriden by environment-specific config if a config matching the
 * environment name is found.
 */
let applicationConfig: Config = defaultConfig;


// If a config matching this environment is found, override the default config.
if (environmentConfigs[applicationEnvironment]) {
	applicationConfig = environmentConfigs[applicationEnvironment];
}

export * from './config';
export const databaseConfig = applicationConfig.database;
export const emailConfig = applicationConfig.email;
export const globalConfig = applicationConfig.global;
export const loggingConfig = applicationConfig.logging;
export const serverConfig = applicationConfig.server;
export const siteConfig = applicationConfig.site;
export const tagConfig = applicationConfig.tag;
export const userConfig = applicationConfig.user;
export const sessionConfig = applicationConfig.session;
export const webringConfig = applicationConfig.webring;
