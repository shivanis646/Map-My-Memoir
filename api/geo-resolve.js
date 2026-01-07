export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  try {
    const response = await fetch(url, { redirect: "follow" });
    const finalURL = response.url;

    let lat, lng;

    // Try @lat,lng
    let match = finalURL.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      lat = parseFloat(match[1]);
      lng = parseFloat(match[2]);
    }

    // Try !3dLAT!4dLNG
    if (!lat || !lng) {
      match = finalURL.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      }
    }

    if (!lat || !lng) {
      return res.status(400).json({ error: "Could not extract coordinates" });
    }

    return res.status(200).json({ lat, lng });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
