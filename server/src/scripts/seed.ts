import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Song } from '../models/Song';
import { Venue } from '../models/Venue';
import { Setlist } from '../models/Setlist';

async function main() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error('MONGO_URL not set');
  }
  await mongoose.connect(mongoUrl);

  const userId = 'mick-jagger';

  // Ensure user
  await User.findOneAndUpdate(
    { userId },
    { userId, handle: 'Mick Jagger', preferences: {} },
    { upsert: true, new: true }
  );

  // Clear previous test data for idempotency
  await Promise.all([
    Song.deleteMany({ userId }),
    Venue.deleteMany({ userId }),
    Setlist.deleteMany({ userId })
  ]);

  const songTitles = [
    "(I Can't Get No) Satisfaction",
    'Gimme Shelter',
    'Sympathy for the Devil',
    'Paint It Black',
    'Brown Sugar',
    'Jumpin\' Jack Flash',
    'Start Me Up',
    'Angie',
    'Wild Horses',
    'You Can\'t Always Get What You Want'
  ];

  const songs = await Song.insertMany(
    songTitles.map((title) => ({ userId, title }))
  );

  const venues = await Venue.insertMany([
    { userId, name: 'Madison Square Garden', address: 'New York, NY, USA' },
    { userId, name: 'Wembley Stadium', address: 'London, UK' },
    { userId, name: 'Hyde Park', address: 'London, UK' },
    { userId, name: 'The O2 Arena', address: 'London, UK' },
    { userId, name: 'Tokyo Dome', address: 'Tokyo, Japan' }
  ]);

  const byTitle = new Map(songs.map((s) => [s.title, s._id] as const));

  const greatestHitsItems = [
    "(I Can't Get No) Satisfaction",
    'Gimme Shelter',
    'Sympathy for the Devil',
    'Paint It Black',
    'Brown Sugar',
    "You Can't Always Get What You Want",
    "Jumpin' Jack Flash",
    'Start Me Up'
  ]
    .filter((t) => byTitle.has(t))
    .map((t) => ({ songId: byTitle.get(t)!, notes: 'classic', moodTags: ['rock'] }));

  const acousticSetItems = ['Angie', 'Wild Horses']
    .filter((t) => byTitle.has(t))
    .map((t) => ({ songId: byTitle.get(t)!, notes: 'acoustic', moodTags: ['acoustic'] }));

  const setlists = await Setlist.insertMany([
    { userId, name: 'Mick Jagger – Greatest Hits', items: greatestHitsItems },
    { userId, name: 'Mick Jagger – Acoustic Set', items: acousticSetItems }
  ]);

  console.log(JSON.stringify({
    user: userId,
    songs: songs.length,
    venues: venues.length,
    setlists: setlists.length
  }, null, 2));

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
