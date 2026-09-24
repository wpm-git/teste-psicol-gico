const CACHE = 'psico-v10.1.1';
const CORE_ASSETS = ['./', './index.html', './manifest.webmanifest', './icon.svg', './hotfix.css', './hotfix.js'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function stabilizeHtml(html) {
  if (!html.includes('hotfix.css')) {
    html = html.replace('</head>', '<link rel="stylesheet" href="./hotfix.css?v=10.1.1"></head>');
  }
  if (!html.includes('hotfix.js')) {
    html = html.replace('</body>', '<script src="./hotfix.js?v=10.1.1" defer></script></body>');
  }
  return html;
}

async function networkHtml(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (!response || !response.ok) throw new Error('HTML indisponível');
    const raw = await response.text();
    const html = stabilizeHtml(raw);
    const headers = new Headers(response.headers);
    headers.set('content-type', 'text/html; charset=utf-8');
    headers.delete('content-length');
    const stable = new Response(html, { status: response.status, statusText: response.statusText, headers });
    const cacheCopy = stable.clone();
    caches.open(CACHE).then(cache => cache.put('./index.html', cacheCopy));
    return stable;
  } catch (error) {
    const cached = await caches.match('./index.html');
    if (!cached) throw error;
    const raw = await cached.text();
    return new Response(stabilizeHtml(raw), { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(networkHtml(request));
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response || !response.ok || response.type === 'opaque') return response;
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy));
        return response;
      });
    })
  );
});
