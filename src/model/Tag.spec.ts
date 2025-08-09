import { describe, it } from 'mocha';
import { expect } from 'chai';
import { testUtils } from '../app';
import { tagConfig } from '../config';
import { Tag } from '.';
import {
	invalidTagNameError,
	invalidTagNameTooLongError,
	invalidTagNameTooShortError
} from '../api/api-error-response';
import { ApiReturnableError } from '../app/error';

describe('Tag Entity', function () {
	this.timeout(testUtils.defaultTestTimeout);

	describe('Validate tag name', function () {
		it('should throw an exception if no tag name is provided', function () {
			expect(() => Tag.validateName('')).to.throw(
				ApiReturnableError,
				invalidTagNameError.message
			);
		});

		it('should throw an exception when passed a tag name that is too short', function () {
			const shortName = Array(tagConfig.nameRequirements.minLength - 1)
				.fill('n')
				.join('');
			expect(() => Tag.validateName(shortName)).to.throw(
				ApiReturnableError,
				invalidTagNameTooShortError.message
			);
		});

		it('should throw an exception when passed a tag name that is too long', function () {
			const longName = Array(tagConfig.nameRequirements.maxLength + 1)
				.fill('n')
				.join('');
			expect(() => Tag.validateName(longName)).to.throw(
				ApiReturnableError,
				invalidTagNameTooLongError.message
			);
		});

		it('should throw an exception when passed a tag name with invalid characters', function () {
			expect(() => Tag.validateName('#something')).to.throw(
				ApiReturnableError,
				invalidTagNameError.message
			);
			expect(() => Tag.validateName('$something')).to.throw(
				ApiReturnableError,
				invalidTagNameError.message
			);
			expect(() => Tag.validateName('/something')).to.throw(
				ApiReturnableError,
				invalidTagNameError.message
			);
			expect(() => Tag.validateName('some tag')).to.throw(
				ApiReturnableError,
				invalidTagNameError.message
			);
			expect(() => Tag.validateName('another-tag')).to.throw(
				ApiReturnableError,
				invalidTagNameError.message
			);
		});
	});

	describe('Normalise tag name', function () {
		it('should throw an exception if no tag name is provided', function () {
			expect(() => Tag.normaliseName('')).to.throw(
				ApiReturnableError,
				invalidTagNameError.message
			);
		});

		it(`should correctly normalise a tag's name`, function () {
			const normalisedName: string = Tag.normaliseName(' 80smusic    ');
			expect(normalisedName).to.equal('80smusic');
		});
	});
});
