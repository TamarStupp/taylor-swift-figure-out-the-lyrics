let lyrics;
let uniqueLyrics = [];
let minutesLeft = 10;
let secondsLeft = 13;
let timerInterval;
let isPaused = false;
let offlineSongs = localStorage.getItem('offlineSongs') || 5;
const restartIcon = `<svg viewBox="0 0 31 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="restart-icon">
<path d="M10.6962 22.6168C10.0167 22.1429 9.08169 22.3096 8.60777 22.989C8.13385 23.6685 8.3005 24.6035 8.97998 25.0775L10.6962 22.6168ZM4.49195 13.2169L3.12185 13.8275C3.29985 14.2269 3.64328 14.5287 4.06222 14.654C4.48117 14.7793 4.93393 14.7155 5.30196 14.4794L4.49195 13.2169ZM9.25288 11.9445C9.95013 11.4971 10.1527 10.5692 9.70536 9.87197C9.258 9.17472 8.33011 8.97213 7.63285 9.41949L9.25288 11.9445ZM3.62352 7.58326C3.2863 6.82657 2.39952 6.48653 1.64283 6.82375C0.886143 7.16097 0.546099 8.04776 0.883319 8.80444L3.62352 7.58326ZM7.82475 7.81245C11.1207 3.0868 17.7752 1.95092 22.7096 5.3925L24.4258 2.93188C18.1947 -1.41411 9.6508 -0.0498022 5.36413 6.09625L7.82475 7.81245ZM22.7096 5.3925C27.644 8.83407 28.877 15.4712 25.581 20.1969L28.0417 21.9131C32.3283 15.767 30.6569 7.27786 24.4258 2.93188L22.7096 5.3925ZM25.581 20.1969C22.285 24.9225 15.6306 26.0584 10.6962 22.6168L8.97998 25.0775C15.2111 29.4234 23.755 28.0591 28.0417 21.9131L25.581 20.1969ZM5.99078 13.2762C6.06623 11.3694 6.66341 9.47753 7.82475 7.81245L5.36413 6.09625C3.86274 8.24888 3.0904 10.6993 2.99313 13.1576L5.99078 13.2762ZM7.63285 9.41949L3.68194 11.9544L5.30196 14.4794L9.25288 11.9445L7.63285 9.41949ZM0.883319 8.80444L3.12185 13.8275L5.86206 12.6063L3.62352 7.58326L0.883319 8.80444Z" fill="var(--bold-text)"/>
</svg>
`;

// variables for filtering
const checkboxSvg = `<svg class="checkbox-svg" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="39" height="39" rx="12" fill="var(--checkbox-color)" stroke="var(--checkbox-stroke)" stroke-width="2"/>
<path class="v" d="M10 20.2269C13.5 22 14.7497 27.8264 14.7497 27.8264C14.7497 27.8264 20.5 16.5 30.5762 12" stroke="var(--checkbox-stroke)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
const songList = [
    ["Taylor Swift", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]],
	["Fearless", [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 89, 90, 91, 92, 93, 94]],
	["Speak Now", [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88]],
	["Red", [110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138,]],
	["1989", [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47]],
	["Reputation", [95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109]],
	["Lover", [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 177, 178, 179, 180, 181,]],
	["Folklore", [139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154,]],
	["Evermore", [182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198,]],
	["Midnights", [155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 199]],
	["The Tortured Poets Department", [200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231]]
]
const NUMBER_OF_SONGS = 232;

const songMap = new Map(songList);
let filteringAvailable = true;
let filteredAlbumsCopy = [];
let filteredAlbums = JSON.parse(localStorage.getItem('filterList')) || [...songMap.keys()];
let filteredStr = '';


const broadcast = new BroadcastChannel('offlineSongs');
/**
 * @param {Array} chosenAlbums deafult: empty arry. The names of 
 * all the albums the song can be from (filtering)
 */
const getRandomSongLyrics = async () => {
    let response = await fetchSong();
    const result = await response.text();
    lyrics = result.split(/[ (/\n)]/g);
    // TODO: make sure DOM is ready before trying to change it
    createWordElements();
    // activate input and start game
    document.getElementById('guess').setAttribute('placeholder', 'Guess the lyrics');
    document.getElementById('guess').readOnly = false;
    document.getElementById('guess').classList.remove('guess-disabled');
    document.getElementById('guess').addEventListener('input', onInput);
    document.getElementById('word-amount').innerText = `0/${lyrics.length}`;
    document.getElementById('give-up').addEventListener('click', finishGame);
    document.querySelector('.score').addEventListener('click', (e) => e.currentTarget.classList.toggle('hidden'))

    // pause the game when user changes tabs
    document.addEventListener("visibilitychange", changeVisibility);


    // activate timer
    timerInterval = setInterval(updateTimer, 1000);
    isPaused = false;
}

const fetchSong = async () => {
    let response;
    if (filteredAlbums.length >= songMap.size) {
        // no filtering needed
        const randomSongNum = Math.floor(Math.random() * NUMBER_OF_SONGS);
        response = await fetch(`./songs/allSongs/song${randomSongNum}.txt?filter=false`);
    } else {
        let pool = [];
        for (key of filteredAlbums) {
            console.log(key);
            if (songMap.get(key)) {
                pool.push(...songMap.get(key));
            } else {
                filteringAvailable = false;
            }
        }

        if (filteringAvailable) {
            const randomSongNum = Math.floor(Math.random() * pool.length);
            response = await fetch(`./songs/allSongs/song${pool[randomSongNum]}.txt?filter=true`);
        } else {
            localStorage.removeItem('filterList');
            console.log("Oops");
            const randomSongNum = Math.floor(Math.random() * NUMBER_OF_SONGS);
            response = await fetch(`./songs/allSongs/song${randomSongNum}.txt?filter=false`);
        }
    }
    
    // check for errors
    if (!response.ok) {
        console.error(`fetch failed. Response status: ${response.status}`);
        if (navigator.onLine) {
            customAlert(document.querySelector('#no-song'));
        } else {
            customAlert(document.querySelector('#no-internet'));
        }
    }
    return response;
}

const changeVisibility = (e) => {
    if (document.visibilityState !== "visible") {
        document.getElementById("pause-btn").click();
    }
}

const registerEntrance = async () => {
    // Don't register enterance if it's from localhost becasue I do tests on localhost
    if (!document.location.href.includes("127.0.0.1") && !document.location.href.includes("localhost")) {
        let newDate = new Date();
        let date = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`
        let time = `${String(newDate.getHours()).padStart(2, '0')}:${String(newDate.getMinutes()).padStart(2, '0')}`
        await fetch(
            'https://docs.google.com/forms/d/e/1FAIpQLSdlQMloARGShFuOMs-9UZDS2fqPa4JVVdsINhfdLGeZVIixYg/formResponse?' +
            new URLSearchParams({
                'usp': 'pp_url',
                'entry.80995540': date,
                'entry.869813470': time,
            }),
            {
                mode: 'no-cors',
                "method": "POST"
            }
        );
        console.log('registered');
    }
}

/*-------------- Create the word elements ------------------ */
const createWordElements = () => {
    let wordDiv;
    let sterileWord;
    for (let index in lyrics) {
        sterileWord = sterilize(lyrics[index]);
        // make sure the word is not empty or not a singer name
        while (sterileWord === '' || lyrics[index].includes('[') || lyrics[index].includes(']')) {
            lyrics.splice(Number(index), 1);
            if (index >= lyrics.length) {
                return;
            }
            sterileWord = sterilize(lyrics[index]);
        }
        wordDiv = document.createElement('div');
        wordDiv.setAttribute('data-word', sterileWord);
        wordDiv.classList.add('word');
        wordDiv.innerText = lyrics[index];
        document.getElementById('lyrics').appendChild(wordDiv);
        // Adds sterile words to uniqueLyrics
        if (!uniqueLyrics.includes(sterileWord)) {
            uniqueLyrics.push(sterileWord);
        }
    }
}

/*-------------- Removes all punctuation ------------------ */
const sterilize = (value) => {
    // chooses only small letters and numbers
    let extractLettersRegex = /[a-z0-9]*/gi;
    let returnValue = value.match(extractLettersRegex).join('').toLowerCase();
    // check for exclamation word - converting to Set to remove duplicates
    let exclamations = [... new Set(returnValue.match(/^ah|^oh|^yeah|^uh|^ooh|^oo/g))].join('');
    // change ooh to oh because it's confusing
    if (exclamations === 'ooh') { exclamations = 'oh' }
    return (exclamations || returnValue);
}

const onInput = (event) => {
    let inputValue = event.currentTarget.value;

    //  change ooh to oh
    if (inputValue == "ooh") {
        inputValue = "oh"
    }

    // uniqueLyrics is sterile
    for (let word of uniqueLyrics) {
        if (sterilize(inputValue) === word) {
            document.querySelectorAll(`[data-word="${word}"]`).forEach((el) => {
                el.classList.add("black");
                document.getElementById('word-amount').innerText = `${document.getElementsByClassName('black').length}/${lyrics.length}`
            });
            uniqueLyrics.splice(uniqueLyrics.indexOf(word), 1)
            document.getElementById('guess').value = '';
            break;
        }
    }

    // Check for win
    if (document.querySelectorAll('.black').length >= lyrics.length) {
        customAlert(document.querySelector("#win"));
        finishGame();
    }
}

/*-------------- update timer ------------------ */
const updateTimer = () => {
    if (secondsLeft <= 0) {
        if (minutesLeft === 0) {
            finishGame();
        } else {
            secondsLeft = 59;
            minutesLeft--;
        }
    } else {
        secondsLeft--;
    }
    // Add close to end of time animation
    if (secondsLeft === 10 && minutesLeft === 0) {
        document.getElementById('timer').classList.add('end-of-time');
    }
    document.querySelector('.timer').innerText = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
}

/*-------------- finish game ------------------ */
const finishGame = () => {
    // sends response to the google form to register traffic
    registerEntrance();
    document.getElementById('timer').classList.remove('end-of-time');
    document.getElementById('give-up').removeEventListener('click', finishGame);
    // document.getElementById('give-up').style.display = "none";
    document.getElementById('give-up').innerHTML = `<span>Restart</span>${restartIcon}`;
    document.getElementById('give-up').addEventListener('click', restart);

    clearInterval(timerInterval);
    document.getElementById('guess').readOnly = true;
    document.getElementById('guess').classList.add('endGame');
    document.getElementById('statistic').classList.add('endGame');
    document.getElementById('guess').setAttribute('placeholder', "Game's Over!");
    document.getElementById('guess').value = '';
    document.querySelectorAll('.word:not(.black)').forEach(el => { el.classList.add('red') });
    document.getElementById('precent').innerText = `Success: ${Math.round(document.getElementsByClassName('black').length / lyrics.length * 100)}%`;
    document.querySelector('.score').classList.remove('hidden');
    document.querySelector('.score').style.pointerEvents = 'none';
    // customAlert("Time's up", document.querySelector(".black-screen"));
    document.removeEventListener("visibilitychange", changeVisibility);
    document.getElementById('pause-btn').style.pointerEvents = 'none';
}


const customAlert = (wrapper, goBackTo) => {
    document.querySelector("body").style.overflow = 'hidden';
    // reset filter screen so changes will not be saved unless specifically told so.
    if (wrapper.id === 'filter') {
        filteredAlbumsCopy = [...filteredAlbums];
        let isAllChecked = true;
        for (el of document.querySelectorAll('.checkbox-input')) {
            if (!(filteredAlbums.includes(el.dataset.album))) {
                isAllChecked = false;
                el.checked = false;
            } else {
                el.checked = true;
            }
        }
        document.getElementById('choose-all-input').checked = isAllChecked;
        document.getElementById('album-num').innerText = filteredAlbums.length;
    }
    
    if (!isPaused) {
        isPaused = true;
        clearInterval(timerInterval);
        document.removeEventListener("visibilitychange", changeVisibility);
    }

    let promise = new Promise((resolve, reject) => {
        wrapper.addEventListener('click', function onClickWrapper (event) {
            const classList = event.target.classList;
            let isBtnPressed = false;
            if (classList.contains('close-btn')) {
                if (goBackTo) {
                    event.currentTarget.classList.add('none'); 
                    customAlert(goBackTo);
                } else {
                    resolve(true);
                }
                isBtnPressed = true;
            } 
            
            switch(event.target.id) {
                case ('start-over'): {
                    resolve(false);
                    restart();
                    isBtnPressed = true;
                    break;
                } case ("instructions-btn"): {
                    event.currentTarget.classList.add('none');
                    customAlert(document.querySelector("#instructions-text"), event.currentTarget);
                    isBtnPressed = true;
                    resolve(false);
                    break;
                } case ("settings-close-btn") : {
                    localStorage.setItem('offlineSongs', offlineSongs);
                    broadcast.postMessage({"offlineSongs": offlineSongs});
                    isBtnPressed = true;
                    resolve(true);
                    break;
                } case ("filter-close-btn"): {
                    if (goBackTo) {
                        event.currentTarget.classList.add('none'); 
                        customAlert(goBackTo);
                    } else {
                        resolve(true);
                    }
                    isBtnPressed = true;
                    filteredAlbums = [...filteredAlbumsCopy];
                    break;
                } case ("plus-btn"): {
                    if (offlineSongs < 30) {
                        offlineSongs++;
                        document.getElementById('num-of-offline-songs').innerText = offlineSongs;
                    }
                    break;
                } case ("minus-btn"): {
                    if (offlineSongs > 0) {
                        offlineSongs--;
                        document.getElementById('num-of-offline-songs').innerText = offlineSongs;
                    }
                    break;
                } case ("goto-filter"): {
                    event.currentTarget.classList.add('none');
                    customAlert(document.querySelector("#filter"), event.currentTarget);
                    isBtnPressed = true;
                    resolve(false);
                    break;
                } case ("filter-accept"): {
                    if (filteredAlbums.length > 0) {
                         document.getElementById("album-name").innerText = `The song is from one of the albums: ${filteredStr}`;
                        localStorage.setItem('filterList', JSON.stringify(filteredAlbums));
                        isBtnPressed = true;
                        restart();
                        resolve(false);
                    }
                    break;
                }
            }

            if (isBtnPressed) {
                event.currentTarget.removeEventListener("click", onClickWrapper);
            }
        });
    });
    promise.then((isStartTimer) => {
        wrapper.classList.add('none');
        if (isStartTimer) {timerInterval = setInterval(updateTimer, 1000);}
        document.addEventListener("visibilitychange", changeVisibility);
        isPaused = false;
        document.querySelector("body").style.overflow = 'auto';
    })
    wrapper.classList.remove('none');
    return (promise);
}


/*-------------- restart ------------------ */
const restart = () => {
    filteringAvailable = true;
    lyrics = [];
    uniqueLyrics = [];
    minutesLeft = 10;
    secondsLeft = 13;
    clearInterval(timerInterval);
    timerInterval = '';
    isPaused = false;
    document.getElementById('lyrics').innerHTML = '';
    document.getElementById('give-up').innerText = "give up";
    document.getElementById('precent').innerText = '';
    document.getElementById('give-up').removeEventListener('click', restart);
    document.querySelector('.timer').innerText = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
    document.getElementById('guess').readOnly = false;
    document.getElementById('guess').classList.remove('endGame');
    document.getElementById('statistic').classList.remove('endGame');
    document.querySelector('.score').style.pointerEvents = 'all';
    document.getElementById('pause-btn').style.pointerEvents = 'all'; 
    getRandomSongLyrics();
}

// install service worker
navigator.serviceWorker.register('./serviceWorker.js').then((registration) => {
    broadcast.onmessage = (event) => {
        console.log('window received message');
        if (event.data === 'get info') {
            broadcast.postMessage({"offlineSongs": offlineSongs, "numberOfSongs": NUMBER_OF_SONGS});
        }
        if (event.data === 'filtering failed') {
            if (navigator.onLine) {
                document.getElementById("album-name").innerText = 'There was a problem with filtering albums. Please try again later.';
            } else {
                document.getElementById("album-name").innerText = 'Filtering is unavailabe offline';
            }
            filteringAvailable = false;
        }
    }

});

// start the program
getRandomSongLyrics();
// handle dark mode
window.addEventListener("load", () => {
    //add event listeners
    document.getElementById('pause-btn').addEventListener('click', () => customAlert(document.querySelector("#pause-text")));
    document.getElementById('settings-btn').addEventListener('click', () => customAlert(document.querySelector("#settings")));
    // upade saved offline songs preference
    document.getElementById("num-of-offline-songs").innerText = offlineSongs;
    
    createFilterScreen();
    document.getElementById('change-albums')?.addEventListener("click", () =>customAlert(document.querySelector('#filter')));



    // detect user preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add("dark");
        document.getElementById("dark-mode-input").checked = false;
    }

    document.getElementById("dark-mode-input").addEventListener("change", () => {
        document.documentElement.classList.toggle("dark");
    })
})

const onFilterInput = (event) => {
    if (event.currentTarget.checked) {
        filteredAlbums.push(event.currentTarget.dataset.album);
    } else {
        // Delete every time the album appears
        while (filteredAlbums.indexOf(event.currentTarget.dataset.album) !== -1) {
            filteredAlbums.splice(filteredAlbums.indexOf(event.currentTarget.dataset.album), 1);   
        }
    }

    // truncate more than 3 albums
    // filteredStr = filteredAlbums.slice(0, 3).join(", ");
    // if(filteredAlbums.length > 3) {filteredStr += ` and ${filteredAlbums.length - 3} others.`}

    // dont truncate albums
    updateFilteredStr();

    // check if all boxes are selected
    if (!document.querySelector("input.checkbox-input:not(:checked)")) {
        updateFilteredStr("All");
        document.querySelector('#choose-all-input').checked = true;
    } else {
        document.querySelector('#choose-all-input').checked = false;
    }

    document.getElementById('album-num').innerText = filteredAlbums.length;
    document.getElementById('filter-accept').disabled = (filteredAlbums.length === 0); 
}

const onChooseAll = (event) => {
    filteredAlbums = [];
    const isChecked = event.currentTarget.checked;
    // update all elements to match
    for (element of document.querySelectorAll('.checkbox-input')) {
        element.checked = isChecked;
        if (isChecked) {
            filteredAlbums.push(element.dataset.album);
        }
    }
    // update filteredStr
    isChecked ? updateFilteredStr('All') : updateFilteredStr('none');

    document.getElementById('album-num').innerText = filteredAlbums.length;
    document.getElementById('filter-accept').disabled = (filteredAlbums.length === 0); 
}

const createFilterScreen = () => {
       let newEl;
       // add Choose all btn
       newEl = document.createElement('label');
       newEl.classList = "checkbox-container choose-all";
       newEl.id = 'choose-all';
       newEl.innerHTML = `
       <input class="choose-all-input" id="choose-all-input" type="checkbox">
       ${checkboxSvg}
       <span class='checkbox-text'>Choose All</span>`;
       newEl.querySelector('#choose-all-input').addEventListener('input', onChooseAll);
       document.getElementById('choice-container').appendChild(newEl);
       
       // add songs checkboxes
       let isAllChecked = true;
       for ([key, value] of songMap) {
           if (!(filteredAlbums.includes(key))) {
               isAllChecked = false;
           }

           newEl = document.createElement('label');
           newEl.classList.add("checkbox-container");
           newEl.innerHTML = `
               <input class="checkbox-input" type="checkbox" data-album="${key}" ${filteredAlbums.includes(key) ? "checked": ''}>
               ${checkboxSvg}
               <span class='checkbox-text'>${key}</span>`;
               newEl.querySelector('.checkbox-input').addEventListener('input', onFilterInput);
               document.getElementById('choice-container').appendChild(newEl);
        }
        document.getElementById('choose-all-input').checked = isAllChecked;
        isAllChecked ? updateFilteredStr("All") : updateFilteredStr();

        if (filteringAvailable) {
            document.getElementById("album-name").innerText = `The song is from one of the albums: ${filteredStr}`;
        } else {
            document.getElementById("album-name").innerText = 'There was a problem with filtering albums. Please try again.';    
        }
}

/**
 * 
 * @param {string} value - the value of filteredStr. If not defined, 
 * gets the albums names from filteredAlbums and orders them
 */
const updateFilteredStr = (value) => {
    if (value) {
        filteredStr = value;
    } else {
        const songsByOrder = [];
        for (key of songMap.keys()) {
            if (filteredAlbums.includes(key)) {
                songsByOrder.push(key);
            }
        }
        filteredStr = songsByOrder.join(', ') + '.';
    }
}


