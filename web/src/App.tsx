import { useState } from 'react';
import { Songs } from './features/songs/Songs';
import { Venues } from './features/venues/Venues';
import { Setlists } from './features/setlists/Setlists';
import { CreateShow } from './features/shows/CreateShow';
import { StagePlotPage } from './features/stageplot/StagePlotPage';

const tabs = [
  { id: 'songs', label: 'Songs' },
  { id: 'setlists', label: 'Setlists' },
  { id: 'venues', label: 'Venues' },
  { id: 'show', label: 'Create Show' },
  { id: 'stageplot', label: 'Stage Plot' }
] as const;

export function App() {
  const [route, setRoute] = useState<string>('songs');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 border-b" style={{ borderColor: 'var(--line)' }}>
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl" style={{ fontFamily: 'Shrikhand, cursive', color: 'var(--orange)' }}>
            BND
          </h1>
          <nav className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setRoute(t.id)}
                className={`retro-tab ${route === t.id ? 'retro-tab--active' : ''}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="retro-card p-6">
          {route === 'songs' && <Songs />}
          {route === 'setlists' && <Setlists />}
          {route === 'venues' && <Venues />}
          {route === 'show' && <CreateShow />}
          {route === 'stageplot' && <StagePlotPage />}
        </div>
      </main>
    </div>
  );
}
