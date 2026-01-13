const RESOLVER_URL = process.env.RESOLVER_SERVICE_URL;
const RESOLVER_API_KEY = process.env.RESOLVER_API_KEY;

export async function resolveSourceUrl(sourceUrl) {
  const response = await fetch(`${RESOLVER_URL}/resolve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Resolver-Key": RESOLVER_API_KEY
    },
    body: JSON.stringify({ source_url: sourceUrl })
  });

  if (!response.ok) {
    throw new Error(`Resolver returned ${response.status}`);
  }

  const data = await response.json();

  return {
    direct_download_url: data.direct_download_url,
    expires_at: data.expires_at
  };
}
