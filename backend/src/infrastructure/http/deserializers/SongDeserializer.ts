import sanitizeHtml from 'sanitize-html';
import type { AddSongInput } from '../../../application/usecases/AddSong';
import type { UpdateSongInput } from '../../../application/usecases/UpdateSong';
import type { UploadableFile } from '../../../application/interfaces/IFileUploadService';
import type { SongSortField } from '../../../domain/interfaces/ISongRepository';

const ALLOWED_LYRICS_TAGS = ['p', 'br', 'strong', 'em', 's', 'ul', 'ol', 'li'];
const VALID_SORT_FIELDS: SongSortField[] = ['title', 'author'];
const DEFAULT_SORT_FIELD: SongSortField = 'title';

export interface RawSongBody {
  title?: string;
  author?: string;
  lyrics?: string;
}

export type RawAddSongBody = RawSongBody;
export type RawUpdateSongBody = RawSongBody;

export class MissingFieldError extends Error {
  constructor(field: string) {
    super(`${field} is required`);
  }
}

export class SongDeserializer {
  deserializeSortField(value: unknown): SongSortField {
    if (typeof value === 'string' && (VALID_SORT_FIELDS as string[]).includes(value)) {
      return value as SongSortField;
    }
    return DEFAULT_SORT_FIELD;
  }

  deserializeAddSong(body: RawAddSongBody, file: UploadableFile): AddSongInput {
    return { ...this.deserializeSongFields(body), tabFile: file };
  }

  deserializeUpdateSong(songId: string, body: RawUpdateSongBody, file?: UploadableFile): UpdateSongInput {
    return { songId, ...this.deserializeSongFields(body), tabFile: file };
  }

  private deserializeSongFields(body: RawSongBody) {
    const { title, author, lyrics } = body;

    if (!title) throw new MissingFieldError('title');
    if (!author) throw new MissingFieldError('author');
    if (!lyrics) throw new MissingFieldError('lyrics');

    return {
      title,
      author,
      lyrics: this.sanitizeLyrics(lyrics),
    };
  }

  private sanitizeLyrics(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: ALLOWED_LYRICS_TAGS,
      allowedAttributes: {},
    });
  }
}
