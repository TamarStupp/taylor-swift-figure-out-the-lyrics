let OFFLINE_SONGS = 5;
// songs without TTPD: 199
let NUMBER_OF_SONGS = 232;
const VERSION = 2.4;
const SONG_CACHE_NAME = `songs-${VERSION}`;
const GENERAL_CACHE_NAME = `general-${VERSION}`;
const broadcast = new BroadcastChannel('offlineSongs');
let resourcesInCache = 0;
let failedCaches = 0;
const files = [
	"style.css",
	"index.html",
	"assets/TS.svg",
	"code.js",
	"assets/fonts/Monorale-Light.woff",
	"assets/fonts/Caveat-Regular.ttf",
	"assets/fonts/Raleway-Light.ttf",
	"assets/fonts/Raleway-Regular.ttf",
	"./"
]


// addToCache
const addSongsToCache = (cache) => {
	if (resourcesInCache < OFFLINE_SONGS) {
		const randomSongNum = Math.floor(Math.random() * NUMBER_OF_SONGS);
		cache.add(`./songs/allSongs/song${randomSongNum}.txt`)
			.then(() => {
				resourcesInCache++;
				addSongsToCache(cache);
			})
			.catch((error) => {
				// exit the loop if failed to cache too many times
				if (failedCaches < OFFLINE_SONGS * 3) {
					addSongsToCache(cache);
					failedCaches++;
				} else {
					console.error('A problem occured with caching resources');
					console.error(error);
				}
			})
	}
}


self.addEventListener("install", (event) => {
	broadcast.postMessage('get info');
	broadcast.onmessage = (event) => {
		let data = event.data;
		OFFLINE_SONGS = Number(data.offlineSongs);
		NUMBER_OF_SONGS = isNaN(Number(data.numberOfSongs)) ? NUMBER_OF_SONGS : Number(data.numberOfSongs);
		caches.open(SONG_CACHE_NAME).then(cache => {
			addSongsToCache(cache);
		})
	};
	failedCaches = 0;
	//add songs to song-cache when OFFLINE_SONGS changes
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
			for (file of files) {
				cache.add(file);
			}
			// cache.addAll(files);
		})
	)
})

self.addEventListener("fetch", (event) => {
	// disable caching if it's from localhost becasue I do tests on localhost
	if (!event.request.url.includes('allSongs')) {
		if (!self.location.href.includes("127.0.0.1") && !self.location.href.includes("localhost")) {
			event.respondWith(
				caches.open(GENERAL_CACHE_NAME).then(cache => {
					return cache.match(event.request.url).then(response => {
						return response || fetch(event.request.url);
					})
				}))
		} else {
			console.log('not caching js, css and html');
		}
	} else {
		if (new URL(event.request.url).searchParams.get("filter") === "false") {
			event.respondWith(getSongFromCache(event));
		} else {
			// try online first
			// at least 3 times
			let tries = 0;
			event.respondWith((async function () {
				let response;
				do {
					try {
						response = await fetch(event.request.url);
						return response;
					} catch (error) {
						tries++;
						if (tries === 2) {
							console.error(error);
							broadcast.postMessage('filtering failed')
							return await getSongFromCache(event, false);
						}
					}
				} while ((!response || !response.ok) && tries < 2);
			}()))
		}
	}
})


// clear old caches
self.addEventListener('activate', event => {
	console.log('activated');
	failedCaches = 0;
	// delete unused caches
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


const getSongFromCache = async (event, tryOnline = true) => {
	cache = await caches.open(SONG_CACHE_NAME);
	const innerKeys = await cache.keys();
	if (innerKeys[0]) {
		const newSong = innerKeys[0];
		const newSongResponse = await cache.match(newSong.url);
		cache.delete(newSong);
		resourcesInCache = innerKeys.length - 1;
		addSongsToCache(cache);
		return newSongResponse;
	} else if (tryOnline) {
		try {
			const randomSongNum = Math.round(Math.random() * NUMBER_OF_SONGS);
			onlineRes = await fetch(`./songs/allSongs/song${randomSongNum}.txt`);
			addSongsToCache(cache);
			return onlineRes;
		} catch (error) {
			return new Response("Something went wrong", { status: 502, error: "Unable to  connect to the internet" })
		}
	} else {
		return new Response("Something went wrong", { status: 502, error: "Cache is empty" })
	}
}
