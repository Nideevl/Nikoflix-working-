import { useEffect } from "react";

export default function useSocial(movie_id?: string) {
  useEffect(() => {
    if (!movie_id) return;

    const layout = document.getElementById("playerLayout") as HTMLDivElement;
    const likeBtn = document.getElementById("likeBtn") as HTMLButtonElement;
    const titleEl = document.getElementById("movieTitle") as HTMLDivElement;
    const likeIcon = document.getElementById("likeIcon") as HTMLSpanElement;
    const likeCount = document.getElementById("likeCount") as HTMLSpanElement;
    const commentBtn = document.getElementById("commentBtn") as HTMLButtonElement;
    const commentIcon = document.getElementById("commentIcon") as HTMLSpanElement;
    const commentCount = document.getElementById("commentCount") as HTMLSpanElement;
    const commentsPanel = document.getElementById("commentsPanel") as HTMLDivElement;
    const closeComments = document.getElementById("closeComments") as HTMLButtonElement;
    const commentsList = document.getElementById("commentsList") as HTMLDivElement;

    commentsPanel.style.display = "none";

    let movieLikeCount = 0;
    let hasLikedMovie = false;
    let commentsOpen = false;

    async function loadMovieMeta() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/movies/${movie_id}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const movie = await res.json();
      titleEl.textContent = movie.title;
    }

    function updateCommentIcon() {
      if (!commentIcon) return;

      commentIcon.innerHTML = "";

      const img = document.createElement("img");
      img.width = 23;
      img.height = 23;
      img.src = commentsOpen
        ? "/icons/commentsOn.ico"
        : "/icons/commentsOff.ico";

      commentIcon.appendChild(img);
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

      updateLikeIcon(); // 🔥 toggle icon
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

    commentBtn.onclick = (e) => {
      e.stopPropagation();
      commentsOpen = !commentsOpen;

      if (commentsOpen) {
        layout.classList.add("chatOpen");
        commentsPanel.style.display = "block";
        loadComments();
      } else {
        layout.classList.remove("chatOpen");
        commentsPanel.style.display = "none";
      }

      updateCommentIcon();
    };

    closeComments.onclick = (e) => {
      e.stopPropagation();
      commentsOpen = false;
      layout.classList.remove("chatOpen");
      commentsPanel.style.display = "none";
      updateCommentIcon();
    };


    loadMovieMeta();
    loadInitialCounts();
    updateCommentIcon();
  }, [movie_id]);
}
