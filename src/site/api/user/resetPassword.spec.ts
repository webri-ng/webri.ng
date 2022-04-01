import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { app } from '../..';
import { User } from '../../model';
import { userService, testUtils } from '../../app';

chai.use(chaiHttp);

describe('Logout API', function()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
	});


	after(async function tearDown() {
		await userService.deleteUser(testUser.userId!);
	});


	it('should return a 200 status when passed a nonexistent user email', function (done) {
		chai.request(app)
			.post('/user/reset-password')
			.send({
				"email": "nonexistent@nonsense.org"
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				done();
			});
	});


	it('should return a 200 status when passed an existant user email', function (done) {
		chai.request(app)
			.post('/user/reset-password')
			.send({
				"email": testUser.email
			})
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				done();
			});
	});
});
