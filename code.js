let lyrics;
let uniqueLyrics = [];
let minutesLeft = 0;
let secondsLeft = 5;
let timerInterval;

const getRandomSongName = async () => {
    const url = `https://taylor-swift-api.sarbo.workers.dev/songs`;
    const reponse = await fetch(url, {
        "method": "GET",
    });
    const result = await reponse.json();
    const randomNum = Math.floor(Math.random() * result.length)
    const currentSongId = result[randomNum].song_id;
    console.log('song id: ' + currentSongId);
    getSongLyrics(128);
}

const getSongLyrics = async (currentSongId) => {
    const reponse = await fetch(`https://taylor-swift-api.sarbo.workers.dev/lyrics/${currentSongId}`);
    const result = await reponse.json();
    lyrics = result.lyrics.split(/[ (/\n)]/g);
    // make sure DOM is ready before trying to change it
    createWordElements();
    // activate input
    document.getElementById('guess').setAttribute('placeholder', 'Guess the lyrics');
    document.getElementById('guess').readOnly = false;
    document.getElementById('guess').classList.remove('disabled');
    document.getElementById('guess').addEventListener('input', onInput);
    document.getElementById('pause').addEventListener('click', pause);
    document.getElementById('word-amount').innerText = `0/${lyrics.length}`;

    // activate timer
    timerInterval = setInterval(updateTimer, 1000);
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
    // Check for win
    if (document.querySelectorAll('.black').length === lyrics.length) {
        customAlert('you won!', document.querySelector(".black-screen"))
    }

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
    clearInterval(timerInterval);
    document.querySelectorAll('.word').forEach(el => {el.classList.add('red')});
    document.getElementById('precent').innerText = `Success: ${Math.round(document.getElementsByClassName('black').length/lyrics.length * 100)}%`;
    // customAlert("Time's up", document.querySelector(".black-screen"));
}

const customAlert = (text, wrapper) => {
    wrapper.querySelector('.text').innerText = text;
    let promise = new Promise((resolve, reject) => {
        wrapper.addEventListener('click', (event) => {
            if (event.target.classList.contains('close-btn')) {
                wrapper.style.display = 'none';
                resolve("next");
            }
        });
    });
    wrapper.style.display = 'block';
    return(promise);
}
const pause = () => {
    clearInterval(timerInterval);
    customAlert('Game paused', document.querySelector(".black-screen")).then(() => {
        timerInterval = setInterval(updateTimer, 1000);
    })
}


// start the program
getRandomSongName();
// maybe add success precentages at the end?