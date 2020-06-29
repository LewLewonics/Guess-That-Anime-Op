const anime_opening_video = document.getElementById('anime-opening-video');
const anime_title = document.getElementById('title');
const song_info = document.getElementById('song-info');
const anime_title_dropdown = document.getElementById('anime-list')
const timerEl = document.getElementById('time');
const opening_block = document.getElementById('block');
const queue_value = document.getElementById('queue');
const current_songEl = document.getElementById('currentSong');
const search = document.getElementById('filterInput');
const correctAnswers = document.getElementById('correct');
const video_player = document.getElementById('video-player');
const play_btn = document.getElementById('play-btn');
const play_area = document.getElementById('video-data')

const timer = 22;

let correct = 0;
let current_time = 22;
let startTime;
let endTime;

const playThroughs = 2;
let playThrough = playThroughs;
let anime_list = [];
let opening_list = [];
let json_data = [];
let normal_case_list = [];

let queue = [];
let current_song = 0;

async function fetchOpenings() {
    const res = await fetch('./js/data.json');
    const data = await res.json();
    data.forEach(anime => {
        json_data.push(anime);
        opening_list.push(anime.source.toUpperCase());
        normal_case_list.push(anime.source);
    })
    //Filter Out repeats
    anime_list = Array.from(new Set(opening_list))
    normal_case_list = Array.from(new Set(normal_case_list));
}

function lookupOpening(anime) {
    anime = anime.toUpperCase();
    //Get the indexes of a shows entry
    let initialIndex = opening_list.indexOf(anime);
    if (initialIndex == -1) return -1;

    let numberOfEntries = 1;
    while (opening_list[initialIndex] == opening_list[initialIndex+numberOfEntries])
    {
        numberOfEntries++;
    }
    console.log(`${anime} is in indecies ${initialIndex}-${initialIndex+numberOfEntries-1}`)

    //Return a random number from InitialIndex to numOfEntries
    const random_index = Math.floor(Math.random() * ((initialIndex+numberOfEntries-1) - initialIndex + 1) + initialIndex);
    console.log(random_index);
    return random_index;
}

async function playOpening(song_index) {
    const file = json_data[song_index].file;
    const url = `https://openings.moe/video/${file}.mp4`
    console.log(url);
    let video = document.getElementById('video');
    let source = document.createElement('source');

    opening_block.classList.remove('inactive');
    anime_title.classList.add('inactive');
    song_info.classList.add('inactive');
    video_player.classList.remove('correct');
    search.value = '';
    search.focus();

    source.setAttribute('src', url);
    video.appendChild(source);
    await setTimeout(()=>{

        source.setAttribute('src', url); 
    
        video.load();
        video.play();
        current_time = timer;
        playThrough = playThroughs;
        setTimeout(()=> {
            getTimeframe(video.duration);
            if ((!Number.isFinite(startTime)) || Number.isNaN(startTime)) { 
                video.currentTime = 0;
                startTime = 0;
            }
            else {
                video.currentTime = Math.floor(startTime);
            }
            timerEl.classList.remove('inactive');
            timerEl.innerHTML = '';
            
        },1000)
    },5000)
}

function fillQueue() {
    const queSize = 10;
    for (let i=0; i<queSize; i++) {
        queue[i] = anime_list[Math.floor(Math.random() * ((anime_list.length - 1) + 1))];
    }
    console.log(queue)
}

function emptyQueue() {
    while (queue.length != 0) {
        queue.pop();
    }
}

function showOpening() {
    opening_block.classList.add('inactive');
    anime_title.classList.remove('inactive');
    song_info.classList.remove('inactive');
    timerEl.classList.add('inactive');
    video.currentTime = Math.floor(startTime);
    video.play();
}

function getTimeframe(duration) {
    startTime = Math.floor(Math.random() * ((duration - (timer+2)) - 0 + 1) + 0);
    endTime = startTime + timer;
    console.log('Start:', startTime)
    console.log('End:', endTime)
}

function filterAnimeList() {
    //Get Value of input
    let filterValue = document.getElementById('filterInput').value.toUpperCase();
    let anime = anime_title_dropdown.getElementsByTagName('li');
    
    for (let i=0; i<anime.length; i++) {
        if (anime[i].innerHTML.toUpperCase().indexOf(filterValue) > -1 && filterValue.length > 1) {
            anime[i].style.display = 'block';
        } else {
            anime[i].style.display = 'none';
        }
    }
}

function revealOpening(song_index) {
    const {source='Uknown', title='Unknown', song='uknown'} = json_data[song_index];
    anime_title.innerHTML = `${source} - ${title}`;
    song_info.innerHTML = `Title: ${song.title} <br> Artist: ${song.artist}`
}

function gameLoop() {

    if (current_song == queue.length) {
        emptyQueue();
        return;
    }

    queue_value.innerHTML = queue.length;
    current_songEl.innerHTML = current_song+1;

    const song_index = lookupOpening(queue[current_song]);
    if (song_index == -1) return;
    playOpening(song_index);
    revealOpening(song_index);
} 

function checkAnswer() {
    console.log("Search", search.value)
    console.log("Queue", queue.current_song)
    if (search.value.toUpperCase() == queue[current_song].toUpperCase()) {
        correct++;
        correctAnswers.innerHTML = correct;
        video_player.classList.add('correct');
    }
}

async function mainFunc() {
    play_area.classList.remove('inactive');
    play_btn.style.display = 'none';
    
    await fetchOpenings();
    fillQueue();
    gameLoop();
    setInterval(()=> {

        if (playThrough == 0) {
            video.querySelector('source').remove();
            video.pause();
            current_song++;
            playThrough--;
            gameLoop();
            return;
        }
        if (current_time == 0) {
            showOpening();
            playThrough--;
            if (playThrough == 1 ) {
                checkAnswer();
            }
            current_time=timer;
        }

        current_time--;
        timerEl.innerText = current_time;
    }, 1000)
}

//Event Listeners 
document.getElementById('filterInput').addEventListener('keyup', filterAnimeList);

const anime_dropdown = anime_title_dropdown.querySelectorAll('li');
anime_dropdown.forEach(anime => {
    anime.addEventListener('click', e => {
        let filterValue = document.getElementById('filterInput');
        filterValue.value = e.target.innerHTML;
        anime_dropdown.forEach(show => show.style.display = 'none');
    });
});

play_btn.addEventListener('click', mainFunc);
