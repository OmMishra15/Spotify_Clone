let currentsong = new Audio();
let songs;
let currfolder;
let play, prev, forw;
document.addEventListener("DOMContentLoaded", () => {
  play = document.querySelector("#play");
  prev = document.querySelector("#prev");
  forw = document.querySelector("#forw");
  main();
});

async function getnames(folder) {
  folder = folder.replace("../", "");
  currfolder = folder;
  let names = await fetch("songs.json");

  if (!names.ok) {
    console.error("Failed to fetch song list");
    return [];
  }

  let response = await names.json();

  songs = response[folder] || [];

  let savedtrack = localStorage.getItem("lastplayed");
  let savedtime = localStorage.getItem("lastime");

  if (savedtrack && songs.includes(savedtrack)) {
    playmusic(savedtrack, true);
    if (savedtime) {
      currentsong.currentTime = savedtime;
    }
  } else if (songs.length > 0) {
    playmusic(songs[0], true);
  }

  let songul = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML =
      songul.innerHTML +
      `<li data-filename="${song}">
                <img src="img/music.svg" class="invert" alt="">
            <div class="info">
                <div>${song.split("-")[0]}</div>
                <div>${song.split("-")[1]?.replaceAll(".mp3", " ").trim()}</div>
            </div>
            <div class="play">
                <img src="img/play.svg" class="invert" alt="">
            </div>
            </li>`;
    songul.classList.add("songlist");
  }

  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      let trackName = e.getAttribute("data-filename");
      playmusic(trackName);
    });
  });

  return songs;
}

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

const playmusic = (track, pause = false) => {
  // let audio=new Audio("/Spotify%20Clone/songs/" + track) ;
  currentsong.pause();

  localStorage.setItem("lastplayed", track);

  currentsong.src = `${currfolder}/${track}`;
  if (!pause) {
    currentsong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = track.replaceAll(".mp3", " ");
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayAlbums() {
  let name = await fetch("../songs.json");

  if (!name.ok) {
    console.error("Failed to fetch song list");
    return [];
  }

  let response = await name.json();
  let container = document.querySelector(".card-container");
  let array = Array.from(response);
  for (const folderPath in response) {
    let name = await fetch(`../${folderPath}/info.json`);
    if (name.ok) {
      let response = await name.json();
      container.innerHTML =
        container.innerHTML +
        `<div data-folder="../${folderPath}" class="card">
            <div class="card-img">
                <img
                  aria-hidden="false"
                  draggable="false"
                  loading="lazy"
                  src="../${folderPath}/cover.jpg"
                  data-testid="card-image"
                  alt=""
                  class="obD7rdENNc2n3fC0 whMS0fh9Ar4I_GaP WfGUvErXcmIzJo1c qIwhHcbG780QDz68"
                />
                <div class="playbuttn">
                  <svg
                    data-encore-id="icon"
                    role="img"
                    aria-hidden="true"
                    class="e-10180-icon"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"
                    ></path>
                  </svg>
                </div>
                </div>
                <h3>${response.Title}</h3>
                <p class="color">${response.Description}</p>
              </div>`;
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (element) => {
      let folderpath = e.getAttribute("data-folder");
      let songs = await getnames(folderpath);
      playmusic(songs[0]);
    });
  });
}

async function main() {
  songs = await getnames("Songs/Folder 1");
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      document.getElementById("play").src = "img/pause.svg";
    } else {
      currentsong.pause();
      document.getElementById("play").src = "img/play.svg";
    }
  });

  displayAlbums();

  currentsong.addEventListener("timeupdate", () => {
    localStorage.setItem("lastime", currentsong.currentTime);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentsong.currentTime
    )}/${secondsToMinutesSeconds(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  let seek = document.querySelector(".seek").addEventListener("click", (e) => {
    let percent = e.offsetX / e.target.getBoundingClientRect().width;
    document.querySelector(".circle").style.left = percent * 100 + "%";
    currentsong.currentTime = currentsong.duration * percent;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").classList.toggle("active");
  });

  document.querySelector(".ham").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("active");
  });

  prev.addEventListener("click", () => {
    let name = currentsong.src.split("/").slice(-1)[0].replaceAll("%20", " ");
    let index = songs.indexOf(name);
    if (index - 1 >= 0) {
      playmusic(songs[index - 1]);
    }
  });
  forw.addEventListener("click", () => {
    let name = currentsong.src.split("/").slice(-1)[0].replaceAll("%20", " ");
    let index = songs.indexOf(name);
    if (index + 1 < songs.length) {
      playmusic(songs[index + 1]);
    } else {
      playmusic(songs[0]);
    }
  });

  document
    .querySelector(".volume")
    .getElementsByTagName("input")[0]
    .addEventListener("input", (e) => {
      currentsong.volume = parseInt(e.target.value) / 100;
      if (currentsong.volume === 0) {
        document
          .querySelector(".volimg")
          .src.replaceAll("volume.svg", "mute.svg");
      }
      if (currentsong.volume > 0) {
        document.querySelector(".volimg").src = document
          .querySelector(".volimg")
          .src.replaceAll("mute.svg", "volume.svg");
      }
    });

  document.querySelector(".volimg").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replaceAll("volume.svg", "mute.svg");
      currentsong.volume = 0;
      document
        .querySelector(".volume")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replaceAll("mute.svg", "volume.svg");
      currentsong.volume = 0.1;
      document
        .querySelector(".volume")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}
