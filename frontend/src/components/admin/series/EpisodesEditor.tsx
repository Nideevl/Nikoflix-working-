"use client";

import { useEffect, useState } from "react";

type Episode = {
  episode_id?: string;
  episode_number: number | "";
  title?: string;
  duration?: number;
  source_url?: string;
};

export default function EpisodesEditor({ contentId }: { contentId: string }) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [newEpisodes, setNewEpisodes] = useState<Episode[]>([
    { episode_number: "", title: "", source_url: "" },
  ]);

  const [baseSourceUrl, setBaseSourceUrl] = useState("");

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/episodes/${contentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setEpisodes(data || []);
      });
  }, [contentId]);

  // ---------- HELPERS ----------

  const cleanBaseUrl = (url: string) => url.trim().replace(/\/$/, "");

  const generateUrl = (num: number | "") => {
    if (!baseSourceUrl || num === "") return "";
    return `${cleanBaseUrl(baseSourceUrl)}/ep${num}`;
  };

  const isEpisodeNumberTaken = (value: number | "", index?: number, isNew?: boolean) => {
    const all = [
      ...episodes.map((e, i) => ({ num: e.episode_number, i, type: "existing" })),
      ...newEpisodes.map((e, i) => ({ num: e.episode_number, i, type: "new" })),
    ];

    return all.some((e) => {
      if (e.num === "") return false;

      if (isNew && e.type === "new" && e.i === index) return false;
      if (!isNew && e.type === "existing" && e.i === index) return false;

      return Number(e.num) === Number(value);
    });
  };

  const applyBaseSourceUrl = (base: string) => {
    const cleaned = cleanBaseUrl(base);

    setEpisodes((prev) =>
      prev.map((ep) => ({
        ...ep,
        source_url: ep.episode_number !== "" ? `${cleaned}/ep${ep.episode_number}` : "",
      }))
    );

    setNewEpisodes((prev) =>
      prev.map((ep) => ({
        ...ep,
        source_url: ep.episode_number !== "" ? `${cleaned}/ep${ep.episode_number}` : "",
      }))
    );
  };

  // ---------- UPDATE EXISTING ----------

  const updateExisting = (index: number, key: keyof Episode, value: any) => {
    const updated = [...episodes];
    updated[index] = { ...updated[index], [key]: value };
    setEpisodes(updated);
  };

  const handleExistingEpisodeNumberChange = (index: number, val: string) => {
    const num = val === "" ? "" : Number(val);

    if (isEpisodeNumberTaken(num, index, false)) {
      alert("❌ Episode number already exists!");
      return;
    }

    const updated = [...episodes];
    updated[index] = {
      ...updated[index],
      episode_number: num,
      source_url: generateUrl(num),
    };

    setEpisodes(updated);
  };

  const saveExistingEpisodes = async () => {
    const normalized = episodes.map((ep) => ({
      ...ep,
      episode_number: Number(ep.episode_number),
    }));

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/episodes/update-bulk`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ episodes: normalized }),
    });

    if (res.ok) alert("Episodes updated ✅");
    else alert("Error updating episodes");
  };

  // ---------- NEW EPISODES ----------

  const updateNew = (index: number, key: keyof Episode, value: any) => {
    const updated = [...newEpisodes];
    updated[index] = { ...updated[index], [key]: value };
    setNewEpisodes(updated);
  };

  const handleNewEpisodeNumberChange = (index: number, val: string) => {
    const num = val === "" ? "" : Number(val);

    if (isEpisodeNumberTaken(num, index, true)) {
      alert("❌ Episode number already exists!");
      return;
    }

    const updated = [...newEpisodes];
    updated[index] = {
      ...updated[index],
      episode_number: num,
      source_url: generateUrl(num),
    };

    setNewEpisodes(updated);
  };

  const addNewEpisode = () => {
    setNewEpisodes([...newEpisodes, { episode_number: "", title: "", source_url: "" }]);
  };

  const insertEpisodes = async () => {
    const normalized = newEpisodes.map((ep) => ({
      ...ep,
      episode_number: Number(ep.episode_number),
    }));

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/episodes/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content_id: contentId, episodes: normalized }),
    });

    if (res.ok) alert("New episodes added 🎬");
    else alert("Error adding episodes");
  };

  // ---------- UI ----------

  return (
    <div>
      <h3>🌐 Global Source URL</h3>

      <input
        placeholder="https://www.tp.com"
        value={baseSourceUrl}
        onChange={(e) => {
          const value = e.target.value;
          setBaseSourceUrl(value);
          applyBaseSourceUrl(value);
        }}
        style={{ width: 400, marginBottom: 10 }}
      />

      <p style={{ fontSize: 12, color: "#888" }}>
        Example: {baseSourceUrl && cleanBaseUrl(baseSourceUrl) + "/ep1"}
      </p>

      <h3>🎬 Existing Episodes</h3>

      {episodes.map((ep, index) => (
        <div key={ep.episode_id} style={{ border: "1px solid #444", padding: 8, marginBottom: 6 }}>
          <input
            type="number"
            value={ep.episode_number}
            onChange={(e) => handleExistingEpisodeNumberChange(index, e.target.value)}
          />

          <input
            placeholder="Title"
            value={ep.title || ""}
            onChange={(e) => updateExisting(index, "title", e.target.value)}
          />

          <input
            type="number"
            placeholder="Duration"
            value={ep.duration || ""}
            onChange={(e) => updateExisting(index, "duration", Number(e.target.value))}
          />

          <input
            value={ep.source_url || ""}
            disabled
          />
        </div>
      ))}

      <button onClick={saveExistingEpisodes}>💾 Update Existing Episodes</button>

      <h3>➕ Insert New Episodes</h3>

      {newEpisodes.map((ep, index) => (
        <div key={index} style={{ border: "1px solid #444", padding: 8, marginBottom: 6 }}>
          <input
            type="number"
            value={ep.episode_number}
            onChange={(e) => handleNewEpisodeNumberChange(index, e.target.value)}
          />

          <input
            placeholder="Title"
            value={ep.title || ""}
            onChange={(e) => updateNew(index, "title", e.target.value)}
          />

          <input
            value={ep.source_url || ""}
            disabled
          />
        </div>
      ))}

      <button onClick={addNewEpisode}>➕ Add Episode</button>
      <button onClick={insertEpisodes}>🚀 Insert Episodes</button>
    </div>
  );
}
