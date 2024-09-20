let folder;
let songs = [];
let audio;
let allSongsContainer = document.getElementById("allSongs");
const playPaus = document.getElementById("play");
const next = document.getElementById("next");
const prev = document.getElementById("prev");
let timer; //handels current time updation;
let index = 0;//to iterate the array of song
let closeB = document.getElementById("close");//closing a card button
const list = allSongsContainer.getElementsByTagName("ul")[0];
let speed = 1;
let loop = false;


async function scanSongs(folder="Songs") {
   let scan = await fetch(`http://127.0.0.1:5500/${folder}/`);
   let data = await scan.text();
   let songHtml = document.createElement("div")
   songHtml.innerHTML = data;

   let links = songHtml.getElementsByTagName("a");
   for (let i = 0; i < links.length; i++) {
      if (links[i].href.endsWith(".mp3")) {
         songs.push(links[i].href);
      }
   }

}

function greet() {
   let name;
   if (!localStorage.getItem("userName")) {
      name = window.prompt("Enter Your Name ");
      localStorage.setItem('userName', name);
      document.getElementById('greet').getElementsByTagName("span")[0].innerText = name;
   }
   else {
      document.getElementById('greet').getElementsByTagName("span")[0].innerText = localStorage.getItem('userName');

   }
}
function setFolder(event){
   folder = event.getAttribute("name");
   console.log(folder);
   
   
}

function controlSpeed() {
   if (speed == 2) {
      speed = 0.5;
   }
   else {
      speed += 0.5;
   }
   audio.playbackRate = speed;
   document.getElementById("speed").innerText = speed + 'x';
}

function loopChanger() {
   if (loop == false) {
      loop = true;
      document.getElementById("loop").innerText="on";
   } else {
      loop = false;
      document.getElementById("loop").innerText="off";
   }

}

function timeConverter(time) {
   let seconds = Math.round(time % 60);
   if (seconds < 10) {
      seconds = '0' + seconds;
   }
   let minutes = Math.floor(time / 60);
   if (minutes < 10) {
      minutes = '0' + minutes;
   }
   let duration = `${minutes} : ${seconds}`;
   return duration;
}

function timeUpdate() {
   audio.addEventListener('timeupdate', () => {
      document.getElementById("currentTime").textContent = timeConverter(audio.currentTime);
      let left = (audio.currentTime / audio.duration) * 100;
      document.getElementById("seek").style.left = left + '%';
      if (audio.currentTime == audio.duration) {

         if(loop == 0){
            pauseSong();
         }
         else{
            nextSongF();
            
         }
      }
   })

   document.querySelector("#seekBar").addEventListener("click", (e) => {
      let pos = e.target.getBoundingClientRect();//pos gets the data about seek bar its width starting and ending point etc
      let clickP = (e.x - pos.left) / pos.width * 100;//clickP calculates the percentage of click position of entire seekBar width
      document.getElementById("seek").style.left = clickP + '%';
      let seekTime = clickP / 100 * audio.duration;//calculates audio duration to play after seek moves
      audio.currentTime = seekTime;

   })
}

function pauseSong() {
   playPaus.setAttribute("src", "image/play.svg");
   playPaus.classList.remove("playing");
   clearInterval(timer);
   audio.pause();
}

function playPausong() {
   if (playPaus.getAttribute("src").endsWith("play.svg")) {
      playPaus.setAttribute("src", "image/pause.svg");
      playPaus.classList.add("playing");
      setTimeout(() => {
         audio.play()
      }, 500)
      setTimeout(() => {
         document.getElementById("duration").innerText = timeConverter(audio.duration);
         timeUpdate();
      }, 300)
   }
}


function previousSongF() {
   pauseSong();
   if (index == 0) {
      index = songs.length - 1;
      audio = new Audio(songs[index]);
      playPausong();
   }
   else {
      index--;
      audio = new Audio(songs[index]);
      playPausong();
   }
}

function nextSongF() {
   pauseSong();
   if (index == songs.length - 1) {
      index = 0;
      audio = new Audio(songs[index]);
      playPausong();
   }
   else {
      index++;
      audio = new Audio(songs[index]);
      playPausong();
   }
}



async function main() {
   greet();
   await scanSongs();
   audio = new Audio(songs[index]);
   playPaus.addEventListener("click", () => {
      if (playPaus.classList.contains("playing")) {
         console.log(index + " " + audio);
         pauseSong();
      }
      else {
         console.log(index + " " + audio);
         playPausong();
      }
   })

   //to play previous song
   prev.addEventListener("click", () => {
      previousSongF();
   })

   //to play next song
   next.addEventListener("click", () => {
      nextSongF();
   })
   function openAPlayList() {
      document.querySelectorAll(".playList").forEach(element => {
         if (element != allSongsContainer) {
            element.classList.add("none");

         }
         list.classList.remove("none");
         closeB.classList.remove("none");
         document.getElementsByClassName("card")[0].style.flexDirection = "row";

      });
   }
   function hideAPlayList() {
      document.querySelectorAll(".playList").forEach(element => {
         if (element != allSongsContainer) {
            element.classList.toggle("none");
         }
         list.classList.add("none");
         closeB.classList.add("none")
         document.getElementsByClassName("card")[0].style.flexDirection = "column";

      });
   }
   let i = 0;
   for (let element of songs) {
      let song = document.createElement("li");
      element = element.replaceAll('%20', ' ');
      let indec = element.lastIndexOf('/') + 1;
      element = element.substr(indec);
      element = i + element;
      i++;
      song.innerHTML = element;
      list.appendChild(song);

   }


   allSongsContainer.addEventListener("click", () => {
      allSongsContainer.classList.add("opened");
      openAPlayList();

   })
   closeB.addEventListener("click", (e) => {
      e.stopPropagation();
      allSongsContainer.classList.remove("opened");
      hideAPlayList();
   });
   console.log('global index ' + index);


   Array.from(document.getElementById("songList").getElementsByTagName("li")).forEach(element => {//for selecting song from playlist
      element.addEventListener("click", () => {
         console.log('clicked');
         let currentIndex = '';

         for (let i = 0; i < element.textContent.length; i++) {
            let charCode = element.textContent.charCodeAt(i);

            if (charCode >= 48 && charCode <= 57) {
               currentIndex += element.textContent.charAt(i);

            }
            else {
               break;
            }
         }
         index = currentIndex;
         pauseSong();
         audio = new Audio(songs[currentIndex]);
         playPausong();

      })
   });
}
main();