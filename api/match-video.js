const { createHash, timingSafeEqual } = require('node:crypto');

const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;

function digest(value) {
  return createHash('sha256').update(value).digest();
}

module.exports = async function matchVideo(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const {
    FIVES_VIDEO_TOKEN: token,
    FIVES_VIDEO_LEAGUE_ID: leagueId,
    SUPABASE_URL: supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
  } = process.env;
  if (!token || !uuid.test(leagueId || '') || !supabaseUrl || !serviceKey) {
    return res.status(503).json({ error: 'Intégration vidéo indisponible.' });
  }
  if (!timingSafeEqual(digest(req.headers.authorization || ''), digest(`Bearer ${token}`))) {
    return res.status(401).json({ error: 'Autorisation requise.' });
  }

  const { matchId, videoId } = req.body || {};
  if (typeof matchId !== 'string' || !uuid.test(matchId) ||
      typeof videoId !== 'string' || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return res.status(400).json({ error: 'Identifiant de match ou de vidéo invalide.' });
  }

  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const filters = new URLSearchParams({
    id: `eq.${matchId}`,
    league_id: `eq.${leagueId}`,
    result: 'neq.P',
    select: 'id,youtube_url',
    or: `(youtube_url.is.null,youtube_url.eq.,youtube_url.eq."${youtubeUrl}")`,
  });

  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/matches?${filters}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        ...(!serviceKey.startsWith('sb_secret_') && { Authorization: `Bearer ${serviceKey}` }),
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ youtube_url: youtubeUrl }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const [match] = await response.json();
    if (!match) {
      return res.status(409).json({ error: 'Match introuvable, à venir ou déjà associé à une autre URL.' });
    }
    return res.status(200).json({ matchId: match.id, youtubeUrl: match.youtube_url });
  } catch (error) {
    console.error('Mise à jour du replay impossible', error.name);
    return res.status(502).json({ error: 'Impossible de mettre à jour le replay.' });
  }
};
