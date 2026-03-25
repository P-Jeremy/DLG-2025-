import type { ISongRepository } from '../../domain/interfaces/ISongRepository';
import type { IPlaylistRepository } from '../../domain/interfaces/IPlaylistRepository';
import type { ITagRepository } from '../../domain/interfaces/ITagRepository';
import type { IPlaylist } from '../../domain/interfaces/IPlaylist';
import { TagNotFoundError, SongNotFoundError } from '../../domain/errors/DomainError';

export interface AddSongToPlaylistInput {
  tagId: string;
  songId: string;
}

export interface AddSongToPlaylistOutput {
  playlist: IPlaylist;
}

export class AddSongToPlaylist {
  constructor(
    private readonly tagRepository: ITagRepository,
    private readonly songRepository: ISongRepository,
    private readonly playlistRepository: IPlaylistRepository,
  ) {}

  async execute(input: AddSongToPlaylistInput): Promise<AddSongToPlaylistOutput> {
    const tag = await this.tagRepository.findById(input.tagId);
    if (!tag) throw new TagNotFoundError();

    const song = await this.songRepository.findById(input.songId);
    if (!song) throw new SongNotFoundError();

    await this.songRepository.setTag(input.songId, input.tagId);

    const existingPlaylist = await this.playlistRepository.findByTagId(input.tagId);
    const currentSongIds = existingPlaylist ? existingPlaylist.songIds : [];

    const songAlreadyInPlaylist = currentSongIds.includes(input.songId);
    const updatedSongIds = songAlreadyInPlaylist
      ? currentSongIds
      : [...currentSongIds, input.songId];

    const playlist = await this.playlistRepository.save({
      tagId: input.tagId,
      songIds: updatedSongIds,
    });

    return { playlist };
  }
}
