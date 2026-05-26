import * as dayjs from 'dayjs';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as chaiAsPromised from 'chai-as-promised';
import { Session, User, Webring } from '../../../model';
import { sessionService, testUtils, userService } from '../../../app';
import { appDataSource } from '../../../infra/database';
import { app } from '../../../index';
import {
	notAuthorisedErrorMessage,
	requestAuthenticationFailedError,
	requestAuthorisationFailedError
} from '../../api-error-response';
import { getResponseViewErrorMessage } from '../../../app/testUtils';

chai.use(chaiAsPromised);
chai.use(chaiHttp);

describe('Delete Webring HTML Form', function () {
	this.timeout(testUtils.defaultTestTimeout);

	let testUser: User;
	let testUser2: User;
	let testUser3: User;
	let testUserSession: Session;
	let testUser2Session: Session;
	let testUser3Session: Session;
	let testWebring: Webring;
	let testWebringToDelete: Webring;

	before(async function beforeTesting() {
		testUser = await testUtils.insertTestUser();
		testUser2 = await testUtils.insertTestUser();
		testUser3 = await testUtils.insertTestUser();
		testUserSession = await sessionService.createSession(testUser);
		testUser2Session = await sessionService.createSession(testUser2);
		testUser3Session = await sessionService.createSession(testUser3);
		testWebring = await testUtils.insertTestWebring(testUser.userId!, {
			moderators: [testUser2]
		});
		testWebringToDelete = await testUtils.insertTestWebring(testUser.userId!);
	});

	after(async function afterTesting() {
		// Cascades to user's webrings.
		testUser = await userService.deleteUser(testUser.userId!);
		testUser2 = await userService.deleteUser(testUser2.userId!);
		testUser3 = await userService.deleteUser(testUser3.userId!);
	});

	it('should reject an unauthenticated request', function (done) {
		chai
			.request(app)
			.post(`/webring/${testWebring.url}/delete/form`)
			.send()
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(
					requestAuthenticationFailedError.httpStatus
				);
				expect(getResponseViewErrorMessage(res.text)).to.equal(
					notAuthorisedErrorMessage
				);

				done();
			});
	});

	it('should reject a request with an unknown webring URL', function (done) {
		chai
			.request(app)
			.post('/webring/nonexistenturl/delete/form')
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send()
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(404);

				done();
			});
	});

	it('should reject an unauthorised request', function (done) {
		chai
			.request(app)
			.post(`/webring/${testWebring.url}/delete/form`)
			.set('Cookie', `session=${testUser3Session.sessionId}`)
			.send()
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(requestAuthorisationFailedError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'delete-webring-error-message')
				).to.equal(requestAuthorisationFailedError.message);

				done();
			});
	});

	it("should reject a request by a webring's moderator", function (done) {
		chai
			.request(app)
			.post(`/webring/${testWebring.url}/delete/form`)
			.set('Cookie', `session=${testUser2Session.sessionId}`)
			.send()
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(requestAuthorisationFailedError.httpStatus);
				expect(
					getResponseViewErrorMessage(res.text, 'delete-webring-error-message')
				).to.equal(requestAuthorisationFailedError.message);

				done();
			});
	});

	it('should successfully delete a webring', function (done) {
		chai
			.request(app)
			.post(`/webring/${testWebringToDelete.url}/delete/form`)
			.set('Cookie', `session=${testUserSession.sessionId}`)
			.send()
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res.status).to.equal(200);

				appDataSource
					.getRepository(Webring)
					.findOneBy({ ringId: testWebringToDelete.ringId! })
					.then((webring: Webring | null) => {
						expect(webring?.dateDeleted).to.not.be.null;
						expect(dayjs(webring?.dateDeleted).isSame(dayjs(), 'minute')).to.be
							.true;

						done();
					});
			});
	});
});
