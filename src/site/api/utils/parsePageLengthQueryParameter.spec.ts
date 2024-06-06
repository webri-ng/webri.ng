import { expect } from 'chai';
import { parsePageLengthQueryParameter } from './parsePageLengthQueryParameter';
import { siteConfig } from '../../config';

describe('Parse page length query parameter', function () {
	it('should return the default when the query parameter is undefined', function () {
		expect(parsePageLengthQueryParameter(undefined))
			.to.equal(siteConfig.defaultPageLength);
	});

	it('should successfully parse the value when the query parameter is a string', function () {
		expect(parsePageLengthQueryParameter('5')).to.equal(5);
	});

	it('should successfully parse the value when the query parameter is an array', function () {
		expect(parsePageLengthQueryParameter(['5', '3'])).to.equal(5);
	});

	it('should return the default when the query parameter is a string that cannot be parsed to a number', function () {
		expect(parsePageLengthQueryParameter('not a number'))
			.to.equal(siteConfig.defaultPageLength);
	});

	it('should return the default when the query parameter is an object', function () {
		expect(parsePageLengthQueryParameter({ a: 1 }))
			.to.equal(siteConfig.defaultPageLength);
	});

	it('should return the default when parsed the query parameter is less than 1', function () {
		expect(parsePageLengthQueryParameter('0'))
			.to.equal(siteConfig.defaultPageLength);
		expect(parsePageLengthQueryParameter('-5'))
			.to.equal(siteConfig.defaultPageLength);
	});

	it('should return the maximum when parsed the query parameter is too large', function () {
		expect(parsePageLengthQueryParameter('555555'))
			.to.equal(siteConfig.maximumPageLength);
	});
});
