const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
  "./index.html",
  "./styles.css",
  "./index.js",
  "./db.js",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png",
];

// install event handler
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("static").then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  console.log("Install");
  self.skipWaiting();
});

self.addEventListener('activate', async (event) => {
  console.log("ACTIVATING");
  caches.match(event.request)
  .then((cachedFiles)=>{
    if(cachedFiles){
      return cachedFiles;
    } else {
      return fetch(event.request);
    }
  })
  .catch((err) => {
    console.log('err in fetch', err);
  });
});

// // retrieve assets from cache
// self.addEventListener("fetch", (event) => {
//   console.log(event.request);
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       return response || fetch(event.request);
//     })
//   );
// });

// self.addEventListener('fetch', event => {
//   if(evt.request.url.includes("/api")) {

//   }
// });

// fetch
self.addEventListener("fetch", function(evt) {
  // cache successful requests to the API
  if (evt.request.url.includes("/api/transactions")) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  // if the request is not for the API, serve static assets using "offline-first" approach.
  // see https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook#cache-falling-back-to-network
  evt.respondWith(
    caches.match(evt.request).then(function(response) {
      return response || fetch(evt.request);
    })
  );
});
