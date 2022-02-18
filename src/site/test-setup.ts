/**
 * @module test-setup
 * This module contains global root hook plugins for the Mocha test harness.
 * Refer to: https://mochajs.org/#root-hook-plugins
 */

import { initApplication, shutdownApplication } from '.';


export const mochaHooks = {
	/**
	 * @async
	 * The `beforeAll` hook sets up the application, making all of the necessary database
	 * and server connections prior to initiating the test suite.
	 */
	async beforeAll()
	{
		await initApplication();
	},


	/**
	 * @async
	 * The `afterAll` hook tears down the application. Gracefully killing the database
	 * and server connections.
	 */
	async afterAll()
	{
		await shutdownApplication();
	}
};
