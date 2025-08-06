import { createRandomString } from '../util';

/**
 * Creates a random string suitable for use as a password.
 * @returns The randomly created password value.
 */
export function createRandomPassword(): string
{
	return createRandomString({
		length: 36
	});
}
