import { describe, it } from 'mocha';
import { expect } from 'chai';
import { testUtils } from '../app';
import { InvalidTagNameError } from '../app/error';
import { tagConfig } from '../config';
import { Tag } from '.';

describe('Tag Entity', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	describe('Validate tag name', function () {
		it('should throw an exception if no tag name is provided', function ()
		{
			expect(() => Tag.validateName('')).to.throw(InvalidTagNameError);
		});


		it('should throw an exception when passed a tag name that is too short', function ()
		{
			const shortName = Array(tagConfig.nameRequirements.minLength - 1)
				.fill('n').join('');
			expect(() => Tag.validateName(shortName)).to.throw(InvalidTagNameError);
		});


		it('should throw an exception when passed a tag name that is too long', function ()
		{
			const longName = Array(tagConfig.nameRequirements.maxLength + 1)
				.fill('n').join('');
			expect(() => Tag.validateName(longName)).to.throw(InvalidTagNameError);
		});


		it('should throw an exception when passed a tag name with invalid characters', function ()
		{
			expect(() => Tag.validateName('#something')).to.throw(InvalidTagNameError);
			expect(() => Tag.validateName('$something')).to.throw(InvalidTagNameError);
			expect(() => Tag.validateName('/something')).to.throw(InvalidTagNameError);
			expect(() => Tag.validateName('some tag')).to.throw(InvalidTagNameError);
			expect(() => Tag.validateName('another-tag')).to.throw(InvalidTagNameError);
		});
	});


	describe('Normalise tag name', function ()
	{
		it('should throw an exception if no tag name is provided', function ()
		{
			expect(() => Tag.normaliseName('')).to.throw(InvalidTagNameError);
		});

		it(`should correctly normalise a tag's name`, function ()
		{
			const normalisedName: string = Tag.normaliseName(' 80smusic    ');
			expect(normalisedName).to.equal('80smusic');
		});
	});
});
