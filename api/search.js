const { getAccessToken } = require("../lib/spotify");

module.exports = async (req, res) => {
  try {
    const q = (req.query.q || "").trim().slice(0, 100);
    if (!q) {
      res.status(400).json({ error: "missing query" });
      return;
    }

    const token = await getAccessToken();
    const r = await fetch(
      "https://api.spotify.com/v1/search?" +
        new URLSearchParams({ q, type: "track", limit: "10" }),
      { headers: { Authorization: "Bearer " + token } }
    );
    const data = await r.json();

    let tracks = (data.tracks?.items || []).map((t) => ({
      uri: t.uri,
      name: t.name,
      artist: t.artists.map((a) => a.name).join(", "),
      image: t.album.images?.[2]?.url || t.album.images?.[0]?.url || "",
      explicit: t.explicit,
    }));

    // Set BLOCK_EXPLICIT=true in Vercel env vars to hide explicit tracks
    if (process.env.BLOCK_EXPLICIT === "true") {
      tracks = tracks.filter((t) => !t.explicit);
    }

    res.setHeader("Cache-Control", "no-store");
    res.json({ tracks });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
