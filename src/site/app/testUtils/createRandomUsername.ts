import { User } from '../../model';
import { createRandomString } from '../util';

/**
 * Creates a random username suitable for use with a test user.
 * @returns The randomly created username.
 */
export function createRandomUsername(): string
{
	return `test_user_${User.normaliseUsername(createRandomString())}`;
}
