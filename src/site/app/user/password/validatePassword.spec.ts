import { expect } from 'chai';
import { hashPassword } from './hashPassword';
import { validatePassword } from '.';

describe('Validate password', function ()
{
	const password = 'testPassword1';
	let passwordHash: string;


	before(async function beforeTesting()
	{
		passwordHash = await hashPassword(password);
	});


	it('should raise an exception if an invalid password is provided', async function ()
	{
		const result = await validatePassword('', passwordHash);
		expect(result).to.be.false;
	});


	it('should raise an exception if an invalid password hash is provided', async function ()
	{
		const result = await validatePassword(password, '');
		expect(result).to.be.false;
	});


	it('should not validate an incorrect password', async function ()
	{
		let result = await validatePassword('1234', passwordHash);
		expect(result).to.be.false;

		result = await validatePassword('      ', passwordHash);
		expect(result).to.be.false;
	});


	it('should correctly validate a correct password', async function ()
	{
		const result = await validatePassword(password, passwordHash);
		expect(result).to.be.true;
	});
});
