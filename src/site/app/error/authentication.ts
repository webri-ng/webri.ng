export class AuthenticationFailedError extends Error { }

export class NoAuthenticationError extends AuthenticationFailedError { }

export class SessionNotFoundError extends AuthenticationFailedError { }

export class InvalidSessionError extends AuthenticationFailedError { }

export class SessionExpiredError extends Error { }

