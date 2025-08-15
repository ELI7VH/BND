import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../lib/api';

type Song = {
  _id?: string;
  title: string;
  bpm?: number;
  key?: string;
  lyrics?: string;
};

export function Songs() {
  const qc = useQueryClient();
  const { data } = useQuery<Song[]>({ queryKey: ['songs'], queryFn: () => api('/api/songs') });
  const [title, setTitle] = useState('');
  const [bpm, setBpm] = useState('');
  const [keySig, setKeySig] = useState('');
  const [lyrics, setLyrics] = useState('');

  const create = useMutation({
    mutationFn: (payload: Partial<Song>) => api<Song>('/api/songs', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      setTitle('');
      setBpm('');
      setKeySig('');
      setLyrics('');
      qc.invalidateQueries({ queryKey: ['songs'] });
    }
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink)' }}>Songs</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          create.mutate({ title, bpm: bpm ? Number(bpm) : undefined, key: keySig || undefined, lyrics: lyrics || undefined });
        }}
        className="grid gap-3 mb-6 md:grid-cols-2"
      >
        <input className="rounded-md border px-3 py-2" style={{ borderColor: 'var(--line)', background: '#fff' }} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="rounded-md border px-3 py-2" style={{ borderColor: 'var(--line)', background: '#fff' }} placeholder="BPM" value={bpm} onChange={(e) => setBpm(e.target.value)} />
        <input className="rounded-md border px-3 py-2" style={{ borderColor: 'var(--line)', background: '#fff' }} placeholder="Key (e.g., A, C#m)" value={keySig} onChange={(e) => setKeySig(e.target.value)} />
        <textarea className="rounded-md border px-3 py-2 md:col-span-2" style={{ borderColor: 'var(--line)', background: '#fff' }} placeholder="Lyrics" rows={4} value={lyrics} onChange={(e) => setLyrics(e.target.value)} />
        <div className="md:col-span-2">
          <button type="submit" className="retro-button">Add Song</button>
        </div>
      </form>

      <ul className="grid sm:grid-cols-2 gap-3">
        {data?.map((s) => (
          <li key={s._id} className="rounded-md border px-3 py-2" style={{ borderColor: 'var(--line)', background: '#fff' }}>
            <div className="font-medium">{s.title}</div>
            <div className="text-sm opacity-70">{[s.bpm ? `${s.bpm} BPM` : null, s.key].filter(Boolean).join(' • ') || '—'}</div>
            {s.lyrics && <pre className="whitespace-pre-wrap text-sm mt-2 opacity-80">{s.lyrics}</pre>}
          </li>
        ))}
      </ul>
    </div>
  );
}
