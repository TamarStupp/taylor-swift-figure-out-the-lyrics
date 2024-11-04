
const fsPromises = require('fs').promises;
const fs = require('fs');

let output = '';

let albumObj = {}

const getAlbumNames = async () => {
    const dirList = await fsPromises.readdir("./songs/");
    dirList.splice(dirList.indexOf('allSongs'), 1);
    dirList.map(async name => {
        output += `"${name}":`;
        output += `${fs.readdirSync(`./songs/${name}/`).length}`
        output += ',\n';
        albumObj[name] = fs.readdirSync(`./songs/${name}/`).length;
    });
    console.log(JSON.stringify(albumObj));
    fsPromises.writeFile("length-output.js", `const output = {${output}}`);
}

getAlbumNames();