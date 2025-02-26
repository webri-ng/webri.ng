import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { app } from '../';
import { testUtils } from '../app';

chai.use(chaiHttp);

describe('Health Check API', function () {
	this.timeout(testUtils.defaultTestTimeout);

	it('should correctly return the status of the application', function (done) {
		chai
			.request(app)
			.get('/health')
			.send()
			.end(function (err, res) {
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				done();
			});
	});
});
