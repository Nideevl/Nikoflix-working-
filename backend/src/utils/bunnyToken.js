import crypto from "crypto";

const BUNNY_TOKEN_KEY = process.env.BUNNY_TOKEN_KEY;
const CDN_BASE = process.env.BUNNY_CDN_BASE;

/**
 * Generates Bunny signed URL valid for 6 hours
 * @param {string} path  -> /movie/<id>/master.m3u8
 */
export function generateBunnySignedUrl(path) {
  const expires = Math.floor(Date.now() / 1000) + (60 * 60 * 6); // 6 hours

  const hash = crypto
    .createHash("sha256")
    .update(BUNNY_TOKEN_KEY + path + expires)
    .digest("hex");

  return `${CDN_BASE}${path}?token=${hash}&expires=${expires}`;
}
