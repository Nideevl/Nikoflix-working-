import * as movieService from "./movies.services.js";

export const getMovieById = async (req, res) => {
  const { movieId } = req.params;

  const movie = await movieService.getMovieById(movieId);

  if (!movie) {
    return res.status(404).json({ error: "Movie not foound" });
  }

  res.json(movie);
};
