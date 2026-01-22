"use client";

import { useParams } from "next/navigation";
import PlayerUI from "@/components/player/PlayerUI";
import usePlayer from "@/components/player/usePlayer";
import useSocial from "@/components/player/useSocial";

export default function Page() {
  const { movie_id } = useParams<{ movie_id: string }>();

  usePlayer(movie_id);
  useSocial(movie_id);

  return <PlayerUI />;
}
