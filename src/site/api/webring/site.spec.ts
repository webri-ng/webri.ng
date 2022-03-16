import dayjs = require('dayjs');
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as chaiAsPromised from 'chai-as-promised';
import { Site, User, Webring } from '../../model';
import { testUtils, userService } from '../../app';
import { globalConfig } from '../../config';
import { app } from '../../index';

chai.use(chaiAsPromised);
chai.use(chaiHttp);

describe('Get new site API', function ()
{
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testWebring: Webring;
	let testSite: Site;
	let testSite2: Site;
	let testSite3: Site;
	let testSite4: Site;
	let testSite5: Site;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser?.userId!);

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
		testUser = await userService.deleteUser(testUser?.userId!);
	});


	it('should redirect to the base domain URL when passed an invalid webring id, and the ' +
		'method is random',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testUtils.invalidUuid}/random`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(404);

				expect(res.header.location).to.equal(globalConfig.baseDomainUrl);
				done();
			});
	});


	it('should redirect to the base domain URL when passed an invalid webring id, and the ' +
		'method is next',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testUtils.invalidUuid}/next`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(404);

				expect(res.header.location).to.equal(globalConfig.baseDomainUrl);
				done();
			});
	});


	it('should redirect to the base domain URL when passed an invalid webring id, and the ' +
		'method is previous',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testUtils.invalidUuid}/previous`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(404);

				expect(res.header.location).to.equal(globalConfig.baseDomainUrl);
				done();
			});
	});


	it('should redirect to the base domain URL when passed a nonexistent webring id',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testUtils.dummyUuid}/random`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(404);
				expect(res.header.location).to.equal(globalConfig.baseDomainUrl);
				done();
			});
	});


	it('should redirect to the first site when not passed an index and the method is next',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.ringId}/next`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite.url);
				done();
			});
	});


	it('should redirect to the first site when not passed an index and the method is previous',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.ringId}/next`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite.url);
				done();
			});
	});


	it('should redirect to the first site when passed a negative index and the method is next',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.ringId}/next?index=-1`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite.url);
				done();
			});
	});


	it('should redirect to the first site when passed a negative index and the method is previous',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.ringId}/previous?index=-1`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite.url);
				done();
			});
	});


	it('should redirect to the first site when passed an invalid index',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.ringId}/previous?index=ffff`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite.url);
				done();
			});
	});


	it('should redirect to the first site when passed an index that is too high',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.ringId}/previous?index=99999`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite.url);
				done();
			});
	});


	it('should redirect to the next site when passed a valid index', function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.ringId}/next?index=0`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite2.url);
				done();
			});
	});


	it('should redirect to the first site when the method is \'next\' and passed the last index',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.ringId}/next?index=4`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite.url);
				done();
			});
	});


	it('should return the previous site when passed a valid index', function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.ringId}/previous?index=1`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite.url);
				done();
			});
	});


	it('should return the last site when the method is \'previous\' and passed the first index',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.ringId}/previous?index=0`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite5.url);
				done();
			});
	});


	it('should return a random site', function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.ringId}/random`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.be.oneOf([testSite.url, testSite2.url,
					testSite3.url, testSite4.url, testSite5.url]);
				done();
			});
	});
});
