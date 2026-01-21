import * as episodeService from "./episodes.services.js";

export const getEpisodeById = async (req, res) => {
  const { episodeId } = req.params;

  const episode = await episodeService.getEpisodeById(episodeId);

  if (!episode) {
    return res.status(404).json({ error: "Episode not found" });
  }

  res.json(episode);
};
