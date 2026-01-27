"use client";

import { useState } from "react";
import styles from "./comments.module.css";
import { useAuth } from "../auth/useAuth";
import { timeAgo } from "@/lib/timeAgo";

export default function ReplyItem({ reply, parentUsername, movieId }: any) {
    const { isUser } = useAuth();

    const [liked, setLiked] = useState(reply.liked);
    const [likes, setLikes] = useState<number>(reply.like_count);
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");

    const [showReplies, setShowReplies] = useState(false);
    const [childReplies, setChildReplies] = useState<any[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(false);

    async function toggleLike() {
        const token = localStorage.getItem("token");
        if (!token) return;

        const url = liked
            ? `/comments/${reply.comment_id}/unlike`
            : `/comments/${reply.comment_id}/like`;

        await fetch(`${process.env.NEXT_PUBLIC_API_BASE}${url}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
        });

        setLiked(!liked);
        setLikes(prev => (liked ? prev - 1 : prev + 1));
    }

    async function postReply() {
        const token = localStorage.getItem("token");
        if (!replyText.trim() || !token) return;

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
                    parentCommentId: reply.comment_id,
                }),
            }
        );

        const newReply = await res.json();

        setChildReplies(prev => [
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
    }

    async function toggleReplies() {
        if (showReplies) {
            setShowReplies(false);
            return;
        }

        setLoadingReplies(true);

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/comments/${reply.comment_id}/replies`,
            { credentials: "include" }
        );

        const data = await res.json();
        setChildReplies(data);
        setShowReplies(true);
        setLoadingReplies(false);
    }

    return (
        <div className={styles.reply}>
            <div className={styles.comment}>
                <div className={styles.username}>
                    <div className={styles.avatarSmall}>
                        {reply.username?.[0] || "U"}
                    </div>
                </div>

                <div className={styles.blockInfo}>
                    <div className={styles.length} style={{ width: "18.5vw" }}>
                        <div className={styles.info}><strong>{reply.username || "anon"} @{parentUsername || "anon"}</strong>{reply.comment} </div>
                        <button className={styles.commentLike} onClick={toggleLike}>{liked ? "❤️" : "🤍"} {likes}</button>
                    </div>

                    <div className={styles.actions}>
                        {isUser && (
                            <>
                                <div className={styles.meta}>
                                    <span>{timeAgo(reply.created_at)}</span>
                                </div>

                                <button onClick={() => setReplying(!replying)}>
                                    Reply
                                </button>
                            </>
                        )}

                        {reply.reply_count > 0 && (
                            <button onClick={toggleReplies} className={styles.viewReplies}>
                                {showReplies
                                    ? "Hide replies"
                                    : `─── \u00A0\u00A0 View replies (${reply.reply_count})`}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {replying && (
                <div className={styles.replyBox}>
                    <div className={styles.replyAvatar}>
                        {(reply.username?.[0] || "U").toUpperCase()}
                    </div>

                    <input
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder={`Reply to @${reply.username || "anon"}`}
                        className={styles.replyInputField}
                        autoFocus
                    />

                    <button
                        className={styles.replySendBtn}
                        onClick={postReply}
                        disabled={!replyText.trim()}
                    >
                        ➤
                    </button>
                </div>
            )}


            {loadingReplies && <div className={styles.loading}>Loading...</div>}

            {showReplies && (
                <div className={styles.nestedReplies}>
                    {childReplies.map((r: any) => (
                        <ReplyItem
                            key={r.comment_id}
                            reply={r}
                            parentUsername={reply.username}
                            movieId={movieId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
