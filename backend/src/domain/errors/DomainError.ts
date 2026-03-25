export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class EmailAlreadyTakenError extends DomainError {
  constructor() {
    super('Email already taken');
    this.name = 'EmailAlreadyTakenError';
  }
}

export class PseudoAlreadyTakenError extends DomainError {
  constructor() {
    super('Pseudo already taken');
    this.name = 'PseudoAlreadyTakenError';
  }
}

export class UserNotFoundError extends DomainError {
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundError';
  }
}

export class AccountNotActiveError extends DomainError {
  constructor() {
    super('Account is not active');
    this.name = 'AccountNotActiveError';
  }
}

export class InvalidPasswordError extends DomainError {
  constructor() {
    super('Invalid password');
    this.name = 'InvalidPasswordError';
  }
}

export class InvalidActivationTokenError extends DomainError {
  constructor() {
    super('Invalid activation token');
    this.name = 'InvalidActivationTokenError';
  }
}

export class InvalidResetTokenError extends DomainError {
  constructor() {
    super('Invalid reset token');
    this.name = 'InvalidResetTokenError';
  }
}

export class DuplicateTagError extends DomainError {
  constructor() {
    super('Tag already exists');
    this.name = 'DuplicateTagError';
  }
}

export class TagNotFoundError extends DomainError {
  constructor() {
    super('Tag not found');
    this.name = 'TagNotFoundError';
  }
}

export class InvalidPlaylistSongError extends DomainError {
  constructor() {
    super('One or more songs do not belong to this tag');
    this.name = 'InvalidPlaylistSongError';
  }
}

export class SongNotFoundError extends DomainError {
  constructor() {
    super('Song not found');
    this.name = 'SongNotFoundError';
  }
}
