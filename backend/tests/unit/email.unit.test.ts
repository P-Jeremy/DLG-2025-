import { Email } from '../../src/domain/value-objects/Email';
import { Pseudo } from '../../src/domain/value-objects/Pseudo';

describe('Email value object', () => {
  it('should create a valid email and normalize to lowercase', () => {
    const email = new Email('User@Example.COM');

    expect(email.toString()).toBe('user@example.com');
  });

  it('should throw when email has no @ symbol', () => {
    expect(() => new Email('invalidemail.com')).toThrow('Invalid email format');
  });

  it('should throw when email has no domain part', () => {
    expect(() => new Email('user@')).toThrow('Invalid email format');
  });

  it('should throw when email is empty', () => {
    expect(() => new Email('')).toThrow('Invalid email format');
  });

  it('should throw when email has spaces', () => {
    expect(() => new Email('user @domain.com')).toThrow('Invalid email format');
  });

  it('should accept a standard valid email', () => {
    const email = new Email('user@domain.com');

    expect(email.toString()).toBe('user@domain.com');
  });
});

describe('Pseudo value object', () => {
  it('should create a valid pseudo and trim whitespace', () => {
    const pseudo = new Pseudo('  john  ');

    expect(pseudo.toString()).toBe('john');
  });

  it('should throw when pseudo is empty string', () => {
    expect(() => new Pseudo('')).toThrow('Pseudo cannot be empty');
  });

  it('should throw when pseudo is only whitespace', () => {
    expect(() => new Pseudo('   ')).toThrow('Pseudo cannot be empty');
  });

  it('should accept a normal pseudo', () => {
    const pseudo = new Pseudo('alice');

    expect(pseudo.toString()).toBe('alice');
  });
});
