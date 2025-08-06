import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { createRandomEmailAddress } from '../app/testUtils';
import { maskSensitiveFieldsInRequestBody } from './validateRequestBody';

describe('Request Body Validation', () => {
	describe('maskSensitiveFieldsInRequestBody', () => {
		it('should mask the password field in the request body', () => {
			const body = {
				email: createRandomEmailAddress(),
				password: 'password123'
			};

			const maskedBody = maskSensitiveFieldsInRequestBody(body);

			// .eql tests for deep equality.
			expect(maskedBody).eql({
				email: body.email,
				password: '******'
			});
		});

		it('should not mask the password field if it does not exist', () => {
			const body = {
				email: createRandomEmailAddress()
			};

			expect(maskSensitiveFieldsInRequestBody(body)).equals(body);
		});
	});
});
