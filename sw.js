const CACHE='rakshaone-shell-v7';
const SHELL=['./','./index.html','./styles.css','./manifest.webmanifest','./assets/logo.png','./assets/favicon.ico','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./js/app.js','./js/experience.js','./js/camera-flow.js','./js/config.js','./js/store.js','./js/curriculum.js','./js/assessment.js','./js/pose.js'];
self.addEventListener('install', event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate', event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch', event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin) return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));
    return response;
  }).catch(()=>caches.match(event.request).then(hit=>hit||(event.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
