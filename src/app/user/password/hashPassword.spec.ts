import { getRounds } from 'bcrypt';
import { expect } from 'chai';
import { userConfig } from '../../../config';
import { ApiReturnableError } from '../../error';
import { hashPassword } from './hashPassword';
import { validatePassword } from './validatePassword';
import { invalidNewPasswordError } from '../../../api/api-error-response';

describe('Hash password', function () {
	it('should raise an exception if an invalid password is provided', async function () {
		return expect(hashPassword(''))
			.to.eventually.be.rejectedWith(ApiReturnableError)
			.and.have.property('code', invalidNewPasswordError.code);
	});

	it('should correctly hash an arbitrary password', async function () {
		const passwordText = 'test_pw';
		const passwordHash = await hashPassword(passwordText);
		const result = await validatePassword(passwordText, passwordHash);
		const saltRounds = getRounds(passwordHash);

		expect(result).to.be.true;
		expect(saltRounds).to.equal(userConfig.password.saltRounds);
	});
});
