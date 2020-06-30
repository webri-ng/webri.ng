import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Webring } from '.';
import { testUtils } from '../app';
import { InvalidRingNameError, InvalidRingUrlError } from '../app/error';
import { webringConfig } from '../config';

describe('Webring Entity', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	describe('Normalise webring URL', function ()
	{
		it('should throw an exception if no ring URL is provided', function ()
		{
			expect(() => Webring.normaliseUrl('')).to.throw(InvalidRingUrlError);
		});

		it("should correctly normalise a webring's URL", function ()
		{
			const normalisedUrl: string = Webring.normaliseUrl('  AnthonysWebring');
			expect(normalisedUrl).to.equal('anthonyswebring');
		});
	});

	describe('Validate webring URL', function () {
		it('should throw an exception if no ring URL is provided', function ()
		{
			expect(() => Webring.validateUrl('')).to.throw(InvalidRingUrlError);
		});


		it('should throw an exception when passed a URL that is too short', function ()
		{
			const shortUrl = Array(webringConfig.urlRequirements.minLength - 1)
				.fill('n').join('');
			expect(() => Webring.validateUrl(shortUrl)).to.throw(InvalidRingUrlError);
		});


		it('should throw an exception when passed a URL that is too long', function ()
		{
			const longUrl = Array(webringConfig.urlRequirements.maxLength + 1)
				.fill('n').join('');
			expect(() => Webring.validateUrl(longUrl)).to.throw(InvalidRingUrlError);
		});


		it('should throw an exception when passed a URL with invalid characters', function ()
		{
			expect(() => Webring.validateUrl('#something')).to.throw(InvalidRingUrlError);
			expect(() => Webring.validateUrl('$something')).to.throw(InvalidRingUrlError);
			expect(() => Webring.validateUrl('/something')).to.throw(InvalidRingUrlError);
			expect(() => Webring.validateUrl('some URL')).to.throw(InvalidRingUrlError);
			expect(() => Webring.validateUrl('another-url')).to.throw(InvalidRingUrlError);
		});
	});


	describe('Normalise webring name', function ()
	{
		it('should throw an exception if no ring name is provided', function ()
		{
			expect(() => Webring.normaliseName('')).to.throw(InvalidRingNameError);
		});

		it("should correctly normalise a webring's name", function ()
		{
			const normalisedName: string = Webring.normaliseName(` Anthony's Webring    `);
			expect(normalisedName).to.equal(`Anthony's Webring`);
		});
	});

	describe('Validate webring name', function ()
	{
		it('should throw an exception if no ring name is provided', function ()
		{
			expect(() => Webring.validateName('')).to.throw(InvalidRingNameError);
		});


		it('should throw an exception when passed a name that is too short', function ()
		{
			const shortRingName = Array(webringConfig.nameRequirements.minLength - 1)
				.fill('n').join('');
			expect(() => Webring.validateName(shortRingName)).to.throw(InvalidRingNameError);
		});


		it('should throw an exception when passed a name that is too long', function ()
		{
			const longRingName = Array(webringConfig.nameRequirements.maxLength + 1)
				.fill('n').join('');
			expect(() => Webring.validateName(longRingName)).to.throw(InvalidRingNameError);
		});
	});
});
