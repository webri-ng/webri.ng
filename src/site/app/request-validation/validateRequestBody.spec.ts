import { expect } from 'chai';
import { testUtils } from '..';
import { RequestSchema } from '../../model';
import { RequestValidationError } from '../error';
import { validateRequestBody } from './validateRequestBody';

describe('API Request Validation', function() {
	this.timeout(testUtils.defaultTestTimeout);

	const requestSchema: RequestSchema = {
		$schema: 'http://json-schema.org/draft-07/schema#',
		type: 'object',
		properties: {
			field1: {
				type: 'string'
			},
			field2: {
				type: 'string'
			},
		},
		required: ['field1', 'field2'],
		additionalProperties: false
	};

	it('should correctly validate an invalid request body', function()
	{
		expect(() => validateRequestBody(requestSchema, {
			field1: 'something',
			field2: undefined
		})).to.throw(RequestValidationError);
	});


	it('should correctly validate an valid request body', function()
	{
		expect(() => validateRequestBody(requestSchema, {
			field1: 'something',
			field2: 'something'
		})).to.not.throw();
	});
});
