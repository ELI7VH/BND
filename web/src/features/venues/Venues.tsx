import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { api } from '../../lib/api';

type Venue = {
  _id?: string;
  name: string;
  address?: string;
  contacts?: string[];
  stageDimensions?: string;
  stageWidth?: number; // feet
  stageHeight?: number; // feet
  electrical?: string;
  lighting?: string;
  audio?: string;
  hours?: string;
};

const FEET_TO_PX = 12; // visual scale only

export function Venues() {
  const qc = useQueryClient();
  const { data } = useQuery<Venue[]>({ queryKey: ['venues'], queryFn: () => api('/api/venues') });
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [stageDimensions, setStageDimensions] = useState('');
  const [stageWidth, setStageWidth] = useState('');
  const [stageHeight, setStageHeight] = useState('');
  const [electrical, setElectrical] = useState('');
  const [lighting, setLighting] = useState('');
  const [audio, setAudio] = useState('');
  const [hours, setHours] = useState('');

  // Drag-to-adjust state
  const dragRef = useRef<{ kind: 'w' | 'h'; startY: number; startVal: number } | null>(null);
  const PX_PER_FOOT = 5; // drag sensitivity

  function onDragStart(kind: 'w' | 'h', e: React.MouseEvent<HTMLSpanElement>) {
    e.preventDefault();
    const val = kind === 'w' ? Number(stageWidth) || 0 : Number(stageHeight) || 0;
    dragRef.current = { kind, startY: e.clientY, startVal: val };
    window.addEventListener('mousemove', onDragging);
    window.addEventListener('mouseup', onDragEnd, { once: true });
  }
  function onDragging(e: MouseEvent) {
    if (!dragRef.current) return;
    const { kind, startY, startVal } = dragRef.current;
    const deltaY = startY - e.clientY; // dragging up increases value
    const deltaFeet = Math.round(deltaY / PX_PER_FOOT);
    const next = Math.max(0, startVal + deltaFeet);
    if (kind === 'w') setStageWidth(String(next));
    else setStageHeight(String(next));
  }
  function onDragEnd() {
    window.removeEventListener('mousemove', onDragging);
    dragRef.current = null;
  }

  const create = useMutation({
    mutationFn: (payload: Partial<Venue>) => api<Venue>('/api/venues', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      setName('');
      setAddress('');
      setStageDimensions('');
      setStageWidth('');
      setStageHeight('');
      setElectrical('');
      setLighting('');
      setAudio('');
      setHours('');
      qc.invalidateQueries({ queryKey: ['venues'] });
    }
  });

  const stageWidthPx = Math.max(120, (Number(stageWidth) || 0) * FEET_TO_PX);
  const stageHeightPx = Math.max(80, (Number(stageHeight) || 0) * FEET_TO_PX);
  const stagePreviewStyle = {
    width: stageWidthPx,
    height: stageHeightPx,
    border: '2px dashed var(--line)',
    background: '#fff'
  } as const;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink)' }}>Venues</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          create.mutate({
            name,
            address: address || undefined,
            stageDimensions: stageDimensions || undefined,
            stageWidth: stageWidth ? Number(stageWidth) : undefined,
            stageHeight: stageHeight ? Number(stageHeight) : undefined,
            electrical,
            lighting,
            audio,
            hours
          });
        }}
        className="grid gap-3 mb-6 md:grid-cols-2"
      >
        <input className="rounded-md border px-3 py-2" style={{ borderColor: 'var(--line)', background: '#fff' }} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="rounded-md border px-3 py-2" style={{ borderColor: 'var(--line)', background: '#fff' }} placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <input className="rounded-md border px-3 py-2" style={{ borderColor: 'var(--line)', background: '#fff' }} placeholder="Stage Dimensions (text)" value={stageDimensions} onChange={(e) => setStageDimensions(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className="rounded-md border px-3 py-2" style={{ borderColor: 'var(--line)', background: '#fff' }} placeholder="Stage Width (ft)" value={stageWidth} onChange={(e) => setStageWidth(e.target.value)} />
          <input className="rounded-md border px-3 py-2" style={{ borderColor: 'var(--line)', background: '#fff' }} placeholder="Stage Depth (ft)" value={stageHeight} onChange={(e) => setStageHeight(e.target.value)} />
        </div>
        <input className="rounded-md border px-3 py-2" style={{ borderColor: 'var(--line)', background: '#fff' }} placeholder="Electrical" value={electrical} onChange={(e) => setElectrical(e.target.value)} />
        <input className="rounded-md border px-3 py-2" style={{ borderColor: 'var(--line)', background: '#fff' }} placeholder="Lighting" value={lighting} onChange={(e) => setLighting(e.target.value)} />
        <input className="rounded-md border px-3 py-2" style={{ borderColor: 'var(--line)', background: '#fff' }} placeholder="Audio" value={audio} onChange={(e) => setAudio(e.target.value)} />
        <input className="rounded-md border px-3 py-2 md:col-span-2" style={{ borderColor: 'var(--line)', background: '#fff' }} placeholder="Hours" value={hours} onChange={(e) => setHours(e.target.value)} />

        <div className="md:col-span-2">
          <div className="text-sm opacity-70 mb-2">Stage Preview</div>
          <div className="rounded-md relative select-none" style={stagePreviewStyle} />
          <div className="mt-2 flex gap-2 text-sm select-none">
            <span
              className="rounded border px-2 py-1 cursor-ns-resize"
              style={{ borderColor: 'var(--line)', background: '#fff' }}
              onMouseDown={(e) => onDragStart('w', e)}
              title="Drag up/down to adjust width"
            >
              Width: {Number(stageWidth) || 0} ft
            </span>
            <span
              className="rounded border px-2 py-1 cursor-ns-resize"
              style={{ borderColor: 'var(--line)', background: '#fff' }}
              onMouseDown={(e) => onDragStart('h', e)}
              title="Drag up/down to adjust depth"
            >
              Depth: {Number(stageHeight) || 0} ft
            </span>
          </div>
        </div>

        <div className="md:col-span-2">
          <button type="submit" className="retro-button">Add Venue</button>
        </div>
      </form>

      <ul className="grid sm:grid-cols-2 gap-3">
        {data?.map((v) => (
          <li key={v._id} className="rounded-md border px-3 py-2" style={{ borderColor: 'var(--line)', background: '#fff' }}>
            <div className="font-medium">{v.name}</div>
            {[v.address, v.stageDimensions, (v.stageWidth && v.stageHeight) ? `Stage: ${v.stageWidth}x${v.stageHeight} ft` : undefined, v.electrical, v.lighting, v.audio, v.hours]
              .filter(Boolean)
              .map((line, idx) => (
                <div key={idx} className="text-sm opacity-70">{line}</div>
              ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
