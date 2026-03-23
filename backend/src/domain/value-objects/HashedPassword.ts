export class HashedPassword {
  private readonly value: string;

  constructor(hash: string) {
    this.value = hash;
  }

  toString(): string {
    return this.value;
  }
}
