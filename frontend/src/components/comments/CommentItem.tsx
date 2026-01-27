"use client";

import { useState } from "react";
import ReplyItem from "./ReplyItem";
import styles from "./comments.module.css";
import { useAuth } from "../auth/useAuth";
import { timeAgo } from "@/lib/timeAgo";

export default function CommentItem({ comment, movieId }: any) {
    const { isUser } = useAuth();
    const [liked, setLiked] = useState(comment.liked);
    const [likes, setLikes] = useState<number>(comment.like_count);
    const [replies, setReplies] = useState<any[]>([]);
    const [showReplies, setShowReplies] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replying, setReplying] = useState(false);
    const [postingReply, setPostingReply] = useState(false);

    async function toggleLike() {
        const token = localStorage.getItem("token");
        if (!token) return;
        const url = liked
            ? `/comments/${comment.comment_id}/unlike`
            : `/comments/${comment.comment_id}/like`;

        await fetch(`${process.env.NEXT_PUBLIC_API_BASE}${url}`, {
            headers: { Authorization: `Bearer ${token}` },
            method: "POST",
            credentials: "include",
        });

        setLiked(!liked);
        setLikes(prev => (liked ? prev - 1 : prev + 1));
    }

    async function loadReplies() {
        if (showReplies) {
            setShowReplies(false);
            return;
        }

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/comments/${comment.comment_id}/replies`,
            { credentials: "include" }
        );

        const data = await res.json();
        setReplies(data);
        setShowReplies(true);
    }

    async function postReply() {
        const token = localStorage.getItem("token");
        if (!replyText.trim() || !token) return;

        setPostingReply(true);

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
                    body: JSON.stringify({
                        comment: replyText,
                        parentCommentId: comment.comment_id,
                    }),
                }
            );

            const newReply = await res.json();

            setReplies(prev => [
                ...prev,
                {
                    ...newReply,
                    username: "You",
                    like_count: 0,
                    liked: false,
                },
            ]);

            setReplyText("");
            setReplying(false);
            setShowReplies(true);
        } finally {
            setPostingReply(false);
        }
    }


    return (
        <div className={styles.commentBlock}>
            <div className={styles.comment}>
                <div className={styles.avatar}>
                    {comment.username?.[0] || "U"}
                </div>

                <div className={styles.blockInfo} >
                    <div className={styles.length} style={{ width: "21vw" }}>
                        <div className={styles.info}><strong >{comment.username || "anon"} </strong>{comment.comment} </div>
                        <button className={styles.commentLike} onClick={toggleLike}>{liked ? "❤️" : "🤍"} {likes}</button>
                    </div>
                    <div className={styles.actions}>
                        {isUser && (
                            <>
                                <div className={styles.meta}>
                                    <span>{timeAgo(comment.created_at)}</span>
                                </div>

                                <button onClick={() => {
                                    if (!isUser) {
                                        window.location.href = "/login";
                                        return;
                                    }
                                    setReplying(!replying);
                                }}>
                                    Reply
                                </button>
                            </>
                        )}

                        {comment.reply_count > 0 && (
                            <button onClick={loadReplies}>
                                {showReplies
                                    ? "Hide replies"
                                    : `─── \u00A0\u00A0View replies (${comment.reply_count})`}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Reply input */}
            {replying && (
                <div className={styles.replyBox}>
                    <div className={styles.replyAvatar}>
                        {(comment.username?.[0] || "U").toUpperCase()}
                    </div>

                    <input
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder={`Reply to @${comment.username || "anon"}`}
                        className={styles.replyInputField}
                        autoFocus
                    />

                    <button
                        className={styles.replySendBtn}
                        onClick={postReply}
                        disabled={postingReply || !replyText.trim()}
                    >
                        {postingReply ? <span className={styles.spinner}></span> : "➤"}
                    </button>

                </div>
            )}


            {/* Replies */}
            {showReplies && (
                <div className={styles.replies}>
                    {replies.map((r, index) => (
                        <ReplyItem
                            key={r.comment_id || `reply-${index}-${Date.now()}`}
                            reply={r}
                            parentUsername={comment.username}
                            movieId={movieId}
                        />
                    ))}

                </div>
            )}
        </div>
    );
}
