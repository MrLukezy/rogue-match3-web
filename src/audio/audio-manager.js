const DEFAULT_AUDIO_STATE = {
  muted: false,
  masterVolume: 1,
};

export function createAudioManager({ storage = window.localStorage, storageKey = "rogue-match3-audio" } = {}) {
  const manifest = {
    bgm: { src: "./assets/audio/bgm_battle_loop.ogg", volume: 0.3, loop: true, kind: "music" },
    uiClick: { src: "./assets/audio/ui_click.ogg", volume: 0.42 },
    uiError: { src: "./assets/audio/ui_error.ogg", volume: 0.4 },
    gemTap: { src: "./assets/audio/gem_sfx/gem_tap_main.mp3", volume: 0.14 },
    swap: { src: "./assets/audio/swap.ogg", volume: 0.26 },
    matchClear: { src: "./assets/audio/match_clear.ogg", volume: 0.3 },
    matchClearHeavy: { src: "./assets/audio/skill_sfx/skill_hammer.ogg", volume: 0.28 },
    matchClearBurst: { src: "./assets/audio/skill_sfx/skill_pulse9.ogg", volume: 0.26 },
    gemClear1: { src: "./assets/audio/gem_sfx/gem_clear_main.mp3", volume: 0.3 },
    gemClear2: { src: "./assets/audio/gem_sfx/gem_clear_main.mp3", volume: 0.32 },
    gemClear3: { src: "./assets/audio/gem_sfx/gem_clear_main.mp3", volume: 0.34 },
    gemClear4: { src: "./assets/audio/gem_sfx/gem_clear_main.mp3", volume: 0.36 },
    gemClear5: { src: "./assets/audio/gem_sfx/gem_clear_main.mp3", volume: 0.38 },
    gemClear6: { src: "./assets/audio/gem_sfx/gem_clear_main.mp3", volume: 0.4 },
    gemClear7: { src: "./assets/audio/gem_sfx/gem_clear_main.mp3", volume: 0.42 },
    comboRise: { src: "./assets/audio/skill_sfx/skill_color.ogg", volume: 0.2 },
    rewardPick: { src: "./assets/audio/reward_pick.ogg", volume: 0.48 },
    victory: { src: "./assets/audio/victory.ogg", volume: 0.52 },
    defeat: { src: "./assets/audio/defeat.ogg", volume: 0.42 },
    fever: { src: "./assets/audio/fever.ogg", volume: 0.5 },
    itemCast: { src: "./assets/audio/item_cast.ogg", volume: 0.42 },
    itemGain: { src: "./assets/audio/item_gain.ogg", volume: 0.36 },
    bossCast: { src: "./assets/audio/boss_cast.ogg", volume: 0.4 },
    enemyFireCast: { src: "./assets/audio/enemy_layers/enemy_fire_cast.ogg", volume: 0.34 },
    enemyIceCast: { src: "./assets/audio/enemy_layers/enemy_ice_cast.ogg", volume: 0.3 },
    enemyArcaneCast: { src: "./assets/audio/enemy_layers/enemy_arcane_cast.ogg", volume: 0.3 },
    enemyLightningCast: { src: "./assets/audio/enemy_layers/enemy_lightning_cast.ogg", volume: 0.34 },
    enemyPoisonCast: { src: "./assets/audio/enemy_layers/enemy_poison_cast.ogg", volume: 0.32 },
    enemyStoneCast: { src: "./assets/audio/enemy_layers/enemy_stone_cast.ogg", volume: 0.34 },
    enemyWaterCast: { src: "./assets/audio/enemy_layers/enemy_water_cast.ogg", volume: 0.3 },
    enemyBossVoice: { src: "./assets/audio/enemy_layers/enemy_boss_voice.ogg", volume: 0.3 },
    enemyMinionVoice: { src: "./assets/audio/enemy_layers/enemy_minion_voice.ogg", volume: 0.22 },
    enemyBossRoar: { src: "./assets/audio/enemy_layers/enemy_boss_roar.wav", volume: 0.38 },
    floorStart: { src: "./assets/audio/floor_start.ogg", volume: 0.28 },
    skillHammer: { src: "./assets/audio/skill_sfx/skill_hammer.ogg", volume: 0.34 },
    skillRow: { src: "./assets/audio/skill_sfx/skill_row.wav", volume: 0.34 },
    skillCross: { src: "./assets/audio/skill_sfx/skill_cross.wav", volume: 0.36 },
    skillColor: { src: "./assets/audio/skill_sfx/skill_color.ogg", volume: 0.32 },
    skillShuffle: { src: "./assets/audio/skill_sfx/skill_shuffle.ogg", volume: 0.34 },
    skillPulse9: { src: "./assets/audio/skill_sfx/skill_pulse9.ogg", volume: 0.38 },
    skillRainbow: { src: "./assets/audio/skill_sfx/skill_rainbow.wav", volume: 0.34 },
    skillOverclock: { src: "./assets/audio/skill_sfx/skill_overclock.ogg", volume: 0.32 },
    skillExecute: { src: "./assets/audio/skill_sfx/skill_execute.ogg", volume: 0.4 },
    condChainMatrix: { src: "./assets/audio/skill_sfx/cond_chain_matrix.ogg", volume: 0.28 },
    condFeverEngine: { src: "./assets/audio/skill_sfx/cond_fever_engine.wav", volume: 0.28 },
    condPurifier: { src: "./assets/audio/skill_sfx/cond_purifier.ogg", volume: 0.26 },
    condBossShunt: { src: "./assets/audio/skill_sfx/cond_boss_shunt.ogg", volume: 0.24 },
    enemyMinionCast: { src: "./assets/audio/skill_sfx/enemy_minion_cast.ogg", volume: 0.3 },
    enemyBossCast: { src: "./assets/audio/skill_sfx/enemy_boss_cast.ogg", volume: 0.34 },
    enemyUltimateCast: { src: "./assets/audio/skill_sfx/enemy_ultimate_cast.ogg", volume: 0.4 },
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
    musicEl.volume = cfg.volume * state.masterVolume;
    musicEl.muted = state.muted;
    return musicEl;
  }

  function syncToggleButton() {
    if (!toggleButton) return;
    toggleButton.textContent = state.muted ? "🔇 Muted" : "🔊 Audio";
    toggleButton.setAttribute("aria-pressed", state.muted ? "false" : "true");
    toggleButton.dataset.muted = state.muted ? "true" : "false";
  }

  function syncMusicVolume() {
    if (!musicEl) return;
    const cfg = manifest.bgm;
    musicEl.volume = (cfg.volume ?? 0.3) * state.masterVolume;
    musicEl.muted = state.muted;
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
    syncMusicVolume();
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
    const baseVolume = Math.max(0, Math.min(1, options.volume ?? cfg.volume ?? 0.4));
    audio.volume = Math.max(0, Math.min(1, baseVolume * state.masterVolume));
    audio.playbackRate = Math.max(0.65, Math.min(1.5, options.rate ?? 1));
    audio.currentTime = 0;
    audio.play().catch(() => {});
    return audio;
  }

  function setMasterVolume(nextVolume) {
    const value = Math.max(0, Math.min(1, Number(nextVolume) || 0));
    state.masterVolume = value;
    saveState();
    syncMusicVolume();
    return state.masterVolume;
  }

  function getMasterVolume() {
    return Number(state.masterVolume ?? 1);
  }

  return {
    bindToggle,
    installAutoUnlock,
    unlock,
    play,
    startMusic,
    stopMusic,
    toggleMute,
    setMasterVolume,
    getMasterVolume,
    isMuted: () => state.muted,
    syncToggleButton,
  };
}
