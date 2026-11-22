const audio           = document.getElementById('audio');
const player          = document.getElementById('player');
const coverFrame      = document.getElementById('coverFrame');
const coverArt        = coverFrame.querySelector('.cover-art');
const songInfo        = document.querySelector('.song-info');
const lyricsContainer = document.getElementById('lyricsContainer');
const lyricsToggle    = document.getElementById('lyricsToggle');
const playBtn         = document.getElementById('playBtn');
const playIcon        = document.getElementById('playIcon');
const prevBtn         = document.getElementById('prevBtn');
const nextBtn         = document.getElementById('nextBtn');
const progressBar     = document.getElementById('progressBar');
const currentTimeEl   = document.getElementById('currentTime');
const durationEl      = document.getElementById('duration');
const volumeSlider    = document.getElementById('volumeSlider');
const muteBtn         = document.getElementById('muteBtn');
const muteIcon        = document.getElementById('muteIcon');
const volumeWaves     = document.querySelectorAll('#volumeMaxIcon .wave');

const splitLayout  = window.matchMedia('(max-width: 950px) and (orientation: landscape) and (max-height: 700px)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const iconPlay  = "M8 5v14l11-7z";
const iconPause = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";
const iconMute  = "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.37.28-.78.52-1.25.71v2.06c1.12-.26 2.16-.76 3.06-1.43l1.67 1.67L21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z";
const iconVol   = "M4 9.5h2.8l4.2-3.5a.6.6 0 0 1 1 .46v11.08a.6.6 0 0 1-1 .46L6.8 14.5H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z";

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

let currentTrack    = 0;
let lastActiveIndex = -1;
let userLyrics      = false;
let lyricsMode      = false;
let flipAnimations  = [];

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
    const silent = audio.muted || audio.volume === 0;
    muteIcon.querySelector('path').setAttribute('d', silent ? iconMute : iconVol);

    const level = silent ? 0 : audio.volume;
    volumeWaves.forEach((wave, i) => wave.classList.toggle('on', level > i / 3 - 0.001 && level > 0));
}

function setActiveLine(index) {
    lyricLines.forEach((line, i) => {
        line.classList.toggle('active', i === index);
        line.style.setProperty('--dist', Math.min(Math.abs(i - index), 4));
    });
    lastActiveIndex = index;
}

function scrollToActive(smooth) {
    const line = lyricLines[lastActiveIndex];
    if (!line || !lyricsContainer.clientHeight) return;
    const top = line.offsetTop - (lyricsContainer.clientHeight - line.offsetHeight) / 2;
    lyricsContainer.scrollTo({
        top,
        behavior: smooth && !reduceMotion.matches ? 'smooth' : 'auto'
    });
}

function applyLyricsMode(on, animate) {
    if (on === lyricsMode) return;

    const flip = animate && !reduceMotion.matches;
    let firstCover, firstInfo, firstRadius;

    if (flip) {
        firstCover  = coverFrame.getBoundingClientRect();
        firstInfo   = songInfo.getBoundingClientRect();
        firstRadius = parseFloat(getComputedStyle(coverArt).borderTopLeftRadius) || 0;
        flipAnimations.forEach(animation => animation.cancel());
    }

    lyricsMode = on;
    player.classList.toggle('lyrics-mode', on);
    lyricsToggle.setAttribute('aria-pressed', String(on));
    lyricsToggle.setAttribute('aria-label', on ? 'Hide lyrics' : 'Show lyrics');
    scrollToActive(false);

    if (!flip) return;

    const lastCover  = coverFrame.getBoundingClientRect();
    const lastInfo   = songInfo.getBoundingClientRect();
    const lastRadius = parseFloat(getComputedStyle(coverArt).borderTopLeftRadius) || 0;
    const sx = firstCover.width  / lastCover.width;
    const sy = firstCover.height / lastCover.height;
    const timing = { duration: 560, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' };

    flipAnimations = [
        coverFrame.animate([
            { transformOrigin: '0 0', transform: `translate(${firstCover.left - lastCover.left}px, ${firstCover.top - lastCover.top}px) scale(${sx}, ${sy})` },
            { transformOrigin: '0 0', transform: 'translate(0, 0) scale(1, 1)' }
        ], timing),
        coverArt.animate([
            { borderRadius: `${firstRadius / sx}px` },
            { borderRadius: `${lastRadius}px` }
        ], timing),
        songInfo.animate([
            { transform: `translate(${firstInfo.left - lastInfo.left}px, ${firstInfo.top - lastInfo.top}px)` },
            { transform: 'translate(0, 0)' }
        ], timing)
    ];
}

function syncLayout() {
    applyLyricsMode(splitLayout.matches ? true : userLyrics, false);
    scrollToActive(false);
}

function loadTrack(index, autoPlay = false) {
    currentTrack = ((index % playlist.length) + playlist.length) % playlist.length;
    audio.src = playlist[currentTrack];
    setActiveLine(-1);
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

nextBtn.onclick = () => loadTrack(currentTrack + 1, !audio.paused);

lyricsToggle.onclick = () => {
    userLyrics = !userLyrics;
    applyLyricsMode(userLyrics, true);
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

audio.onloadedmetadata = () => {
    durationEl.innerText = formatTime(audio.duration);
};

audio.ontimeupdate = () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progress || 0;
    updateSliderFill(progressBar);
    currentTimeEl.innerText = formatTime(audio.currentTime);

    const currentLineIndex = lyricsData.reduce((found, line, i) => audio.currentTime >= line.time ? i : found, -1);

    if (currentLineIndex !== lastActiveIndex && currentLineIndex !== -1) {
        setActiveLine(currentLineIndex);
        scrollToActive(true);
    }
};

audio.onended = () => {
    if (currentTrack < playlist.length - 1) {
        loadTrack(currentTrack + 1, true);
    } else {
        updatePlayIcon();
    }
};

splitLayout.addEventListener('change', syncLayout);
window.addEventListener('resize', () => scrollToActive(false));

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
updateMuteIcon();
setActiveLine(-1);
syncLayout();
