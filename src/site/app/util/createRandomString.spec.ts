import { expect } from 'chai';
import { testUtils } from '..';
import { createRandomString } from './createRandomString';

describe('Create random string', function()
{
	this.timeout(testUtils.defaultTestTimeout);

	it('should create a random string', function() {
		const randomString = createRandomString();
		expect(randomString).to.be.a('string');
		expect(randomString).to.have.length(8);

		const allowedCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' +
		'01234567890_';

		for (const character of randomString) {
			expect(allowedCharacters.includes(character)).to.be.true;
		}
	});


	it('should create a random string of a specified length', function() {
		const randomString = createRandomString({
			length: 36
		});
		expect(randomString).to.be.a('string');
		expect(randomString).to.have.length(36);
	});


	it('should create a random string consisting of only alphabetic characters', function() {
		const randomString = createRandomString({
			length: 64,
			charactersOnly: true
		});
		expect(randomString).to.be.a('string');
		expect(randomString).to.have.length(64);

		const allowedCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

		for (const character of randomString) {
			expect(allowedCharacters.includes(character)).to.be.true;
		}
	});
});
