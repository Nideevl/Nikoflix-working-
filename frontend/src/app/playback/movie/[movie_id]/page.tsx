"use client";

import { useParams, useSearchParams } from "next/navigation";
import PlayerUI from "@/components/player/PlayerUI";
import usePlayer from "@/components/player/usePlayer";
import useSocial from "@/components/player/useSocial";

export default function Page() {
  const { movie_id } = useParams<{ movie_id: string }>();
  const searchParams = useSearchParams();

  const src = searchParams.get("src");

  usePlayer(src || undefined);      // 👈 PASS FULL SIGNED URL
  useSocial(movie_id);

  return <PlayerUI movie_id={movie_id} />;
}
