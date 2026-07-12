const { getAccessToken } = require("../lib/spotify");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  try {
    const uri = req.body?.uri;
    if (typeof uri !== "string" || !/^spotify:track:[A-Za-z0-9]+$/.test(uri)) {
      res.status(400).json({ error: "invalid track uri" });
      return;
    }

    const token = await getAccessToken();
    const r = await fetch(
      "https://api.spotify.com/v1/me/player/queue?" +
        new URLSearchParams({ uri }),
      {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      }
    );

    if (r.status === 200 || r.status === 204) {
      res.json({ ok: true });
      return;
    }

    // 404 = no active Spotify device (driver's phone isn't playing anything)
    if (r.status === 404) {
      res.status(409).json({ ok: false, reason: "no_active_device" });
      return;
    }

    const err = await r.json().catch(() => ({}));
    res.status(502).json({ ok: false, reason: err.error?.message || "spotify_error" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
