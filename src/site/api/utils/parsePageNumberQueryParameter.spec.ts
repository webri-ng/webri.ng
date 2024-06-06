import { expect } from 'chai';
import { parsePageNumberQueryParameter } from './parsePageNumberQueryParameter';

describe('Parse page number query parameter', function () {
	it('should return 1 when the query parameter is undefined', function () {
		expect(parsePageNumberQueryParameter(undefined)).to.equal(1);
	});

	it('should successfully parse the value when the query parameter is a string', function () {
		expect(parsePageNumberQueryParameter('5')).to.equal(5);
	});

	it('should successfully parse the value when the query parameter is an array', function () {
		expect(parsePageNumberQueryParameter(['5', '3'])).to.equal(5);
	});

	it('should return 1 when the query parameter cannot be parsed to a number', function () {
		expect(parsePageNumberQueryParameter('not a number')).to.equal(1);
	});

	it('should return 1 when the query parameter is an object', function () {
		expect(parsePageNumberQueryParameter({ a: 1 })).to.equal(1);
	});

	it('should return 1 when parsed the query parameter is less than 1', function () {
		expect(parsePageNumberQueryParameter('0')).to.equal(1);
		expect(parsePageNumberQueryParameter('-5')).to.equal(1);
	});
});
