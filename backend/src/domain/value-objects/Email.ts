import { DomainError } from '../errors/DomainError';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!EMAIL_REGEX.test(email)) {
      throw new DomainError('Invalid email format');
    }
    this.value = email.toLowerCase();
  }

  toString(): string {
    return this.value;
  }
}
