const fs = require('fs');
const albumIndex = ['Speak Now', '1989', 'Midnights', 'Taylor Swift', 'Red', 'Evermore', 'Reputation', 'The Tortured Poets Department', 'Fearless', 'Folklore', 'Lover']

const doFetch = async (url) => {
    let tries = 0;
    let reponse = await fetch(url);
    // console.log(reponse);
    while (!reponse.ok && reponse.status >= 500 && tries < 5) {
        reponse = await fetch(url);
        tries++;
    }
    console.log(tries);
    // if retriving the song lyrics after five tries is impossible, show error message
    if (!reponse.ok) {
        console.log(`something went wrong. Error code: ${reponse.status}`);
    }
    const result = await reponse.json();
    return result;
}

const saveSongs = async () => {
    const songs = await doFetch(`https://taylor-swift-api.vercel.app/api/songs`);
    
    for (let s = 0; s < songs.length; s++) {
        fs.writeFile(`./songs/allSongs/song${s}.txt`, songs[s].lyrics , (error) => {
            if (error) {
                console.log(error);
            }
        })
    }
    console.log('all initiated')
}

// create directories because I also wanted something ordered and I'm lazy😜
// for (let i = 0; i < 11; i++) {
//     fs.mkdir(`./songs/${albumIndex[i]}`, (error) => {error ? console.log(error) : ''})
// }


saveSongs();