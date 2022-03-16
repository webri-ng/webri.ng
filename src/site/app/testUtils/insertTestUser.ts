import { User } from '../../model';
import { getRepository } from 'typeorm';
import { createRandomEmailAddress, createRandomUsername, testPasswordHash } from '.';

/** Additional options for inserting a test user. */
export type InsertTestUserOptions = {
	username?: Readonly<string>;
	email?: Readonly<string>;
	passwordHash?: Readonly<string>
}


/**
 * Inserts a User entity suitable for testing.
 * @param {InsertTestUserOptions} [options] - Options for instantiating the test user.
 * @returns The User entity
 */
export async function insertTestUser(options: InsertTestUserOptions = {}): Promise<User>
{
	const username = User.normaliseUsername(options.username || createRandomUsername());
	const email = User.normaliseEmailAddress(options.email || createRandomEmailAddress());

	const newUser: User = new User(username, email, options.passwordHash || testPasswordHash);

	return getRepository(User).save(newUser);
}
