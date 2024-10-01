let lyrics;
let uniqueLyrics = [];
let minutesLeft = 10;
let secondsLeft = 13;
let timerInterval;
let isPaused = false;
// songs without TTPD: 199
const NUMBER_OF_SONGS = 231;

const getRandomSongLyrics = async (currentSongId) => {
    // get random song number, max num is NUMBER_OF_SONGS
    const randomSongNum = Math.round(Math.random() * NUMBER_OF_SONGS);
    let tries = 0;
    let reponse = await fetch(`./songs/allSongs/song${randomSongNum}.txt`);
    while (!reponse.ok && reponse.status >= 500 && tries < 5) {
        reponse = await fetch(`./songs/allSongs/song${randomSongNum}.txt`);
        tries++;
    }
    // if retriving the song lyrics after five tries is impossible, show error message
    if (!reponse.ok ) {
        customAlert(document.querySelector('#no-song'));
    }
    const result = await reponse.text();
    lyrics = result.split(/[ (/\n)]/g);
    // make sure DOM is ready before trying to change it
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
    
    // sends response to the google form to register traffic
    registerEntrance();

    // activate timer
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
        wordDiv.innerText= lyrics[index];
        document.getElementById('lyrics-container').appendChild(wordDiv);
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
    document.getElementById('timer').classList.remove('end-of-time');
    // document.getElementById('pause-btn').removeEventListener('click', pause);
    document.getElementById('give-up').removeEventListener('click', finishGame);
    document.getElementById('give-up').style.display = "none";
    clearInterval(timerInterval);
    document.getElementById('guess').readOnly = true;
    document.getElementById('guess').classList.add('endGame');
    document.getElementById('guess').setAttribute('placeholder',"Game's Over!");
    document.getElementById('guess').value = '';
    document.querySelectorAll('.word:not(.black)').forEach(el => {el.classList.add('red')});
    document.getElementById('precent').innerText = `Success: ${Math.round(document.getElementsByClassName('black').length/lyrics.length * 100)}%`;
    document.querySelector('.score').classList.remove('hidden');
    document.querySelector('.score').style.pointerEvents = 'none';
    // customAlert("Time's up", document.querySelector(".black-screen"));
    document.removeEventListener("visibilitychange", changeVisibility);
    document.getElementById('pause-btn').style.pointerEvents = 'none';
}

const customAlert = (wrapper) => {
    if (!isPaused) {
        isPaused = true;
        clearInterval(timerInterval);
        // wrapper.querySelector('.text').innerText = text;
        let promise = new Promise((resolve, reject) => {
            wrapper.addEventListener('click', (event) => {
                if (event.target.classList.contains('close-btn')) {
                    wrapper.style.display = 'none';
                    resolve("next");
                }
            });
        });
        promise.then(() => {
            timerInterval = setInterval(updateTimer, 1000);
            isPaused = false;
        })
        wrapper.style.display = 'block';
        return(promise);
    }
}


// install service worker
navigator.serviceWorker.register('./serviceWorker.js').then((registration) => {
    console.log('service worker installed')
})

navigator.serviceWorker.ready.then(registration => {
    console.log('controller: ', navigator.serviceWorker.controller);
  });

navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('new service worker took control')
})

// start the program
getRandomSongLyrics()
