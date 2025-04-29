let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds)) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;

}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML +
            `<li>
             <img class="invert" src="img/music.svg" alt="">
                    <div class="info ">
                        <div>${song.replaceAll("%20", " ")} </div>
                        <div>Arpit</div>
                    </div>
                    <div class="playnow">
                        <span>Play</span>
                    <div class="invert">
                        <img src="img/play.svg" alt="">
                    </div>
                    </div>
             </li>`
    }
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info>div").innerText)
        })
    })

    return songs
}
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.querySelector("img").src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".timeStamp").innerHTML = "00:00/00:00"
}

async function displayAlbums() {
    // let a = await fetch(`/songs/`)
    // let response = await a.text();
    // let div = document.createElement("div")
    // div.innerHTML = response;
    // let anchors = div.getElementsByTagName("a")
    let folders = ["krsna", "vibe" , "diljit"];
    for (let folder of folders) {
        try {
            let res = await fetch(`/songs/${folder}/info.json`);
            let json = await res.json();
            document.querySelector(".cardContainer").innerHTML += `
            <div data-folder="${folder}" class="card">
                <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="48" fill="#1fdf64" />
                    <polygon points="40,30 70,50 40,70" fill="black" />
                </svg>
                <img src="/songs/${folder}/cover.jpeg" alt="">
                <h3>${json.title}</h3>
                <p>${json.description}</p>
            </div>`;
        } catch (e) {
            console.error(`Failed to load ${folder}`, e);
        }
    }


    // let cardContainer = document.querySelector(".cardContainer")
    // let array = Array.from(anchors)
    // for (let i = 0; i < array.length; i++) {
    //     const e = array[i];
    //     if (e.href.includes("/songs/")) {
    //         let folder = e.href.split("/").slice(-1)[0]
    //         let a = await fetch(`songs/${folder}/info.json`)
    //         let response = await a.json();
    //         cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
    //                     <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    //                         <circle cx="50" cy="50" r="48" fill="#1fdf64" />
    //                         <polygon points="40,30 70,50 40,70" fill="black" />
    //                     </svg>
    //                     <img src="/songs/${folder}/cover.jpeg" alt="">
    //                     <h3>${response.title}</h3>
    //                     <p>${response.description}</p>
    //                 </div>`
    //     }
    // }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })

    })

}

async function main() {

    await getSongs("songs/vibe")
    playMusic(songs[0], true)

    await displayAlbums()

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.querySelector("img").src = "img/pause.svg"

        }
        else {
            currentSong.pause();
            play.querySelector("img").src = "img/play.svg"

        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".timeStamp").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".dot").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".dot").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    document.querySelector(".ham").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-500%"
    })

    back.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {

            playMusic(songs[index - 1])
        }

    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {

            playMusic(songs[index + 1])
        }
    })

    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = e.target.value / 100
    })

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;

        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = .50;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 50;
        }
    })

}
main()
