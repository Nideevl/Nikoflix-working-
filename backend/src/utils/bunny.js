import axios from "axios";

const STORAGE_NAME = process.env.BUNNY_STORAGE_NAME;
const PASSWORD = process.env.BUNNY_STORAGE_PASSWORD;

const BASE_URL = "https://sg.storage.bunnycdn.com";

/**
 * Deletes a folder recursively from Bunny CDN
 * path example: movie/<movie_id> or episode/<episode_id>
 */
 
export async function deleteFromBunny(path) {
  const url = `${BASE_URL}/${STORAGE_NAME}/${path}`;

  await axios.delete(url, {
    headers: {
      AccessKey: PASSWORD
    }
  });

  console.log("🗑 Deleted from Bunny:", path);
}
