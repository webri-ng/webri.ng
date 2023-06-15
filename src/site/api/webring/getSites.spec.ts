import dayjs = require('dayjs');
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as chaiAsPromised from 'chai-as-promised';
import { Site, User, Webring } from '../../model';
import { testUtils, userService } from '../../app';
import { app } from '../../index';

chai.use(chaiAsPromised);
chai.use(chaiHttp);

describe('Get webring sites API', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testWebring: Webring;
	let testEmptyWebring: Webring;
	let testSite: Site;
	let testSite2: Site;
	let testSite3: Site;
	let testSite4: Site;
	let testSite5: Site;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser.userId!);
		testEmptyWebring = await testUtils.insertTestWebring(testUser.userId!);

		testSite = await testUtils.insertTestSite(testWebring.ringId!,
			testUser.userId!, {
				dateCreated: dayjs().subtract(5, 'days').toDate()
			});
		testSite2 = await testUtils.insertTestSite(testWebring.ringId!,
			testUser.userId!, {
				dateCreated: dayjs().subtract(4, 'days').toDate()
			});
		testSite3 = await testUtils.insertTestSite(testWebring.ringId!,
			testUser.userId!, {
				dateCreated: dayjs().subtract(3, 'days').toDate()
			});
		testSite4 = await testUtils.insertTestSite(testWebring.ringId!,
			testUser.userId!, {
				dateCreated: dayjs().subtract(2, 'days').toDate()
			});
		testSite5 = await testUtils.insertTestSite(testWebring.ringId!,
			testUser.userId!, {
				dateCreated: dayjs().subtract(1, 'days').toDate()
			});
	});


	after(async function afterTesting()
	{
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser.userId!);
	});

	it('should return a 404 status when passed a nonexistent webring',
		function (done)
	{
		chai.request(app)
			.get(`/webring/nonexistent/sites`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(404);
				done();
			});
	});

	it('should return an empty array when passed a webring with no sites added',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testEmptyWebring?.url}/sites`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.length(0);
				done();
			});
	});

	it('should return a webring\'s sites',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.url}/sites`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				expect(res.body).to.be.an('array');
				expect(res.body).to.have.length(5);

				expect(res.body[0]).to.have.property('name', testSite.name);
				expect(res.body[0]).to.have.property('url', testSite.url);

				expect(res.body[1]).to.have.property('name', testSite2.name);
				expect(res.body[1]).to.have.property('url', testSite2.url);

				expect(res.body[2]).to.have.property('name', testSite3.name);
				expect(res.body[2]).to.have.property('url', testSite3.url);

				expect(res.body[3]).to.have.property('name', testSite4.name);
				expect(res.body[3]).to.have.property('url', testSite4.url);

				expect(res.body[4]).to.have.property('name', testSite5.name);
				expect(res.body[4]).to.have.property('url', testSite5.url);

				done();
			});
	});
});
