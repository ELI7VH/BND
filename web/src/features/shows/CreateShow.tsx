import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api } from "../../lib/api";

type Show = {
  _id?: string;
  name: string;
  date?: string;
  venueId?: string;
  setlistIds?: string[];
};

type Venue = {
  _id: string;
  name: string;
  stageWidth?: number;
  stageHeight?: number;
};

type StageNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  color?: string;
};

type StagePlot = { contextId: string; nodes: StageNode[] };

type StagePlotSummary = { contextId: string; name?: string };

type Setlist = { _id: string; name: string };

const FEET_TO_PX = 12;

export function CreateShow() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [venueId, setVenueId] = useState("");
  const [stageContextId, setStageContextId] = useState("demo-context");
  const [selectedSetlists, setSelectedSetlists] = useState<string[]>([]);

  const venuesQuery = useQuery<Venue[]>({
    queryKey: ["venues"],
    queryFn: () => api("/api/venues"),
  });
  const setlistsQuery = useQuery<Setlist[]>({
    queryKey: ["setlists"],
    queryFn: () => api("/api/setlists"),
  });
  const plotsQuery = useQuery<StagePlotSummary[]>({
    queryKey: ["stageplots"],
    queryFn: () => api("/api/stageplots"),
  });
  const stagePlotQuery = useQuery<StagePlot>({
    queryKey: ["stageplot", stageContextId],
    queryFn: () => api(`/api/stageplots/${stageContextId}`),
  });

  const create = useMutation({
    mutationFn: (payload: Partial<Show>) =>
      api<Show>("/api/shows", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

  const currentVenue = useMemo(
    () => venuesQuery.data?.find((v) => v._id === venueId),
    [venuesQuery.data, venueId]
  );
  const stageWidthPx = Math.max(
    120,
    (currentVenue?.stageWidth || 0) * FEET_TO_PX || 300
  );
  const stageHeightPx = Math.max(
    80,
    (currentVenue?.stageHeight || 0) * FEET_TO_PX || 180
  );

  // Compute scale to fit nodes within stage box while preserving aspect ratio
  const nodes = stagePlotQuery.data?.nodes || [];
  const maxX = nodes.reduce((m, n) => Math.max(m, n.x), 0) || 1;
  const maxY = nodes.reduce((m, n) => Math.max(m, n.y), 0) || 1;
  const scale = Math.min(stageWidthPx / maxX, stageHeightPx / maxY);

  function toggleSetlist(id: string) {
    setSelectedSetlists((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Create Show</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          create.mutate({ name, date, venueId, setlistIds: selectedSetlists });
          setName("");
          setDate("");
          setVenueId("");
          setSelectedSetlists([]);
        }}
        className="grid sm:grid-cols-2 gap-3 max-w-2xl mb-6"
      >
        <input
          className="rounded-md border px-3 py-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded-md border px-3 py-2"
          placeholder="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select
          className="rounded-md border px-3 py-2"
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
        >
          <option value="">Select venue…</option>
          {venuesQuery.data?.map((v) => (
            <option key={v._id} value={v._id}>
              {v.name}
            </option>
          ))}
        </select>

        {/* Multi-checkbox setlists with separate order list */}
        <div
          className="rounded-md border p-2"
          style={{ borderColor: "var(--line)", background: "#fff" }}
        >
          <div className="text-sm font-medium mb-1">Setlists</div>
          <div className="grid grid-cols-1 gap-1 max-h-40 overflow-auto">
            {setlistsQuery.data?.map((s) => {
              const selected = selectedSetlists.includes(s._id);
              return (
                <label
                  key={s._id}
                  className="inline-flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    className="rounded border"
                    checked={selected}
                    onChange={() => toggleSetlist(s._id)}
                  />
                  <span>{s.name}</span>
                </label>
              );
            })}
          </div>
          <div className="mt-2">
            <div className="text-xs font-medium mb-1 opacity-70">
              Selected order
            </div>
            <ol className="list-decimal ml-5 text-sm">
              {selectedSetlists.map((id) => {
                const name =
                  setlistsQuery.data?.find((s) => s._id === id)?.name || id;
                return <li key={id}>{name}</li>;
              })}
            </ol>
          </div>
        </div>

        <select
          className="rounded-md border px-3 py-2"
          value={stageContextId}
          onChange={(e) => setStageContextId(e.target.value)}
        >
          <option value="">Select stage plot…</option>
          {plotsQuery.data?.map((p) => (
            <option key={p.contextId} value={p.contextId}>
              {p.name || p.contextId}
            </option>
          ))}
        </select>

        <div className="sm:col-span-2">
          <button type="submit" className="retro-button">
            Create
          </button>
        </div>
      </form>

      <div className="mb-2 text-sm opacity-70">Venue Stage Preview</div>
      <div
        className="relative rounded-md border"
        style={{
          width: stageWidthPx * 2,
          height: stageHeightPx * 2,
          background: "#fff",
          borderColor: "var(--line)",
        }}
      >
        {nodes.map((n) => {
          const left = Math.round(n.x * scale);
          const top = Math.round(n.y * scale);
          return (
            <div
              key={n.id}
              className="absolute px-2 py-1 rounded-md"
              style={{
                left,
                top,
                color: "#fff",
                background: n.color || "#eee",
                border: "1px solid rgba(0,0,0,0.2)",
              }}
            >
              {n.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
