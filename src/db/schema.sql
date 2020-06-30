BEGIN TRANSACTION;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP SCHEMA IF EXISTS webring CASCADE;
CREATE SCHEMA webring;

CREATE TABLE webring.user_account (
	user_id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
	username TEXT NOT NULL,
	email TEXT NOT NULL,
	password_hash TEXT NOT NULL,
	password_set_time TIMESTAMPTZ NOT NULL,
	password_expiry_time TIMESTAMPTZ,
	login_attempt_count INTEGER NOT NULL DEFAULT 0,
	locked_due_to_failed_auth BOOLEAN NOT NULL DEFAULT FALSE,
	date_last_login TIMESTAMPTZ,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_deleted TIMESTAMPTZ,
	date_last_logged_in TIMESTAMPTZ
);


CREATE TABLE webring.user_session (
	session_id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
	user_id UUID NOT NULL REFERENCES webring.user_account(user_id),
	expiry_date TIMESTAMPTZ,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_deleted TIMESTAMPTZ
);


CREATE TABLE webring.ring (
	ring_id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
	name TEXT NOT NULL,
	url TEXT NOT NULL,
	description TEXT,
	created_by UUID NOT NULL REFERENCES webring.user_account(user_id),
	private BOOLEAN NOT NULL DEFAULT False,
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_deleted TIMESTAMPTZ
);


CREATE TABLE webring.ring_moderator (
	ring_id UUID NOT NULL REFERENCES webring.ring(ring_id),
	user_id UUID NOT NULL REFERENCES webring.user_account(user_id),
	PRIMARY KEY (ring_id, user_id)
);


CREATE TABLE webring.site (
	site_id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
	ring_id UUID NOT NULL REFERENCES webring.ring(ring_id),
	name TEXT NOT NULL,
	url TEXT NOT NULL,
	added_by UUID NOT NULL REFERENCES webring.user_account(user_id),
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_deleted TIMESTAMPTZ,
	date_last_accessed TIMESTAMPTZ
);


CREATE TABLE webring.tag (
	tag_id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
	name TEXT NOT NULL,
	created_by UUID NOT NULL REFERENCES webring.user_account(user_id),
	date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	date_deleted TIMESTAMPTZ
);


CREATE TABLE webring.tagged_ring (
	tag_id UUID NOT NULL REFERENCES webring.tag(tag_id),
	ring_id UUID NOT NULL REFERENCES webring.ring(ring_id),
	PRIMARY KEY (tag_id, ring_id)
);

COMMIT;
