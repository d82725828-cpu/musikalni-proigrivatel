
    const audio = new Audio();

    let songs = [];
    let currentIndex = 0;
    let isPlaying = false;

    const title = document.getElementById("title");
    const artist = document.getElementById("artist");
    const cover = document.getElementById("cover");
    const playButton = document.getElementById("playButton");
    const progress = document.getElementById("progress");
    const currentTime = document.getElementById("currentTime");
    const duration = document.getElementById("duration");
    const playlist = document.getElementById("playlist");
    const volume = document.getElementById("volume");

    function formatTime(seconds) {
      if (!Number.isFinite(seconds)) return "0:00";

      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);

      return minutes + ":" + String(secs).padStart(2, "0");
    }

    function renderPlaylist() {
      playlist.innerHTML = "";

      if (songs.length === 0) {
        playlist.innerHTML = `
          <p style="color:#999; line-height:1.6;">
            Пока нет песен.<br>
            Добавь аудиофайлы с компьютера.
          </p>
        `;
        return;
      }

      songs.forEach((song, index) => {
        const item = document.createElement("div");
        item.className = "song" +
          (index === currentIndex ? " active" : "");

        item.innerHTML = `
          <div class="song-icon">🎵</div>
          <div class="song-info">
            <h3></h3>
            <p>Моя музыка</p>
          </div>
          <span class="song-duration">♪</span>
        `;

        item.querySelector("h3").textContent = song.name;

        item.addEventListener("click", () => {
          loadSong(index);
          playSong();
        });

        playlist.appendChild(item);
      });
    }

    function loadSong(index) {
      if (!songs.length) return;

      currentIndex = (index + songs.length) % songs.length;

      const song = songs[currentIndex];

      audio.src = song.url;
      title.textContent = song.name;
      artist.textContent = "Моя музыка";
      cover.textContent = "🎵";

      progress.value = 0;
      currentTime.textContent = "0:00";
      duration.textContent = "0:00";

      renderPlaylist();
    }

    async function playSong() {
      if (!songs.length) return;

      try {
        await audio.play();
        isPlaying = true;
        playButton.textContent = "⏸";
      } catch (error) {
        isPlaying = false;
        playButton.textContent = "▶";
      }
    }

    function pauseSong() {
      audio.pause();
      isPlaying = false;
      playButton.textContent = "▶";
    }

    function togglePlay() {
      if (!songs.length) {
        alert("Сначала добавь музыку!");
        return;
      }

      if (isPlaying) {
        pauseSong();
      } else {
        playSong();
      }
    }

    function nextSong() {
      if (!songs.length) return;

      loadSong(currentIndex + 1);
      playSong();
    }

    function previousSong() {
      if (!songs.length) return;

      if (audio.currentTime > 3) {
        audio.currentTime = 0;
      } else {
        loadSong(currentIndex - 1);
        playSong();
      }
    }

    audio.addEventListener("timeupdate", () => {
      if (!Number.isFinite(audio.duration)) return;

      progress.value =
        (audio.currentTime / audio.duration) * 100 || 0;

      currentTime.textContent = formatTime(audio.currentTime);
    });

    audio.addEventListener("loadedmetadata", () => {
      duration.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("ended", nextSong);

    audio.addEventListener("play", () => {
      isPlaying = true;
      playButton.textContent = "⏸";
    });

    audio.addEventListener("pause", () => {
      isPlaying = false;
      playButton.textContent = "▶";
    });

    progress.addEventListener("input", () => {
      if (Number.isFinite(audio.duration)) {
        audio.currentTime =
          (progress.value / 100) * audio.duration;
      }
    });

    volume.addEventListener("input", () => {
      audio.volume = Number(volume.value);
    });

    audio.volume = 0.7;

    document.getElementById("fileInput").addEventListener("change", event => {
      const files = Array.from(event.target.files);

      files.forEach(file => {
        if (!file.type.startsWith("audio/")) return;

        songs.push({
          name: file.name.replace(/\.[^/.]+$/, ""),
          url: URL.createObjectURL(file)
        });
      });

      if (songs.length && !audio.src) {
        loadSong(0);
      }

      renderPlaylist();
      event.target.value = "";
    });

    renderPlaylist();
