import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const apiUrl = process.env.VITE_API_URL ?? 'http://localhost:3000';
const siteUrl = process.env.VITE_SITE_URL ?? 'https://zrbus.ddns.net';

const { render } = await import('./.vite-ssg-temp/entry-server.mjs');

const templatePath = path.join(distDir, 'index.html.tpl');
const indexHtml = await fs.readFile(templatePath, 'utf-8');

const staticRoutes = ['/', '/o-nama', '/red-voznje'];
const noindexRoutes = ['/prijava'];

let allLines = [];
let lineRoutes = [];
try {
    const res = await fetch(`${apiUrl}/lines`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allLines = await res.json();
    lineRoutes = allLines
        .filter((l) => (l.category ?? 'city') === 'city')
        .map((l) => `/red-voznje/${l.id}`);
} catch (err) {
    console.warn('[SSG] Could not fetch /lines — building with static routes only:', err.message);
}

const corridorRoutes = [
    '/autobus/novi-sad-zrenjanin',
    '/autobus/beograd-zrenjanin',
    '/autobus/kikinda-zrenjanin',
];
const allRoutes = [...staticRoutes, ...lineRoutes, ...corridorRoutes];

for (const routePath of noindexRoutes) {
    try {
        const noindexPage = indexHtml.replace(
            '<meta name="robots" content="index, follow" />',
            '<meta name="robots" content="noindex, nofollow" />',
        );
        const outDir = path.join(distDir, routePath.replace(/^\//, ''));
        await fs.mkdir(outDir, { recursive: true });
        await fs.writeFile(path.join(outDir, 'index.html'), noindexPage, 'utf-8');
        console.log(`[SSG] noindex ${routePath}`);
    } catch (err) {
        console.error(`[SSG] failed noindex for ${routePath}:`, err.message);
    }
}

async function fetchLoaderData(routePath) {
    if (routePath === '/red-voznje') {
        const cityLines = allLines.filter((l) => (l.category ?? 'city') === 'city');
        return cityLines.length > 0 ? { lines: cityLines } : null;
    }

    const corridorMatch = routePath.match(/^\/autobus\/([\w-]+)$/);
    if (corridorMatch) {
        const slug = corridorMatch[1];
        const parts = slug.split('-');
        const zrIdx = parts.indexOf('zrenjanin');
        if (zrIdx < 0) return null;
        const from = parts.slice(0, zrIdx).join('-');
        const to = 'zrenjanin';
        try {
            const linesRes = await fetch(`${apiUrl}/lines/intercity?from=${from}&to=${to}`);
            if (!linesRes.ok) return { lines: [], stopsByLine: {}, departuresByEntry: {} };
            const lines = await linesRes.json();
            if (!lines.length) return { lines: [], stopsByLine: {}, departuresByEntry: {} };

            const stopsByLine = {};
            const departuresByEntry = {};

            await Promise.all(lines.map(async (line) => {
                const stopsRes = await fetch(`${apiUrl}/lines-locations/${line.id}`);
                if (!stopsRes.ok) return;
                const stops = await stopsRes.json();
                const sorted = [...stops].sort((a, b) => a.stop_number - b.stop_number);
                stopsByLine[line.id] = sorted;
                await Promise.all(sorted.map(async (entry) => {
                    const depRes = await fetch(`${apiUrl}/lines-locations-departures/${entry.id}`);
                    departuresByEntry[entry.id] = depRes.ok ? await depRes.json() : [];
                }));
            }));

            return { lines, stopsByLine, departuresByEntry };
        } catch (err) {
            console.warn(`[SSG] corridor loader failed for ${routePath}:`, err.message);
            return { lines: [], stopsByLine: {}, departuresByEntry: {} };
        }
    }

    const match = routePath.match(/^\/red-voznje\/(\d+)$/);
    if (!match) return null;
    const lineId = match[1];
    try {
        const [stopsRes, linesRes] = await Promise.all([
            fetch(`${apiUrl}/lines-locations/${lineId}`),
            fetch(`${apiUrl}/lines`),
        ]);
        if (!stopsRes.ok || !linesRes.ok) return null;
        const stops = await stopsRes.json();
        const lines = await linesRes.json();
        const line = lines.find((l) => String(l.id) === String(lineId));
        const sorted = [...stops].sort((a, b) => a.stop_number - b.stop_number);
        const depResults = await Promise.all(
            sorted.map((entry) =>
                fetch(`${apiUrl}/lines-locations-departures/${entry.id}`)
                    .then((r) => (r.ok ? r.json() : []))
                    .catch(() => []),
            ),
        );
        const departures = {};
        sorted.forEach((entry, i) => { departures[entry.id] = depResults[i] || []; });
        return { stops: sorted, departures, line: line ?? null };
    } catch (err) {
        console.warn(`[SSG] loader fetch failed for ${routePath}:`, err.message);
        return null;
    }
}

const TITLE_RE = /<title[^>]*>[\s\S]*?<\/title>/gi;
const META_HELMET_RE = /<meta\s+(?:name="(?:description|robots|twitter:[^"]+)"|property="(?:og:[^"]+)")[^/]*/gi;
const CANONICAL_LINK_RE = /<link\s[^>]*rel="canonical"[^>]*\/?>/gi;
const JSON_LD_RE = /<script\s[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi;

function extractAndStripHeadTags(html) {
    const tags = [];

    let t;
    TITLE_RE.lastIndex = 0;
    while ((t = TITLE_RE.exec(html)) !== null) tags.push(t[0]);
    META_HELMET_RE.lastIndex = 0;
    while ((t = META_HELMET_RE.exec(html)) !== null) {
        const tag = t[0].endsWith('/>') ? t[0] : t[0] + '/>';
        tags.push(tag);
    }
    CANONICAL_LINK_RE.lastIndex = 0;
    while ((t = CANONICAL_LINK_RE.exec(html)) !== null) tags.push(t[0]);
    JSON_LD_RE.lastIndex = 0;
    while ((t = JSON_LD_RE.exec(html)) !== null) tags.push(t[0]);

    const stripped = html
        .replace(TITLE_RE, '')
        .replace(META_HELMET_RE, '')
        .replace(CANONICAL_LINK_RE, '')
        .replace(JSON_LD_RE, '');

    return { tags, stripped };
}

for (const routePath of allRoutes) {
    try {
        const loaderData = await fetchLoaderData(routePath);
        const url = `${siteUrl}${routePath}`;
        const { html } = await render(url, loaderData);

        const { tags, stripped } = extractAndStripHeadTags(html);

        let page = indexHtml;

        if (tags.length > 0) {
            const titleTag = tags.find((t) => /<title/i.test(t));
            if (titleTag) {
                page = page.replace(/<title[^>]*>[\s\S]*?<\/title>/i, titleTag);
            }
            const otherTags = tags.filter((t) => !/<title/i.test(t));
            if (otherTags.length > 0) {
                page = page
                    .replace(/<meta\s+name="description"[^>]*\/>/gi, '')
                    .replace(/<meta\s+property="og:title"[^>]*\/>/gi, '')
                    .replace(/<meta\s+property="og:description"[^>]*\/>/gi, '')
                    .replace(/<meta\s+property="og:url"[^>]*\/>/gi, '')
                    .replace(/<meta\s+name="twitter:title"[^>]*\/>/gi, '')
                    .replace(/<meta\s+name="twitter:description"[^>]*\/>/gi, '')
                    .replace(/<link\s+rel="canonical"[^>]*\/>/gi, '');
                const injection = otherTags.map((t) => `    ${t}`).join('\n');
                page = page.replace('</head>', `${injection}\n  </head>`);
            }
        }

        page = page.replace('<div id="root">', `<div id="root" data-server-rendered="true">${stripped}`);

        const outDir = routePath === '/'
            ? distDir
            : path.join(distDir, routePath.replace(/^\//, ''));

        await fs.mkdir(outDir, { recursive: true });
        await fs.writeFile(path.join(outDir, 'index.html'), page, 'utf-8');
        console.log(`[SSG] rendered ${routePath}`);
    } catch (err) {
        console.error(`[SSG] failed to render ${routePath}:`, err.message);
    }
}

console.log('[SSG] Done.');
