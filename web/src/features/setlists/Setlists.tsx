import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { api } from '../../lib/api';

type Song = { _id: string; title: string };

type SetlistItem = {
  songId?: string;
  notes?: string;
  moodTags?: string[];
};

type Setlist = {
  _id?: string;
  name: string;
  items?: SetlistItem[];
};

export function Setlists() {
  const qc = useQueryClient();
  const { data: setlists } = useQuery<Setlist[]>({ queryKey: ['setlists'], queryFn: () => api('/api/setlists') });
  const { data: songs } = useQuery<Song[]>({ queryKey: ['songs'], queryFn: () => api('/api/songs') });

  const [name, setName] = useState('');
  const [items, setItems] = useState<SetlistItem[]>([{ songId: undefined, notes: '', moodTags: [] }]);

  const create = useMutation({
    mutationFn: (payload: Partial<Setlist>) => api<Setlist>('/api/setlists', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      setName('');
      setItems([{ songId: undefined, notes: '', moodTags: [] }]);
      qc.invalidateQueries({ queryKey: ['setlists'] });
    }
  });

  const songOptions = useMemo(() => songs || [], [songs]);

  function updateItem(index: number, data: Partial<SetlistItem>) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...data };
      return next;
    });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink)' }}>Setlists</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          const normalized = items.map((it) => ({
            songId: it.songId || undefined,
            notes: it.notes || undefined,
            moodTags: (it.moodTags || []).filter(Boolean)
          }));
          create.mutate({ name, items: normalized });
        }}
        className="grid gap-3 mb-6"
      >
        <input className="rounded-md border px-3 py-2" style={{ borderColor: 'var(--line)', background: '#fff' }} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />

        <div className="rounded-md border p-3" style={{ borderColor: 'var(--line)', background: '#fff' }}>
          <div className="font-medium mb-2">Items</div>
          {items.map((it, idx) => (
            <div key={idx} className="grid gap-2 md:grid-cols-3 mb-2">
              <select
                className="rounded-md border px-2 py-2"
                style={{ borderColor: 'var(--line)', background: '#fff' }}
                value={it.songId || ''}
                onChange={(e) => updateItem(idx, { songId: e.target.value || undefined })}
              >
                <option value="">Select song…</option>
                {songOptions.map((s) => (
                  <option key={s._id} value={s._id}>{s.title}</option>
                ))}
              </select>
              <input
                className="rounded-md border px-2 py-2"
                style={{ borderColor: 'var(--line)', background: '#fff' }}
                placeholder="Notes"
                value={it.notes || ''}
                onChange={(e) => updateItem(idx, { notes: e.target.value })}
              />
              <input
                className="rounded-md border px-2 py-2"
                style={{ borderColor: 'var(--line)', background: '#fff' }}
                placeholder="Mood tags (comma-separated)"
                value={(it.moodTags || []).join(', ')}
                onChange={(e) => updateItem(idx, { moodTags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
              />
            </div>
          ))}
          <button type="button" className="retro-button" onClick={() => setItems((prev) => [...prev, { songId: undefined, notes: '', moodTags: [] }])}>Add Item</button>
        </div>

        <div>
          <button type="submit" className="retro-button">Create Setlist</button>
        </div>
      </form>

      <ul className="grid sm:grid-cols-2 gap-3">
        {setlists?.map((s) => (
          <li key={s._id} className="rounded-md border px-3 py-2" style={{ borderColor: 'var(--line)', background: '#fff' }}>
            <div className="font-medium">{s.name}</div>
            <ol className="mt-2 list-decimal ml-5">
              {(s.items || []).map((it, idx) => (
                <li key={idx} className="text-sm opacity-80">
                  {songOptions.find((x) => x._id === it.songId)?.title || '—'}
                  {it.notes ? ` — ${it.notes}` : ''}
                  {it.moodTags && it.moodTags.length > 0 ? ` [${it.moodTags.join(', ')}]` : ''}
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ul>
    </div>
  );
}
