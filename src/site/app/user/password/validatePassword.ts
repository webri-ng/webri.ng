import { compare } from 'bcrypt';

/**
* Validates a user's password hash.
* Compares a plaintext password against a hashed password.
* @param {string} password - The password string to check.
* @param {string} passwordHash - The password hash to compare against.
* @returns A boolean indicating whether the password matches the hash.
*/
export async function validatePassword(password: Readonly<string>,
	passwordHash: Readonly<string>): Promise<boolean>
{
	if (!password || !passwordHash) {
		return false;
	}

	return compare(password, passwordHash);
}
