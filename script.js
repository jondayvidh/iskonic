const audio           = document.getElementById('audio');
const playBtn         = document.getElementById('playBtn');
const playIcon        = document.getElementById('playIcon');
const progressBar     = document.getElementById('progressBar');
const lyricsContainer = document.getElementById('lyricsContainer');
const currentTimeEl   = document.getElementById('currentTime');
const durationEl      = document.getElementById('duration');
const volumeSlider    = document.getElementById('volumeSlider');
const muteBtn         = document.getElementById('muteBtn');
const muteIcon        = document.getElementById('muteIcon');
const shuffleBtn      = document.getElementById('shuffleBtn');
const prevBtn         = document.getElementById('prevBtn');
const nextBtn         = document.getElementById('nextBtn');
const repeatBtn       = document.getElementById('repeatBtn');
const repeatIcon      = document.getElementById('repeatIcon');

const iconPlay      = "M8 5v14l11-7z";
const iconPause     = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";
const iconMute      = "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.37.28-.78.52-1.25.71v2.06c1.12-.26 2.16-.76 3.06-1.43l1.67 1.67L21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z";
const iconVol       = "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z";
const iconRepeatAll = "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z";
const iconRepeatOne = "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-7h-1v3h-1v1h2V10z";

const repeatLabels = ['Repeat: Off', 'Repeat: All', 'Repeat: One'];

const playlist = ['pup-hymn.mp3'];

const lyricsData = [
    { time: 2,     text: "(Instrumental na Panimula)" },
    { time: 13,    text: "Sintang Paaralan" },
    { time: 15,    text: "Tanglaw ka ng bayan" },
    { time: 18,    text: "Pandayan ng isip ng kabataan" },
    { time: 24,    text: "Kami ay dumating nang salat sa yaman" },
    { time: 29,    text: "Hanap na dunong ay iyong alay" },
    { time: 35,    text: "Ang layunin mong makatao" },
    { time: 41,    text: "Dinarangal ang Pilipino" },
    { time: 47.5,  text: "Ang iyong aral, diwa" },
    { time: 51,    text: "Adhikang taglay" },
    { time: 53,    text: "PUP, aming gabay" },
    { time: 56,    text: "Paaralang dakila" },
    { time: 62,    text: "PUP, pinagpala" },
    { time: 68,    text: "Gagamitin ang karunungan" },
    { time: 74,    text: "Mula sa iyo, para sa bayan" },
    { time: 80.50, text: "Ang iyong aral, diwa" },
    { time: 84,    text: "Adhikang taglay" },
    { time: 86,    text: "PUP, aming gabay" },
    { time: 89,    text: "Paaralang dakila" },
    { time: 95,    text: "PUP, pinagpala" }
];

const lyricLines = [];

let repeatMode      = 0;
let shuffleOn       = false;
let lastActiveIndex = -1;
let currentTrack    = 0;

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function updateSliderFill(slider) {
    const min   = parseFloat(slider.min) || 0;
    const max   = parseFloat(slider.max) || 100;
    const ratio = (parseFloat(slider.value) - min) / (max - min);
    slider.style.setProperty('--fill', (Math.min(Math.max(ratio, 0), 1) * 100) + '%');
}

function updatePlayIcon() {
    playIcon.querySelector('path').setAttribute('d', audio.paused ? iconPlay : iconPause);
}

function updateMuteIcon() {
    muteIcon.querySelector('path').setAttribute('d', (audio.muted || audio.volume === 0) ? iconMute : iconVol);
}

function updateRepeatUI() {
    repeatBtn.classList.toggle('active', repeatMode > 0);
    repeatBtn.title = repeatLabels[repeatMode];
    repeatIcon.querySelector('path').setAttribute('d', repeatMode === 2 ? iconRepeatOne : iconRepeatAll);
}

function updateShuffleUI() {
    shuffleBtn.classList.toggle('active', shuffleOn);
    shuffleBtn.title = shuffleOn ? 'Shuffle: On' : 'Shuffle: Off';
}

function randomTrackIndex() {
    let next;
    do { next = Math.floor(Math.random() * playlist.length); }
    while (next === currentTrack);
    return next;
}

function loadTrack(index, autoPlay = false) {
    currentTrack = ((index % playlist.length) + playlist.length) % playlist.length;
    audio.src = playlist[currentTrack];
    lastActiveIndex = -1;
    lyricLines.forEach(l => l.classList.remove('active'));
    progressBar.value = 0;
    updateSliderFill(progressBar);
    currentTimeEl.innerText = '0:00';
    durationEl.innerText = '0:00';

    if (autoPlay) {
        audio.play().then(updatePlayIcon);
    } else {
        updatePlayIcon();
    }
}

playBtn.onclick = () => {
    if (audio.paused) audio.play();
    else audio.pause();
    updatePlayIcon();
};

prevBtn.onclick = () => {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
    } else {
        loadTrack(currentTrack - 1, !audio.paused);
    }
};

nextBtn.onclick = () => {
    if (shuffleOn && playlist.length > 1) {
        loadTrack(randomTrackIndex(), !audio.paused);
    } else {
        loadTrack(currentTrack + 1, !audio.paused);
    }
};

shuffleBtn.onclick = () => {
    shuffleOn = !shuffleOn;
    updateShuffleUI();
};

repeatBtn.onclick = () => {
    repeatMode = (repeatMode + 1) % 3;
    updateRepeatUI();
};

progressBar.oninput = () => {
    updateSliderFill(progressBar);
    if (!isFinite(audio.duration)) return;
    audio.currentTime = (progressBar.value / 100) * audio.duration;
};

volumeSlider.oninput = () => {
    audio.volume = volumeSlider.value;
    if (audio.muted && audio.volume > 0) audio.muted = false;
    updateSliderFill(volumeSlider);
    updateMuteIcon();
};

muteBtn.onclick = () => {
    audio.muted = !audio.muted;
    updateMuteIcon();
};

audio.onended = () => {
    if (repeatMode === 2) {
        audio.currentTime = 0;
        audio.play();
    } else if (shuffleOn && playlist.length > 1) {
        loadTrack(randomTrackIndex(), true);
    } else if (currentTrack < playlist.length - 1 || repeatMode === 1) {
        loadTrack(currentTrack + 1, true);
    } else {
        updatePlayIcon();
    }
};

audio.ontimeupdate = () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progress || 0;
    updateSliderFill(progressBar);
    currentTimeEl.innerText = formatTime(audio.currentTime);

    let currentLineIndex = -1;
    lyricsData.forEach((line, index) => {
        if (audio.currentTime >= line.time) currentLineIndex = index;
    });

    if (currentLineIndex !== lastActiveIndex && currentLineIndex !== -1) {
        lyricLines.forEach((line, index) => {
            const isActive = index === currentLineIndex;
            line.classList.toggle('active', isActive);
            if (isActive) {
                line.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        lastActiveIndex = currentLineIndex;
    }
};

audio.onloadedmetadata = () => {
    durationEl.innerText = formatTime(audio.duration);
};

lyricsData.forEach((line) => {
    const p = document.createElement('p');
    p.className = 'lyric-line';
    p.innerText = line.text;
    p.onclick = () => {
        audio.currentTime = line.time;
        audio.play();
        updatePlayIcon();
    };
    lyricsContainer.appendChild(p);
    lyricLines.push(p);
});

progressBar.step = 'any';
updateSliderFill(progressBar);
updateSliderFill(volumeSlider);
updateRepeatUI();
updateShuffleUI();
