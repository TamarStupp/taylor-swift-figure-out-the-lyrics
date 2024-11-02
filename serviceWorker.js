let OFFLINE_SONGS = 5;
// songs without TTPD: 199
const NUMBER_OF_SONGS = 231;
const VERSION = 3;
const SONG_CACHE_NAME = `songs-${VERSION}`;
const GENERAL_CACHE_NAME = `general-${VERSION}`;
const broadcast = new BroadcastChannel('offlineSongs');
let resourcesInCache;
let failedCaches = 0;
const files = [
	"style.css",
	"index.html",
	"assets/TS.svg",
	"code.js",
	"assets/fonts/Monorale-Light.woff",
	"assets/fonts/Caveat-Regular.ttf",
	"assets/fonts/Raleway-Light.ttf",
	"/"
]


// addToCache
const addSongsToCache = (cache) => {
	const randomSongNum = Math.round(Math.random() * NUMBER_OF_SONGS);
	cache.add(`./songs/allSongs/song${randomSongNum}.txt`).then(() => {
		resourcesInCache++;
		if (resourcesInCache < OFFLINE_SONGS) {
			addSongsToCache(cache);
		}
	})
		.catch(() => {
			// exit the loop if failed to cache too many times
			if (failedCaches < OFFLINE_SONGS * 3) {
				addSongsToCache(cache);
				failedCaches++;
			} else {
				console.error('A problem occured with caching resources');
			}
		})
}


self.addEventListener("install", (event) => {
	broadcast.postMessage('What is the number of offline songs?');
	broadcast.onmessage = (event) => {
		OFFLINE_SONGS = Number(event.data);
		caches.open(SONG_CACHE_NAME).then(cache => {
				if (resourcesInCache < OFFLINE_SONGS) {
					addSongsToCache(cache);
				}
			})
	};
	failedCaches = 0;
	//add songs to song-cache
	event.waitUntil(
		caches.open(SONG_CACHE_NAME).then(cache => {
			// check cache size
			cache.keys().then((innerKeys) => {
				resourcesInCache = innerKeys.length;
				addSongsToCache(cache);
			});
		})
	)
	event.waitUntil(
		caches.open(GENERAL_CACHE_NAME).then(cache => {
			cache.addAll(files);
		})
	)
})

self.addEventListener("fetch", (event) => {
	if (!event.request.url.includes('allSongs')) {
		// Temporary disable caching
		event.respondWith(
			caches.open(GENERAL_CACHE_NAME).then(cache => {
				return cache.match(event.request.url).then(response => {
					return response || fetch(event.request.url);
				})
			}))
	} else {
		event.respondWith((async () => {
			cache = await caches.open(SONG_CACHE_NAME);
			const innerKeys = await cache.keys();
			if (innerKeys[0]) {
				const newSong = innerKeys[0];
				const newSongResponse = await cache.match(newSong.url);
				cache.delete(newSong);
				resourcesInCache = innerKeys.length - 1;
				addSongsToCache(cache);
				return newSongResponse;
			} else {
				try {
					const randomSongNum = Math.round(Math.random() * NUMBER_OF_SONGS);
					onlineRes = await fetch(`./songs/allSongs/song${randomSongNum}.txt`);
					addSongsToCache(cache);
					return onlineRes;
				} catch (error) {
					return new Response("Something went wrong", { status: 502, error: "Unable to  connect to the internet" })
				}

			}
		})())
	}
})


// clear old caches
self.addEventListener('activate', event => {
	console.log('activated');
	failedCaches = 0;
	event.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.map(name => {
					if (name !== SONG_CACHE_NAME && name !== GENERAL_CACHE_NAME) {
						return caches.delete(name)
					}
				})
			)
		})
	)
})

