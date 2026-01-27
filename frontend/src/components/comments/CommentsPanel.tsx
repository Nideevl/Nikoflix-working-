"use client";

import { useEffect, useState } from "react";
import CommentItem from "./CommentItem";
import styles from "./comments.module.css";
import { useAuth } from "../auth/useAuth";
import { SendHorizontal } from "lucide-react";

export default function CommentsPanel({
    movieId,
    open,
    onClose,
}: {
    movieId?: string;
    open: boolean;
    onClose: () => void;
}) {
    const { isUser } = useAuth();
    const [comments, setComments] = useState<any[]>([]);
    const [text, setText] = useState("");
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (!open || !movieId) return;

        async function loadParentComments() {

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/comments/movie/${movieId}/parents`,
                { credentials: "include" }
            );

            const data = await res.json();
            setComments(data);
        }

        loadParentComments();
    }, [open, movieId]);

    async function postComment() {
        const token = localStorage.getItem("token");
        if (!text.trim() || !movieId || !token) return;

        setPosting(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/comments/movie/${movieId}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ comment: text }),
                }
            );

            const newComment = await res.json();

            setComments(prev => [
                {
                    ...newComment,
                    username: "You",
                    like_count: 0,
                    liked: false,
                    reply_count: 0,
                },
                ...prev,
            ]);

            setText("");
        } finally {
            setPosting(false);
        }
    }


    return (
        <div className={`${styles.panel} ${open ? styles.open : ""}`} data-player-ui>
            <div className={styles.header}>
                <span> <strong>Comments</strong></span>
                <button onClick={onClose}>✕</button>
            </div>

            <div className={styles.list}>
                {comments.map((c, index) => (
                    <CommentItem
                        key={c.comment_id || `comment-${index}-${Date.now()}`}
                        comment={c}
                        movieId={movieId}
                    />
                ))}

            </div>

            {isUser ? (
                <div className={styles.inputBox}>
                    <input
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Write a comment..."
                    />
                    <button
                        className={styles.commentSendBtn}
                        onClick={postComment}
                        disabled={posting || !text.trim()}
                    >
                        {posting ? (
                            <span className={styles.spinner}></span>
                        ) : (
                            <SendHorizontal size={20} fill="white" />
                        )}
                    </button>
                </div>
            ) : (
                <div className={styles.loginHint}>
                    <div className={styles.loginHintBox}>
                        <div>
                            <span>✨ Join the conversation</span>
                            <p>Log in to comment and reply</p>
                        </div>
                        <button className={styles.loginBtn} onClick={() => window.location.href = "/login"}>
                            Login
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
