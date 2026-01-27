import { useEffect } from "react";

export default function useSocial(movie_id?: string) {
  useEffect(() => {
    if (!movie_id) return;

    const likeBtn = document.getElementById("likeBtn") as HTMLButtonElement;
    const titleEl = document.getElementById("movieTitle") as HTMLDivElement;
    const likeIcon = document.getElementById("likeIcon") as HTMLSpanElement;
    const likeCount = document.getElementById("likeCount") as HTMLSpanElement;
    const commentCount = document.getElementById("commentCount") as HTMLSpanElement;

    let movieLikeCount = 0;
    let hasLikedMovie = false;

    async function loadMovieMeta() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/movies/${movie_id}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const movie = await res.json();
      titleEl.textContent = movie.title;
    }

    function updateLikeIcon() {
      if (!likeIcon) return;

      likeIcon.innerHTML = "";

      const img = document.createElement("img");
      img.width = 23;
      img.height = 23;
      img.src = hasLikedMovie
        ? "/icons/liked.ico"
        : "/icons/notLiked.ico";

      likeIcon.appendChild(img);
    }

    async function loadInitialCounts() {
      const likesRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/likes/movie/${movie_id}`,
        { credentials: "include" }
      );
      const commentsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/comments/movie/${movie_id}`,
        { credentials: "include" }
      );

      if (likesRes.ok) {
        const data = await likesRes.json();
        movieLikeCount = data.count;
        hasLikedMovie = data.liked;
        updateLikeIcon();
        likeCount.textContent = String(movieLikeCount);
      }

      if (commentsRes.ok) {
        const comments = await commentsRes.json();
        commentCount.textContent = String(comments.length);
      }
    }

    likeBtn.onclick = async (e) => {
      e.stopPropagation();
      const url = hasLikedMovie ? "/likes/unlike" : "/likes/like";

      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}${url}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: movie_id }),
      });

      hasLikedMovie = !hasLikedMovie;
      movieLikeCount += hasLikedMovie ? 1 : -1;
      likeCount.textContent = String(movieLikeCount);

      updateLikeIcon(); 
    };

    loadMovieMeta();
    loadInitialCounts();
  }, [movie_id]);
}
