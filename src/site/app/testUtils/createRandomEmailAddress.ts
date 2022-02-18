import { User } from '../../model';
import { createRandomString } from '../util';

/**
 * Creates a random email address suitable for use as a test user email.
 * @returns The randomly created email address.
 */
export function createRandomEmailAddress(): string
{
	return `${User.normaliseEmailAddress(createRandomString())}@example.org`;
}
