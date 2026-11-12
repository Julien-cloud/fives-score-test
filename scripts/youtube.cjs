const fs = require('node:fs/promises');
const api = 'https://www.googleapis.com/youtube/v3';
const channelId = 'UCwBLoaCRYAHknUoFQGvDfIg';
const playlistId = 'PLYJcxDl1cg2U';
const mime = 'video/mp4';

async function checked(response) {
  if (response.ok) return response;
  const body = await response.json().catch(() => ({}));
  const reason = body.error?.errors?.[0]?.reason || body.error?.status || body.error;
  throw new Error(`HTTP ${response.status}${typeof reason === 'string' ? ` (${reason})` : ''}`);
}

async function upload({ filename, date, client, refreshToken, state, save }) {
  const file = state.videoId ? null : await fs.open(filename, 'r');
  try {
    const size = file ? (await file.stat()).size : 0;
    if (file && (!size || (state.size && state.size !== size))) throw new Error('Taille du fichier inattendue.');
    const auth = await checked(await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', body: new URLSearchParams({
        client_id: client.client_id, client_secret: client.client_secret,
        refresh_token: refreshToken, grant_type: 'refresh_token',
      }), signal: AbortSignal.timeout(20000),
    }));
    const { access_token } = await auth.json();
    const headers = { Authorization: `Bearer ${access_token}` };
    const get = async url => (await checked(await fetch(url, { headers, signal: AbortSignal.timeout(20000) }))).json();
    const { items: channels } = await get(`${api}/channels?part=id&mine=true`);
    const { items: playlists } = await get(`${api}/playlists?part=snippet&id=${playlistId}`);
    if (!channels.some(channel => channel.id === channelId) || playlists[0]?.snippet.channelId !== channelId) {
      throw new Error('Chaîne ou playlist inattendue.');
    }
    const [year, month, day] = date.split('-');
    const title = `${day}-${month}-${year.slice(-2)}`;
    if (!state.videoId) {
      const put = (range, body) => fetch(state.uploadUrl, {
        method: 'PUT', headers: { ...headers, 'Content-Type': mime, 'Content-Range': range },
        body, redirect: 'manual', signal: AbortSignal.timeout(120000),
      });
      let offset = 0;
      const accept = async response => {
        if (response.status === 308) {
          const range = response.headers.get('range');
          return range ? Number(range.split('-').at(-1)) + 1 : 0;
        }
        const uploaded = await (await checked(response)).json();
        if (!uploaded.id) throw new Error('YouTube a terminé sans fournir d’identifiant.');
        state.videoId = uploaded.id;
        delete state.uploadUrl;
        await save();
        return size;
      };
      if (state.uploadUrl) {
        offset = await accept(await put(`bytes */${size}`, Buffer.alloc(0)));
      } else {
        const response = await checked(await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status&notifySubscribers=false', {
          method: 'POST', headers: {
            ...headers, 'Content-Type': 'application/json',
            'X-Upload-Content-Type': mime, 'X-Upload-Content-Length': String(size),
          },
          body: JSON.stringify({ snippet: { title, categoryId: '17' }, status: { privacyStatus: 'unlisted', embeddable: true } }),
          signal: AbortSignal.timeout(20000),
        }));
        const location = new URL(response.headers.get('location'));
        if (location.origin !== 'https://www.googleapis.com') throw new Error('Adresse de reprise YouTube inattendue.');
        state.uploadUrl = location.href;
        state.size = size;
        await save();
      }
      while (offset < size) {
        const length = Math.min(8 * 1024 * 1024, size - offset);
        const chunk = Buffer.alloc(length);
        const { bytesRead } = await file.read(chunk, 0, length, offset);
        if (bytesRead !== length) throw new Error('Lecture incomplète du MP4.');
        const next = await accept(await put(`bytes ${offset}-${offset + length - 1}/${size}`, chunk));
        if (next <= offset) throw new Error('YouTube n’a pas confirmé la progression de cet envoi.');
        offset = next;
        console.log(`Transfert YouTube : ${Math.floor(100 * offset / size)} %`);
      }
    }
    let video;
    for (let attempt = 0; attempt < 30; attempt++) {
      const { items } = await get(`${api}/videos?part=snippet,status&id=${state.videoId}`);
      video = items[0];
      if (video?.status.uploadStatus !== 'uploaded') break;
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    if (video?.snippet.title !== title || video.status.privacyStatus !== 'unlisted') {
      throw new Error(`Le titre ou la visibilité YouTube ne correspond pas (vidéo ${state.videoId}).`);
    }
    if (video.status.uploadStatus !== 'processed') throw new Error('Traitement YouTube en attente ou en échec.');
    const playlistQuery = `${api}/playlistItems?part=id&playlistId=${playlistId}&videoId=${state.videoId}`;
    if (!(await get(playlistQuery)).items.length) {
      await checked(await fetch(`${api}/playlistItems?part=snippet`, {
        method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ snippet: { playlistId, resourceId: { kind: 'youtube#video', videoId: state.videoId } } }),
        signal: AbortSignal.timeout(20000),
      }));
    }
    if (!(await get(playlistQuery)).items.length) throw new Error('Ajout à la playlist encore non confirmé.');
    return state.videoId;
  } finally {
    await file?.close();
  }
}

module.exports = { upload };
