import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type Node = { id: string; label: string; x: number; y: number; type?: string; color?: string };

type StagePlot = { contextId: string; nodes: Node[]; userId?: string; name?: string };

const contextId = 'demo-context';

function getContrastColor(bg?: string) {
  const hex = (bg || '#eeeeee').replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const r = parseInt(full.substring(0, 2), 16) || 0;
  const g = parseInt(full.substring(2, 4), 16) || 0;
  const b = parseInt(full.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? '#000000' : '#ffffff';
}

export function StagePlotPage() {
  const { data, refetch } = useQuery<StagePlot>({
    queryKey: ['stageplot', contextId],
    queryFn: () => api(`/api/stageplots/${contextId}`)
  });

  const [nodes, setNodes] = useState<Node[]>([]);
  const [plotName, setPlotName] = useState('');

  useEffect(() => {
    if (data) {
      setNodes(data.nodes || []);
      setPlotName(data.name || '');
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (payload: StagePlot) =>
      api<StagePlot>(`/api/stageplots/${contextId}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    onSuccess: () => refetch()
  });

  function addNode() {
    const newNode: Node = { id: Math.random().toString(36).slice(2), label: 'Node', x: 20, y: 20, color: '#222' };
    setNodes((prev) => [newNode, ...prev]);
  }

  function onDrag(index: number, dx: number, dy: number) {
    setNodes((prev) => {
      const n = [...prev];
      n[index] = { ...n[index], x: n[index].x + dx, y: n[index].y + dy };
      return n;
    });
  }

  function updateNode(id: string, patch: Partial<Node>) {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg font-semibold">Stage Plot</h2>
        <input className="rounded-md border px-2 py-1" style={{ borderColor: 'var(--line)', background: '#fff' }} placeholder="Plot name" value={plotName} onChange={(e) => setPlotName(e.target.value)} />
        <button onClick={addNode} className="retro-button">Add Node</button>
        <button onClick={() => save.mutate({ contextId, nodes, name: plotName })} disabled={save.isPending} className="retro-button" style={{ background: 'linear-gradient(180deg, #34d399, #10b981)' }}>Save</button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-3">
          <div className="w-full h-80 border border-white/10 rounded-md bg-slate-900/60 relative select-none overflow-hidden">
            {nodes.map((n, i) => (
              <Draggable key={n.id} x={n.x} y={n.y} onDrag={(dx, dy) => onDrag(i, dx, dy)}>
                <div
                  className="absolute px-2 py-1 rounded-md cursor-move"
                  style={{
                    background: n.color || '#eeeeee',
                    color: getContrastColor(n.color || '#eeeeee'),
                    border: '1px solid rgba(0,0,0,0.2)'
                  }}
                >
                  {n.label}
                </div>
              </Draggable>
            ))}
          </div>
        </div>

        <div className="col-span-1">
          <div className="rounded-md border p-3 h-80 overflow-auto" style={{ borderColor: 'var(--line)', background: '#fff' }}>
            <div className="font-medium mb-2">Active Nodes</div>
            <div className="grid gap-2">
              {nodes.map((n) => (
                <div key={n.id} className="grid md:grid-cols-3 gap-2 items-center">
                  <input
                    className="rounded-md border px-2 py-1"
                    style={{ borderColor: 'var(--line)' }}
                    value={n.label}
                    onChange={(e) => updateNode(n.id, { label: e.target.value })}
                  />
                  <input
                    type="color"
                    className="rounded-md border px-2 py-1"
                    style={{ borderColor: 'var(--line)' }}
                    value={n.color || '#222222'}
                    onChange={(e) => updateNode(n.id, { color: e.target.value })}
                  />
                  <div className="text-sm opacity-70">x:{Math.round(n.x)} y:{Math.round(n.y)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Draggable({ x, y, onDrag, children }: { x: number; y: number; onDrag: (dx: number, dy: number) => void; children: any }) {
  const [pos, setPos] = useState({ x, y });
  const [dragging, setDragging] = useState(false);

  useEffect(() => setPos({ x, y }), [x, y]);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging) return;
      const dx = e.movementX;
      const dy = e.movementY;
      onDrag(dx, dy);
      setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
    }
    function onMouseUp() {
      setDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, onDrag]);

  return (
    <div
      style={{ position: 'absolute', left: pos.x, top: pos.y }}
      onMouseDown={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
    >
      {children}
    </div>
  );
}
