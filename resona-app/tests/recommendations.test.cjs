/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness uses the installed TypeScript compiler. */
// Run with: node --test tests/recommendations.test.cjs
// Uses the existing TypeScript compiler and Node runner; no test dependency needed.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function loadModule(relativePath, imports, globals = {}) {
    const filename = path.join(__dirname, '..', relativePath);
    const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
    });
    const exports = {};
    vm.runInNewContext(outputText, {
        exports,
        require(name) {
            if (Object.hasOwn(imports, name)) return imports[name];
            if (name === 'react/jsx-runtime') return require(name);
            throw new Error(`Unexpected import: ${name}`);
        },
        URL, AbortController, setTimeout, clearTimeout,
        console: { error() {} },
        ...globals,
    }, { filename });
    return exports;
}

function setup({ user = 'viewer', counts = [5, 5, 5], response, status = 200, env, failFetch = false, failDb = false, beforeResponse, timers } = {}) {
    const queries = [];
    const requests = [];
    const ratings = [];
    const records = Object.fromEntries(['track', 'album', 'artist'].map(type => [type, [
        { id: 'shared', spotifyId: `spotify-${type}`, name: `${type} name`, imageUrl: null, album: null, artists: [] },
    ]]));
    const prisma = {};
    ['track', 'album', 'artist'].forEach((type, i) => {
        prisma[`user${type[0].toUpperCase()}${type.slice(1)}Stat`] = {
            async count(query) {
                queries.push({ operation: 'count', type, query });
                assert.equal(query.where.userId, user);
                assert.equal(query.where.rating.gt, 0);
                if (failDb) throw new Error('DB unavailable');
                return counts[i];
            },
        };
        prisma[type] = {
            async findMany(query) {
                queries.push({ operation: 'findMany', type, query });
                const filter = query.where[`user${type[0].toUpperCase()}${type.slice(1)}Stats`].none;
                assert.equal(filter.userId, user);
                assert.equal(filter.rating.not, null);
                return records[type].filter(record => query.where.id.in.includes(record.id)
                    && !ratings.some(r => r.type === type && r.id === record.id && r.userId === user && r.rating !== null)).reverse();
            },
        };
    });
    const body = response === undefined ? {
        user_id: user,
        reason: null,
        recommendations: ['artist', 'track', 'album'].map((type, i) => ({ item_type: type, item_id: 'shared', score: 9 - i })),
    } : response;
    const loaded = loadModule('lib/recommendations.ts', {
        'server-only': {}, '@/auth': { auth: async () => user ? { user: { id: user } } : null }, '@/lib/prisma': { prisma },
    }, {
        process: { env: env ?? { RECOMMENDATION_SERVICE_URL: 'https://recommendation.test', RECOMMENDATION_SERVICE_TOKEN: 'test-secret' } },
        fetch: async (url, options) => {
            requests.push({ url, options });
            if (timers) await new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('Aborted')), { once: true }));
            if (failFetch) throw new Error('Network failure');
            if (beforeResponse) beforeResponse(ratings);
            return { ok: status === 200, status, json: async () => body };
        },
        ...(timers ? { setTimeout(callback, ms) { timers.push(ms); queueMicrotask(callback); return 1; }, clearTimeout() {} } : {}),
    });
    return { ...loaded, queries, requests, records, ratings };
}

test('signed-out viewers do not query data or call Python', async () => {
    const ctx = setup({ user: null });
    assert.equal((await ctx.getRecommendations()).status, 'signed_out');
    assert.equal(ctx.queries.length, 0);
    assert.equal(ctx.requests.length, 0);
});

test('under 15 positive ratings stops before the service call', async () => {
    const ctx = setup({ counts: [8, 4, 2] });
    const result = await ctx.getRecommendations();
    assert.equal(result.status, 'insufficient_ratings');
    assert.equal(result.qualifyingRatings, 14);
    assert.equal(ctx.requests.length, 0);
    assert.equal(ctx.queries.length, 3);
});

test('uses authenticated identity, private token, timeout signal, no cache, and no redirects', async () => {
    const ctx = setup();
    const result = await ctx.getRecommendations();
    assert.equal(result.status, 'ready');
    const { url, options } = ctx.requests[0];
    assert.equal(url.pathname, '/recommendations/viewer');
    assert.equal(url.searchParams.get('top_n'), '30');
    assert.equal(options.headers.Authorization, 'Bearer test-secret');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(ctx.queries.filter(q => q.operation === 'findMany').length, 3);
    assert.deepEqual(Array.from(result.items, item => item.href), ['/artist/spotify-artist', '/track/spotify-track', '/album/spotify-album']);
    assert.ok(!JSON.stringify(result).includes('test-secret'));
});

test('post-snapshot ratings, including zero, are excluded after the response; null and other-user ratings are allowed', async () => {
    const ctx = setup({ beforeResponse(ratings) {
        ratings.push(
            { type: 'track', id: 'shared', userId: 'viewer', rating: 0 },
            { type: 'album', id: 'shared', userId: 'viewer', rating: 8 },
            { type: 'artist', id: 'shared', userId: 'viewer', rating: null },
            { type: 'artist', id: 'shared', userId: 'someone-else', rating: 10 },
        );
    } });
    const result = await ctx.getRecommendations();
    assert.deepEqual(Array.from(result.items, item => item.itemType), ['artist']);
});

test('unknown users and users below the snapshot threshold await training', async () => {
    for (const config of [
        { status: 404 },
        { response: { user_id: 'viewer', recommendations: [], reason: 'insufficient_ratings' } },
    ]) {
        const ctx = setup(config);
        assert.equal((await ctx.getRecommendations()).status, 'awaiting_training');
        assert.equal(ctx.queries.filter(q => q.operation === 'findMany').length, 0);
    }
});

test('empty service results or missing catalog records produce an honest empty state', async () => {
    const empty = setup({ response: { user_id: 'viewer', recommendations: [], reason: 'no_candidates' } });
    assert.equal((await empty.getRecommendations()).status, 'empty');
    const missing = setup();
    Object.keys(missing.records).forEach(type => { missing.records[type] = []; });
    assert.equal((await missing.getRecommendations()).status, 'empty');
});

test('all candidates rated since training produce an empty state', async () => {
    const ctx = setup();
    ['track', 'album', 'artist'].forEach(type => ctx.ratings.push({ type, id: 'shared', userId: 'viewer', rating: 0 }));
    assert.equal((await ctx.getRecommendations()).status, 'empty');
});

test('deduplicates candidates, preserves rank, and caps display at ten', async () => {
    const recommendations = Array.from({ length: 20 }, (_, i) => ({ item_type: 'track', item_id: String(i), score: 10 - i / 2 }));
    const ctx = setup({ response: { user_id: 'viewer', recommendations: [recommendations[0], ...recommendations], reason: null } });
    ctx.records.track = recommendations.map(item => ({ id: item.item_id, spotifyId: `spotify-${item.item_id}`, name: 'Track', album: null, artists: [] }));
    const result = await ctx.getRecommendations();
    assert.deepEqual(Array.from(result.items, item => item.id), Array.from({ length: 10 }, (_, i) => String(i)));
    assert.equal(ctx.queries.filter(q => q.operation === 'findMany').length, 1);
});

test('service, database, and configuration failures are contained', async () => {
    for (const config of [{ status: 500 }, { status: 401 }, { status: 503 }, { failFetch: true }, { failDb: true }, { env: {} }]) {
        assert.equal((await setup(config).getRecommendations()).status, 'unavailable');
    }
});

test('timeout aborts the request after the configured three seconds', async () => {
    const timers = [];
    assert.equal((await setup({ timers }).getRecommendations()).status, 'unavailable');
    assert.deepEqual(timers, [3000]);
});

test('malformed, mismatched-user, and old spotify_id payloads are rejected', async () => {
    const valid = { user_id: 'viewer', reason: null, recommendations: [{ item_type: 'track', item_id: 'shared', score: 8 }] };
    const invalid = [null, {}, { ...valid, user_id: 'other' }, { ...valid, reason: 'unexpected' },
        { ...valid, reason: 'insufficient_ratings' },
        { ...valid, recommendations: [{ item_type: 'track', spotify_id: 'shared', score: 8 }] },
        { ...valid, recommendations: [{ item_type: 'podcast', item_id: 'shared', score: 8 }] },
        { ...valid, recommendations: [{ item_type: 'track', item_id: 'shared', score: Infinity }] },
        { ...valid, recommendations: [{ item_type: 'track', item_id: 'shared', score: '8' }] },
        { ...valid, recommendations: Array(31).fill(valid.recommendations[0]) },
    ];
    for (const response of invalid) {
        assert.equal((await setup({ response }).getRecommendations()).status, 'unavailable');
    }
});

function renderDiscover(states) {
    let index = 0;
    const mockedReact = { ...React, useState: () => [states[index++], () => {}], useEffect() {}, useCallback: fn => fn };
    const { default: Discover } = loadModule('components/dashboard/discover/Discover.tsx', {
        react: mockedReact,
        'next/image': { default: () => null },
        './DiscoverSection': { default: ({ title, children }) => React.createElement('section', null, title, children) },
        './DiscoverCard': { default: ({ name }) => React.createElement('span', null, name) },
    });
    return renderToStaticMarkup(React.createElement(Discover, { recommendations: React.createElement('section', null, 'Recommendation slot') }));
}

test('recommendation section remains visible during Spotify loading, disconnection, and failure', () => {
    for (const state of [[null, true, null], [null, false, 'spotify_not_connected'], [null, false, 'Spotify failed']]) {
        const html = renderDiscover(state);
        assert.ok(html.includes('Recommendation slot'));
        if (state[2] === 'spotify_not_connected') assert.ok(html.includes('Connect with Spotify'));
        if (state[2] === 'Spotify failed') assert.ok(html.includes('Spotify failed'));
    }
});

test('existing Spotify sections still render alongside recommendations', () => {
    const html = renderDiscover([{ topTracks: [], topArtists: [], recentlyPlayed: [] }, false, null]);
    for (const label of ['Recommendation slot', 'Top Tracks', 'Top Artists', 'Recently Played']) assert.ok(html.includes(label));
});

test('server recommendation section renders the distinct empty states and resolved links', async () => {
    for (const [status, text] of [
        ['insufficient_ratings', '14 of 15'],
        ['awaiting_training', 'future training update'],
        ['empty', 'No new recommendations'],
        ['unavailable', 'temporarily unavailable'],
        ['ready', '/track/resolved-spotify-id'],
    ]) {
        const result = { status, qualifyingRatings: 14, items: status === 'ready' ? [{
            id: 'internal-id', itemType: 'track', name: 'Track', imageUrl: null, subtitle: 'Track', href: '/track/resolved-spotify-id',
        }] : [] };
        const { default: Recommendations } = loadModule('components/dashboard/discover/Recommendations.tsx', {
            '@/lib/recommendations': { getRecommendations: async () => result, MIN_RECOMMENDATION_RATINGS: 15 },
            './DiscoverSection': { default: ({ isEmpty, emptyMessage, children }) => React.createElement('section', null, isEmpty ? emptyMessage : children) },
            './DiscoverCard': { default: ({ href, name }) => React.createElement('a', { href }, name) },
        });
        assert.ok(renderToStaticMarkup(await Recommendations()).includes(text));
    }
});

test('server page gives recommendations a Suspense boundary without waiting for them', async () => {
    let called = false;
    const Recommendations = () => { called = true; return null; };
    const { default: Page } = loadModule('app/(dashboard)/discover/page.tsx', {
        react: React,
        '@/auth': { auth: async () => ({ user: { id: 'viewer' } }) },
        'next/navigation': { redirect() { throw new Error('Unexpected redirect'); } },
        '@/components/dashboard/discover/Discover': { default: () => null },
        '@/components/dashboard/discover/Recommendations': { default: Recommendations, RecommendationsLoading: () => null },
    });
    const page = await Page();
    assert.equal(page.props.recommendations.type, React.Suspense);
    assert.equal(page.props.recommendations.props.children.type, Recommendations);
    assert.equal(called, false);
});
