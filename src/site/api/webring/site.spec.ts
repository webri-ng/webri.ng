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
	let testEmptyWebring: Webring;
	let testWebringWithEncodedUrls: Webring;
	let testSite: Site;
	let testSite2: Site;
	let testSite3: Site;
	let testSite4: Site;
	let testSite5: Site;
	let testSite6: Site;
	let testSite7: Site;
	let testSite8: Site;

	before(async function beforeTesting()
	{
		testUser = await testUtils.insertTestUser();
		testWebring = await testUtils.insertTestWebring(testUser.userId!);
		testEmptyWebring = await testUtils.insertTestWebring(testUser.userId!);
		testWebringWithEncodedUrls = await testUtils.insertTestWebring(testUser.userId!);

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

		testSite6 = await testUtils.insertTestSite(testWebringWithEncodedUrls.ringId!,
			testUser.userId!, {
				dateCreated: dayjs().subtract(2, 'days').toDate(),
				url: 'https://www.example.org/site-one#about'
			});
		testSite7 = await testUtils.insertTestSite(testWebringWithEncodedUrls.ringId!,
			testUser.userId!, {
				dateCreated: dayjs().subtract(1, 'days').toDate(),
				url: 'https://www.example.org/url?query=something_else'
			});
		testSite8 = await testUtils.insertTestSite(testWebringWithEncodedUrls.ringId!,
			testUser.userId!, {
				dateCreated: dayjs().subtract(1, 'hour').toDate(),
			});
	});


	after(async function afterTesting()
	{
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser.userId!);
	});


	it('should return a 404 status when passed a webring with no sites added',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testEmptyWebring?.url}/random`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(404);
				done();
			});
	});

	it('should return a 404 status when passed a valid webring, and an invalid method',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.url}/invalid`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(404);
				done();
			});
	});


	it('should redirect to the base domain URL when passed a nonexistent webring url',
		function (done)
	{
		chai.request(app)
			.get('/webring/@@@@@/random')
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
			.get(`/webring/${testWebring?.url}/next`)
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
			.get(`/webring/${testWebring?.url}/next`)
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
			.get(`/webring/${testWebring?.url}/next?index=-1`)
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
			.get(`/webring/${testWebring?.url}/previous?index=-1`)
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
			.get(`/webring/${testWebring?.url}/previous?index=ffff`)
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
			.get(`/webring/${testWebring?.url}/previous?index=99999`)
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
			.get(`/webring/${testWebring?.url}/next?index=0`)
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
			.get(`/webring/${testWebring?.url}/next?index=4`)
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
			.get(`/webring/${testWebring?.url}/previous?index=1`)
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
			.get(`/webring/${testWebring?.url}/previous?index=0`)
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
			.get(`/webring/${testWebring?.url}/random`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.be.oneOf([testSite.url, testSite2.url,
					testSite3.url, testSite4.url, testSite5.url]);
				done();
			});
	});


	it('should handle being passed multiple indexes', function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.url}/previous?index=1&index=2`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite.url);
				done();
			});
	});


	it('should handle being passed multiple referring urls', function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.url}/previous?via=${testSite2.url}&via=${testSite3.url}`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite.url);
				done();
			});
	});


	it('should handle being passed a referring url with a \'via\' query parameter',
		function (done)
	{
		const referringUrl = 'https://some-url.com?via=nothing';

		chai.request(app)
			.get(`/webring/${testWebring?.url}/previous?via=${referringUrl}`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite.url);
				done();
			});
	});


	it('should redirect to the next site when passed a valid url', function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.url}/next?via=${testSite.url}`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite2.url);
				done();
			});
	});


	it('should redirect to the first site when the method is \'next\' and passed the last url',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.url}/next?via=${testSite5.url}`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite.url);
				done();
			});
	});


	it('should return the previous site when passed a valid url', function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.url}/previous?via=${testSite3.url}`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite2.url);
				done();
			});
	});


	it('should return the last site when the method is \'previous\' and passed the first url',
		function (done)
	{
		chai.request(app)
			.get(`/webring/${testWebring?.url}/previous?via=${testSite.url}`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite5.url);
				done();
			});
	});

	it('should handle being passed a URL with an encoded anchor',
		function (done)
	{
		const encodedUrl = encodeURIComponent(testSite6.url);

		chai.request(app)
			.get(`/webring/${testWebringWithEncodedUrls?.url}/next?via=${encodedUrl}`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite7.url);
				done();
			});
	});

	it('should handle being passed a URL with an encoded query parameter',
		function (done)
	{
		const encodedUrl = encodeURIComponent(testSite7.url);

		chai.request(app)
			.get(`/webring/${testWebringWithEncodedUrls?.url}/next?via=${encodedUrl}`)
			.redirects(0)
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(303);
				expect(res.header.location).to.equal(testSite8.url);
				done();
			});
	});
});
