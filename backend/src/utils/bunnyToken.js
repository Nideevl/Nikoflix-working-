import crypto from "crypto";

const KEY = process.env.BUNNY_TOKEN_KEY;
const CDN = "https://nikoflix.b-cdn.net";

export function generateBunnySignedUrl(path) {
  const dirPath = path.endsWith('/') ? path : path + '/';
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 6;
  
  // For hash: use the directory path WITHOUT encoding
  const hashBase = `${KEY}${dirPath}${expires}token_path=${dirPath}`;
  
  const token = crypto
    .createHash("sha256")
    .update(hashBase)
    .digest("base64")
    .replace(/\n/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  
  // In the URL: encode the token_path parameter
  return `${CDN}${dirPath}master.m3u8?token=${token}&expires=${expires}&token_path=${encodeURIComponent(dirPath)}`;
}