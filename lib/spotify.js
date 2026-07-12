// Shared helper: exchanges the driver's refresh token for a fresh access token.
// The refresh token is obtained once via /api/login and stored in Vercel env vars.

let cached = { token: null, expires: 0 };

async function getAccessToken() {
  if (cached.token && Date.now() < cached.expires - 60_000) return cached.token;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error("Spotify token refresh failed: " + JSON.stringify(data));
  }

  cached = {
    token: data.access_token,
    expires: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

module.exports = { getAccessToken };
