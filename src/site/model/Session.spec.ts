import { describe, it } from 'mocha';
import * as dayjs from 'dayjs';
import { expect } from 'chai';
import { Session } from '.';
import { testUtils } from '../app';
import { dummyUuid } from '../app/testUtils';

describe('Session Entity', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	describe('Validate session active', function ()
	{
		const expiryDate = dayjs().add(1, "week").toDate();
		const session = new Session(dummyUuid, expiryDate);
		const dateTooEarly = dayjs().subtract(1, 'day').toDate();
		const dateTooLate = dayjs(session.expiryDate).add(1, 'day').toDate();
		const validDate = dayjs(session.expiryDate).subtract(1, 'minute').toDate();

		it('should return false if the specified date is before the creation', function ()
		{
			expect(session.isActive(dateTooEarly)).to.be.false;
		});


		it('should return false if the specified date is after the expiry', function ()
		{
			expect(session.isActive(dateTooLate)).to.be.false;

		});


		it('should return true if the specified date is within the valid window', function ()
		{
			expect(session.isActive(validDate)).to.be.true;
		});


		it('should return true if the current date is within the valid window', function ()
		{
			expect(session.isActive()).to.be.true;
		});
	});

	it('should return the number of seconds remaining in the session', function () {
		const expiryDate = dayjs().add(1, "week").toDate();
		const session = new Session(dummyUuid, expiryDate);
		expect(session.secondsRemaining).to.equal(604800);
	});

	describe('Validate session invalidation', function () {
		// Set an arbitrary creation date.
		// In future the functionality may change to validate the creation date when determining
		// the validity of a session in this manner.
		const creationDate = dayjs().subtract(1, "day").toDate();
		const session = new Session(dummyUuid);
		session.dateCreated = creationDate;

		it('should correctly return whether a session has been invalidated', function () {
			expect(session.isInvalidated()).to.be.false;
			session.dateEnded = dayjs().subtract(1, "minute").toDate();
			expect(session.isInvalidated()).to.be.true;
		});

		it('should correctly return whether a session has been invalidated as of a specific date',
			function ()
		{
			const effectiveDate = dayjs().subtract(1, "hour").toDate();
			expect(session.isInvalidated(effectiveDate)).to.be.false;
		});
	})

});
