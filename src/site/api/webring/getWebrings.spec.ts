import dayjs = require('dayjs');
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as chaiAsPromised from 'chai-as-promised';
import { Site, User, Webring } from '../../model';
import { testUtils, userService } from '../../app';
import { app } from '../../index';
import { PaginatedApiResult, WebringApiResult } from '../model';

chai.use(chaiAsPromised);
chai.use(chaiHttp);

describe('Get webrings API', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testWebring: Webring;
	let testEmptyWebring: Webring;
	let testPrivateWebring: Webring;
	let testSite: Site;
	let testSite2: Site;
	let testSite3: Site;
	let testSite4: Site;
	let testSite5: Site;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser.userId!, {
			name: `Alice's Webring`
		});
		testEmptyWebring = await testUtils.insertTestWebring(testUser.userId!, {
			name: `Bob's Webring`
		});
		testPrivateWebring = await testUtils.insertTestWebring(testUser.userId!, {
			name: `Carol's Webring`,
			private: true
		});

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


	it('should return all webrings, sorted alphabetically', function (done) {
		chai.request(app)
			.get(`/webring`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);

				expect(res.body).to.have.property('totalItems', 2);
				expect(res.body).to.have.property('data');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.length(2);

				expect(res.body.data[0]).to.haveOwnProperty('name', `Alice's Webring`);
				expect(res.body.data[1]).to.haveOwnProperty('name', `Bob's Webring`);

				done();
			});
	});

	it('should not return private webrings', function (done) {
		chai.request(app)
			.get(`/webring`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);

				expect(res.body).to.have.property('totalItems', 2);
				expect(res.body).to.have.property('data');
				expect(res.body.data).to.be.an('array');
				expect(res.body.data).to.have.length(2);

				const result: PaginatedApiResult<WebringApiResult> = res.body;
				const privateWebring = result.data.find((webring) => {
					return webring.name === testPrivateWebring.name;
				});

				expect(privateWebring).to.be.undefined;

				done();
			});
	});
});
