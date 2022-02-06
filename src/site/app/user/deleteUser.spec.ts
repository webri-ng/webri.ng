import * as dayjs from 'dayjs';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { InvalidIdentifierError, UserNotFoundError } from '../error';
chai.use(chaiAsPromised);

import { User, Webring } from '../../model';

import { testUtils } from '../';
import { deleteUser } from './deleteUser';
import { EntityManager, getManager, getRepository } from 'typeorm';


describe('User soft-deletion', function() {
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUser2: User;
	let testUser3: User;
	let testUser4: User;
	let testWebring: Webring;
	let testPrivateWebring: Webring;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
		testUser2 = await testUtils.insertTestUser();
		testUser3 = await testUtils.insertTestUser();
		testUser4 = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser3.userId || '');
		testPrivateWebring = await testUtils.insertTestWebring(testUser3.userId || '', {
			private: true
		});
	});


	it('should throw an exception when passed an empty userId', async function() {
		return expect(deleteUser('')).to.be.rejectedWith(InvalidIdentifierError);
	});


	it('should throw an exception when passed a nonexistent userId', async function() {
		return expect(deleteUser(testUtils.dummyUuid)).to.be.rejectedWith(UserNotFoundError);
	});


	it('should correctly delete a user', async function() {
		const deletedUser = await deleteUser(testUser?.userId || '');

		expect(deletedUser.dateDeleted).to.not.be.null;
		expect(dayjs(deletedUser.dateDeleted).isSame(dayjs(), 'minute')).to.be.true;
	});


	it('should correctly delete a user at an arbitrary date', async function() {
		const deletionDate = new Date();
		const deletedUser = await deleteUser(testUser2?.userId || '', {
			deletionDate
		});

		expect(deletedUser.dateDeleted).to.not.be.null;
		expect(dayjs(deletedUser.dateDeleted).isSame(deletionDate)).to.be.true;
	});


	it('should correctly delete a user\'s created webrings', async function() {
		const deletionDate = new Date();
		const deletedUser = await deleteUser(testUser3?.userId || '', {
			deletionDate
		});

		expect(deletedUser.dateDeleted).to.not.be.null;
		expect(dayjs(deletedUser.dateDeleted).isSame(deletionDate)).to.be.true;

		let deletedWebring = await getRepository(Webring).findOne(testWebring.ringId);
		expect(deletedWebring?.dateDeleted).to.not.be.null;
		expect(dayjs(deletedWebring?.dateDeleted).isSame(deletionDate)).to.be.true;

		deletedWebring = await getRepository(Webring).findOne(testPrivateWebring.ringId);
		expect(deletedWebring?.dateDeleted).to.not.be.null;
		expect(dayjs(deletedWebring?.dateDeleted).isSame(deletionDate)).to.be.true;
	});


	it('should correctly delete a user within a transaction', async function() {
		await getManager().transaction(async (transactionalEntityManager: EntityManager) => {
			const deletionDate = new Date();
			const deletedUser = await deleteUser(testUser4?.userId || '', {
				deletionDate,
				transactionalEntityManager
			});

			expect(deletedUser.dateDeleted).to.not.be.null;
			expect(dayjs(deletedUser.dateDeleted).isSame(deletionDate)).to.be.true;
		});
	});
});
