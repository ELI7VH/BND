import { randomUUID } from 'node:crypto';

export type Id = string;

export type MemorySong = {
  _id: Id;
  userId: string;
  title: string;
  bpm?: number;
  key?: string;
  lyrics?: string;
  streamingLinks?: string[];
  tags?: string[];
};

export type MemoryVenue = {
  _id: Id;
  userId: string;
  name: string;
  address?: string;
  contacts?: string[];
  stageDimensions?: string;
  stageWidth?: number;
  stageHeight?: number;
  electrical?: string;
  lighting?: string;
  audio?: string;
  hours?: string;
};

export type MemorySetlistItem = { songId?: Id; notes?: string; moodTags?: string[] };
export type MemorySetlist = { _id: Id; userId: string; name: string; items?: MemorySetlistItem[] };

export type MemoryShow = {
  _id: Id;
  userId: string;
  name: string;
  date?: string;
  venueId?: Id;
  setlistId?: Id;
  arriveAt?: string;
  setupAt?: string;
  parking?: string;
  food?: string;
  technicalNotes?: string;
};

export type MemoryStageNode = { id: string; label: string; x: number; y: number; type?: string; color?: string };
export type MemoryStagePlot = { _id: Id; userId: string; contextId: string; name?: string; nodes: MemoryStageNode[] };

export type MemoryUser = { userId: string; handle?: string; preferences?: Record<string, unknown> };

const mem = {
  users: [] as MemoryUser[],
  songs: [] as MemorySong[],
  venues: [] as MemoryVenue[],
  setlists: [] as MemorySetlist[],
  shows: [] as MemoryShow[],
  stageplots: [] as MemoryStagePlot[]
};

export function ensureDefaultUser(userId = 'user1') {
  if (!mem.users.find((u) => u.userId === userId)) {
    mem.users.push({ userId, handle: 'Demo User', preferences: {} });
  }
}

// Songs
export const songsStore = {
  list(userId: string) {
    return mem.songs.filter((s) => s.userId === userId);
  },
  get(userId: string, id: Id) {
    return mem.songs.find((s) => s.userId === userId && s._id === id) || null;
  },
  create(userId: string, data: Omit<Partial<MemorySong>, '_id' | 'userId'> & { title: string }) {
    const doc: MemorySong = { _id: randomUUID(), userId, title: data.title, bpm: data.bpm, key: data.key, lyrics: data.lyrics, streamingLinks: data.streamingLinks, tags: data.tags };
    mem.songs.push(doc);
    return doc;
  },
  update(userId: string, id: Id, patch: Partial<MemorySong>) {
    const idx = mem.songs.findIndex((s) => s.userId === userId && s._id === id);
    if (idx === -1) return null;
    mem.songs[idx] = { ...mem.songs[idx], ...patch, _id: mem.songs[idx]._id, userId };
    return mem.songs[idx];
  },
  delete(userId: string, id: Id) {
    const idx = mem.songs.findIndex((s) => s.userId === userId && s._id === id);
    if (idx === -1) return false;
    mem.songs.splice(idx, 1);
    return true;
  }
};

// Venues
export const venuesStore = {
  list(userId: string) { return mem.venues.filter((v) => v.userId === userId); },
  get(userId: string, id: Id) { return mem.venues.find((v) => v.userId === userId && v._id === id) || null; },
  create(userId: string, data: Omit<Partial<MemoryVenue>, '_id' | 'userId'> & { name: string }) {
    const doc: MemoryVenue = { _id: randomUUID(), userId, name: data.name, address: data.address, contacts: data.contacts, stageDimensions: data.stageDimensions, stageWidth: data.stageWidth, stageHeight: data.stageHeight, electrical: data.electrical, lighting: data.lighting, audio: data.audio, hours: data.hours };
    mem.venues.push(doc);
    return doc;
  },
  update(userId: string, id: Id, patch: Partial<MemoryVenue>) {
    const idx = mem.venues.findIndex((v) => v.userId === userId && v._id === id);
    if (idx === -1) return null;
    mem.venues[idx] = { ...mem.venues[idx], ...patch, _id: mem.venues[idx]._id, userId };
    return mem.venues[idx];
  },
  delete(userId: string, id: Id) {
    const idx = mem.venues.findIndex((v) => v.userId === userId && v._id === id);
    if (idx === -1) return false;
    mem.venues.splice(idx, 1);
    return true;
  }
};

// Setlists
export const setlistsStore = {
  list(userId: string) { return mem.setlists.filter((s) => s.userId === userId); },
  get(userId: string, id: Id) { return mem.setlists.find((s) => s.userId === userId && s._id === id) || null; },
  create(userId: string, data: Omit<Partial<MemorySetlist>, '_id' | 'userId'> & { name: string }) {
    const doc: MemorySetlist = { _id: randomUUID(), userId, name: data.name, items: data.items || [] };
    mem.setlists.push(doc);
    return doc;
  },
  update(userId: string, id: Id, patch: Partial<MemorySetlist>) {
    const idx = mem.setlists.findIndex((s) => s.userId === userId && s._id === id);
    if (idx === -1) return null;
    mem.setlists[idx] = { ...mem.setlists[idx], ...patch, _id: mem.setlists[idx]._id, userId };
    return mem.setlists[idx];
  },
  delete(userId: string, id: Id) {
    const idx = mem.setlists.findIndex((s) => s.userId === userId && s._id === id);
    if (idx === -1) return false;
    mem.setlists.splice(idx, 1);
    return true;
  }
};

// Shows
export const showsStore = {
  list(userId: string) { return mem.shows.filter((s) => s.userId === userId); },
  get(userId: string, id: Id) { return mem.shows.find((s) => s.userId === userId && s._id === id) || null; },
  create(userId: string, data: Omit<Partial<MemoryShow>, '_id' | 'userId'> & { name: string }) {
    const doc: MemoryShow = { _id: randomUUID(), userId, name: data.name, date: data.date, venueId: data.venueId, setlistId: (data as any).setlistId, arriveAt: data.arriveAt, setupAt: data.setupAt, parking: data.parking, food: data.food, technicalNotes: data.technicalNotes };
    mem.shows.push(doc);
    return doc;
  }
};

// StagePlots
export const stageplotsStore = {
  list(userId: string) {
    return mem.stageplots.filter((p) => p.userId === userId).map((p) => ({ contextId: p.contextId, name: p.name }));
  },
  get(userId: string, contextId: string) {
    return mem.stageplots.find((p) => p.userId === userId && p.contextId === contextId) || null;
  },
  upsert(userId: string, contextId: string, nodes: MemoryStageNode[], name?: string) {
    let plot = mem.stageplots.find((p) => p.userId === userId && p.contextId === contextId) || null;
    if (!plot) {
      plot = { _id: randomUUID(), userId, contextId, name, nodes: nodes || [] };
      mem.stageplots.push(plot);
    } else {
      plot.nodes = nodes || [];
      if (name !== undefined) plot.name = name;
    }
    return plot;
  }
};

export function resetMemoryStore() {
  mem.users = [];
  mem.songs = [];
  mem.venues = [];
  mem.setlists = [];
  mem.shows = [];
  mem.stageplots = [];
}
