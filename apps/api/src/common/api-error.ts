import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@amazon-mvp/api-contract';

/**
 * All deliberate failures go through this type so the wire format stays the one
 * documented in the API contract.
 */
export class ApiError extends HttpException {
  constructor(
    readonly code: ErrorCode,
    message: string,
    status: HttpStatus,
    readonly details?: Array<{ field: string; message: string }>,
  ) {
    super({ code, message, details }, status);
  }

  static invalidCredentials() {
    // Deliberately identical for "unknown email" and "wrong password" so the
    // endpoint cannot be used to enumerate registered accounts.
    return new ApiError(
      ErrorCode.AUTH_INVALID_CREDENTIALS,
      'Invalid credentials',
      HttpStatus.UNAUTHORIZED,
    );
  }

  static currentPasswordInvalid() {
    // Same code and message as a failed login; 403 because the session itself is
    // valid (a 401 would read as "signed out" to clients).
    return new ApiError(
      ErrorCode.AUTH_INVALID_CREDENTIALS,
      'Invalid credentials',
      HttpStatus.FORBIDDEN,
    );
  }

  static emailAlreadyRegistered() {
    return new ApiError(
      ErrorCode.AUTH_EMAIL_ALREADY_REGISTERED,
      'That email is already registered',
      HttpStatus.CONFLICT,
    );
  }

  static sessionRequired() {
    return new ApiError(
      ErrorCode.AUTH_SESSION_REQUIRED,
      'Sign in to continue',
      HttpStatus.UNAUTHORIZED,
    );
  }

  static notFound(resource: string) {
    return new ApiError(
      ErrorCode.RESOURCE_NOT_FOUND,
      `${resource} not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}
