const DEFAULT_AUDIO_STATE = {
  muted: false,
};

export function createAudioManager({ storage = window.localStorage, storageKey = "rogue-match3-audio" } = {}) {
  const manifest = {
    bgm: { src: "./assets/audio/bgm_battle_loop.ogg", volume: 0.3, loop: true, kind: "music" },
    uiClick: { src: "./assets/audio/ui_click.ogg", volume: 0.42 },
    uiError: { src: "./assets/audio/ui_error.ogg", volume: 0.4 },
    swap: { src: "./assets/audio/swap.ogg", volume: 0.26 },
    matchClear: { src: "./assets/audio/match_clear.ogg", volume: 0.3 },
    rewardPick: { src: "./assets/audio/reward_pick.ogg", volume: 0.48 },
    victory: { src: "./assets/audio/victory.ogg", volume: 0.52 },
    defeat: { src: "./assets/audio/defeat.ogg", volume: 0.42 },
    fever: { src: "./assets/audio/fever.ogg", volume: 0.5 },
    itemCast: { src: "./assets/audio/item_cast.ogg", volume: 0.42 },
    itemGain: { src: "./assets/audio/item_gain.ogg", volume: 0.36 },
    bossCast: { src: "./assets/audio/boss_cast.ogg", volume: 0.4 },
    floorStart: { src: "./assets/audio/floor_start.ogg", volume: 0.28 },
  };

  let toggleButton = null;
  let unlocked = false;
  let musicStarted = false;
  let musicEl = null;
  const state = loadState();

  function loadState() {
    try {
      const parsed = JSON.parse(storage.getItem(storageKey) || "null");
      return { ...DEFAULT_AUDIO_STATE, ...(parsed || {}) };
    } catch {
      return { ...DEFAULT_AUDIO_STATE };
    }
  }

  function saveState() {
    try {
      storage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // ignore storage failures
    }
  }

  function ensureMusic() {
    if (musicEl) return musicEl;
    const cfg = manifest.bgm;
    musicEl = new Audio(cfg.src);
    musicEl.loop = true;
    musicEl.preload = "auto";
    musicEl.volume = cfg.volume;
    musicEl.muted = state.muted;
    return musicEl;
  }

  function syncToggleButton() {
    if (!toggleButton) return;
    toggleButton.textContent = state.muted ? "🔇 Muted" : "🔊 Audio";
    toggleButton.setAttribute("aria-pressed", state.muted ? "false" : "true");
    toggleButton.dataset.muted = state.muted ? "true" : "false";
  }

  async function unlock() {
    if (unlocked) return true;
    unlocked = true;
    try {
      const audio = ensureMusic();
      audio.muted = true;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.muted = state.muted;
    } catch {
      // browser will unlock on a later gesture
    }
    return true;
  }

  async function startMusic() {
    if (state.muted) return false;
    const audio = ensureMusic();
    audio.muted = false;
    if (musicStarted && !audio.paused) return true;
    musicStarted = true;
    try {
      await audio.play();
      return true;
    } catch {
      musicStarted = false;
      return false;
    }
  }

  function stopMusic() {
    if (!musicEl) return;
    musicEl.pause();
    musicStarted = false;
  }

  async function toggleMute(forceMuted = !state.muted) {
    state.muted = Boolean(forceMuted);
    saveState();
    if (musicEl) musicEl.muted = state.muted;
    syncToggleButton();
    if (state.muted) {
      stopMusic();
      return;
    }
    await unlock();
    await startMusic();
    play("uiClick", { allowWhenMuted: false, volume: 0.34 });
  }

  function bindToggle(button) {
    toggleButton = button;
    if (!toggleButton) return;
    syncToggleButton();
    toggleButton.addEventListener("click", async () => {
      await toggleMute();
    });
  }

  function installAutoUnlock(doc = document) {
    const unlockAndStart = async () => {
      await unlock();
      if (!state.muted) await startMusic();
    };
    doc.addEventListener("pointerdown", unlockAndStart, { passive: true });
    doc.addEventListener("keydown", unlockAndStart, { passive: true });
  }

  function play(name, options = {}) {
    const cfg = manifest[name];
    if (!cfg) return null;
    if (state.muted && !options.allowWhenMuted) return null;
    if (cfg.kind === "music") return startMusic();

    const audio = new Audio(cfg.src);
    audio.preload = "auto";
    audio.volume = Math.max(0, Math.min(1, options.volume ?? cfg.volume ?? 0.4));
    audio.playbackRate = Math.max(0.65, Math.min(1.5, options.rate ?? 1));
    audio.currentTime = 0;
    audio.play().catch(() => {});
    return audio;
  }

  return {
    bindToggle,
    installAutoUnlock,
    unlock,
    play,
    startMusic,
    stopMusic,
    toggleMute,
    isMuted: () => state.muted,
    syncToggleButton,
  };
}
