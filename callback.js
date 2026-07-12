// DRIVER-ONLY, ONE-TIME SETUP ROUTE.
// Spotify redirects here after you authorize. It exchanges the code for tokens
// and shows the refresh token so you can paste it into Vercel env vars.

module.exports = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    res.status(400).send("Missing ?code — start at /api/login");
    return;
  }

  const redirectUri = `https://${req.headers.host}/api/callback`;

  const r = await fetch("https://accounts.spotify.com/api/token", {
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
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await r.json();

  if (!data.refresh_token) {
    res
      .status(500)
      .send("<pre>Token exchange failed:\n" + JSON.stringify(data, null, 2) + "</pre>");
    return;
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`
    <body style="font-family:system-ui;max-width:640px;margin:40px auto;padding:0 16px">
      <h2>✅ Authorized</h2>
      <p>Copy this refresh token into your Vercel project as the
      <code>SPOTIFY_REFRESH_TOKEN</code> environment variable, then redeploy:</p>
      <textarea style="width:100%;height:120px;font-size:14px">${data.refresh_token}</textarea>
      <p><strong>Keep it secret.</strong> Anyone with this token can control your Spotify playback.</p>
    </body>
  `);
};
