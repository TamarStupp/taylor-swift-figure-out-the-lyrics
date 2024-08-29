self.addEventListener("activate", () => {
    console.log("new SW activated immediately")
  })
self.addEventListener('fetch', (event) => {
    console.log('fetching: ', event.request.url);
    event.respondWith(fetch(event.request.url));
})