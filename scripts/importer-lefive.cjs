const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { createWriteStream } = require('node:fs');
const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const { createInterface } = require('node:readline/promises');
const { chromium } = require('playwright-core');

async function findReplay(matchUrl) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ locale: 'fr-FR', viewport: { width: 1440, height: 1000 } });
    await page.goto(matchUrl.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const cookies = page.locator('#CybotCookiebotDialogBodyButtonDecline');
    await cookies.waitFor({ state: 'visible', timeout: 6000 }).catch(error => {
      if (error.name !== 'TimeoutError') throw error;
    });
    if (await cookies.isVisible()) await cookies.click();
    const promotion = page.locator('[id$="___BV_modal_body_"]').getByText('X', { exact: true }).first();
    await promotion.waitFor({ state: 'visible', timeout: 4000 }).catch(error => {
      if (error.name !== 'TimeoutError') throw error;
    });
    if (await promotion.isVisible()) await promotion.click();
    const poster = page.getByRole('img', { name: 'Le match', exact: true });
    const play = page.locator('.lf-fdm-video-card-play').and(page.locator('img[alt="Le match"] ~ *'));
    if (await play.count() === 1) {
      await play.click({ timeout: 15000 });
    } else {
      await poster.click({ timeout: 15000, position: { x: 30, y: 30 } });
    }
    const source = await page.waitForFunction(() => {
      const video = document.querySelector('video');
      return video?.currentSrc || video?.getAttribute('src') || video?.querySelector('source[src]')?.src || '';
    }, undefined, { timeout: 15000 });
    return new URL(await source.jsonValue(), page.url());
  } finally {
    await browser.close();
  }
}

async function main() {
  let [link, date, destination = path.join(__dirname, 'Depot-videos')] = process.argv.slice(2);
  if (!link && process.stdin.isTTY) {
    const input = createInterface({ input: process.stdin, output: process.stdout });
    try {
      link = (await input.question('Lien du match LE FIVE : ')).trim();
      date = (await input.question('Date du match (AAAA-MM-JJ) : ')).trim();
    } finally {
      input.close();
    }
  }
  if (!link || !/^\d{4}-\d{2}-\d{2}$/.test(date || '')) {
    throw new Error('Indique le lien du match LE FIVE et sa date au format AAAA-MM-JJ.');
  }
  const day = new Date(date + 'T00:00:00Z');
  if (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== date) {
    throw new Error('La date du match est invalide.');
  }
  const matchUrl = new URL(link);
  if (!['https://www.lefive.fr', 'https://lefive.fr'].includes(matchUrl.origin) ||
      !/^\/[a-z0-9-]+\/matchs\/detail\/\d+\/?$/i.test(matchUrl.pathname) ||
      matchUrl.username || matchUrl.password) {
    throw new Error('Le lien doit pointer vers la page de détail d’un match sur lefive.fr.');
  }

  await fs.mkdir(destination, { recursive: true });
  const target = path.resolve(destination, date + '.mp4');
  if (await fs.stat(target).then(() => true, error => {
    if (error.code !== 'ENOENT') throw error;
    return false;
  })) throw new Error(`Un MP4 existe déjà pour ce match : ${target}`);

  const replay = await findReplay(matchUrl);
  if (replay.protocol !== 'https:' || !/\.mp4$/i.test(replay.pathname) ||
      replay.username || replay.password) {
    throw new Error('Le lecteur ne fournit pas de fichier MP4 en HTTPS.');
  }
  const temp = path.resolve(destination, `.${date}.${randomUUID()}.part`);
  try {
    const response = await fetch(replay, { redirect: 'error', signal: AbortSignal.timeout(20 * 60000) });
    if (!response.ok || !response.body) throw new Error(`Téléchargement LE FIVE refusé (HTTP ${response.status}).`);
    await pipeline(Readable.fromWeb(response.body), createWriteStream(temp, { flags: 'wx' }));
    const file = await fs.open(temp, 'r');
    try {
      const { size } = await file.stat();
      const declaredSize = Number(response.headers.get('content-length'));
      const header = Buffer.alloc(12);
      const { bytesRead } = await file.read(header, 0, header.length, 0);
      if ((declaredSize && size !== declaredSize) || bytesRead !== header.length ||
          header.toString('ascii', 4, 8) !== 'ftyp') {
        throw new Error('Le fichier reçu est incomplet ou ne contient pas de vidéo MP4 valide.');
      }
    } finally {
      await file.close();
    }
    await fs.link(temp, target);
    console.log(target);
  } finally {
    await fs.rm(temp, { force: true });
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
