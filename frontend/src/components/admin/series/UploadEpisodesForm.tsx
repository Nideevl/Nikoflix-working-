"use client";

import { useState } from "react";
import SeriesSearch from "./SeriesSearch";

type EpisodeInput = {
  episode_number: number;
  title: string;
  duration?: number;
  source_url: string;
};

export default function UploadEpisodesForm() {
  const [series, setSeries] = useState<any>(null);
  const [existingEpisodes, setExistingEpisodes] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<EpisodeInput[]>([
    { episode_number: 1, title: "", source_url: "" },
  ]);

  const fetchEpisodes = async (contentId: string) => {
    const token = localStorage.getItem("admin_token");

    const res = await fetch(`NEXT_PUBLIC_API_BASE/admin/episodes/${contentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setExistingEpisodes(data);
  };

  const handleSeriesSelect = (s: any) => {
    setSeries(s);
    fetchEpisodes(s.content_id);
  };

const updateEpisode = <K extends keyof EpisodeInput>(
  index: number,
  field: K,
  value: EpisodeInput[K]
) => {
  const updated = [...episodes];
  updated[index][field] = value;
  setEpisodes(updated);
};

  const addEpisode = () => {
    setEpisodes([
      ...episodes,
      { episode_number: episodes.length + 1, title: "", source_url: "" },
    ]);
  };

  const removeEpisode = (index: number) => {
    setEpisodes(episodes.filter((_, i) => i !== index));
  };

  const submit = async () => {
    if (!series) return alert("Select a series first");

    const token = localStorage.getItem("admin_token");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/episodes/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content_id: series.content_id,
        episodes,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Episodes uploaded successfully 🎬");
      fetchEpisodes(series.content_id);
    } else {
      alert(data.error);
    }
  };

  return (
    <div>
      <h2>🎬 Upload Episodes in Existing Series</h2>

      <SeriesSearch onSelect={handleSeriesSelect} />

      {series && (
        <>
          <h3>Selected Series: {series.title}</h3>

          <h4>Existing Episodes</h4>
          {existingEpisodes.map(ep => (
            <div key={ep.episode_id}>
              Ep {ep.episode_number} — {ep.title || "(no title)"} — {ep.duration || "?"} min
            </div>
          ))}

          <h4>Add New Episodes</h4>

          {episodes.map((ep, index) => (
            <div key={index} style={{ border: "1px solid #444", padding: 10, marginBottom: 8 }}>
              <input
                type="number"
                placeholder="Episode No."
                value={ep.episode_number}
                onChange={(e) => updateEpisode(index, "episode_number", Number(e.target.value))}
              />

              <input
                placeholder="Title (optional)"
                value={ep.title}
                onChange={(e) => updateEpisode(index, "title", e.target.value)}
              />

              <input
                type="number"
                placeholder="Duration (min)"
                onChange={(e) => updateEpisode(index, "duration", Number(e.target.value))}
              />

              <input
                placeholder="Source URL"
                value={ep.source_url}
                onChange={(e) => updateEpisode(index, "source_url", e.target.value)}
              />

              {episodes.length > 1 && (
                <button onClick={() => removeEpisode(index)}>❌ Remove</button>
              )}
            </div>
          ))}

          <button onClick={addEpisode}>➕ Add one more episode</button>
          <button onClick={submit}>🚀 Upload Episodes</button>
        </>
      )}
    </div>
  );
}
