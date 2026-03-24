import { SongDeserializer, MissingFieldError, InvalidTagsError } from '../../src/infrastructure/http/deserializers/SongDeserializer';
import type { UploadableFile } from '../../src/application/interfaces/IFileUploadService';

const buildFile = (): UploadableFile => ({
  originalname: 'tab.png',
  mimetype: 'image/png',
  size: 1024,
  buffer: Buffer.from(''),
});

const buildBody = (overrides: Record<string, string> = {}) => ({
  title: 'Bohemian Rhapsody',
  author: 'Queen',
  lyrics: '<p>Is this the real life?</p>',
  ...overrides,
});

describe('Unit | Deserializer | SongDeserializer', () => {
  const deserializer = new SongDeserializer();

  describe('deserializeAddSong', () => {
    it('returns valid AddSongInput for a well-formed body', () => {
      const result = deserializer.deserializeAddSong(buildBody(), buildFile());

      expect(result.title).toBe('Bohemian Rhapsody');
      expect(result.author).toBe('Queen');
      expect(result.lyrics).toBe('<p>Is this the real life?</p>');
      expect(result.tagIds).toEqual([]);
    });

    it('throws MissingFieldError when title is absent', () => {
      expect(() =>
        deserializer.deserializeAddSong(buildBody({ title: '' }), buildFile()),
      ).toThrow(MissingFieldError);
    });

    it('throws MissingFieldError when author is absent', () => {
      expect(() =>
        deserializer.deserializeAddSong(buildBody({ author: '' }), buildFile()),
      ).toThrow(MissingFieldError);
    });

    it('throws MissingFieldError when lyrics is absent', () => {
      expect(() =>
        deserializer.deserializeAddSong(buildBody({ lyrics: '' }), buildFile()),
      ).toThrow(MissingFieldError);
    });

    it('parses selectedTags JSON array into tagIds', () => {
      const result = deserializer.deserializeAddSong(
        buildBody({ selectedTags: '["id1","id2"]' }),
        buildFile(),
      );

      expect(result.tagIds).toEqual(['id1', 'id2']);
    });

    it('throws InvalidTagsError when selectedTags is not a JSON array', () => {
      expect(() =>
        deserializer.deserializeAddSong(buildBody({ selectedTags: '"not-an-array"' }), buildFile()),
      ).toThrow(InvalidTagsError);
    });

    it('throws InvalidTagsError when selectedTags is malformed JSON', () => {
      expect(() =>
        deserializer.deserializeAddSong(buildBody({ selectedTags: '{invalid}' }), buildFile()),
      ).toThrow(InvalidTagsError);
    });

    it('strips script tags from lyrics before returning', () => {
      const result = deserializer.deserializeAddSong(
        buildBody({ lyrics: '<p>Hello</p><script>alert("xss")</script>' }),
        buildFile(),
      );

      expect(result.lyrics).toBe('<p>Hello</p>');
      expect(result.lyrics).not.toContain('<script>');
    });

    it('strips disallowed attributes from lyrics', () => {
      const result = deserializer.deserializeAddSong(
        buildBody({ lyrics: '<p onclick="evil()">Hello</p>' }),
        buildFile(),
      );

      expect(result.lyrics).toBe('<p>Hello</p>');
    });

    it('preserves allowed formatting tags in lyrics', () => {
      const html = '<p><strong>Bold</strong> and <em>italic</em></p>';
      const result = deserializer.deserializeAddSong(buildBody({ lyrics: html }), buildFile());

      expect(result.lyrics).toBe(html);
    });
  });

  describe('deserializeSortField', () => {
    it('returns "title" for valid sort field', () => {
      expect(deserializer.deserializeSortField('title')).toBe('title');
    });

    it('returns "author" for valid sort field', () => {
      expect(deserializer.deserializeSortField('author')).toBe('author');
    });

    it('returns default "title" for unknown string', () => {
      expect(deserializer.deserializeSortField('unknown')).toBe('title');
    });

    it('returns default "title" for undefined', () => {
      expect(deserializer.deserializeSortField(undefined)).toBe('title');
    });

    it('returns default "title" for non-string value', () => {
      expect(deserializer.deserializeSortField(42)).toBe('title');
    });
  });
});
