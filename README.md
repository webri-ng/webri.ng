# Webri.ng

This repository contains the source for the webri.ng website, and its supporting database. The website's front, and back-end are both contained within this repository.

## Site
The `src/site` directory contains the source code for the main server. All source code is written in Typescript. Pug is used for rendering the front-end pages. Database connectivity is implemented using the `pg` module with `TypeORM` as an ORM to interface with a `PostgreSQL` database. Testing is implemented using Mocha and Chai.


### Source tree
The source tree is split into several main directories:
* `server/api`: Contains the code for the main server API, as well as request validation schemas.
* `server/app`: Contains the service layer, which contains the main business logic.
* `server/config`: Contains the various environment configurations for the server. A default base config file is overwritten with enviroment-specific configurations based upon the current runtime environment.
* `server/model`: Contains all domain model types.
* `server/infra`: Contains all of the code for interfacing with external infrastructure, such as the database, and email.

Refer to `doc/styleguide.md` for development practices.
The main entry point for the built application is `src/site/dist/index.js`.

### Local development
Before you can bootstrap the server locally, you will need to run the local mock services and initialise the database. The database schema, and application user can be created using the `src/db/setup` script.

#### Setup dependencies
In order to run the server setup locally you will need the following applications installed:
* `psql`: Postgres front-end. Binaries are available from most Linux distro repositories or from [the official site](https://www.postgresql.org/).

#### First-time configuration
In order to setup the application for local development:
* Initialise local development mock services by running the `docker-compose.yml` file in the main `/src` directory.
* Initialise the database schema, application's database credentials and seed data by running the `npm run start:initdb` script. This is a shorthand for running the `setup` script in the `/src/database` directory. This will initialise the database schema, and set up the application user.
* From here you should be able to run the server locally using `npm run start:dev`. Refer to `src/site/package.json` for more specific NPM configuration.

### Environment Variables
Provided below is a table of the environment variables which can be used to configure the application.
These are necessary for running a staging/production instance of the application. All required env vars are provided in the default development environment config. 
For more details refer to modules in the `src/server/config` directory.

| Key |Description  |
|--|--|
|PORT| The HTTP port to run the site's server on |
|EMAIL_TRANSPORT_NAME| An arbitrary name to identify the email transport |
|EMAIL_TRANSPORT_HOST| The host of the email transport provider |
|EMAIL_TRANSPORT_PORT| The port of the email transport provider |
|EMAIL_TRANSPORT_AUTH_USER| The user account to authenticate with the email transport provider |
|EMAIL_TRANSPORT_AUTH_PASS| The password to authenticate with the email transport provider |
|EMAIL_TRANSPORT_SECURE| Whether TLS should be used for the SMTP connection |
|EMAIL_TRANSPORT_IGNORE_TLS| Whether TLS validation should be ignored for the SMTP connection |
|DB_SCHEMA| The Postgres database schema to use |
|DB_HOST| The database hostname |
|DB_PORT| The database port |
|DB_USER| The database username to authenticate with |
|DB_PASS| The database password to authenticate with |
|DB_NAME| The name of the Postgres database to use |
|DB_SSL| Whether to use SSL when connecting to the database |

## First steps
If you are new to the codebase, the best way to approach debugging any particular issue or understanding any one particular aspect is to trace the flow of control through the application.
Most functionality within the application is API driven and begins with a HTTP request to the application's main router. The best place to begin looking is the main `express.js` router module, located at `src/site/api/index.ts`. Within this file are declarations for the individual sub-routers for all of the application's exposed APIs. Each API typically exposes two routers: The API, and View routers. The API router implements the application's REST API, and the View router implements the front-end views.
For example:

```typescript
// ...
// `api/user/index.ts`.
userApiRouter.post('/register',
	validateRequestBody(registrationRequestSchema),
	registerController);

// ...
```

Inside this API route module we can see that the main functionality is contained within the `userService` module, contained within the service layer:

```typescript
// ...
// `api/user/register.ts`
	const { username, email, password } = req.body;

	/** The newly created user entity. */
	const user: User | null = await userService.register(username, email, password);
// ...
```

The main application logic is contained within the 'services' exposed from the `src/app` module. The individual 'service' submodules contained within this module expose the core of the application's functionality, separated into logical groupings.
