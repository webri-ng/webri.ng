/**
 * Test utils.
 * Contains a collection of functions suitable for inserting and manipulating test data.
 * @module app/test-utils
 */

import * as dayjs from 'dayjs';

/**
 * Be aware: Use this instead of comparing a UUID to `null`, since TypeORM's implementation
 * is inconsistent and will happily search for entities with a `null` primary key, for
 * whatever reason. Always use this when testing against a nonexistent entity.
 */
export const dummyUuid = 'a90d2103-bc3b-40be-ba29-ffffffffffff';


/**
 * An invalid UUID for testing purposes.
 */
export const invalidUiid = 'ffffffffffff';


/**
 * The default maximum timeout for tests.
 * This should cater for most scenarios, including test entity creation/deletion.
 * Declare this at the suite-level, as per: https://mochajs.org/#test-level
 * Any test that runs longer than 30 seconds should have an individual timeout specified
 * in the test spec.
 */
export const defaultTestTimeout = 30000;

/**
 * An invalid date object suitable for testing purposes.
 * This is a date object which `dayjs` will flag as being invalid.
 */
export const invalidDate: Date = dayjs('3131-31-31').toDate();

/** A test password string. */
export const testPasswordText = 'password1';
/** The accompanying hash to the test password string. */
export const testPasswordHash = '$2b$10$WZ85caRdLwlVekySsa/Xdu5lMI7xpywvpb7xcHxE.fv3wwYUYaUoy';

export * from './createRandomEmailAddress';
export * from './createRandomPassword';
export * from './createRandomSiteUrl';
export * from './createRandomTagName';
export * from './createRandomUsername';
export * from './createRandomWebringUrl';
export * from './insertTestSite';
export * from './insertTestTag';
export * from './insertTestUser';
export * from './insertTestWebring';
