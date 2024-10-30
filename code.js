let lyrics;
let uniqueLyrics = [];
let minutesLeft = 10;
let secondsLeft = 13;
let timerInterval;
let isPaused = false;
const restartIcon = `<svg viewBox="0 0 31 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="restart-icon">
<path d="M10.6962 22.6168C10.0167 22.1429 9.08169 22.3096 8.60777 22.989C8.13385 23.6685 8.3005 24.6035 8.97998 25.0775L10.6962 22.6168ZM4.49195 13.2169L3.12185 13.8275C3.29985 14.2269 3.64328 14.5287 4.06222 14.654C4.48117 14.7793 4.93393 14.7155 5.30196 14.4794L4.49195 13.2169ZM9.25288 11.9445C9.95013 11.4971 10.1527 10.5692 9.70536 9.87197C9.258 9.17472 8.33011 8.97213 7.63285 9.41949L9.25288 11.9445ZM3.62352 7.58326C3.2863 6.82657 2.39952 6.48653 1.64283 6.82375C0.886143 7.16097 0.546099 8.04776 0.883319 8.80444L3.62352 7.58326ZM7.82475 7.81245C11.1207 3.0868 17.7752 1.95092 22.7096 5.3925L24.4258 2.93188C18.1947 -1.41411 9.6508 -0.0498022 5.36413 6.09625L7.82475 7.81245ZM22.7096 5.3925C27.644 8.83407 28.877 15.4712 25.581 20.1969L28.0417 21.9131C32.3283 15.767 30.6569 7.27786 24.4258 2.93188L22.7096 5.3925ZM25.581 20.1969C22.285 24.9225 15.6306 26.0584 10.6962 22.6168L8.97998 25.0775C15.2111 29.4234 23.755 28.0591 28.0417 21.9131L25.581 20.1969ZM5.99078 13.2762C6.06623 11.3694 6.66341 9.47753 7.82475 7.81245L5.36413 6.09625C3.86274 8.24888 3.0904 10.6993 2.99313 13.1576L5.99078 13.2762ZM7.63285 9.41949L3.68194 11.9544L5.30196 14.4794L9.25288 11.9445L7.63285 9.41949ZM0.883319 8.80444L3.12185 13.8275L5.86206 12.6063L3.62352 7.58326L0.883319 8.80444Z" fill="var(--bold-text)"/>
</svg>
`

/**
 * @param {Array} chosenAlbums deafult: empty arry. The names of 
 * all the albums the song can be from (filtering)
 */
const getRandomSongLyrics = async () => {
    let response = await fetch(`./songs/allSongs/randomSong`);
    // if retriving the song lyrics after five tries is impossible, show error message
    if (!response.ok) {
        console.error(`fetch failed. Response status: ${response.status}`);
        if (navigator.onLine) {
            customAlert(document.querySelector('#no-song'));
        } else {
            customAlert(document.querySelector('#no-internet'));
        }
    }
    const result = await response.text();
    lyrics = result.split(/[ (/\n)]/g);
    // TODO: make sure DOM is ready before trying to change it
    createWordElements();
    // activate input and start game
    document.getElementById('guess').setAttribute('placeholder', 'Guess the lyrics');
    document.getElementById('guess').readOnly = false;
    document.getElementById('guess').classList.remove('disabled');
    document.getElementById('guess').addEventListener('input', onInput);
    document.getElementById('pause-btn').addEventListener('click', () => customAlert(document.querySelector("#pause-text")));
    document.getElementById('word-amount').innerText = `0/${lyrics.length}`;
    document.getElementById('instructions-btn').addEventListener('click', () => customAlert(document.querySelector("#instructions-text")))
    document.getElementById('give-up').addEventListener('click', finishGame);
    document.querySelector('.score').addEventListener('click', (e) => e.currentTarget.classList.toggle('hidden'))

    // pause the game when user changes tabs
    document.addEventListener("visibilitychange", changeVisibility);


    // activate timer
    console.log(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    isPaused = false;
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
    console.log(document.querySelectorAll('.black'));
    if (document.querySelectorAll('.black').length >= lyrics.length) {
        customAlert(document.querySelector(".black-screen"));
        document.querySelector(".text").innerText = 'You Won!';
        document.querySelector(".black-screen .continue").remove();
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

const customAlert = (wrapper) => {
    if (!isPaused) {
        isPaused = true;
        console.log(timerInterval);
        clearInterval(timerInterval);
        // wrapper.querySelector('.text').innerText = text;
        let promise = new Promise((resolve, reject) => {
            wrapper.addEventListener('click', function onClickWrapper (event) {
                const classList = event.target.classList;
                if (classList.contains('close-btn')) {
                    resolve(true);
                } else if (classList.contains('start-over')) {
                    resolve(false);
                    restart();
                }
                event.target.removeEventListener("click", onClickWrapper);
            });
        });
        promise.then((isStartTimer) => {
            wrapper.style.display = 'none';
            if (isStartTimer) {timerInterval = setInterval(updateTimer, 1000);}
            isPaused = false;
        })
        wrapper.style.display = 'block';
        return (promise);
    }
}


/*-------------- restart ------------------ */
const restart = () => {
    lyrics = [];
    uniqueLyrics = [];
    minutesLeft = 10;
    secondsLeft = 13;
    console.log('clearInterval restart');
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
    document.querySelector('.score').style.pointerEvents = 'all';
    document.getElementById('pause-btn').style.pointerEvents = 'all';
    getRandomSongLyrics();
}

// install service worker
navigator.serviceWorker.register('./serviceWorker.js').then((registration) => {
    console.log('service worker registered');
});

// start the program
getRandomSongLyrics();
// handle dark mode
window.addEventListener("load", () => {
    // detect user preferenct
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add("dark");
        document.getElementById("dark-mode-input").checked = false;
    }



    document.getElementById("dark-mode-input").addEventListener("change", () => {
        document.documentElement.classList.toggle("dark");
    })
})