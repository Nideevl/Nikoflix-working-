import { useEffect } from "react";

export default function useSocial(movie_id?: string) {
  useEffect(() => {
    if (!movie_id) return;

    const titleEl = document.getElementById("movieTitle") as HTMLDivElement;
    const likeBtn = document.getElementById("likeBtn") as HTMLButtonElement;
    const likeCount = document.getElementById("likeCount") as HTMLSpanElement;
    const commentBtn = document.getElementById("commentBtn") as HTMLButtonElement;
    const commentCount = document.getElementById("commentCount") as HTMLSpanElement;
    const commentsPanel = document.getElementById("commentsPanel") as HTMLDivElement;
    const closeComments = document.getElementById("closeComments") as HTMLButtonElement;
    const commentsList = document.getElementById("commentsList") as HTMLDivElement;

    commentsPanel.style.display = "none";

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
        likeCount.textContent = String(movieLikeCount);
      }

      if (commentsRes.ok) {
        const comments = await commentsRes.json();
        commentCount.textContent = String(comments.length);
      }
    }

    likeBtn.onclick = async () => {
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
    };

    async function loadComments() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/comments/movie/${movie_id}`,
        { credentials: "include" }
      );
      if (!res.ok) return;

      const comments = await res.json();
      commentsList.innerHTML = "";

      comments.forEach((c: any) => {
        const div = document.createElement("div");
        div.textContent = `${c.username ?? "Guest"}: ${c.comment}`;
        commentsList.appendChild(div);
      });
    }

    commentBtn.onclick = () => {
      commentsPanel.style.display = "block";
      loadComments();
    };

    closeComments.onclick = () => {
      commentsPanel.style.display = "none";
    };

    loadMovieMeta();
    loadInitialCounts();
  }, [movie_id]);
}
