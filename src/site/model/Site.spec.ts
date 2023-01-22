import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Site } from '.';
import { testUtils } from '../app';
import { InvalidSiteNameError, InvalidSiteUrlError } from '../app/error';
import { siteConfig } from '../config';

describe('Site Entity', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	describe('Normalise site URL', function ()
	{
		it('should throw an exception if no site URL is provided', function ()
		{
			expect(() => Site.normaliseUrl('')).to.throw(InvalidSiteUrlError);
		});

		it('should correctly normalise a site URL', function ()
		{
			const normalisedUrl: string = Site.normaliseUrl('  http://www.example.org  ');
			expect(normalisedUrl).to.equal('http://www.example.org');
		});

		it('should prepend http:// if no protocol identifier is present in the site URL', function ()
		{
			const normalisedUrl: string = Site.normaliseUrl('www.example.org  ');
			expect(normalisedUrl).to.equal('http://www.example.org');
		});

		it('should not add http:// if a non http protocol identifier is present in the site URL', function ()
		{
			const normalisedUrl: string = Site.normaliseUrl('  ftp://www.example.org  ');
			expect(normalisedUrl).to.equal('ftp://www.example.org');
		});
	});

	describe('Validate site URL', function () {
		it('should throw an exception if no ring URL is provided', function ()
		{
			expect(() => Site.validateUrl('')).to.throw(InvalidSiteUrlError);
		});
	});


	describe('Normalise site name', function ()
	{
		it('should throw an exception if no site name is provided', function ()
		{
			expect(() => Site.normaliseName('')).to.throw(InvalidSiteNameError);
		});

		it("should correctly normalise a site's name", function ()
		{
			const normalisedName: string = Site.normaliseName(` Anthony's Site    `);
			expect(normalisedName).to.equal(`Anthony's Site`);
		});
	});

	describe('Validate site name', function ()
	{
		it('should throw an exception if no site name is provided', function ()
		{
			expect(() => Site.validateName('')).to.throw(InvalidSiteNameError);
		});


		it('should throw an exception when passed a name that is too short', function ()
		{
			const shortSiteName = Array(siteConfig.nameRequirements.minLength - 1)
			.fill('n').join('');
			expect(() => Site.validateName(shortSiteName)).to.throw(InvalidSiteNameError);
		});


		it('should throw an exception when passed a name that is too long', function ()
		{
			const longSiteName = Array(siteConfig.nameRequirements.maxLength + 1)
			.fill('n').join('');
			expect(() => Site.validateName(longSiteName)).to.throw(InvalidSiteNameError);
		});
	});
});
