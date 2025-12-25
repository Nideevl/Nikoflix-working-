import * as contentService from "./content.services.js";

export const getAllContent = async (req, res) => {
  const content = await contentService.getAllContent();
  res.json(content);
};

export const getContentById = async (req, res) => {
  const { contentId } = req.params;

  const content = await contentService.getContentById(contentId);

  if (!content) {
    return res.status(404).json({ error: "Content not found" });
  }

  res.json(content);
};

export const getEpisodesBySeries = async (req, res) => {
  const { contentId } = req.params;

  const episodes = await contentService.getEpisodesBySeries(contentId);

  if (!episodes) {
    return res.status(404).json({
      error: "Series not found"
    });
  }

  res.json(episodes);
};

