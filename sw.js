// Cache only the public app shell. Financial data and API responses are never cached.
const CACHE='et-wallet-pwa-v2-1';
const SHELL=['./','./index.html','./manifest.webmanifest','./favicon-512.png','./apple-touch-icon.png','./icon-192.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  // Prefer newest HTML to minimize stale builds; offline shell is view-only.
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).catch(()=>caches.match('./index.html')));return;
  }
  if(SHELL.some(x=>url.pathname.endsWith(x.replace('./','')))){
    event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
  }
});
