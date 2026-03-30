import {
  DomainError,
  EmailAlreadyTakenError,
  PseudoAlreadyTakenError,
  UserNotFoundError,
  AccountNotActiveError,
  InvalidPasswordError,
  InvalidActivationTokenError,
  InvalidResetTokenError,
} from '../../../domain/errors/DomainError';

type ErrorConstructor = new (...args: any[]) => Error;

const SINGLE_ERROR_STATUS_MAP = new Map<ErrorConstructor, number>([
  [EmailAlreadyTakenError, 409],
  [PseudoAlreadyTakenError, 409],
  [InvalidActivationTokenError, 400],
  [InvalidResetTokenError, 400],
  [AccountNotActiveError, 403],
]);

const MULTI_ERROR_STATUS_MAP = new Map<ErrorConstructor[], number>([
  [[UserNotFoundError, InvalidPasswordError], 401],
]);

export function getHttpStatusForError(error: unknown): number {
  for (const [ErrorClass, status] of SINGLE_ERROR_STATUS_MAP) {
    if (error instanceof ErrorClass) {
      return status;
    }
  }

  for (const [ErrorClasses, status] of MULTI_ERROR_STATUS_MAP) {
    if (ErrorClasses.some((ErrorClass) => error instanceof ErrorClass)) {
      return status;
    }
  }

  if (error instanceof DomainError) {
    return 400;
  }

  return 500;
}

export function getErrorMessage(error: unknown, defaultMessage = 'Internal server error'): string {
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
}
