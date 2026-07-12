// DRIVER-ONLY, ONE-TIME SETUP ROUTE.
// Visit https://your-domain.vercel.app/api/login once after deploying.
// It sends you to Spotify to authorize, then /api/callback shows your refresh token.

module.exports = (req, res) => {
  const redirectUri = `https://${req.headers.host}/api/callback`;
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "user-modify-playback-state user-read-playback-state",
  });
  res.writeHead(302, {
    Location: "https://accounts.spotify.com/authorize?" + params.toString(),
  });
  res.end();
};
