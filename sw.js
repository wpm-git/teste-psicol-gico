const CACHE='psico-v11';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./norm-fix.js'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  const isHtml=e.request.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('/index.html');
  if(isHtml){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(async r=>{
      const type=r.headers.get('content-type')||'';
      if(!type.includes('text/html'))return r;
      let html=await r.text();
      if(!html.includes('norm-fix.js'))html=html.replace(/<\/body>/i,'<script src="./norm-fix.js"></script></body>');
      const h=new Headers(r.headers);h.delete('content-length');
      const response=new Response(html,{status:r.status,statusText:r.statusText,headers:h});
      const clone=response.clone();caches.open(CACHE).then(c=>c.put('./index.html',clone));
      return response;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{const y=x.clone();caches.open(CACHE).then(c=>c.put(e.request,y));return x})));
});
