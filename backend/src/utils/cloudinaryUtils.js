export function extractPublicId(url) {
  if (!url) return null;

  const parts = url.split("/upload/")[1]; 
  if (!parts) return null;

  const withoutVersion = parts.split("/").slice(1).join("/");
  const publicId = withoutVersion.replace(/\.[^/.]+$/, ""); // remove extension

  return publicId;
}
