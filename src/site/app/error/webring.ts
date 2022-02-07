import { ApiReturnableError } from '.';

export class WebringNotFoundError extends ApiReturnableError { }

export class InvalidRingNameError extends ApiReturnableError { }

export class InvalidRingUrlError extends ApiReturnableError { }

export class RingUrlNotUniqueError extends ApiReturnableError { }

export class TooManyTagsError extends ApiReturnableError { }

export class InvalidSiteIndexError extends ApiReturnableError { }
