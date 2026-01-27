// comments.controller.js

import * as commentService from "./comments.services.js";

const requireUser = (req, res) => {
  if (req.identity.type !== "user") {
    res.status(403).json({
      error: "Guests cannot interact with comments"
    });
    return false;
  }
  return true;
};

// CREATE MOVIE COMMENT
export const createMovieComment = async (req, res) => {
  if (!requireUser(req, res)) return;

  const { movieId } = req.params;
  const { comment, parentCommentId } = req.body;
  const userId = req.identity.user_id;

  const data = await commentService.createMovieComment(
    userId,
    movieId,
    comment,
    parentCommentId
  );

  res.status(201).json(data);
};

// CREATE EPISODE COMMENT
export const createEpisodeComment = async (req, res) => {
  if (!requireUser(req, res)) return;

  const { episodeId } = req.params;
  const { comment, parentCommentId } = req.body;
  const userId = req.identity.user_id;

  const data = await commentService.createEpisodeComment(
    userId,
    episodeId,
    comment,
    parentCommentId
  );

  res.status(201).json(data);
};

// READ (USERS + GUESTS)
export const getCommentsByMovie = async (req, res) => {
  const { movieId } = req.params;

  const userId =
    req.identity.type === "user"
      ? req.identity.user_id
      : null;

  const comments = await commentService.getCommentsByMovie(
    movieId,
    userId
  );

  res.json(comments);
};

export const getCommentsByEpisode = async (req, res) => {
  const { episodeId } = req.params;

  const userId =
    req.identity.type === "user"
      ? req.identity.user_id
      : null;

  const comments = await commentService.getCommentsByEpisode(
    episodeId,
    userId
  );

  res.json(comments);
};

// DELETE COMMENT (OWNER ONLY)
export const deleteComment = async (req, res) => {
  if (!requireUser(req, res)) return;

  const { commentId } = req.params;
  const userId = req.identity.user_id;

  const deleted = await commentService.deleteComment(commentId, userId);

  if (!deleted) {
    return res.status(403).json({
      error: "You are not allowed to delete this comment"
    });
  }

  res.status(204).send();
};

export const likeComment = async (req, res) => {
  if (req.identity.type !== "user") {
    return res.status(403).json({
      error: "Guests cannot like comments"
    });
  }

  const { commentId } = req.params;
  const userId = req.identity.user_id;

  await commentService.likeComment(commentId, userId);
  res.json({ success: true });
};

export const unlikeComment = async (req, res) => {
  if (req.identity.type !== "user") {
    return res.status(403).json({
      error: "Guests cannot like comments"
    });
  }

  const { commentId } = req.params;
  const userId = req.identity.user_id;

  await commentService.unlikeComment(commentId, userId);
  res.json({ success: true });
};

export const getParentCommentsByMovie = async (req, res) => {
  const { movieId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const userId =
    req.identity.type === "user"
      ? req.identity.user_id
      : null;

  const comments = await commentService.getParentCommentsByMovie(
    movieId,
    userId,
    Number(limit),
    Number(offset)
  );

  res.json(comments);
};

export const getRepliesByComment = async (req, res) => {
  const { commentId } = req.params;

  const userId =
    req.identity.type === "user"
      ? req.identity.user_id
      : null;

  const replies = await commentService.getRepliesByComment(
    commentId,
    userId
  );

  res.json(replies);
};


