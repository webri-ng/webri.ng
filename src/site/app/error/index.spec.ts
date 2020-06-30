import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ApiReturnableError } from '../error';
import { requestValidationError } from '../../api/api-error-response';
chai.use(chaiAsPromised);


describe('API Returnable Error Instance', function() {
	it('should be able to instantiate an instance from error detail instance', function()
	{
		const errorInstance = ApiReturnableError
			.fromApiErrorResponseDetails(requestValidationError);

		expect(errorInstance.message).to.equal(requestValidationError.message);
		expect(errorInstance.code).to.equal(requestValidationError.code);
		expect(errorInstance.httpStatus).to.equal(requestValidationError.httpStatus);
	});


	it('the HTTP status code should default to 400 when not specified',
		function()
	{
		const errorInstance = new ApiReturnableError('Error message', 'error-code');

		expect(errorInstance.httpStatus).to.equal(400);
	});
});
