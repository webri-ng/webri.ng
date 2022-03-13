-- (Re)Create the application user.
-- This is the user that the application authenticates itself as.
-- The idea behind this is that we want the application to be as limited as possible
-- in the privileges it can assert. No need for the app to drop tables etc.

-- Create user if it doesn't already exist.
-- see: https://stackoverflow.com/questions/8092086/create-postgresql-role-user-if-it-doesnt-exist
DO
$do$
BEGIN
	 IF NOT EXISTS (
			SELECT
			FROM pg_catalog.pg_roles
			WHERE rolname = 'webring_app') THEN

			CREATE ROLE webring_app LOGIN PASSWORD 'adventure2022';
	 END IF;
END
$do$;


-- Perform all DB specific GRANT / REVOKE actions.
DO $$DECLARE 
	current_db TEXT;
BEGIN
	SELECT current_database() into current_db;
	EXECUTE format('REVOKE ALL PRIVILEGES ON DATABASE %I FROM webring_app', current_db);
	EXECUTE format('GRANT CONNECT ON DATABASE %I TO webring_app', current_db);
END$$;

GRANT USAGE ON SCHEMA webring TO webring_app;

GRANT SELECT, INSERT, UPDATE ON webring.ring TO webring_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON webring.ring_moderator TO webring_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON webring.tagged_ring TO webring_app;
GRANT SELECT, INSERT, UPDATE ON webring.site TO webring_app;
GRANT SELECT, INSERT, UPDATE ON webring.tag TO webring_app;
GRANT SELECT, INSERT, UPDATE ON webring.user_account TO webring_app;
GRANT SELECT, INSERT, UPDATE ON webring.user_session TO webring_app;

GRANT USAGE ON SCHEMA webring TO webring_app;
