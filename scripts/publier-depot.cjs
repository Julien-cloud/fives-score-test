const { sign } = require('node:crypto');
const { createWriteStream, readFileSync } = require('node:fs');
const { mkdtemp, rm, stat } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { pipeline } = require('node:stream/promises');
const { Readable } = require('node:stream');
const { execFileSync } = require('node:child_process');
const { upload } = require('./youtube.cjs');

const folder = '1sqLB-DHdyjNrb3Lx3S_wu56fT38weSK8';
const archive = '18R2cc6pED5wZoxPtJ-F9ApZ1XCeWIs7k';
const league = '80ed16d4-0848-46f4-beb9-47257cd4bf60';
const drive = 'https://www.googleapis.com/drive/v3/files';
const tokenUrl = 'https://oauth2.googleapis.com/token';

async function checked(url, options = {}, timeout = 20000) {
  const res = await fetch(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`${new URL(url).hostname} a répondu HTTP ${res.status}.`);
  return res;
}

async function driveToken() {
  const key = JSON.parse(process.env.FIVES_DRIVE_SERVICE_ACCOUNT);
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const jwt = encode({ alg: 'RS256', typ: 'JWT' }) + '.' + encode({
    iss: key.client_email, scope: 'https://www.googleapis.com/auth/drive',
    aud: tokenUrl, iat: now, exp: now + 600,
  });
  const signature = sign('RSA-SHA256', Buffer.from(jwt), key.private_key).toString('base64url');
  const res = await checked(tokenUrl, { method: 'POST', body: new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt + '.' + signature,
  }) });
  return (await res.json()).access_token;
}

async function matchFor(date) {
  const config = readFileSync('supabase-config.js', 'utf8');
  const key = config.match(/key:\s*['"]([^'"]+)['"]/)?.[1];
  if (!key) throw new Error('Clé publique Supabase introuvable.');
  const q = new URLSearchParams({
    select: 'id,youtube_url', league_id: 'eq.' + league, date: 'eq.' + date,
    result: 'neq.P', limit: '2',
  });
  const url = 'https://lnesnmpqdaxhmawuqzfk.supabase.co/rest/v1/matches?' + q;
  const matches = await (await checked(url, { headers: { apikey: key } })).json();
  if (matches.length !== 1) throw new Error('Il faut une seule fiche de match terminée pour cette date.');
  return matches[0];
}

async function processFile(file, headers) {
  const [, date, extension] = file.name.match(/^(\d{4}-\d{2}-\d{2})\.(mp4|txt)$/i);
  const match = await matchFor(date);
  const mediaUrl = drive + '/' + encodeURIComponent(file.id);
  const keys = Object.keys(file.appProperties || {}).filter(key => /^fivesState\d+$/.test(key));
  const state = keys.length ? JSON.parse(keys.sort((a, b) => Number(a.slice(10)) - Number(b.slice(10)))
    .map(key => file.appProperties[key]).join('')) : {};
  if (state.uploadUrl && new URL(state.uploadUrl).origin !== 'https://www.googleapis.com') {
    throw new Error('Adresse de reprise YouTube invalide.');
  }
  if (state.checksum && state.checksum !== file.md5Checksum) throw new Error('Le dépôt a changé depuis le premier envoi.');
  if (match.youtube_url && match.youtube_url !== 'https://www.youtube.com/watch?v=' + state.videoId) {
    throw new Error('La fiche possède déjà un autre lien vidéo.');
  }
  state.checksum = file.md5Checksum;
  const patch = async (url, body) => (await checked(url, {
    method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })).json();
  const directory = await mkdtemp(join(tmpdir(), 'fives-replay-'));
  const filename = join(directory, date + '.mp4');
  try {
    if (!state.videoId && extension.toLowerCase() === 'txt') {
      if (Number(file.size) > 4096) throw new Error('Fichier de lien trop long.');
      const link = (await (await checked(mediaUrl + '?alt=media', { headers })).text()).trim();
      const env = Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith('FIVES_')));
      execFileSync(process.execPath, [join(__dirname, 'importer-lefive.cjs'), link, date, directory], {
        env, stdio: 'ignore', timeout: 22 * 60000,
      });
    } else if (!state.videoId) {
      const response = await checked(mediaUrl + '?alt=media', { headers }, 600000);
      await pipeline(Readable.fromWeb(response.body), createWriteStream(filename));
      if ((await stat(filename)).size !== Number(file.size)) throw new Error('MP4 Drive incomplet.');
    }
    const videoId = await upload({
      filename, date, state, client: JSON.parse(process.env.FIVES_YOUTUBE_CLIENT).installed,
      refreshToken: process.env.FIVES_YOUTUBE_REFRESH,
      save: () => {
        const chunks = JSON.stringify(state).match(/.{1,100}/g);
        const props = Object.fromEntries(keys.map(key => [key, null]));
        chunks.forEach((chunk, index) => { props['fivesState' + index] = chunk; });
        keys.splice(0, keys.length, ...chunks.map((_, index) => 'fivesState' + index));
        return patch(mediaUrl, { appProperties: props });
      },
    });
    const response = await checked('https://fives-score-test.vercel.app/api/match-video', {
      method: 'PUT', headers: { Authorization: 'Bearer ' + process.env.FIVES_SITE_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: match.id, videoId }),
    });
    if ((await response.json()).youtubeUrl !== 'https://www.youtube.com/watch?v=' + videoId) {
      throw new Error('Lien non confirmé par Fives Score Test.');
    }
    const moved = await patch(mediaUrl + '?' + new URLSearchParams({
      addParents: archive, removeParents: folder, fields: 'parents',
    }), {});
    if (!moved.parents.includes(archive) || moved.parents.includes(folder)) throw new Error('Déplacement non confirmé.');
    console.log(`${file.name} publié et déplacé dans Traités.`);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function main() {
  const headers = { Authorization: 'Bearer ' + await driveToken() };
  const files = [];
  let pageToken;
  do {
    const q = new URLSearchParams({
      q: `'${folder}' in parents and trashed = false`,
      fields: 'nextPageToken,files(id,name,size,md5Checksum,appProperties,mimeType)', pageSize: '100',
    });
    if (pageToken) q.set('pageToken', pageToken);
    const page = await (await checked(drive + '?' + q, { headers })).json();
    files.push(...page.files);
    pageToken = page.nextPageToken;
  } while (pageToken);
  const pending = files.filter(file => file.md5Checksum && /^\d{4}-\d{2}-\d{2}\.(mp4|txt)$/i.test(file.name));
  if (!pending.length) return console.log('Dépôt vide.');
  if (process.argv.includes('--lecture-seule')) return console.log(`${pending.length} dépôt(s) en attente.`);
  for (const file of pending) {
    try {
      if (pending.filter(item => item.name.slice(0, 10) === file.name.slice(0, 10)).length > 1) {
        throw new Error('Plusieurs fichiers portent la date de ce match.');
      }
      await processFile(file, headers);
    } catch (error) {
      console.error(`${file.name} : ${error.message}`);
      process.exitCode = 1;
    }
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
