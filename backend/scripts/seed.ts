import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectMongo } from '../src/infrastructure/db/mongo';
import { SongModel } from '../src/infrastructure/models/songModel';
import { PlaylistModel } from '../src/infrastructure/models/playlistModel';
import { UserModel } from '../src/infrastructure/models/userModel';

dotenv.config();

const REQUIRED_NODE_ENV = 'development';
const LOCAL_URI_PREFIXES = ['mongodb://localhost', 'mongodb://127.0.0.1'];
const ROCK_CLASSICS_PLAYLIST_NAME = 'Rock Classics';
const ADMIN_EMAIL = 'admin@dlg.com';
const ADMIN_PSEUDO = 'Admin';
const BCRYPT_SALT_ROUNDS = 10;
const SONGS_IN_PLAYLIST_COUNT = 3;

const seedSongs = [
  {
    title: 'Smoke on the Water',
    author: 'Deep Purple',
    lyrics: `We all came out to Montreux\nOn the Lake Geneva shoreline\nTo make records with a mobile\nWe didn't have much time`,
    tab: `e|----------------------------|\nB|----------------------------|\nG|-5-5-8-5-5-8-7-5-5-8-10-8--|\nD|-5-5-8-5-5-8-7-5-5-8-10-8--|\nA|-3-3-6-3-3-6-5-3-3-6-8--6--|\nE|----------------------------|`,
  },
  {
    title: 'Wonderwall',
    author: 'Oasis',
    lyrics: `Today is gonna be the day\nThat they're gonna throw it back to you\nBy now you should've somehow\nRealized what you gotta do`,
    tab: `e|-0-0-0-0-0-0-0-0-0-0-0-0---|\nB|-0-0-0-0-0-0-0-0-0-0-0-0---|\nG|-0-0-0-0-2-2-2-2-2-2-2-2---|\nD|-2-2-2-2-2-2-2-2-4-4-4-4---|\nA|-2-2-2-2-0-0-0-0-4-4-4-4---|\nE|-0-0-0-0---------2-2-2-2---|`,
  },
  {
    title: 'Sweet Home Alabama',
    author: 'Lynyrd Skynyrd',
    lyrics: `Big wheels keep on turning\nCarry me home to see my kin\nSinging songs about the Southland\nI miss Alabamy once again and I think it's a sin`,
    tab: `e|----------------------------|\nB|----------------------------|\nG|-0---0-0----------------0---|\nD|-0---0-0-0h2-0-2--------0---|\nA|-2---2-2---------3-2-0--2---|\nE|----------------------------|`,
  },
  {
    title: 'Hotel California',
    author: 'Eagles',
    lyrics: `On a dark desert highway, cool wind in my hair\nWarm smell of colitas rising up through the air\nUp ahead in the distance, I saw a shimmering light\nMy head grew heavy and my sight grew dim`,
    tab: `e|-0-----0-----0-----0--------|\nB|----1-----1-----1-----1-----|\nG|-------2-----2-----2-----2--|\nD|-2-----2-----2-----2--------|\nA|---0-----0-----0-----0------|\nE|----------------------------|`,
  },
  {
    title: 'Knockin\' on Heaven\'s Door',
    author: 'Bob Dylan',
    lyrics: `Mama, take this badge off of me\nI can't use it anymore\nIt's getting dark, too dark to see\nI feel I'm knockin' on heaven's door`,
    tab: `e|---3-----3-----3-----3------|\nB|---3-----3-----3-----1------|\nG|---0-----0-----0-----0------|\nD|-0-----2-----0--------------|\nA|----------------------------|\nE|----------------------------|`,
  },
  {
    title: 'Come as You Are',
    author: 'Nirvana',
    lyrics: `Come as you are, as you were\nAs I want you to be\nAs a friend, as a friend\nAs an old enemy`,
    tab: `e|----------------------------|\nB|----------------------------|\nG|----------------------------|\nD|-2-2-2-0-2-3-2-0-2-3-2-0---|\nA|-0-0-0-0-0-1-0-0-0-1-0-0---|\nE|----------------------------|`,
  },
  {
    title: 'Wish You Were Here',
    author: 'Pink Floyd',
    lyrics: `So, so you think you can tell\nHeaven from Hell\nBlue skies from pain\nCan you tell a green field from a cold steel rail`,
    tab: `e|-12-12------------12-12-----|\nB|------12-10-12-10-----------|\nG|----------------------------|\nD|----------------------------|\nA|----------------------------|\nE|----------------------------|`,
  },
  {
    title: 'Stairway to Heaven',
    author: 'Led Zeppelin',
    lyrics: `There's a lady who's sure all that glitters is gold\nAnd she's buying a stairway to heaven\nWhen she gets there she knows, if the stores are all closed\nWith a word she can get what she came for`,
    tab: `e|-5-4-5-7-5-4-2-0------------|\nB|----------------------------|\nG|----------------------------|\nD|----------------------------|\nA|----------------------------|\nE|----------------------------|`,
  },
  {
    title: 'Paint It Black',
    author: 'The Rolling Stones',
    lyrics: `I see a red door and I want it painted black\nNo colors anymore, I want them to turn black\nI see the girls walk by dressed in their summer clothes\nI have to turn my head until my darkness goes`,
    tab: `e|----------------------------|\nB|----------------------------|\nG|---0-2-3----0-2-3-----------|\nD|-0---------0----------------|\nA|----------------------------|\nE|----------------------------|`,
  },
  {
    title: 'Don\'t Stop Believin\'',
    author: 'Journey',
    lyrics: `Just a small town girl\nLivin' in a lonely world\nShe took the midnight train goin' anywhere\nJust a city boy\nBorn and raised in South Detroit`,
    tab: `e|----------------------------|\nB|----------------------------|\nG|----------------------------|\nD|---4-4-4-5-5-5-2-2-2-0-0-0--|\nA|-2-2-2-2-3-3-3-0-0-0--------|\nE|----------------------------|`,
  },
];

async function seed(): Promise<void> {
  if (process.env.NODE_ENV !== REQUIRED_NODE_ENV) {
    console.error(`Seed script can only run in ${REQUIRED_NODE_ENV} environment`);
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI;
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!mongoUri) {
    console.error('MONGO_URI environment variable is required');
    process.exit(1);
  }

  const isLocalUri = LOCAL_URI_PREFIXES.some((prefix) => mongoUri.startsWith(prefix));
  if (!isLocalUri) {
    console.error('Seed script can only run against a local MongoDB instance (localhost / 127.0.0.1)');
    process.exit(1);
  }

  if (!seedAdminPassword) {
    console.error('SEED_ADMIN_PASSWORD environment variable is required');
    process.exit(1);
  }

  try {
    await connectMongo(mongoUri);

    await SongModel.deleteMany({});
    await PlaylistModel.deleteMany({});
    await UserModel.deleteMany({});

    const insertedSongs = await SongModel.insertMany(seedSongs);
    const firstSongIds = insertedSongs.slice(0, SONGS_IN_PLAYLIST_COUNT).map((song) => song._id);

    await PlaylistModel.create({
      name: ROCK_CLASSICS_PLAYLIST_NAME,
      songIds: firstSongIds,
    });

    const hashedPassword = await bcrypt.hash(seedAdminPassword, BCRYPT_SALT_ROUNDS);

    await UserModel.create({
      email: ADMIN_EMAIL,
      pseudo: ADMIN_PSEUDO,
      password: hashedPassword,
      isAdmin: true,
      isActive: true,
      isDeleted: false,
      avatar: null,
      tokens: [],
    });

    console.log(`Seed complete:`);
    console.log(`  Songs inserted: ${insertedSongs.length}`);
    console.log(`  Playlist created: "${ROCK_CLASSICS_PLAYLIST_NAME}" (${SONGS_IN_PLAYLIST_COUNT} songs)`);
    console.log(`  Admin created: ${ADMIN_EMAIL}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

void seed();
