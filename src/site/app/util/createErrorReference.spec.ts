import { expect } from 'chai';
import { createErrorReference } from '.';
import { testUtils } from '..';

describe('Create error reference', function()
{
	this.timeout(testUtils.defaultTestTimeout);

	it('should create an error reference string', function() {
		const errorReference = createErrorReference();
		expect(errorReference).to.be.a('string');
		expect(errorReference.slice(0, 4)).to.equal('ERR-');
		expect(errorReference).to.have.length(12);
	});
});
