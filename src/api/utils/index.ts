/**
 * @module api/utils
 * API-related utilities.
 */

export type QueryParameter = undefined | string | string[] | object;

export * from './parsePageLengthQueryParameter';
export * from './parsePageNumberQueryParameter';
