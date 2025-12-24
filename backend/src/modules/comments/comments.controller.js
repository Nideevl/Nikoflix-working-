import * as commentService from "./comments.services.js";

const requireUser = (req, res) => {
  if (req.identity.type !== "user") {
    res.status(403).json({ error: "Only users can comment" });
    return false;
  }
  return true;
};

export const createMovieComment = async (req, res) => {
  if (!requireUser(req, res)) return;

  const { movieId } = req.params;
  const { comment } = req.body;
  const userId = req.identity.user_id;

  const data = await commentService.createMovieComment(
    userId,
    movieId,
    comment
  );

  res.status(201).json(data);
};

export const createEpisodeComment = async (req, res) => {
  if (!requireUser(req, res)) return;

  const { episodeId } = req.params;
  const { comment } = req.body;
  const userId = req.identity.user_id;

  const data = await commentService.createEpisodeComment(
    userId,
    episodeId,
    comment
  );

  res.status(201).json(data);
};

export const getCommentsByMovie = async (req, res) => {
  const { movieId } = req.params;
  const comments = await commentService.getCommentsByMovie(movieId);
  res.json(comments);
};

export const getCommentsByEpisode = async (req, res) => {
  const { episodeId } = req.params;
  const comments = await commentService.getCommentsByEpisode(episodeId);
  res.json(comments);
};

export const deleteComment = async (req, res) => {
  if (req.identity.type !== "user") {
    return res.status(403).json({
      error: "Only users can delete comments"
    });
  }

  const { commentId } = req.params;
  const userId = req.identity.user_id;

  const deletedCount = await commentService.deleteComment(
    commentId,
    userId
  );

  if (deletedCount === 0) {
    return res.status(403).json({
      error: "You are not allowed to delete this comment"
    });
  }

  res.status(204).send();
};

