import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { User } from '../../model';
import { testUtils, userService } from '../';
import { InvalidIdentifierError } from '../error';
import { getUser, GetUserSearchField } from './getUser';
import { EntityManager, getManager } from 'typeorm';


describe('Get user', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User | null = null;
	let testUser2: User | null = null;
	let testUser3: User | null = null;
	let testDeletedUser: User | null = null;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testUser2 = await testUtils.insertTestUser();
		testUser3 = await testUtils.insertTestUser();
		testDeletedUser = await testUtils.insertTestUser();
		testDeletedUser = await userService.deleteUser(testDeletedUser?.userId || '');
	});


	after(async function afterTesting()
	{
		testUser = await userService.deleteUser(testUser?.userId || '');
		testUser2 = await userService.deleteUser(testUser2?.userId || '');
		testUser3 = await userService.deleteUser(testUser3?.userId || '');
	});


	it('should get a user within a transaction', async function ()
	{
		await getManager().transaction(async (transactionalEntityManager: EntityManager) => {
			const result = await getUser(GetUserSearchField.UserId, testUser?.userId || '', {
				transactionalEntityManager
			});

			expect(result).to.not.be.null;
			expect(result?.userId).to.equal(testUser?.userId);
		});
	});


	describe('Get user by id', function () {
		it('should throw an exception when passed an empty user id', async function ()
		{
			return expect(getUser(GetUserSearchField.UserId,
				'')).to.be.rejectedWith(InvalidIdentifierError);
		});


		it('should throw an exception when passed an invalid user id', async function ()
		{
			return expect(getUser(GetUserSearchField.UserId,
				testUtils.invalidUiid)).to.be.rejectedWith(InvalidIdentifierError);
		});


		it('should correctly get a user by their id', async function ()
		{
			const result = await getUser(GetUserSearchField.UserId, testUser?.userId || '');

			expect(result).to.not.be.null;
			expect(result?.userId).to.equal(testUser?.userId);
		});


		it('should correctly ignore a deleted user', async function ()
		{
			const result = await getUser(GetUserSearchField.UserId, testDeletedUser?.userId || '');
			expect(result).to.be.null;
		});
	});


	describe('Get user by email', function () {
		it('should throw an exception when passed an invalid email', async function ()
		{
			return expect(getUser(GetUserSearchField.Email,
				'')).to.be.rejectedWith(InvalidIdentifierError);
		});


		it('should correctly get a user by their email', async function ()
		{
			const result = await getUser(GetUserSearchField.Email, testUser2?.email || '');

			expect(result).to.not.be.null;
			expect(result?.userId).to.equal(testUser2?.userId);
		});


		it('should correctly ignore a deleted user', async function ()
		{
			const result = await getUser(GetUserSearchField.Email, testDeletedUser?.email || '');
			expect(result).to.be.null;
		});
	});


	describe('Get user by username', function () {
		it('should throw an exception when passed an invalid username', async function ()
		{
			return expect(getUser(GetUserSearchField.Username,
				'')).to.be.rejectedWith(InvalidIdentifierError);
		});


		it('should correctly get a user by their username', async function ()
		{
			const result = await getUser(GetUserSearchField.Username, testUser3?.username || '');

			expect(result).to.not.be.null;
			expect(result?.userId).to.equal(testUser3?.userId);
		});


		it('should correctly ignore a deleted user', async function ()
		{
			const result = await getUser(GetUserSearchField.Username, testDeletedUser?.username || '');
			expect(result).to.be.null;
		});
	});
});
