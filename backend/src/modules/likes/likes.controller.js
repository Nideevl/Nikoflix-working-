import * as likeService from "./likes.services.js";

export const like = async (req, res) => {
  const { movieId, episodeId } = req.body;

  const userId =
    req.identity.type === "user" ? req.identity.user_id : null;
  const guestId =
    req.identity.type === "guest" ? req.identity.guest_id : null;

  await likeService.likeContent(
    userId,
    guestId,
    movieId,
    episodeId
  );

  res.json({ success: true });
};

export const unlike = async (req, res) => {
  const { movieId, episodeId } = req.body;

  const userId =
    req.identity.type === "user" ? req.identity.user_id : null;
  const guestId =
    req.identity.type === "guest" ? req.identity.guest_id : null;

  await likeService.unlikeContent(
    userId,
    guestId,
    movieId,
    episodeId
  );

  res.json({ success: true });
};

export const getMovieLikes = async (req, res) => {
  const { movieId } = req.params;

  const userId =
    req.identity.type === "user"
      ? req.identity.user_id
      : null;

  const guestId =
    req.identity.type === "guest"
      ? req.identity.guest_id
      : null;

  const data = await likeService.getMovieLikeInfo(
    movieId,
    userId,
    guestId
  );

  res.json(data);
};

export const getEpisodeLikes = async (req, res) => {
  const { episodeId } = req.params;

  const userId =
    req.identity.type === "user"
      ? req.identity.user_id
      : null;

  const guestId =
    req.identity.type === "guest"
      ? req.identity.guest_id
      : null;

  const data = await likeService.getEpisodeLikeInfo(
    episodeId,
    userId,
    guestId
  );

  res.json(data);
};