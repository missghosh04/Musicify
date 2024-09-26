let currentSong = new Audio;
let songs;
let currfolder;
async function getsongs(folder) {
  currfolder = folder
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
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

  let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
  songul.innerHTML = ""
  for (const song of songs) {
    songul.innerHTML = songul.innerHTML + `<li>
                            <img class="invert" src="music.svg" alt="" srcset="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Soumi Ghosh</div>
                            </div>
                            <div class="playnow">
                                <div>Play now</div>
                                <img class="invert" src="playnow.svg" alt="">
                            </div>
                            
                        </li>`;
  }
  // attach an eventlistner every song
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", element => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
    })
  })
  return songs
}

const playMusic = (track, pause = false) => {
  //   let audio=new Audio("/songs/"+ track)
  currentSong.src = `/${currfolder}/` + track
  if (!pause) {
    currentSong.play()
    play.src = "pause.svg"
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 /00:00";
}

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}
async function displayalbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a")
  let array = Array.from(anchors)


  for (let i = 0; i < array.length; i++) {
    const e = array[i];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0]
      // get the meta data of the folder
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.JSON`)
      let response = await a.json();

      document.querySelector(".cardcontainer").innerHTML = document.querySelector(".cardcontainer").innerHTML + `<div data-folder=${folder} class="card">
                        <div class="play">
                            <img src="play.svg" alt="" srcset="">

                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
    }
  }
  // load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      await getsongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0]);
    })

  })



}
async function main(params) {

  // get the list of all songs
  await getsongs("songs/Laila_Majnu")
  playMusic(songs[0], true)
  //  diplay all the albums on the page
  displayalbums()
  let play = document.getElementById("play");
  // Attach en event lisntener to play ,next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    }
    else {
      currentSong.pause();
      play.src = "play.svg";
    }
  })
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  }
  )
  // add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let perecent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    document.querySelector(".circle").style.left = perecent + "%"
    currentSong.currentTime = (currentSong.duration * perecent) / 100
  }
  )
  // add an event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  }
  )
  // add an eventlistener to close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  }
  )
  // add eventlistener to previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])


    //  the purpose of [0] is to retrieve the single element (the filename) from the array.
    //  slice can start from begining 0 1 2 3 4 5 or back -1 -2 -3 -4 -5 so here -1 or 4 equivalent
    if (index - 1 >= 0) {
      playMusic(songs[index - 1])
    }

  }
  )
  // add eventlistener to previous
  next.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])


    //  the purpose of [0] is to retrieve the single element (the filename) from the array.
    //  slice can start from begining 0 1 2 3 4 5 or back -1 -2 -3 -4 -5 so here -1 or 4 equivalent
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1])
    }
  }
  )

  //  add an event in volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = e.target.value / 100
  }
  )

  // it’s good to ensure consistency even when a song ends or is manually paused from another source.
  currentSong.addEventListener("play", () => {
    play.src = "pause.svg";
  });
  currentSong.addEventListener("pause", () => {
    play.src = "play.svg";
  });
  //mute button
  document.querySelector(".volume>img").addEventListener("click", (e) => {

    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = .10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  }
  )
}
main()
