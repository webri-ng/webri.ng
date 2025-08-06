import { hash } from 'bcrypt';
import { invalidNewPasswordError } from '../../../api/api-error-response';
import { userConfig } from '../../../config';
import { InvalidPasswordError } from '../../error';

/**
 * Creates a new password hash from a supplied password string, ready to store in a
 * user entity.
 * @param {string} password - The password string to hash.
 * @returns The hashed password in string form.
 */
export async function hashPassword(password: string): Promise<string>
{
	if (!password) {
		throw new InvalidPasswordError(invalidNewPasswordError.message,
			invalidNewPasswordError.code, invalidNewPasswordError.httpStatus);
	}

	return hash(password, userConfig.password.saltRounds);
}
