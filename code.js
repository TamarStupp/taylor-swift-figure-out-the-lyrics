let lyrics;
let uniqueLyrics = [];
let minutesLeft = 10;
let secondsLeft = 0;
let timerInterval;

const getRandomSongName = async () => {
    const url = `https://taylor-swift-api.sarbo.workers.dev/songs`;
    const reponse = await fetch(url, {
        "method": "GET",
    });
    const result = await reponse.json();
    const randomNum = Math.floor(Math.random() * result.length)
    const currentSongId = result[randomNum].song_id;
    getSongLyrics(currentSongId);
}

const getSongLyrics = async (currentSongId) => {
    const reponse = await fetch(`https://taylor-swift-api.sarbo.workers.dev/lyrics/${currentSongId}`);
    const result = await reponse.json();
    lyrics = result.lyrics.split(/[ (/\n)]/g);
    createWordElements();
    // activate input
    document.getElementById('guess').setAttribute('placeholder', 'Guess the lyrics');
    document.getElementById('guess').readOnly = false;
    document.getElementById('guess').classList.remove('disabled');
    document.getElementById('guess').addEventListener('input', onInput);

    // activate timer
    timerInterval = setInterval(updateTimer, 1000)
}

const createWordElements = () => {
    let wordDiv;
    let sterileWord;
    for (let index in lyrics) {
        sterileWord = sterilize(lyrics[index]);
        if (!sterileWord) {
            lyrics.splice(index, 1);
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
    let extractLettersRegex = /[a-z0-9]*/gi;
    return (value.match(extractLettersRegex).join('').toLowerCase()) 
}

const onInput = (event) => {
    const inputValue = event.currentTarget.value;
    // Check for win
    if (document.querySelectorAll('.black').length === lyrics.length) {
        alert('you won!')
    }

    // uniqueLyrics is sterile
    for (let word of uniqueLyrics) {
        if (sterilize(inputValue) === word) {
            document.querySelectorAll(`[data-word="${word}"]`).forEach((el) => {
                el.classList.add("black");
            });
            uniqueLyrics.splice(uniqueLyrics.indexOf(word), 1)
            document.getElementById('guess').value = '';
            break;
        }
    }
}

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


const finishGame = () => {
    document.getElementById('timer').classList.remove('end-of-time');
    clearInterval(timerInterval);
    document.querySelectorAll('.word').forEach(el => {el.classList.add('red')});
    alert("Time's up");
}

getRandomSongName();


