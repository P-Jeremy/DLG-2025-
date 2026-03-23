import { DomainError } from '../errors/DomainError';

export class Pseudo {
  private readonly value: string;

  constructor(pseudo: string) {
    if (!pseudo || pseudo.trim().length === 0) {
      throw new DomainError('Pseudo cannot be empty');
    }
    this.value = pseudo.trim();
  }

  toString(): string {
    return this.value;
  }
}
