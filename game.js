import {
  MIN_BOARD_SIZE,
  MAX_BOARD_SIZE,
  BOARD_SIZE_BY_FLOOR,
  TOTAL_FLOORS,
  META_KEY,
  MOMENTUM_MAX,
  MAX_SKILL_CHAIN,
  MAX_ACTIVE_SHARDS,
  FLOOR_CONFIG,
  FLOOR_DIFFICULTY,
  CHAPTER_THEMES,
  EVENT_NODE_FLOORS,
  ELITE_FLOORS,
} from "./src/config/game-config.js";
import {
  MAX_ITEM_TYPES,
  ITEM_DEFS,
  ITEM_ANIM_FRAMES,
  ITEM_ORDER,
  ITEM_BASE_COUNTS,
  ITEM_BASE_LEVEL,
  RARITY_LABELS,
} from "./src/config/items-config.js";
import { GUIDE_DEFS, GEM_IMAGE_BY_COLOR, GEM_ANIM_FRAMES, GEM_POOL_BY_FLOOR, GEM_COLOR_NAMES } from "./src/config/gems-config.js";
import { UI_IMAGES, BOSS_ANIM_FRAMES, BOSS_PROFILES } from "./src/config/boss-ui-config.js";
import { BLESSING_DEFS } from "./src/config/blessings-config.js";
import { renderItemsView, renderPerksView } from "./src/render/items-render.js";
import { renderBoardView } from "./src/render/board-render.js";
import {
  createInitialState as buildInitialState,
  seedStartingItems,
  getItemCount as readItemCount,
  getItemLevel as readItemLevel,
  getAnimatedItemImage as pickAnimatedItemImage,
  getAnimatedGemImage as pickAnimatedGemImage,
  getAnimatedBossImage as pickAnimatedBossImage,
  syncAnimatedVisuals,
  hasItemType as checkHasItemType,
  getCarriedItems as listCarriedItems,
  itemSlotAvailable as checkItemSlotAvailable,
  ensureItemType as ensureStateItemType,
  addItemCharges as addStateItemCharges,
  upgradeItem as upgradeStateItem,
  spendItemCharge as spendStateItemCharge,
  boostAllItemLevels,
  grantDragonHoardBonus as applyDragonHoardBonus,
  defaultCodex,
  loadMeta as loadMetaState,
  saveMeta as persistMeta,
  recordCodex as patchCodex,
} from "./src/core/state-meta-items.js";
import {
  createBoard as createBoardState,
  resolveAutoBoard as resolveAutoBoardState,
  collapseBoard as collapseBoardState,
  refillBoard as refillBoardState,
  rowOf as getRowOf,
  colOf as getColOf,
  inside as isInside,
  indicesInRow as getIndicesInRow,
  indicesInCol as getIndicesInCol,
  isAdjacent as checkIsAdjacent,
  swap as swapBoardCells,
  randColor as pickRandColor,
  randomPick as pickRandom,
  shuffle as shuffleArray,
  sleep as wait,
  isGem as checkIsGem,
  isObstacle as checkIsObstacle,
} from "./src/core/board-core.js";
import {
  playSwapAnimation as runSwapAnimation,
  playItemCastAnimation as runItemCastAnimation,
  spawnShatterFX as runShatterFX,
  spawnShockwaveFX as runShockwaveFX,
  spawnFloatText as runFloatText,
  spawnScreenPulse as runScreenPulse,
  shakeBoard as runShakeBoard,
} from "./src/fx/board-fx.js";
import { getDomRefs, bindCoreEvents } from "./src/bootstrap/dom.js";
import { createAudioManager } from "./src/audio/audio-manager.js";
import { createI18n } from "./src/ui/i18n.js";

(() => {
  const zhen = (zh, en) => ({ zh, en });
  const MODIFIERS = [
    { id: "glass", name: zhen("玻璃蔓延", "Glass"), desc: zhen("开局附带更多玻璃层", "Start with extra glass layers"), apply: (s) => (s.modGlass = 8) },
    { id: "heavy", name: zhen("重压", "Heavy"), desc: zhen("失去 2 步，但连锁更强", "Lose 2 moves, gain stronger chains"), apply: (s) => { s.movesLeft = Math.max(8, s.movesLeft - 2); s.chainBonus += 0.2; } },
    { id: "color_tax", name: zhen("颜色税", "Color Tax"), desc: zhen("一种颜色得分降低", "One color scores less"), apply: (s) => { s.taxColor = randColor(); } },
    { id: "lucky", name: zhen("幸运掉落", "Lucky Drop"), desc: zhen("道具掉落概率更高", "Item drop chance is higher"), apply: (s) => { s.dropBoost += 0.12; } },
    { id: "frost_seal", name: zhen("霜封", "Frost Seal"), desc: zhen("若干宝石开局被锁定", "Several gems begin locked"), apply: (s) => { s.modLocks = 4; } },
    { id: "stormfront", name: zhen("风暴前线", "Stormfront"), desc: zhen("动量更快积累，但少 1 步", "Builds momentum faster but trims one move"), apply: (s) => { s.movesLeft = Math.max(8, s.movesLeft - 1); s.chainBonus += 0.12; s.dropBoost += 0.04; } },
    { id: "rich_vein", name: zhen("丰矿脉", "Rich Vein"), desc: zhen("本层额外得分并提高工具密度", "Gain score and extra tool density on this floor"), apply: (s) => { s.floorScore += 80; s.dropBoost += 0.08; } },
  ];

  const PERK_DEFS = {
    combo_forge: { title: zhen("连锁熔炉", "Combo Forge"), desc: zhen("4 连消可升级为炸弹宝石", "4-matches can upgrade into bomb gems"), rarity: "common", apply: (s) => { s.perks.combo_forge = true; } },
    fever_loop: { title: zhen("热潮回路", "Fever Loop"), desc: zhen("热潮持续 +1 回合", "Fever lasts +1 turn"), rarity: "common", apply: (s) => { s.perks.fever_loop = true; } },
    relic_magnet: { title: zhen("遗物磁引", "Relic Magnet"), desc: zhen("道具掉落概率更高", "Item drop chance is higher"), rarity: "common", apply: (s) => { s.perks.relic_magnet = true; } },
    glass_breaker: { title: zhen("碎玻者", "Glass Breaker"), desc: zhen("打碎玻璃可获得额外分数", "Breaking glass grants bonus points"), rarity: "common", apply: (s) => { s.perks.glass_breaker = true; } },
    overcharge: { title: zhen("过载启动", "Overcharge"), desc: zhen("每层开始时获得额外动量", "Each floor begins with bonus momentum"), rarity: "common", apply: (s) => { s.perks.overcharge = true; } },
    pressure_valve: { title: zhen("压力阀", "Pressure Valve"), desc: zhen("Boss 压力带来的减步更少", "Boss pressure removes fewer moves"), rarity: "common", apply: (s) => { s.perks.pressure_valve = true; } },
    blast_core: { title: zhen("爆破核心", "Blast Core"), desc: zhen("特殊宝石和爆炸得分更高", "Specials and blasts score more"), rarity: "rare", apply: (s) => { s.perks.blast_core = true; } },
    score_bloom: { title: zhen("分数绽放", "Score Bloom"), desc: zhen("每次清除宝石都获得额外分数", "Every gem cleared grants bonus score"), rarity: "rare", apply: (s) => { s.perks.score_bloom = true; } },
    quick_hands: { title: zhen("迅捷之手", "Quick Hands"), desc: zhen("目标型道具升级时获得额外充能", "Target items gain bonus charge when upgraded"), rarity: "rare", apply: (s) => { s.perks.quick_hands = true; } },
    fever_smith: { title: zhen("热潮锻匠", "Fever Smith"), desc: zhen("传说道具会提供更多动量", "Legend skills grant extra momentum"), rarity: "rare", apply: (s) => { s.perks.fever_smith = true; } },
    arcane_stockpile: { title: zhen("奥术储藏", "Arcane Stockpile"), desc: zhen("道具掉落可包含传说技能", "Item drops can include legendary skills"), rarity: "epic", apply: (s) => { s.perks.arcane_stockpile = true; } },
    boss_hunter: { title: zhen("Boss 猎手", "Boss Hunter"), desc: zhen("每次使用传说道具都会额外打击 Boss 充能", "Damage the boss charge more whenever you use a legend skill"), rarity: "epic", apply: (s) => { s.perks.boss_hunter = true; } },
    vault_expander: { title: zhen("仓库扩展", "Vault Expander"), desc: zhen("新道具类型会附带额外充能", "New item types arrive with bonus charges"), rarity: "epic", apply: (s) => { s.perks.vault_expander = true; } },
    prism_heart: { title: zhen("棱镜之心", "Prism Heart"), desc: zhen("彩虹宝石得分更高且更常出现", "Rainbow gems score more and spawn more often"), rarity: "epic", apply: (s) => { s.perks.prism_heart = true; } },
    sovereign_circuit: { title: zhen("王权回路", "Sovereign Circuit"), desc: zhen("所有装备道具立刻 +1 等级", "All equipped items gain +1 level instantly"), rarity: "legendary", apply: (s) => { s.perks.sovereign_circuit = true; boostAllItemLevels(s); } },
    dragon_hoard: { title: zhen("龙之宝藏", "Dragon Hoard"), desc: zhen("你最高等级的道具每层都会获得充能", "Your highest-level item gains charges every floor"), rarity: "legendary", apply: (s) => { s.perks.dragon_hoard = true; } },
  };

  const {
    appRootEl,
    chapterScreenEl,
    chapterSettingsBtn,
    chapterShellEl,
    chapterListEl,
    appSettingsBtn,
    floorEl,
    modifierEl,
    movesLeftEl,
    floorScoreEl,
    scoreEl,
    boardTargetScoreEl,
    boardFloorScoreEl,
    bestFloorEl,
    bestScoreEl,
    momentumBarEl,
    feverTurnsEl,
    bossMeterEl,
    bossBarEl,
    bossSkillHintEl,
    bossPortraitEl,
    bossTitleEl,
    bossStateEl,
    bossThreatEl,
    bossPatternEl,
    bossSkillbookListEl,
    modeTextEl,
    boardWrapEl,
    boardEl,
    fxLayerEl,
    itemTooltipEl,
    messageEl,
    audioToggleBtn,
    restartBtn,
    codexBtn,
    guideBtn,
    itemWrapEl,
    perkWrapEl,
    overlayEl,
    overlaySettingsBtn,
    overlayTitleEl,
    overlayDescEl,
    choiceWrapEl,
    overlayActionsEl,
    codexModalEl,
    codexSettingsBtn,
    codexContentEl,
    codexCloseBtn,
    guideModalEl,
    guideSettingsBtn,
    guideModalTitleEl,
    guideModalDescEl,
    guideModalContentEl,
    guideCloseBtn,
    settingsModalEl,
    settingsTitleEl,
    settingsDescEl,
    settingsLanguageLabelEl,
    settingsLanguageHintEl,
    settingsVolumeLabelEl,
    settingsVolumeValueEl,
    settingsCloseBtn,
    settingsMuteBtn,
    volumeSliderEl,
    languageSwitchEl,
    langZhBtn,
    langEnBtn,
  } = getDomRefs(document);

  const i18n = createI18n();
  let meta = loadMeta();
  let state = createInitialState();
  let selected = null;
  let inputLocked = false;
  let clearAnim = new Set();
  let fallAnim = new Set();
  let activeShards = 0;
  let boardSize = MIN_BOARD_SIZE;
  let guideQueue = [];
  let guideActive = false;
  let itemAnimFrameIndex = 0;
  let itemAnimTimer = null;
  let bossHudTimer = null;
  const audio = createAudioManager();

  bindEvents();
  startItemIconAnimation();
  startBossHudTicker();
  startRun();

  function createInitialState() {
    const initial = buildInitialState({ MIN_BOARD_SIZE, ITEM_ORDER });
    seedStartingItems(initial, { ITEM_BASE_LEVEL, ITEM_BASE_COUNTS });
    return initial;
  }

  function getItemCount(id) {
    return readItemCount(state, id);
  }

  function getItemLevel(id) {
    return readItemLevel(state, id);
  }

  function getAnimatedItemImage(id, frameIndex = itemAnimFrameIndex) {
    return pickAnimatedItemImage(id, frameIndex, ITEM_ANIM_FRAMES, ITEM_DEFS);
  }

  function getAnimatedGemImage(color, frameIndex = itemAnimFrameIndex) {
    return pickAnimatedGemImage(color, frameIndex, GEM_ANIM_FRAMES, GEM_IMAGE_BY_COLOR);
  }

  function getAnimatedBossImage(frameIndex = itemAnimFrameIndex) {
    return pickAnimatedBossImage(frameIndex, BOSS_ANIM_FRAMES);
  }

  function syncAnimatedItemImages(root = document) {
    syncAnimatedVisuals({ root, frameIndex: itemAnimFrameIndex, getAnimatedItemImage, getAnimatedGemImage, getAnimatedBossImage });
  }

  function startItemIconAnimation() {
    if (itemAnimTimer) clearInterval(itemAnimTimer);
    itemAnimTimer = setInterval(() => {
      itemAnimFrameIndex = (itemAnimFrameIndex + 1) % 8;
      syncAnimatedItemImages(document);
    }, 145);
  }

  function startBossHudTicker() {
    if (bossHudTimer) clearInterval(bossHudTimer);
    bossHudTimer = setInterval(() => {
      if (state?.selectedChapter && !state.gameOver && !state.victory) {
        renderHUD();
        renderBossSkillbook();
      }
    }, 250);
  }

  function hasItemType(id) {
    return checkHasItemType(state, id);
  }

  function itemPower(id) {
    return Math.max(1, getItemLevel(id) || 1);
  }

  function getCarriedItems() {
    return listCarriedItems(state, ITEM_DEFS);
  }

  function itemSlotAvailable() {
    return checkItemSlotAvailable(state, ITEM_DEFS, MAX_ITEM_TYPES);
  }

  function ensureItemType(id) {
    return ensureStateItemType(state, id, { ITEM_BASE_LEVEL, ITEM_DEFS, MAX_ITEM_TYPES });
  }

  function addItemCharges(id, amount = 1, allowNewType = true) {
    return addStateItemCharges(state, id, amount, allowNewType, { ITEM_BASE_LEVEL, ITEM_DEFS, MAX_ITEM_TYPES });
  }

  function upgradeItem(id, levelGain = 1, chargeGain = 1) {
    return upgradeStateItem(state, id, levelGain, chargeGain, { ITEM_BASE_LEVEL, ITEM_DEFS, MAX_ITEM_TYPES });
  }

  function spendItemCharge(id) {
    spendStateItemCharge(state, id);
  }

  function grantDragonHoardBonus() {
    applyDragonHoardBonus(state, ITEM_DEFS, (id, amount, allowNewType) => addItemCharges(id, amount, allowNewType));
  }

  function loadMeta() {
    return loadMetaState(localStorage, META_KEY);
  }

  function saveMeta() {
    persistMeta(localStorage, META_KEY, meta);
  }

  function recordCodex(group, key, delta = 1) {
    patchCodex(meta, group, key, delta);
    saveMeta();
  }

  function bindEvents() {
    audio.bindToggle(audioToggleBtn);
    audio.installAutoUnlock(document);
    bindCoreEvents({
      restartBtn,
      boardEl,
      itemWrapEl,
      codexBtn,
      guideBtn,
      codexCloseBtn,
      guideCloseBtn,
      codexModalEl,
      guideModalEl,
      settingsModalEl,
      settingsButtons: [chapterSettingsBtn, appSettingsBtn, overlaySettingsBtn, codexSettingsBtn, guideSettingsBtn],
      settingsCloseBtn,
      startRun,
      onBoardClick,
      onItemClick,
      onItemHover,
      onItemHoverOut,
      openCodex,
      openGuidePanel,
      closeGuideModal,
      openSettings,
      closeSettings,
      getRestartConfirmText: () => t("restartConfirm"),
    });

    if (langZhBtn) langZhBtn.addEventListener("click", () => setLanguage("zh-CN"));
    if (langEnBtn) langEnBtn.addEventListener("click", () => setLanguage("en"));
    if (settingsMuteBtn) {
      settingsMuteBtn.addEventListener("click", async () => {
        await audio.toggleMute();
        syncSettingsControls();
        applyStaticText();
      });
    }
    if (volumeSliderEl) {
      volumeSliderEl.addEventListener("input", (event) => {
        const nextVolume = Number(event.target.value || 0) / 100;
        audio.setMasterVolume(nextVolume);
        if (nextVolume > 0 && audio.isMuted()) audio.toggleMute(false).then(() => {
          syncSettingsControls();
          applyStaticText();
        });
        else syncSettingsControls();
      });
    }

    applyStaticText();
    syncSettingsControls();
  }

  function t(key, params = {}) {
    return i18n.t(key, params);
  }

  function langKey() {
    return i18n.getLanguage() === "zh-CN" ? "zh" : "en";
  }

  function lt(value) {
    if (value && typeof value === "object" && ("zh" in value || "en" in value)) {
      return value[langKey()] ?? value.en ?? value.zh ?? "";
    }
    return value;
  }

  function setLanguage(lang) {
    i18n.setLanguage(lang);
    applyStaticText();
    renderAll();
    if (!chapterScreenEl?.classList.contains("hidden")) showChapterSelect();
  }

  function openSettings() {
    audio.play("uiClick", { volume: 0.34 });
    syncSettingsControls();
    settingsModalEl?.classList.remove("hidden");
  }

  function closeSettings() {
    audio.play("uiClick", { volume: 0.24 });
    settingsModalEl?.classList.add("hidden");
  }

  function syncSettingsControls() {
    const lang = i18n.getLanguage();
    if (langZhBtn) langZhBtn.classList.toggle("active", lang === "zh-CN");
    if (langEnBtn) langEnBtn.classList.toggle("active", lang === "en");
    if (volumeSliderEl) volumeSliderEl.value = String(Math.round(audio.getMasterVolume() * 100));
    if (settingsVolumeValueEl) settingsVolumeValueEl.textContent = t("volumePercent", { value: Math.round(audio.getMasterVolume() * 100) });
    if (settingsMuteBtn) settingsMuteBtn.textContent = audio.isMuted() ? t("settingsUnmute") : t("settingsMute");
    if (languageSwitchEl) languageSwitchEl.dataset.lang = lang;
  }

  function applyStaticText() {
    document.documentElement.lang = i18n.getLanguage();
    document.title = t("appTitle");
    const chapterHeaderTitle = chapterShellEl?.querySelector(".chapter-header h1");
    const chapterHeaderDesc = chapterShellEl?.querySelector(".chapter-header p");
    if (chapterHeaderTitle) chapterHeaderTitle.textContent = t("chapterChoose");
    if (chapterHeaderDesc) chapterHeaderDesc.textContent = t("chapterDesc");

    const titleEl = document.querySelector(".title-block h1");
    const subEl = document.querySelector(".left-panel .sub");
    if (titleEl) titleEl.textContent = t("appTitle");
    if (subEl) subEl.textContent = t("subline");
    if (audioToggleBtn) audioToggleBtn.textContent = audio.isMuted() ? t("audioOff") : t("audioOn");

    setTextBySelector(".hero-stat span", t("movesLeft"));
    setPanelRowLabel(0, t("floor"));
    setPanelRowLabel(1, t("modifier"));
    setPanelRowLabel(2, t("floorScore"));
    setPanelRowLabel(3, t("bestFloor"));
    setPanelRowLabel(4, t("bestScore"));
    setTextBySelector(".momentum > span", t("momentum"));
    setTextBySelector(".glossary-panel h2", t("tileGuide"));
    if (guideBtn) guideBtn.textContent = t("openGuide");
    setTextBySelector(".build-panel h2", t("rogueSkills"));
    setTextBySelector(".panel-note", t("raritySummary"));
    if (restartBtn) restartBtn.textContent = t("restartRun");
    if (codexBtn) codexBtn.textContent = t("codex");
    setTextBySelector(".score-banner span", t("totalScore"));
    setTextBySelector(".target-chip span", t("target"));
    setTextBySelector(".board-chip.accent span", t("floorScore"));
    setTextBySelector(".dock-title span", t("equippedItems"));
    setTextBySelector(".dock-title small", t("equippedItemsHint"));
    setTextBySelector(".boss-card .eyebrow", t("bossPressure"));
    setTextBySelector(".boss-card h2", t("encounterGauge"));
    setTextBySelector("#bossMeter > span", t("bossEnergy"));
    setBossMiniCardLabel(0, t("threat"));
    setBossMiniCardLabel(1, t("pattern"));
    setTextBySelector(".boss-skillbook h3", t("bossAttacks"));
    setTextBySelector(".boss-copy", t("bossCopy"));

    if (overlayEl && overlayEl.classList.contains("hidden") && overlayTitleEl) overlayTitleEl.textContent = t("chooseReward");
    if (overlayEl && overlayEl.classList.contains("hidden") && overlayDescEl) overlayDescEl.textContent = t("rewardDesc");
    if (guideModalTitleEl && guideModalEl?.classList.contains("hidden")) guideModalTitleEl.textContent = t("tileGuide");
    if (guideModalDescEl && guideModalEl?.classList.contains("hidden")) guideModalDescEl.textContent = t("guideModalDesc");
    const guideClose = document.getElementById("guideCloseBtn");
    if (guideClose) guideClose.textContent = t("close");
    const codexTitle = codexModalEl?.querySelector("h3");
    const codexDesc = codexModalEl?.querySelector("p");
    if (codexTitle) codexTitle.textContent = t("codexStats");
    if (codexDesc) codexDesc.textContent = t("codexDesc");
    if (codexCloseBtn) codexCloseBtn.textContent = t("close");
    if (settingsTitleEl) settingsTitleEl.textContent = t("settingsTitle");
    if (settingsDescEl) settingsDescEl.textContent = t("settingsDesc");
    if (settingsLanguageLabelEl) settingsLanguageLabelEl.textContent = t("settingsLanguage");
    if (settingsLanguageHintEl) settingsLanguageHintEl.textContent = t("settingsLanguageHint");
    if (settingsVolumeLabelEl) settingsVolumeLabelEl.textContent = t("settingsVolume");
    syncSettingsControls();
  }

  function setTextBySelector(selector, text) {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  }

  function setPanelRowLabel(index, text) {
    const rows = document.querySelectorAll(".stats .row span");
    if (rows[index]) rows[index].textContent = text;
  }

  function setBossMiniCardLabel(index, text) {
    const rows = document.querySelectorAll(".boss-mini-card span");
    if (rows[index]) rows[index].textContent = text;
  }

  function openCodex() {
    renderCodex();
    audio.play("uiClick");
    codexModalEl.classList.remove("hidden");
  }

  function openGuidePanel(entryId = null) {
    renderGuideList(entryId);
    guideModalTitleEl.textContent = entryId && GUIDE_DEFS[entryId] ? lt(GUIDE_DEFS[entryId].title) : t("tileGuide");
    guideModalDescEl.textContent = entryId && GUIDE_DEFS[entryId]
      ? t("guideModalDiscoverDesc")
      : t("guideModalDesc");
    audio.play("uiClick");
    guideModalEl.classList.remove("hidden");
  }

  function closeGuideModal() {
    audio.play("uiClick", { volume: 0.3 });
    guideModalEl.classList.add("hidden");
    guideActive = false;
    maybeShowNextGuide();
  }

  function renderGuideList(highlightId = null) {
    const entries = Object.entries(GUIDE_DEFS);
    guideModalContentEl.innerHTML = "";

    for (const [id, def] of entries) {
      const detail = createGuideEntry(id, def, highlightId === id, true);
      detail.addEventListener("click", () => {});
      guideModalContentEl.appendChild(detail);
    }
  }

  function createGuideEntry(id, def, highlighted = false, detailed = false) {
    const entry = document.createElement("div");
    entry.className = `guide-item${detailed ? " modal-item" : ""}${highlighted ? " highlighted" : ""}`;

    const preview = document.createElement("div");
    preview.className = "guide-preview";
    preview.appendChild(createGuidePreview(def.preview));

    const text = document.createElement("div");
    text.innerHTML = `<strong>${lt(def.title)}</strong><small>${lt(def.desc)}</small>`;

    entry.appendChild(preview);
    entry.appendChild(text);
    entry.dataset.guide = id;
    return entry;
  }

  function createGuidePreview(preview) {
    const frame = document.createElement("div");
    frame.className = "guide-preview-frame";

    if (!preview || preview.kind === "obstacle") {
      const obstacle = document.createElement("div");
      obstacle.className = "obstacle";
      frame.appendChild(obstacle);
      return frame;
    }

    const gem = document.createElement("div");
    gem.className = `gem g-${preview.color ?? 0}`;
    if (preview.special) gem.classList.add(`sp-${preview.special}`);
    if (preview.glass) gem.classList.add("glass");
    if (preview.burning) gem.classList.add("burning");
    if (preview.frozen) gem.classList.add("frozen");
    if (preview.locked) gem.classList.add("locked");

    const icon = document.createElement("img");
    icon.className = "gem-icon gem-image";
    icon.alt = "guide gem";
    icon.dataset.animGem = String(preview.color ?? 0);
    icon.src = getAnimatedGemImage(preview.color ?? 0);
    gem.appendChild(icon);

    if (preview.burning) {
      const burnAura = document.createElement("span");
      burnAura.className = "gem-burn-aura";
      gem.appendChild(burnAura);

      const burnTag = document.createElement("span");
      burnTag.className = "gem-status burn";
      burnTag.textContent = "SCORCH";
      gem.appendChild(burnTag);
    }

    if ((preview.poisonedTurns || 0) > 0) {
      gem.classList.add("poisoned");
      const poisonTag = document.createElement("span");
      poisonTag.className = "gem-status poison";
      poisonTag.textContent = `POISON ${preview.poisonedTurns}`;
      gem.appendChild(poisonTag);
    }

    if (preview.frozen) {
      const frozenTag = document.createElement("span");
      frozenTag.className = "gem-status frozen";
      frozenTag.textContent = "FROZEN";
      gem.appendChild(frozenTag);
    }

    frame.appendChild(gem);
    return frame;
  }

  function queueGuideIfNew(id) {
    if (!GUIDE_DEFS[id]) return;
    if (meta.codex.guideSeen[id]) return;
    meta.codex.guideSeen[id] = 1;
    saveMeta();
    guideQueue.push(id);
  }

  function scanGuideDiscoveries() {
    let hasGlass = false;
    let hasBurning = false;
    let hasLocked = false;
    let hasObstacle = false;
    const specials = new Set();

    for (const cell of state.board) {
      if (isObstacle(cell)) hasObstacle = true;
      if (!isGem(cell)) continue;
      if (cell.glass) hasGlass = true;
      if (cell.burning) hasBurning = true;
      if (cell.lockedTurns > 0 || cell.frozen) hasLocked = true;
      if (cell.special) specials.add(cell.special);
    }

    if (hasObstacle) queueGuideIfNew("obstacle");
    if (hasGlass) queueGuideIfNew("glass");
    if (hasBurning) queueGuideIfNew("burning");
    if (hasLocked) queueGuideIfNew("locked");
    if (state.floor === 1) queueGuideIfNew("gem_basic");
    for (const special of specials) queueGuideIfNew(special);
    maybeShowNextGuide();
  }

  function maybeShowNextGuide() {
    if (guideActive || overlayEl.classList.contains("hidden") === false) return;
    const next = guideQueue.shift();
    if (!next) return;
    guideActive = true;
    openGuidePanel(next);
  }

  function bindOverlayActions() {
    const buttons = overlayActionsEl.querySelectorAll("[data-action]");
    for (const btn of buttons) {
      btn.addEventListener("click", () => {
        if (btn.dataset.action === "restart-run") startRun();
        if (btn.dataset.action === "chapter-select") showChapterSelect();
        if (btn.dataset.action === "next-chapter") startNextChapter();
      });
    }
  }

  function renderCodex() {
    const c = meta.codex;
    const p = meta.progression;
    codexContentEl.innerHTML = "";

    const rows = [
      [i18n.getLanguage() === "zh-CN" ? "对局次数" : "Runs", c.runs],
      [i18n.getLanguage() === "zh-CN" ? "最高连锁" : "Best Chain", c.maxChain],
      [i18n.getLanguage() === "zh-CN" ? "锤子使用" : "Hammer Uses", c.itemUse.hammer],
      [i18n.getLanguage() === "zh-CN" ? "横扫使用" : "Row Sweep Uses", c.itemUse.row],
      [i18n.getLanguage() === "zh-CN" ? "十字爆发使用" : "Cross Burst Uses", c.itemUse.cross],
      [i18n.getLanguage() === "zh-CN" ? "彩色炸弹使用" : "Color Bomb Uses", c.itemUse.color],
      [i18n.getLanguage() === "zh-CN" ? "洗牌使用" : "Shuffle Uses", c.itemUse.shuffle],
      [i18n.getLanguage() === "zh-CN" ? "直线特效触发" : "Line Triggers", c.specialTrigger.line_h + c.specialTrigger.line_v],
      [i18n.getLanguage() === "zh-CN" ? "炸弹触发" : "Bomb Triggers", c.specialTrigger.bomb],
      [i18n.getLanguage() === "zh-CN" ? "彩虹触发" : "Rainbow Triggers", c.specialTrigger.rainbow],
      [i18n.getLanguage() === "zh-CN" ? "Boss：余烬火花" : "Boss: Ember Spark", c.bossSeen.ember_spark],
      [i18n.getLanguage() === "zh-CN" ? "Boss：绝对静止" : "Boss: Absolute Stillness", c.bossSeen.absolute_stillness],
      [i18n.getLanguage() === "zh-CN" ? "Boss：星渊终末" : "Boss: Star Abyss End", c.bossSeen.star_abyss_end],
      [i18n.getLanguage() === "zh-CN" ? "全屏脉冲使用" : "Screen Pulse Uses", c.skillUse.screen_wipe],
      [i18n.getLanguage() === "zh-CN" ? "彩虹爆发使用" : "Rainbow Burst Uses", c.skillUse.rainbow_burst],
      [i18n.getLanguage() === "zh-CN" ? "时间冻结使用" : "Time Freeze Uses", c.skillUse.time_freeze],
      [i18n.getLanguage() === "zh-CN" ? "Boss 粉碎者使用" : "Boss Breaker Uses", c.skillUse.boss_breaker],
      [i18n.getLanguage() === "zh-CN" ? "单次最高清除" : "Best Single Clear", c.maxSingleClear],
    ];

    for (const [k, v] of rows) {
      const div = document.createElement("div");
      div.className = "row";
      div.innerHTML = `<span>${k}</span><strong>${v}</strong>`;
      codexContentEl.appendChild(div);
    }

    const progression = document.createElement("div");
    progression.className = "codex-progression";
    progression.innerHTML = `<div class="row"><span>${i18n.getLanguage() === "zh-CN" ? "裂隙碎片" : "Rift Shards"}</span><strong>${p.shards}</strong></div><h4>${i18n.getLanguage() === "zh-CN" ? "永久升级" : "Permanent Upgrades"}</h4>`;

    const upgrades = [
      { id: "veteran_boots", title: "Veteran Boots", desc: "+1 start move per rank", max: 3, cost: (lvl) => 4 + lvl * 3 },
      { id: "ember_core", title: "Ember Core", desc: "+12 start momentum per rank", max: 3, cost: (lvl) => 5 + lvl * 4 },
      { id: "relic_satchel", title: "Relic Satchel", desc: "Starting Hammer and Shuffle gain +1 charge per rank", max: 2, cost: (lvl) => 6 + lvl * 5 },
      { id: "boss_dampener", title: "Boss Dampener", desc: "Reduce boss charge gain by 1 on early floors", max: 2, cost: (lvl) => 8 + lvl * 6 },
    ];

    for (const up of upgrades) {
      const level = Number(p.upgrades[up.id] || 0);
      const canBuy = level < up.max;
      const cost = up.cost(level);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice codex-upgrade";
      btn.disabled = !canBuy || p.shards < cost;
      btn.innerHTML = `<strong>${up.title} ${t("itemLevel", { level: `${level}/${up.max}` })}</strong><small>${up.desc}</small><small>${i18n.getLanguage() === "zh-CN" ? "花费" : "Cost"}: ${canBuy ? cost : "MAX"} ${i18n.getLanguage() === "zh-CN" ? "碎片" : "shards"}</small>`;
      btn.addEventListener("click", () => {
        if (!canBuy || meta.progression.shards < cost) return;
        meta.progression.shards -= cost;
        meta.progression.upgrades[up.id] = level + 1;
        saveMeta();
        renderCodex();
      });
      progression.appendChild(btn);
    }
    codexContentEl.appendChild(progression);
  }

  function startRun() {
    state = createInitialState();
    selected = null;
    inputLocked = false;
    clearAnim = new Set();
    fallAnim = new Set();
    guideQueue = [];
    guideActive = false;
    overlayEl.classList.add("hidden");
    codexModalEl.classList.add("hidden");
    guideModalEl.classList.add("hidden");
    meta.codex.runs += 1;
    saveMeta();
    showChapterSelect();
    audio.startMusic();
    notify(t("chooseChapterNotify"), "ok");
  }

  function openChapterScreen() {
    if (appRootEl) appRootEl.classList.add("hidden");
    if (chapterScreenEl) chapterScreenEl.classList.remove("hidden");
  }

  function closeChapterScreen() {
    if (chapterScreenEl) chapterScreenEl.classList.add("hidden");
    if (appRootEl) appRootEl.classList.remove("hidden");
  }

  function getChapterLocalFloor() {
    if (!state.selectedChapter) return state.floor;
    return state.floor - state.selectedChapter.start + 1;
  }

  function showChapterSelect() {
    openChapterScreen();
    overlayEl.classList.add("hidden");
    chapterListEl.innerHTML = "";
    const unlocked = new Set(meta.progression.unlockedChapters || ["ember_hollows"]);
    if (chapterScreenEl) chapterScreenEl.style.setProperty("--chapter-preview-image", `url("${CHAPTER_THEMES[0].chapterPreviewImage}")`);

    for (const chapter of CHAPTER_THEMES) {
      const btn = document.createElement("button");
      const isUnlocked = unlocked.has(chapter.id);
      const isCleared = Boolean(meta.progression.clearedChapters?.[chapter.id]);
      btn.className = `chapter-card${isUnlocked ? "" : " locked"}`;
      btn.disabled = !isUnlocked;
      btn.innerHTML = `<span class="tag">${isUnlocked ? (isCleared ? t("chapterClearedTag") : t("chapterUnlockedTag")) : t("chapterLockedTag")}</span><strong>${lt(chapter.title)}</strong><small>${lt(chapter.intro)}<br>${t("bossLabel")}: ${lt(chapter.bossName)}<br>${t("patternLabel")}: ${lt(chapter.pattern)}</small>`;
      btn.addEventListener("mouseenter", () => {
        if (chapterScreenEl) chapterScreenEl.style.setProperty("--chapter-preview-image", `url("${chapter.chapterPreviewImage}")`);
      });
      btn.addEventListener("focus", () => {
        if (chapterScreenEl) chapterScreenEl.style.setProperty("--chapter-preview-image", `url("${chapter.chapterPreviewImage}")`);
      });
      btn.addEventListener("click", () => {
        if (!isUnlocked) return;
        audio.play("uiClick");
        state.selectedChapter = chapter;
        state.floorTheme = chapter;
        state.routePlan = { id: "main", title: t("carryingPath"), floorsRemaining: 0, moveBonus: 0, movePenalty: 0, targetMulDelta: 0, pressureDelta: 0, dropBoost: 0, chainBonus: 0, shardBonus: 0 };
        closeChapterScreen();
        showChapterBlessings(true);
      });
      chapterListEl.appendChild(btn);
    }
  }

  function startFloor(floor) {
    state.floor = floor;
    const chapter = state.selectedChapter || CHAPTER_THEMES[0];
    if (state.floor > chapter.end) return onVictory();

    const previousColorCount = state.activeGemColors?.length || 4;

    const cfg = FLOOR_CONFIG[state.floor - 1];
    const threat = getFloorThreat(state.floor);
    const theme = getFloorTheme(state.floor);
    const route = state.routePlan || { id: "main", title: "Main Path", floorsRemaining: 0, moveBonus: 0, movePenalty: 0, targetMulDelta: 0, pressureDelta: 0, dropBoost: 0, chainBonus: 0, shardBonus: 0 };
    boardSize = getBoardSizeForFloor(state.floor);
    state.boardSize = boardSize;
    state.activeGemColors = getGemPoolForFloor(state.floor);
    state.floorThreat = { label: lt(threat.label), bossGain: threat.bossGain, pressure: threat.pressure };
    state.floorTheme = theme;
    applyThemeVisuals(theme);
    const unlockedNewColor = state.activeGemColors.length > previousColorCount;

    state.targetScore = Math.floor(cfg.target * (threat.targetMul + route.targetMulDelta));
    state.movesLeft = Math.max(8, cfg.moves + threat.movesDelta);
    state.floorScore = 0;
    state.mode = { type: "normal", item: null };
    state.modifier = randomPick(MODIFIERS);
    state.modGlass = 0;
    state.modLocks = 0;
    state.taxColor = null;
    state.taxColorTurns = 0;
    state.dropBoost = 0;
    state.chainBonus = 0;
    selected = null;

    if (route.floorsRemaining > 0) {
      state.movesLeft += route.moveBonus;
      state.movesLeft = Math.max(7, state.movesLeft - route.movePenalty);
      state.dropBoost += route.dropBoost;
      state.chainBonus += route.chainBonus;
      state.floorThreat.pressure += route.pressureDelta;
      route.floorsRemaining -= 1;
      if (route.floorsRemaining <= 0) {
        state.routePlan = { id: "main", title: "Main Path", floorsRemaining: 0, moveBonus: 0, movePenalty: 0, targetMulDelta: 0, pressureDelta: 0, dropBoost: 0, chainBonus: 0, shardBonus: 0 };
      }
    }

    if (state.nextFloorMovePenalty > 0) {
      state.movesLeft = Math.max(7, state.movesLeft - state.nextFloorMovePenalty);
      state.nextFloorMovePenalty = 0;
    }
    if (state.nextFloorMoveBonus > 0) {
      state.movesLeft += state.nextFloorMoveBonus;
      state.nextFloorMoveBonus = 0;
    }
    state.movesLeft += Number(meta.progression.upgrades.veteran_boots || 0);

    if (state.perks.overcharge) {
      state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 28);
    }
    state.momentum = Math.min(MOMENTUM_MAX, state.momentum + Number(meta.progression.upgrades.ember_core || 0) * 12);
    if (state.blessings.tactical_reserve) state.movesLeft += 1;
    if (state.blessings.chain_matrix) state.chainBonus += 0.15;
    if (state.blessings.supply_cache) refillCarriedCharges();
    if (unlockedNewColor) {
      state.movesLeft += 1;
      state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 18);
    }
    grantDragonHoardBonus();

    const satchelBonus = Number(meta.progression.upgrades.relic_satchel || 0);
    if (satchelBonus > 0) {
      addItemCharges("hammer", satchelBonus, false);
      addItemCharges("shuffle", satchelBonus, false);
    }

    state.board = createBoard();
    resolveAutoBoard();
    placeObstacles(cfg.obstacles + threat.obstacleBonus);
    state.modifier.apply(state);

    applyThemePressure(theme, threat);

    if (state.eventCurseFloors > 0) {
      state.eventCurseFloors -= 1;
      state.dropBoost += 0.08;
      state.chainBonus += 0.1;
    }

    const purifierOffset = state.blessings.purifier_sigil ? 2 : 0;
    if (state.modGlass > 0) placeGlass(Math.max(0, state.modGlass + threat.glassBonus - purifierOffset));
    if (state.modLocks > 0) placeLocks(Math.max(0, state.modLocks + Math.max(0, threat.pressure - 1) - purifierOffset));

    const isElite = ELITE_FLOORS.includes(state.floor);
    const bossProfile = getBossProfile(theme);
    state.boss.elite = isElite;
    state.boss.charge = 0;
    state.boss.max = 100;
    state.boss.hint = isElite
      ? (i18n.getLanguage() === "zh-CN" ? `${lt(theme.eliteBossName)}正在积蓄${lt(bossProfile.element)}能量 - ${lt(threat.label)}` : `${lt(theme.eliteBossName)} gathers ${lt(bossProfile.element)} energy - ${lt(threat.label)}`)
      : (i18n.getLanguage() === "zh-CN" ? `${lt(theme.bossName)}正在积蓄${lt(bossProfile.element)}能量 - ${lt(threat.label)}` : `${lt(theme.bossName)} gathers ${lt(bossProfile.element)} energy - ${lt(threat.label)}`);
    state.boss.phase = "charging";
    state.boss.casting = false;
    state.boss.lastActionEndedAt = Date.now();
    state.boss.pendingIdleMs = 0;

    overlayEl.classList.add("hidden");
    if (overlayActionsEl) overlayActionsEl.innerHTML = "";
    clearAnim.clear();
    fallAnim.clear();

    renderAll();
    showFloorIntro(threat);
    audio.play("floorStart");
    if (unlockedNewColor) {
      const newest = state.activeGemColors[state.activeGemColors.length - 1];
      notify(i18n.getLanguage() === "zh-CN"
        ? `解锁新宝石：${lt(GEM_COLOR_NAMES[newest])}。额外获得 +1 步和 +18 动量，帮助你平稳过渡。`
        : `New gem unlocked: ${lt(GEM_COLOR_NAMES[newest])}. +1 move and +18 momentum to ease the transition.`, "ok");
    }
    notify(i18n.getLanguage() === "zh-CN"
      ? `第 ${state.floor} 层开始：${lt(theme.title)} / ${state.routePlan.title} / ${lt(state.modifier.name)} / ${lt(threat.label)}。`
      : `Floor ${state.floor} begins: ${lt(theme.title)} / ${state.routePlan.title} / ${lt(state.modifier.name)} / ${lt(threat.label)}.`, "ok");
    scanGuideDiscoveries();
    maybeShowBossChargeGuide();
  }

  function getFloorThreat(floor) {
    return FLOOR_DIFFICULTY[Math.max(0, Math.min(FLOOR_DIFFICULTY.length - 1, floor - 1))];
  }

  function getFloorTheme(floor) {
    return CHAPTER_THEMES.find((theme) => floor >= theme.start && floor <= theme.end) || CHAPTER_THEMES[0];
  }

  function getBossProfile(theme = state.floorTheme) {
    return BOSS_PROFILES[theme?.id] || BOSS_PROFILES.ember_hollows;
  }

  function getBossEnergyGain() {
    const profile = getBossProfile();
    const permanentDampener = state.floor <= 6 ? Number(meta.progression.upgrades.boss_dampener || 0) : 0;
    const base = Number(profile.baseGain || 8);
    const threat = Number(state.floorThreat.bossGain || 0);
    const elite = state.boss.elite ? 2 : 0;
    const blessing = state.blessings.boss_shunt ? 2 : 0;
    return Math.max(6, base + threat + elite - blessing - permanentDampener);
  }

  function getBossChargeRatePerSecond() {
    return Math.max(4, Math.round(getBossEnergyGain() * 0.5));
  }

  function getBossIdleChargeGain(idleMs = 0) {
    if (!idleMs || idleMs <= 0) return 0;
    return Math.max(0, Math.floor((idleMs / 1000) * getBossChargeRatePerSecond()));
  }

  function getBossDisplayedCharge() {
    const base = Number(state.boss.charge || 0);
    if (state.boss.casting || inputLocked || state.gameOver || state.victory) return Math.min(state.boss.max, base);
    const idleMs = Math.max(0, Date.now() - Number(state.boss.lastActionEndedAt || Date.now()));
    return Math.min(state.boss.max, base + getBossIdleChargeGain(idleMs));
  }

  function getAvailableBossSkills() {
    const profile = getBossProfile();
    const skills = Array.isArray(profile.skills) ? profile.skills : [];
    const charge = getBossDisplayedCharge();
    return skills.filter((skill) => charge >= skill.cost);
  }

  function pickBossSkill() {
    const available = getAvailableBossSkills();
    if (available.length === 0) return null;
    return available[available.length - 1] || null;
  }

  function getBossThreatLevel() {
    const charge = getBossDisplayedCharge();
    if (charge >= 100) return 5;
    if (charge >= 80) return 4;
    if (charge >= 60) return 3;
    if (charge >= 40) return 2;
    if (charge >= 20) return 1;
    return 0;
  }

  function beginPlayerAction() {
    state.boss.pendingIdleMs = Math.max(0, Date.now() - Number(state.boss.lastActionEndedAt || Date.now()));
  }

  function finishPlayerAction() {
    state.boss.lastActionEndedAt = Date.now();
    state.boss.pendingIdleMs = 0;
  }

  function maybeShowBossChargeGuide() {
    if (meta.codex.guideSeen.boss_charge_rule) return false;
    meta.codex.guideSeen.boss_charge_rule = 1;
    saveMeta();
    overlayTitleEl.textContent = t("bossGuideTitle");
    overlayDescEl.textContent = t("bossGuideDesc");
    choiceWrapEl.innerHTML = "";
    overlayActionsEl.innerHTML = `<button type="button" class="btn overlay-btn" data-action="boss-guide-close">${t("bossGuideAction")}</button>`;
    const btn = overlayActionsEl.querySelector('[data-action="boss-guide-close"]');
    if (btn) {
      btn.addEventListener("click", () => {
        overlayEl.classList.add("hidden");
        finishPlayerAction();
        renderAll();
      });
    }
    overlayEl.classList.remove("hidden");
    return true;
  }

  function applyThemeVisuals(theme) {
    document.body.dataset.theme = theme.id;
    document.documentElement.style.setProperty("--bg-board-image", `url("${theme.boardImage}")`);
    document.documentElement.style.setProperty("--obstacle-image", `url("${theme.obstacleImage}")`);
    document.documentElement.style.setProperty("--chapter-gem-filter", theme.gemTone || "none");
    if (bossPortraitEl) bossPortraitEl.src = theme.bossPortrait;
  }

  function getGemPoolForFloor(floor) {
    return GEM_POOL_BY_FLOOR[Math.max(0, Math.min(GEM_POOL_BY_FLOOR.length - 1, floor - 1))] || [0, 1, 2, 3];
  }

  function nextGemColor(color) {
    const pool = state.activeGemColors || [0, 1, 2, 3];
    const idx = pool.indexOf(color);
    if (idx === -1) return pool[0];
    return pool[(idx + 1) % pool.length];
  }

  function getBoardSizeForFloor(floor) {
    const size = BOARD_SIZE_BY_FLOOR[Math.max(0, Math.min(BOARD_SIZE_BY_FLOOR.length - 1, floor - 1))] || MIN_BOARD_SIZE;
    return Math.max(MIN_BOARD_SIZE, Math.min(MAX_BOARD_SIZE, size));
  }

  function showFloorIntro(threat) {
    const fx = document.createElement("div");
    fx.className = "floor-intro";
    fx.innerHTML = `<strong>${lt(state.floorTheme.title)} · ${i18n.getLanguage() === "zh-CN" ? `第 ${state.floor} 层` : `Floor ${state.floor}`}</strong><small>${lt(threat.label)} - ${lt(state.modifier.name)} · ${state.activeGemColors.length} ${i18n.getLanguage() === "zh-CN" ? "种颜色" : "colors"}</small>`;
    fxLayerEl.appendChild(fx);

    spawnScreenPulse("floor", 620);
    shakeBoard(1.08);
    setTimeout(() => fx.remove(), 760);
  }

  function placeObstacles(count) {
    const idxs = collectIndices((c) => c && c.kind === "gem");
    shuffle(idxs);
    for (let i = 0; i < Math.min(count, idxs.length); i += 1) state.board[idxs[i]] = { kind: "obstacle" };
  }

  function placeGlass(count) {
    const idxs = collectIndices((c) => c && c.kind === "gem");
    shuffle(idxs);
    for (let i = 0; i < Math.min(count, idxs.length); i += 1) state.board[idxs[i]].glass = true;
  }

  function placeLocks(count) {
    const idxs = collectIndices((c) => c && c.kind === "gem" && c.lockedTurns <= 0 && !c.frozen);
    shuffle(idxs);
    for (let i = 0; i < Math.min(count, idxs.length); i += 1) state.board[idxs[i]].lockedTurns = 2;
  }

  function applyThemePressure(theme, threat) {
    if (theme.id === "frost_spire") {
      state.modLocks += 2 + Math.min(2, threat.pressure);
      state.modGlass += 1;
    }
    if (theme.id === "storm_peaks") {
      state.chainBonus += 0.08;
      state.dropBoost += 0.06;
    }
    if (theme.id === "stone_grove") {
      placeObstacles(1 + Math.max(0, threat.pressure - 1));
    }
    if (theme.id === "venom_bloom") {
      state.taxColor = randColor();
      state.dropBoost += 0.03;
    }
    if (theme.id === "tidal_depths") {
      state.chainBonus += 0.04;
    }
    if (theme.id === "mirror_circus") {
      state.modGlass += 1;
    }
    if (theme.id === "iron_forge") {
      placeObstacles(1 + Math.max(0, threat.pressure - 2));
      state.modGlass += 1;
    }
    if (theme.id === "eclipse_sanctum") {
      state.modLocks += 1;
      state.chainBonus += 0.05;
    }
    if (theme.id === "void_throne") {
      if (state.taxColor == null) state.taxColor = randColor();
      state.modGlass += 1;
      placeObstacles(1 + Math.max(0, threat.pressure - 2));
    }
  }

  function collectIndices(predicate) {
    const arr = [];
    for (let i = 0; i < state.board.length; i += 1) if (predicate(state.board[i])) arr.push(i);
    return arr;
  }

  function onItemClick(event) {
    if (inputLocked || state.gameOver || state.victory) return;
    const btn = event.target.closest(".ability");
    if (!btn) return;
    const item = btn.dataset.item;
    if (!item || getItemCount(item) <= 0 || !hasItemType(item)) return;
    audio.play("uiClick", { volume: 0.34 });

    if (!ITEM_DEFS[item].target) {
      inputLocked = true;
      spendItemCharge(item);
      recordCodex("itemUse", item);
      if (item === "shuffle") {
        useShuffle();
      } else {
        useLegendSkill(item);
      }
      return;
    }

    state.mode = { type: "target_item", item };
    selected = null;
    renderAll();
  }

  function onItemHover(event) {
    const btn = event.target.closest(".ability[data-item]");
    if (!btn || !itemTooltipEl) return;
    const item = btn.dataset.item;
    if (!item || !ITEM_DEFS[item]) return;
    itemTooltipEl.innerHTML = `<strong>${lt(ITEM_DEFS[item].name)} ${t("itemLevel", { level: getItemLevel(item) })}</strong><small>${lt(ITEM_DEFS[item].desc)}</small>`;
    itemTooltipEl.classList.remove("hidden");
  }

  function onItemHoverOut(event) {
    if (!itemTooltipEl) return;
    const related = event.relatedTarget;
    if (related && related.closest && related.closest("#itemWrap")) return;
    itemTooltipEl.classList.add("hidden");
  }

  async function onBoardClick(event) {
    if (inputLocked || state.gameOver || state.victory) return;
    const cell = event.target.closest(".cell");
    if (!cell) return;
    const idx = Number(cell.dataset.index);

    if (state.mode.type === "target_item") return useTargetItem(state.mode.item, idx);

    if (selected === null) {
      selected = idx;
      return renderBoard();
    }
    if (selected === idx) {
      selected = null;
      return renderBoard();
    }

    const a = selected;
    const b = idx;
    selected = null;

    if (!isAdjacent(a, b)) {
      selected = b;
      return renderBoard();
    }
    await attemptSwap(a, b);
  }

  async function attemptSwap(a, b) {
    const ca = state.board[a];
    const cb = state.board[b];
    if (!isGem(ca) || !isGem(cb)) {
      audio.play("uiError");
      return notify(i18n.getLanguage() === "zh-CN" ? "障碍格无法交换。" : "Obstacle tiles cannot be swapped.", "warn");
    }
    if (ca.lockedTurns > 0 || cb.lockedTurns > 0 || ca.frozen || cb.frozen) {
      audio.play("uiError");
      return notify(i18n.getLanguage() === "zh-CN" ? "被锁定的宝石无法交换。" : "A locked gem cannot be swapped.", "warn");
    }

    inputLocked = true;
    beginPlayerAction();
    audio.play("swap");
    await playSwapAnimation(a, b);

    if (ca.special && cb.special) {
      swap(a, b);
      consumeMove();
      const comboTargets = specialComboTargets(a, b, ca.special, cb.special);
      await resolveAction(comboTargets, "combo");
      await consumePostAction();
      return (inputLocked = false);
    }

    swap(a, b);
    const analysis = analyzeMatches();
    if (analysis.clear.length === 0) {
      swap(a, b);
      await playSwapAnimation(a, b);
      inputLocked = false;
      renderAll();
      audio.play("uiError", { volume: 0.34 });
      return notify(i18n.getLanguage() === "zh-CN" ? "无效交换：未形成匹配。" : "Invalid swap: no match formed.", "warn");
    }

    consumeMove();
    await resolveAction(analysis.clear, "normal", analysis.spawnMap, b);
    await consumePostAction();
    inputLocked = false;
  }

  async function useTargetItem(item, idx) {
    if (getItemCount(item) <= 0) return;
    const targets = getItemTargets(item, idx);
    if (targets.length === 0) {
      audio.play("uiError");
      return notify(i18n.getLanguage() === "zh-CN" ? "该道具不能用于这个位置。" : "That item cannot be used there.", "warn");
    }

    inputLocked = true;
    beginPlayerAction();
    audio.play("itemCast");
    spendItemCharge(item);
    state.mode = { type: "normal", item: null };
    recordCodex("itemUse", item);

    await playItemCastAnimation(item, idx);
    await resolveAction(targets, item);
    await consumePostAction();
    inputLocked = false;
  }

  function getItemTargets(item, idx) {
    const r = rowOf(idx);
    const c = colOf(idx);

    if (item === "hammer") {
      const power = itemPower(item);
      if (power <= 1) return [idx];
      const arr = [idx];
      for (let rr = r - 1; rr <= r + 1; rr += 1) for (let cc = c - 1; cc <= c + 1; cc += 1) if (inside(rr, cc)) arr.push(rr * boardSize + cc);
      return [...new Set(arr)];
    }
    if (item === "row") {
      const rows = [r];
      if (itemPower(item) >= 2 && inside(r - 1, c)) rows.push(r - 1);
      if (itemPower(item) >= 3 && inside(r + 1, c)) rows.push(r + 1);
      return [...new Set(rows.flatMap((row) => indicesInRow(row)))];
    }
    if (item === "cross") {
      const arr = [...indicesInRow(r), ...indicesInCol(c)];
      if (itemPower(item) >= 3) {
        if (inside(r - 1, c)) arr.push(...indicesInRow(r - 1));
        if (inside(r + 1, c)) arr.push(...indicesInRow(r + 1));
      }
      return [...new Set(arr)];
    }
    if (item === "color") {
      const cell = state.board[idx];
      if (!isGem(cell)) return [];
      if (cell.lockedTurns > 0 || cell.frozen) return [];
      const targets = collectIndices((x) => isGem(x) && x.color === cell.color);
      if (itemPower(item) >= 3) {
        const bonusColor = nextGemColor(cell.color);
        targets.push(...collectIndices((x) => isGem(x) && x.color === bonusColor));
      }
      return [...new Set(targets)];
    }
    return [];
  }

  async function useShuffle() {
    beginPlayerAction();
    audio.play("itemCast", { volume: 0.34, rate: 0.95 });
    const power = itemPower("shuffle");
    const gems = collectIndices(isGem).map((i) => state.board[i]);
    shuffle(gems);
    let k = 0;
    for (let i = 0; i < state.board.length; i += 1) {
      if (isGem(state.board[i])) {
        state.board[i] = gems[k++];
        fallAnim.add(i);
      }
    }
    renderAll();
    await sleep(220);
    fallAnim.clear();
    resolveAutoBoard();
    if (power >= 2) state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 10 + power * 2);
    if (power >= 3) {
      for (let i = 0; i < state.board.length; i += 1) if (isGem(state.board[i])) { state.board[i].lockedTurns = 0; state.board[i].frozen = false; }
    }
    renderAll();
    await consumePostAction();
    inputLocked = false;
    notify(i18n.getLanguage() === "zh-CN" ? "已使用道具：洗牌" : "Item used: Shuffle", "ok");
  }

  function applyLegendBossPressure() {
    if (state.perks.fever_smith) {
      state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 10);
    }
    if (!state.perks.boss_hunter) return;
    state.boss.charge = Math.max(0, state.boss.charge - 1);
  }

  async function useLegendSkill(skill) {
    if (skill === "screen_wipe") {
      await playSkillShowcase(lt(ITEM_DEFS.screen_wipe.name), "screen");
      const targets = collectIndices((x) => isGem(x) || (itemPower(skill) >= 2 && isObstacle(x)));
      recordCodex("skillUse", "screen_wipe");
      applyLegendBossPressure();
      meta.codex.maxSingleClear = Math.max(meta.codex.maxSingleClear, targets.length);
      saveMeta();
      await resolveAction(targets, "legend");
      await consumePostAction();
      inputLocked = false;
      return;
    }

    if (skill === "rainbow_burst") {
      await playSkillShowcase(lt(ITEM_DEFS.rainbow_burst.name), "rainbow");
      const first = randColor();
      let second = randColor();
      if (second === first) second = nextGemColor(first);
      const targets = collectIndices((x) => isGem(x) && (x.color === first || x.color === second));
      const extra = collectIndices((x) => isGem(x) && x.special).slice(0, itemPower(skill) >= 2 ? 16 : 10);
      const merged = [...new Set([...targets, ...extra])];
      recordCodex("skillUse", "rainbow_burst");
      applyLegendBossPressure();
      meta.codex.maxSingleClear = Math.max(meta.codex.maxSingleClear, merged.length);
      saveMeta();
      await resolveAction(merged, "legend");
      await consumePostAction();
      inputLocked = false;
      return;
    }

    if (skill === "time_freeze") {
      await playSkillShowcase(lt(ITEM_DEFS.time_freeze.name), "screen");
      state.movesLeft += 2 + itemPower(skill);
      state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 18 + itemPower(skill) * 4 + (state.perks.fever_smith ? 8 : 0));
      for (let i = 0; i < state.board.length; i += 1) {
        if (isGem(state.board[i])) { state.board[i].lockedTurns = 0; state.board[i].frozen = false; }
      }
      recordCodex("skillUse", "time_freeze");
      applyLegendBossPressure();
      notify(i18n.getLanguage() === "zh-CN"
        ? `时间冻结提供 +${2 + itemPower(skill)} 步，并移除全部锁定。`
        : `Time Freeze grants +${2 + itemPower(skill)} moves and removes all locks.`, "ok");
      renderAll();
      await consumePostAction();
      inputLocked = false;
      return;
    }

    if (skill === "boss_breaker") {
      await playSkillShowcase(lt(ITEM_DEFS.boss_breaker.name), "rainbow");
      const targets = collectIndices((x) => isGem(x));
      shuffle(targets);
      const chosen = targets.slice(0, Math.min(12 + itemPower(skill) * 3, targets.length));
      state.boss.charge = Math.max(0, state.boss.charge - Math.ceil(state.boss.max * (0.45 + itemPower(skill) * 0.12)));
      state.boss.hint = i18n.getLanguage() === "zh-CN" ? "Boss 粉碎者：能量已击碎" : "Boss Breaker: charge shattered";
      recordCodex("skillUse", "boss_breaker");
      applyLegendBossPressure();
      meta.codex.maxSingleClear = Math.max(meta.codex.maxSingleClear, chosen.length);
      saveMeta();
      await resolveAction(chosen, "legend");
      await consumePostAction();
      inputLocked = false;
      return;
    }

    inputLocked = false;
  }

  async function playSkillShowcase(name, theme = "screen") {
    const fx = document.createElement("div");
    fx.className = `skill-showcase ${theme}`;
    fx.textContent = name;
    fxLayerEl.appendChild(fx);
    audio.play("itemCast", { volume: 0.38, rate: theme === "screen" ? 0.92 : 1.05 });

    spawnScreenPulse(theme === "screen" ? "skill-screen" : "skill-rainbow", 520);
    boardWrapEl.classList.add("boss-cast");
    shakeBoard(theme === "screen" ? 1.45 : 1.35);
    await sleep(120);

    for (let i = 0; i < 6; i += 1) {
      spawnShockwaveFX(Math.floor(Math.random() * boardSize * boardSize), true);
    }
    await sleep(320);

    fx.remove();
    boardWrapEl.classList.remove("boss-cast");
  }

  async function consumePostAction() {
    decayLocks();
    spreadBurning();
    spreadPoison();
    decayTaxColor();
    if (state.feverTurns > 0) state.feverTurns -= 1;
    await tickBoss();
    finishPlayerAction();
    checkFloorState();
    renderAll();
    scanGuideDiscoveries();
  }

  function decayLocks() {
    for (let i = 0; i < state.board.length; i += 1) {
      const cell = state.board[i];
      if (isGem(cell) && cell.lockedTurns > 0) cell.lockedTurns -= 1;
    }
  }

  function spreadBurning() {
    const burningSeeds = collectIndices((cell) => isGem(cell) && cell.burning);
    if (burningSeeds.length === 0) return 0;

    const spreadTargets = new Set();
    const spreadPairs = [];
    for (const idx of burningSeeds) {
      const r = rowOf(idx);
      const c = colOf(idx);
      const localCandidates = [];
      for (let rr = r - 1; rr <= r + 1; rr += 1) {
        for (let cc = c - 1; cc <= c + 1; cc += 1) {
          if (rr === r && cc === c) continue;
          if (!inside(rr, cc)) continue;
          const nextIdx = rr * boardSize + cc;
          const cell = state.board[nextIdx];
          if (!isGem(cell) || cell.burning) continue;
          localCandidates.push(nextIdx);
        }
      }

      shuffle(localCandidates);
      const spreadCount = Math.min(localCandidates.length, Math.random() < 0.5 ? 1 : 2);
      for (const nextIdx of localCandidates.slice(0, spreadCount)) {
        if (spreadTargets.has(nextIdx)) continue;
        spreadTargets.add(nextIdx);
        spreadPairs.push([idx, nextIdx]);
      }
    }

    for (const idx of spreadTargets) {
      if (!isGem(state.board[idx])) continue;
      state.board[idx].burning = true;
      state.board[idx].glass = false;
      spawnShockwaveFX(idx, true);
    }

    if (spreadTargets.size > 0) {
      const center = [...spreadTargets][0];
      spawnBurnSpreadLinks(spreadPairs);
      spawnFloatText(i18n.getLanguage() === "zh-CN" ? `火势蔓延 ${spreadTargets.size}` : `Fire spreads ${spreadTargets.size}`, center);
      notify(
        i18n.getLanguage() === "zh-CN"
          ? `灼烧扩散到 ${spreadTargets.size} 枚周围宝石！`
          : `Burning spreads to ${spreadTargets.size} nearby gems!`,
        "warn",
      );
      shakeBoard(1.18);
      renderAll();
    }

    return spreadTargets.size;
  }

  function spreadPoison() {
    const seeds = collectIndices((cell) => isGem(cell) && (cell.poisonedTurns || 0) > 0);
    if (seeds.length === 0) return 0;

    const spreadTargets = new Set();
    for (const idx of seeds) {
      const source = state.board[idx];
      if (!isGem(source) || source.poisonedTurns <= 0) continue;
      const r = rowOf(idx);
      const c = colOf(idx);
      const localCandidates = [];
      for (let rr = r - 1; rr <= r + 1; rr += 1) {
        for (let cc = c - 1; cc <= c + 1; cc += 1) {
          if (rr === r && cc === c) continue;
          if (!inside(rr, cc)) continue;
          const nextIdx = rr * boardSize + cc;
          const cell = state.board[nextIdx];
          if (!isGem(cell) || (cell.poisonedTurns || 0) > 0) continue;
          localCandidates.push(nextIdx);
        }
      }
      shuffle(localCandidates);
      const spreadCount = Math.min(localCandidates.length, 1);
      for (const nextIdx of localCandidates.slice(0, spreadCount)) spreadTargets.add(nextIdx);
      source.poisonedTurns = Math.max(0, source.poisonedTurns - 1);
    }

    for (const idx of spreadTargets) {
      const cell = state.board[idx];
      if (!isGem(cell)) continue;
      cell.poisonedTurns = Math.max(cell.poisonedTurns || 0, 2);
      spawnShockwaveFX(idx, false);
    }

    if (spreadTargets.size > 0) {
      const center = [...spreadTargets][0];
      spawnFloatText(i18n.getLanguage() === "zh-CN" ? `感染扩散 ${spreadTargets.size}` : `Poison spreads ${spreadTargets.size}`, center);
      notify(i18n.getLanguage() === "zh-CN" ? `感染扩散到 ${spreadTargets.size} 枚周围宝石！` : `Infection spreads to ${spreadTargets.size} nearby gems!`, "warn");
      renderAll();
    }
    return spreadTargets.size;
  }

  function decayTaxColor() {
    if ((state.taxColorTurns || 0) <= 0) return;
    state.taxColorTurns -= 1;
    if (state.taxColorTurns <= 0) state.taxColor = null;
  }

  function spawnBurnSpreadLinks(pairs) {
    const host = document.body;
    for (const [from, to] of pairs.slice(0, 14)) {
      const fromEl = boardEl.querySelector(`.cell[data-index="${from}"]`);
      const toEl = boardEl.querySelector(`.cell[data-index="${to}"]`);
      if (!fromEl || !toEl) continue;

      const a = fromEl.getBoundingClientRect();
      const b = toEl.getBoundingClientRect();
      const ax = a.left + a.width / 2;
      const ay = a.top + a.height / 2;
      const bx = b.left + b.width / 2;
      const by = b.top + b.height / 2;
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      const beam = document.createElement("i");
      beam.className = "fx-burn-link";
      beam.style.left = `${ax}px`;
      beam.style.top = `${ay}px`;
      beam.style.width = `${len}px`;
      beam.style.setProperty("--burn-angle", `${angle}rad`);
      host.appendChild(beam);
      setTimeout(() => beam.remove(), 420);

      const ember = document.createElement("i");
      ember.className = "fx-burn-link-head";
      ember.style.left = `${bx}px`;
      ember.style.top = `${by}px`;
      host.appendChild(ember);
      setTimeout(() => ember.remove(), 360);
    }
  }

  async function tickBoss() {
    if (state.gameOver || state.victory || state.boss.casting) return;
    const idleMs = Number(state.boss.pendingIdleMs || 0);
    const gain = getBossIdleChargeGain(idleMs);
    state.boss.charge = Math.min(state.boss.max, state.boss.charge + gain);
    state.boss.phase = state.boss.charge >= 20 ? "ready" : "charging";
    if (state.boss.charge < 20) {
      state.boss.hint = gain > 0
        ? t("bossIdleHint", { seconds: (idleMs / 1000).toFixed(1), charge: gain })
        : (i18n.getLanguage() === "zh-CN" ? "Boss 正在等待你停手蓄能" : "The boss is waiting to charge while you idle");
      return;
    }

    state.boss.casting = true;
    state.boss.phase = "ready";
    state.boss.hint = i18n.getLanguage() === "zh-CN"
      ? `Boss 在你停手 ${(idleMs / 1000).toFixed(1)} 秒后蓄能至 ${state.boss.charge}/100`
      : `The boss charged to ${state.boss.charge}/100 after ${(idleMs / 1000).toFixed(1)}s of idle time`;
    notify(i18n.getLanguage() === "zh-CN" ? "你一出手，Boss 就跟着出招了！" : "You acted, and the boss answered immediately!", "warn");
    audio.play("bossCast", { volume: 0.24, rate: 0.84 });
    boardWrapEl.classList.add("boss-telegraph");
    renderAll();
    await sleep(360);

    const skill = pickBossSkill();
    if (skill) await castBossSkill(skill);

    boardWrapEl.classList.remove("boss-telegraph");
    state.boss.phase = "charging";
    state.boss.casting = false;
  }

  async function castBossSkill(skillEntry) {
    const skill = typeof skillEntry === "string" ? { id: skillEntry, cost: 20, name: zhen(skillEntry, skillEntry) } : skillEntry;
    recordCodex("bossSeen", skill.id);
    audio.play("bossCast", { volume: 0.44, rate: skill.id === "star_abyss_end" ? 0.82 : 1 });
    boardWrapEl.classList.add("boss-cast");
    if (bossPortraitEl) bossPortraitEl.classList.add("casting");
    spawnScreenPulse("boss", 520);
    await resolveBossSkill(skill);
    state.boss.charge = Math.max(0, state.boss.charge - Number(skill.cost || 20));
    renderAll();
    await sleep(220);
    if (bossPortraitEl) bossPortraitEl.classList.remove("casting");
    boardWrapEl.classList.remove("boss-cast");
  }

  function applyBossPressure(skill) {
    const pressure = state.floorThreat.pressure || 0;
    if (["ember_spark", "tail_scorch", "cinder_spread", "foxfire_ring", "wildfire_pounce", "toxin_dust", "thorn_bind", "spore_bloom", "rot_garden", "royal_pollution"].includes(skill)) {
      const reduction = state.perks.pressure_valve ? 1 : 0;
      const loss = Math.max(0, 1 + Math.min(1, pressure) - reduction);
      state.movesLeft = Math.max(0, state.movesLeft - loss);
      if (loss > 0) spawnFloatText(i18n.getLanguage() === "zh-CN" ? `-${loss} 步` : `-${loss} Move`, Math.floor((boardSize * boardSize) / 2));
      return;
    }
    if (["glacier_column", "absolute_stillness", "cave_in", "elder_root_wall", "chain_burst", "duel_of_storms", "tail_wave", "abyss_tsunami", "mirror_maze", "thousand_masks", "heavy_press", "steelflame_domain", "abyss_gaze", "revelation_zero", "world_crack", "emperor_decree", "star_abyss_end"].includes(skill)) {
      const reduction = state.perks.pressure_valve ? 1 : 0;
      const loss = Math.max(0, (state.boss.elite ? 2 : 1) + pressure - reduction);
      state.movesLeft = Math.max(0, state.movesLeft - loss);
      if (loss > 0) spawnFloatText(i18n.getLanguage() === "zh-CN" ? `-${loss} 步` : `-${loss} Move`, Math.floor((boardSize * boardSize) / 2));
    }
  }

  function setBossCastHint(skillName, detailZh, detailEn) {
    state.boss.hint = i18n.getLanguage() === "zh-CN"
      ? `${skillName}：${detailZh}`
      : `${skillName}: ${detailEn}`;
  }

  function notifyBossCast(skillName, extraZh = "Boss 技能生效！", extraEn = "Boss skill activated!") {
    notify(i18n.getLanguage() === "zh-CN"
      ? `Boss 施放【${skillName}】！${extraZh}`
      : `Boss casts [${skillName}]! ${extraEn}`, "warn");
  }

  async function resolveBossSkill(skill) {
    const gems = collectIndices((x) => isGem(x));
    const unlockedGems = collectIndices((x) => isGem(x) && x.lockedTurns <= 0 && !x.frozen);
    shuffle(gems);
    shuffle(unlockedGems);

    const markGlass = (count) => {
      const targets = gems.slice(0, Math.min(count, gems.length));
      for (const idx of targets) if (isGem(state.board[idx])) state.board[idx].glass = true;
      return targets.length;
    };

    const markBurning = (count) => {
      const targets = gems.slice(0, Math.min(count, gems.length));
      for (const idx of targets) {
        if (!isGem(state.board[idx])) continue;
        state.board[idx].burning = true;
        state.board[idx].glass = false;
      }
      return targets.length;
    };

    const markLocks = (count, turns = 2) => {
      const targets = unlockedGems.slice(0, Math.min(count, unlockedGems.length));
      for (const idx of targets) if (isGem(state.board[idx])) state.board[idx].lockedTurns = Math.max(state.board[idx].lockedTurns, turns);
      return targets.length;
    };

    const recolor = (count) => {
      const from = randColor();
      let to = randColor();
      if (to === from) to = nextGemColor(from);
      const candidates = collectIndices((x) => isGem(x) && x.color === from && x.lockedTurns <= 0 && !x.frozen);
      shuffle(candidates);
      const size = Math.min(count, candidates.length);
      for (let i = 0; i < size; i += 1) state.board[candidates[i]].color = to;
      return size;
    };

    const addObstacles = (count) => {
      const candidates = collectIndices((x) => isGem(x));
      shuffle(candidates);
      const size = Math.min(count, candidates.length);
      for (let i = 0; i < size; i += 1) state.board[candidates[i]] = { kind: "obstacle" };
      return size;
    };

    const rotateRow = () => {
      const row = Math.floor(Math.random() * boardSize);
      const indices = indicesInRow(row);
      const values = indices.map((idx) => state.board[idx]);
      values.unshift(values.pop());
      indices.forEach((idx, i) => { state.board[idx] = values[i]; });
      return row;
    };

    const rotateCol = () => {
      const col = Math.floor(Math.random() * boardSize);
      const indices = indicesInCol(col);
      const values = indices.map((idx) => state.board[idx]);
      values.push(values.shift());
      indices.forEach((idx, i) => { state.board[idx] = values[i]; });
      return col;
    };

    const pulseBoard = (count = 6, power = 1.4) => {
      for (let i = 0; i < count; i += 1) spawnShockwaveFX(Math.floor(Math.random() * boardSize * boardSize), true);
      shakeBoard(power);
    };

    switch (skill.id) {
      case "ember_spark": {
        const count = markBurning(state.boss.elite ? 4 : 2);
        state.boss.hint = i18n.getLanguage() === "zh-CN" ? `余烬火花：${count} 枚宝石进入灼伤态，需先熄火再消除` : `Ember Spark: ${count} gems are burning and need an extra clear`;
        notify(i18n.getLanguage() === "zh-CN" ? "Boss 施放了余烬火花！" : "Boss casts Ember Spark!", "warn");
        applyBossPressure(skill.id);
        break;
      }
      case "tail_scorch": {
        const row = Math.floor(Math.random() * boardSize);
        const targets = indicesInRow(row).filter((idx) => isGem(state.board[idx])).slice(0, state.boss.elite ? 5 : 3);
        for (const idx of targets) {
          state.board[idx].burning = true;
          state.board[idx].glass = false;
        }
        state.boss.hint = i18n.getLanguage() === "zh-CN" ? `尾焰灼烧：第 ${row + 1} 行有 ${targets.length} 枚宝石被点燃` : `Tail Scorch: ${targets.length} gems in row ${row + 1} are burning`;
        notify(i18n.getLanguage() === "zh-CN" ? "Boss 用尾焰灼烧横扫了棋盘！" : "Boss sweeps the board with Tail Scorch!", "warn");
        applyBossPressure(skill.id);
        break;
      }
      case "cinder_spread": {
        const count = recolor(state.boss.elite ? 14 : 9);
        state.boss.hint = i18n.getLanguage() === "zh-CN" ? `灰烬扩散：${count} 枚宝石变得不稳定` : `Cinder Spread: ${count} gems turned volatile`;
        notify(i18n.getLanguage() === "zh-CN" ? "灰烬在棋盘上蔓延！" : "Cinders spread across the board!", "warn");
        applyBossPressure(skill.id);
        break;
      }
      case "foxfire_ring": {
        const count = markBurning(state.boss.elite ? 8 : 6);
        markLocks(state.boss.elite ? 3 : 2, 1);
        state.boss.hint = i18n.getLanguage() === "zh-CN" ? `狐火之环：${count} 枚宝石被狐火点燃并短暂封位` : `Foxfire Ring: ${count} gems ignited and briefly pinned`;
        notify(i18n.getLanguage() === "zh-CN" ? "狐火之环包围了关键格子！" : "Foxfire Ring surrounds key tiles!", "warn");
        applyBossPressure(skill.id);
        break;
      }
      case "wildfire_pounce": {
        const burning = markBurning(state.boss.elite ? 12 : 8);
        const locks = markLocks(state.boss.elite ? 4 : 2, 2);
        state.boss.hint = i18n.getLanguage() === "zh-CN" ? `野火扑袭：${burning} 枚宝石进入灼伤态，${locks} 枚被锁定` : `Wildfire Pounce: ${burning} burning gems, ${locks} pinned`;
        notify(i18n.getLanguage() === "zh-CN" ? "野火扑袭吞没了棋盘！" : "Wildfire Pounce engulfs the board!", "warn");
        pulseBoard(8, 1.55);
        applyBossPressure(skill.id);
        break;
      }
      case "chill_script": {
        const lockedCandidates = collectIndices((cell) => isGem(cell) && cell.lockedTurns <= 0 && !cell.frozen && cell.special).concat(collectIndices((cell) => isGem(cell) && cell.lockedTurns <= 0 && !cell.frozen && !cell.special));
        const targets = [...new Set(lockedCandidates)].slice(0, state.boss.elite ? 4 : 2);
        let frozen = 0;
        let frosted = 0;
        for (const idx of targets) {
          const cell = state.board[idx];
          if (!isGem(cell)) continue;
          if (cell.frozen) {
            cell.glass = true;
            frosted += 1;
          } else {
            cell.frozen = true;
            frozen += 1;
          }
        }
        setBossCastHint(lt(skill.name), `冻结 ${frozen} 枚，覆霜 ${frosted} 枚`, `${frozen} frozen, ${frosted} frosted`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "frost_page": {
        const center = gems[0];
        const r = rowOf(center);
        const c = colOf(center);
        const cross = [[r, c], [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
        let frozen = 0;
        let frosted = 0;
        for (const [rr, cc] of cross) {
          if (!inside(rr, cc)) continue;
          const idx = rr * boardSize + cc;
          const cell = state.board[idx];
          if (!isGem(cell)) continue;
          if (rr === r && cc === c) {
            cell.frozen = true;
            frozen += 1;
          } else {
            cell.glass = true;
            frosted += 1;
          }
        }
        setBossCastHint(lt(skill.name), `中心冻结 ${frozen} 枚，十字覆霜 ${frosted} 枚`, `center ${frozen} frozen, cross ${frosted} frosted`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "winter_seal": {
        const targets = gems.slice(0, Math.min(state.boss.elite ? 10 : 6, gems.length));
        let frosted = 0;
        let upgraded = 0;
        for (const idx of targets) {
          const cell = state.board[idx];
          if (!isGem(cell)) continue;
          if (cell.glass) {
            cell.frozen = true;
            upgraded += 1;
          } else {
            cell.glass = true;
            frosted += 1;
          }
        }
        setBossCastHint(lt(skill.name), `${frosted} 覆霜，${upgraded} 升级冻结`, `${frosted} frosted, ${upgraded} upgraded to freeze`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "glacier_column": {
        const col = Math.floor(Math.random() * boardSize);
        const targets = indicesInCol(col).filter((idx) => isGem(state.board[idx]));
        for (const idx of targets) state.board[idx].frozen = true;
        for (const sideCol of [col - 1, col + 1]) {
          if (sideCol < 0 || sideCol >= boardSize) continue;
          for (const idx of indicesInCol(sideCol).filter((index) => isGem(state.board[index])).slice(0, 2)) state.board[idx].glass = true;
        }
        setBossCastHint(lt(skill.name), `第 ${col + 1} 列被冻结，侧格覆霜`, `column ${col + 1} frozen and side tiles frosted`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "absolute_stillness": {
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * boardSize);
        let frozen = 0;
        let frosted = 0;
        for (const idx of [...indicesInRow(row), ...indicesInCol(col)]) {
          const cell = state.board[idx];
          if (!isGem(cell)) continue;
          cell.glass = true;
          cell.frozen = true;
          frozen += 1;
          frosted += 1;
        }
        const crossIdx = row * boardSize + col;
        if (isGem(state.board[crossIdx])) state.board[crossIdx].frozen = true;
        setBossCastHint(lt(skill.name), `冻结第 ${row + 1} 行与第 ${col + 1} 列`, `freeze row ${row + 1} and col ${col + 1}`);
        notifyBossCast(lt(skill.name));
        pulseBoard(8, 1.5);
        applyBossPressure(skill.id);
        break;
      }
      case "pebble_drop": {
        const count = addObstacles(state.boss.elite ? 3 : 2);
        setBossCastHint(lt(skill.name), `新增 ${count} 个障碍`, `${count} obstacles added`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "bark_armor": {
        const count = markGlass(state.boss.elite ? 6 : 4);
        setBossCastHint(lt(skill.name), `${count} 枚宝石获得护甲`, `${count} armored gems`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "burrow_rise": {
        const count = addObstacles(state.boss.elite ? 4 : 3);
        setBossCastHint(lt(skill.name), `升起 ${count} 根石柱`, `${count} stone pillars raised`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "cave_in": {
        const count = addObstacles(state.boss.elite ? 6 : 4);
        markLocks(state.boss.elite ? 4 : 2, 1);
        setBossCastHint(lt(skill.name), `${count} 个格子坍塌`, `${count} tiles collapsed`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "elder_root_wall": {
        const count = addObstacles(state.boss.elite ? 8 : 6);
        markGlass(state.boss.elite ? 6 : 4);
        setBossCastHint(lt(skill.name), `生长出 ${count} 个封锁点`, `${count} blockers grown`);
        notifyBossCast(lt(skill.name));
        pulseBoard(8, 1.55);
        applyBossPressure(skill.id);
        break;
      }
      case "static_pin": {
        const count = recolor(state.boss.elite ? 8 : 5);
        setBossCastHint(lt(skill.name), `${count} 枚宝石过载`, `${count} gems overloaded`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "thunder_lance": {
        const col = rotateCol();
        setBossCastHint(lt(skill.name), `第 ${col + 1} 列被偏移`, `column ${col + 1} displaced`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "overload_mark": {
        const count = recolor(state.boss.elite ? 12 : 8);
        markLocks(state.boss.elite ? 3 : 2, 1);
        setBossCastHint(lt(skill.name), `${count} 枚宝石被改变`, `${count} gems altered`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "chain_burst": {
        const row = rotateRow();
        const col = rotateCol();
        setBossCastHint(lt(skill.name), `第 ${row + 1} 行 / 第 ${col + 1} 列发生位移`, `row ${row + 1} / col ${col + 1} shifted`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "duel_of_storms": {
        const shifts = state.boss.elite ? 4 : 3;
        for (let i = 0; i < shifts; i += 1) rotateCol();
        recolor(state.boss.elite ? 14 : 10);
        setBossCastHint(lt(skill.name), `棋盘发生大规模位移`, `board heavily displaced`);
        notifyBossCast(lt(skill.name));
        pulseBoard(8, 1.55);
        applyBossPressure(skill.id);
        break;
      }
      case "toxin_dust": {
        const targets = gems.slice(0, Math.min(state.boss.elite ? 8 : 5, gems.length));
        for (const idx of targets) if (isGem(state.board[idx])) state.board[idx].poisonedTurns = Math.max(state.board[idx].poisonedTurns || 0, 2);
        setBossCastHint(lt(skill.name), `${targets.length} 枚宝石被感染`, `${targets.length} gems infected`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "thorn_bind": {
        const infected = collectIndices((cell) => isGem(cell) && (cell.poisonedTurns || 0) > 0);
        if (infected.length < (state.boss.elite ? 5 : 3)) {
          for (const idx of gems.slice(0, Math.min((state.boss.elite ? 5 : 3) - infected.length, gems.length))) {
            if (isGem(state.board[idx])) state.board[idx].poisonedTurns = Math.max(state.board[idx].poisonedTurns || 0, 2);
          }
        }
        const entangleTargets = collectIndices((cell) => isGem(cell) && (cell.poisonedTurns || 0) > 0).slice(0, state.boss.elite ? 5 : 3);
        for (const idx of entangleTargets) state.board[idx].lockedTurns = Math.max(state.board[idx].lockedTurns, 2);
        setBossCastHint(lt(skill.name), `${entangleTargets.length} 枚感染宝石被束缚`, `${entangleTargets.length} infected gems bound`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "spore_bloom": {
        const hadPoison = collectIndices((cell) => isGem(cell) && (cell.poisonedTurns || 0) > 0).length > 0;
        const count = hadPoison ? spreadPoison() : (() => {
          const targets = gems.slice(0, Math.min(state.boss.elite ? 12 : 8, gems.length));
          for (const idx of targets) if (isGem(state.board[idx])) state.board[idx].poisonedTurns = Math.max(state.board[idx].poisonedTurns || 0, 2);
          return targets.length;
        })();
        setBossCastHint(lt(skill.name), `${count} 枚宝石受到孢子扩散`, `${count} gems hit by spore spread`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "rot_garden": {
        const infectedTargets = gems.slice(0, Math.min(state.boss.elite ? 12 : 8, gems.length));
        for (const idx of infectedTargets) if (isGem(state.board[idx])) state.board[idx].poisonedTurns = Math.max(state.board[idx].poisonedTurns || 0, 2);
        const infectedCells = collectIndices((cell) => isGem(cell) && (cell.poisonedTurns || 0) > 0 && !cell.special);
        shuffle(infectedCells);
        const chosen = infectedCells.slice(0, state.boss.elite ? 3 : 2);
        for (const idx of chosen) state.board[idx] = { kind: "obstacle" };
        setBossCastHint(lt(skill.name), `${infectedTargets.length} 感染，${chosen.length} 腐株生成`, `${infectedTargets.length} infected, ${chosen.length} rot growths`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "royal_pollution": {
        const colorCounts = new Map();
        for (const idx of gems) {
          const cell = state.board[idx];
          if (!isGem(cell)) continue;
          colorCounts.set(cell.color, (colorCounts.get(cell.color) || 0) + 1);
          cell.poisonedTurns = Math.max(cell.poisonedTurns || 0, isGem(cell) ? 2 : 0);
        }
        const dominantColor = [...colorCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? randColor();
        state.taxColor = dominantColor;
        state.taxColorTurns = 2;
        const locks = markLocks(state.boss.elite ? 6 : 4, 2);
        setBossCastHint(lt(skill.name), `${gems.length} 感染，颜色税锁定 2 回合`, `${gems.length} infected, color tax for 2 turns`);
        notifyBossCast(lt(skill.name));
        pulseBoard(8, 1.55);
        applyBossPressure(skill.id);
        break;
      }
      case "splash_shift": {
        const row = rotateRow();
        setBossCastHint(lt(skill.name), `第 ${row + 1} 行被潮水推移`, `row ${row + 1} washed aside`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "undertow_pull": {
        const col = rotateCol();
        setBossCastHint(lt(skill.name), `第 ${col + 1} 列被暗流拖拽`, `column ${col + 1} dragged`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "tide_pool": {
        const rows = state.boss.elite ? 2 : 1;
        for (let i = 0; i < rows; i += 1) rotateRow();
        setBossCastHint(lt(skill.name), `形成 ${rows} 条行流`, `${rows} row currents formed`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "tail_wave": {
        const shifts = state.boss.elite ? 3 : 2;
        for (let i = 0; i < shifts; i += 1) rotateCol();
        addObstacles(state.boss.elite ? 3 : 2);
        setBossCastHint(lt(skill.name), `列被推移并升起珊瑚障碍`, `columns displaced and coral raised`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "abyss_tsunami": {
        for (let i = 0; i < 2; i += 1) rotateRow();
        for (let i = 0; i < 2; i += 1) rotateCol();
        addObstacles(state.boss.elite ? 4 : 3);
        setBossCastHint(lt(skill.name), `全盘发生位移`, `full-board displacement`);
        notifyBossCast(lt(skill.name));
        pulseBoard(8, 1.55);
        applyBossPressure(skill.id);
        break;
      }
      case "mirror_glint": {
        const count = recolor(state.boss.elite ? 8 : 5);
        setBossCastHint(lt(skill.name), `${count} 枚宝石被伪装`, `${count} gems disguised`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "false_match": {
        const row = rotateRow();
        setBossCastHint(lt(skill.name), `第 ${row + 1} 行出现伪装匹配`, `row ${row + 1} faked`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "prism_shuffle": {
        const count = recolor(state.boss.elite ? 12 : 8);
        rotateRow();
        setBossCastHint(lt(skill.name), `${count} 枚宝石被棱镜扭转`, `${count} gems refracted`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "mirror_maze": {
        rotateRow();
        rotateCol();
        markLocks(state.boss.elite ? 4 : 2, 1);
        setBossCastHint(lt(skill.name), `通路被镜像扭曲`, `routes bent out of shape`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "thousand_masks": {
        recolor(state.boss.elite ? 18 : 12);
        rotateRow();
        rotateCol();
        setBossCastHint(lt(skill.name), `幻象全面侵袭`, `total illusion assault`);
        notifyBossCast(lt(skill.name));
        pulseBoard(8, 1.55);
        applyBossPressure(skill.id);
        break;
      }
      case "iron_slag": {
        const count = addObstacles(state.boss.elite ? 3 : 2);
        setBossCastHint(lt(skill.name), `锻造出 ${count} 个炽热障碍`, `${count} hot blocks forged`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "anvil_slam": {
        const count = markLocks(state.boss.elite ? 5 : 3, 2);
        setBossCastHint(lt(skill.name), `${count} 个格子被压制`, `${count} tiles pinned`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "furnace_core": {
        const obstacles = addObstacles(state.boss.elite ? 5 : 3);
        const glass = markGlass(state.boss.elite ? 6 : 4);
        setBossCastHint(lt(skill.name), `${obstacles} 障碍，${glass} 炽热宝石`, `${obstacles} blocks, ${glass} heated gems`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "heavy_press": {
        const obstacles = addObstacles(state.boss.elite ? 6 : 4);
        setBossCastHint(lt(skill.name), `${obstacles} 处区域被压缩`, `${obstacles} sections compressed`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "steelflame_domain": {
        const obstacles = addObstacles(state.boss.elite ? 8 : 6);
        const locks = markLocks(state.boss.elite ? 5 : 3, 2);
        setBossCastHint(lt(skill.name), `${obstacles} 障碍，${locks} 锁定`, `${obstacles} blocks, ${locks} pinned`);
        notifyBossCast(lt(skill.name));
        pulseBoard(8, 1.55);
        applyBossPressure(skill.id);
        break;
      }
      case "radiance_mark": {
        const count = markGlass(state.boss.elite ? 8 : 5);
        setBossCastHint(lt(skill.name), `${count} 枚宝石被烙印`, `${count} gems branded`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "eclipse_wing": {
        const count = markLocks(state.boss.elite ? 5 : 3, 2);
        setBossCastHint(lt(skill.name), `${count} 枚宝石被压制`, `${count} gems subdued`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "judgment_wheel": {
        const count = recolor(state.boss.elite ? 14 : 10);
        setBossCastHint(lt(skill.name), `${count} 枚宝石被重判`, `${count} gems judged`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "abyss_gaze": {
        const obstacles = addObstacles(state.boss.elite ? 4 : 2);
        const locks = markLocks(state.boss.elite ? 4 : 2, 2);
        setBossCastHint(lt(skill.name), `打开 ${obstacles} 处虚空裂口`, `${obstacles} voids opened`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "revelation_zero": {
        const recolored = recolor(state.boss.elite ? 16 : 12);
        const locks = markLocks(state.boss.elite ? 6 : 4, 2);
        const glass = markGlass(state.boss.elite ? 8 : 5);
        setBossCastHint(lt(skill.name), `${recolored} 重判，${locks} 封锁`, `${recolored} judged, ${locks} sealed`);
        notifyBossCast(lt(skill.name));
        pulseBoard(8, 1.55);
        applyBossPressure(skill.id);
        break;
      }
      case "void_scale": {
        markGlass(1);
        markLocks(1, 2);
        addObstacles(1);
        setBossCastHint(lt(skill.name), `施加混合虚空腐化`, `mixed corruption applied`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "dragon_breath": {
        const row = Math.floor(Math.random() * boardSize);
        const targets = indicesInRow(row).slice(0, Math.min(boardSize, state.boss.elite ? 6 : 5));
        for (const idx of targets) {
          if (isGem(state.board[idx])) state.board[idx].glass = true;
          else state.board[idx] = { kind: "obstacle" };
        }
        setBossCastHint(lt(skill.name), `第 ${row + 1} 行被龙息灼烧`, `row ${row + 1} scorched`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "world_crack": {
        const obstacles = addObstacles(state.boss.elite ? 6 : 4);
        const recolored = recolor(state.boss.elite ? 12 : 8);
        setBossCastHint(lt(skill.name), `${obstacles} 处裂隙，${recolored} 枚扭曲宝石`, `${obstacles} voids, ${recolored} warped gems`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "emperor_decree": {
        const locks = markLocks(state.boss.elite ? 5 : 3, 2);
        const glass = markGlass(state.boss.elite ? 8 : 6);
        const obstacles = addObstacles(state.boss.elite ? 4 : 2);
        setBossCastHint(lt(skill.name), `${locks} 束缚，${obstacles} 处裂隙升起`, `${locks} bound, ${obstacles} voids raised`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "star_abyss_end": {
        const recolored = recolor(state.boss.elite ? 20 : 14);
        const locks = markLocks(state.boss.elite ? 7 : 5, 2);
        const obstacles = addObstacles(state.boss.elite ? 7 : 5);
        const glass = markGlass(state.boss.elite ? 10 : 8);
        setBossCastHint(lt(skill.name), `${recolored} 扭曲，${obstacles} 处虚空裂口`, `${recolored} warped, ${obstacles} voids`);
        notifyBossCast(lt(skill.name));
        pulseBoard(10, 1.6);
        applyBossPressure(skill.id);
        break;
      }
      default: {
        const count = recolor(6);
        setBossCastHint(lt(skill.name), `${count} 枚宝石被改变`, `${count} gems altered`);
        notifyBossCast(lt(skill.name));
        break;
      }
    }

    spawnFloatText(i18n.getLanguage() === "zh-CN" ? `Boss：${lt(skill.name)}` : `Boss: ${lt(skill.name)}`, Math.floor((boardSize * boardSize) / 2));
    renderAll();
  }

  async function resolveAction(initialTargets, source, spawnMap = null, preferSpawnIndex = null) {
    let chain = 1;
    let current = [...new Set(initialTargets)];
    let localSpawnMap = spawnMap;

    while (current.length > 0) {
      const expandedInfo = expandWithSpecialTriggers(current, MAX_SKILL_CHAIN);
      const valid = expandedInfo.targets.filter((idx) => state.board[idx] !== null);
      if (valid.length === 0) break;

      if (expandedInfo.chainCount > 1) {
        spawnFloatText(i18n.getLanguage() === "zh-CN" ? `连锁技能 x${expandedInfo.chainCount}` : `Chain Skill x${expandedInfo.chainCount}`, valid[0]);
      }

      audio.play("matchClear", {
        volume: Math.min(0.58, 0.24 + valid.length * 0.012 + (expandedInfo.chainCount > 1 ? 0.06 : 0)),
        rate: Math.max(0.82, 1.06 - (chain - 1) * 0.04),
      });

      clearAnim = new Set(valid);
      spawnShatterFX(valid);
      if (expandedInfo.chainCount > 1) shakeBoard(1.25);
      else shakeBoard(1);
      renderAll();
      await sleep(180);

      const gemTargets = valid.filter((i) => isGem(state.board[i]));
      const obstacles = valid.filter((i) => isObstacle(state.board[i])).length;

      let glassBroken = 0;
      let burningCleared = 0;
      for (const idx of valid) {
        const cell = state.board[idx];
        if (isGem(cell) && cell.glass) glassBroken += 1;
        if (isGem(cell) && cell.burning) burningCleared += 1;
      }

      let gain = calcGain(gemTargets.length, obstacles, chain, source, expandedInfo.chainCount, glassBroken);
      if (source === "legend") gain = Math.floor(gain * 1.3);
      state.floorScore += gain;
      state.score += gain;
      updateMomentum(gemTargets.length, chain);
      spawnFloatText(`+${gain}`, gemTargets[0] ?? valid[0]);

      for (const idx of valid) {
        const cell = state.board[idx];
        if (isGem(cell) && cell.burning) {
          cell.burning = false;
          continue;
        }
        if (isGem(cell) && cell.glass) {
          cell.glass = false;
          continue;
        }
        state.board[idx] = null;
      }
      breakAdjacentObstacles(gemTargets);

        if (chain === 1 && localSpawnMap && localSpawnMap.size > 0) {
        const spawnIndex = pickSpawnIndex(localSpawnMap, preferSpawnIndex);
        if (spawnIndex !== null && state.board[spawnIndex] === null) {
          state.board[spawnIndex] = { kind: "gem", color: randColor(), special: localSpawnMap.get(spawnIndex), glass: false, burning: false, poisonedTurns: 0, frozen: false, lockedTurns: 0 };
          spawnShockwaveFX(spawnIndex, true);
        }
      }

      if (burningCleared > 0) {
        spawnFloatText(i18n.getLanguage() === "zh-CN" ? `熄灭 ${burningCleared}` : `Snuff ${burningCleared}`, gemTargets[0] ?? valid[0]);
      }

      clearAnim.clear();
      renderAll();
      await sleep(70);

      const moved = collapseBoard();
      const born = refillBoard();
      fallAnim = new Set([...moved, ...born]);
      renderAll();
      await sleep(230);
      fallAnim.clear();

      maybeDropItem(chain);

      meta.codex.maxChain = Math.max(meta.codex.maxChain, chain);
      saveMeta();

      chain += 1;
      const next = analyzeMatches();
      current = next.clear;
      localSpawnMap = next.spawnMap;
      source = "normal";
    }

    renderAll();
  }

  function pickSpawnIndex(spawnMap, prefer) {
    if (prefer != null && spawnMap.has(prefer)) return prefer;
    const keys = [...spawnMap.keys()];
    if (keys.length === 0) return null;
    return keys[0];
  }

  function analyzeMatches() {
    const groups = findMatchGroups();
    const clearSet = new Set();
    const spawnMap = new Map();

    for (const g of groups) for (const idx of g.indices) clearSet.add(idx);

    const at = new Map();
    for (const g of groups) {
      for (const idx of g.indices) {
        if (!at.has(idx)) at.set(idx, []);
        at.get(idx).push(g);
      }
    }

    for (const [idx, arr] of at.entries()) {
      const hasH = arr.some((x) => x.dir === "h");
      const hasV = arr.some((x) => x.dir === "v");
      if (hasH && hasV) spawnMap.set(idx, "bomb");
    }

    for (const g of groups) {
      if (g.len >= 5) {
        spawnMap.set(g.indices[2], "rainbow");
      } else if (g.len === 4 && !spawnMap.has(g.indices[1])) {
        if (state.perks.prism_heart && Math.random() < 0.18) spawnMap.set(g.indices[1], "rainbow");
        else if (state.perks.combo_forge && Math.random() < 0.4) spawnMap.set(g.indices[1], "bomb");
        else spawnMap.set(g.indices[1], g.dir === "h" ? "line_h" : "line_v");
      }
    }

    return { clear: [...clearSet], spawnMap };
  }

  function findMatchGroups() {
    const groups = [];
    for (let r = 0; r < boardSize; r += 1) {
      let c = 0;
      while (c < boardSize) {
        const idx = r * boardSize + c;
        const cell = state.board[idx];
        if (!isGem(cell) || cell.special === "rainbow") { c += 1; continue; }
        let len = 1;
        while (c + len < boardSize && sameColor(idx, r * boardSize + c + len)) len += 1;
        if (len >= 3) groups.push({ dir: "h", len, indices: rangeIndices(r, c, len, "h") });
        c += len;
      }
    }

    for (let c = 0; c < boardSize; c += 1) {
      let r = 0;
      while (r < boardSize) {
        const idx = r * boardSize + c;
        const cell = state.board[idx];
        if (!isGem(cell) || cell.special === "rainbow") { r += 1; continue; }
        let len = 1;
        while (r + len < boardSize && sameColor(idx, (r + len) * boardSize + c)) len += 1;
        if (len >= 3) groups.push({ dir: "v", len, indices: rangeIndices(r, c, len, "v") });
        r += len;
      }
    }
    return groups;
  }

  function sameColor(a, b) {
    const ca = state.board[a];
    const cb = state.board[b];
    return isGem(ca) && isGem(cb) && ca.color === cb.color;
  }

  function rangeIndices(r, c, len, dir) {
    const arr = [];
    for (let k = 0; k < len; k += 1) arr.push(dir === "h" ? r * boardSize + (c + k) : (r + k) * boardSize + c);
    return arr;
  }

  function expandWithSpecialTriggers(indices, maxDepth) {
    const set = new Set(indices);
    const queue = indices.map((idx) => ({ idx, depth: 0 }));
    let chainCount = 1;

    while (queue.length > 0) {
      const { idx, depth } = queue.shift();
      const cell = state.board[idx];
      if (!isGem(cell) || !cell.special) continue;

      if (cell.special in meta.codex.specialTrigger) recordCodex("specialTrigger", cell.special);
      spawnShockwaveFX(idx, true);

      if (depth >= maxDepth) continue;

      const extra = specialTargets(idx, cell.special);
      let spawned = 0;
      for (const e of extra) {
        if (!set.has(e)) {
          set.add(e);
          queue.push({ idx: e, depth: depth + 1 });
          spawned += 1;
        }
      }
      if (spawned > 0) chainCount = Math.max(chainCount, depth + 2);
    }

    return { targets: [...set], chainCount: Math.min(chainCount, maxDepth + 1) };
  }

  function specialTargets(idx, special) {
    const r = rowOf(idx);
    const c = colOf(idx);
    if (special === "line_h") return indicesInRow(r);
    if (special === "line_v") return indicesInCol(c);
    if (special === "bomb") {
      const arr = [];
      for (let rr = r - 1; rr <= r + 1; rr += 1) for (let cc = c - 1; cc <= c + 1; cc += 1) if (inside(rr, cc)) arr.push(rr * boardSize + cc);
      return arr;
    }
    if (special === "rainbow") {
      const cell = state.board[idx];
      const color = cell.color;
      return collectIndices((x) => isGem(x) && x.color === color);
    }
    return [idx];
  }

  function specialComboTargets(a, b, sa, sb) {
    const set = new Set([a, b]);
    if ((sa === "line_h" || sa === "line_v") && (sb === "line_h" || sb === "line_v")) {
      for (const i of indicesInRow(rowOf(a))) set.add(i);
      for (const i of indicesInCol(colOf(a))) set.add(i);
      for (const i of indicesInRow(rowOf(b))) set.add(i);
      for (const i of indicesInCol(colOf(b))) set.add(i);
      return [...set];
    }
    if (sa === "rainbow" || sb === "rainbow") {
      const other = sa === "rainbow" ? state.board[b] : state.board[a];
      if (isGem(other)) {
        for (const i of collectIndices((x) => isGem(x) && x.color === other.color)) set.add(i);
      }
      return [...set];
    }
    for (const i of specialTargets(a, sa)) set.add(i);
    for (const i of specialTargets(b, sb)) set.add(i);
    return [...set];
  }

  function calcGain(gemCount, obstacleCount, chain, source, skillChainDepth = 1, glassBroken = 0) {
    let base = gemCount * 10 + obstacleCount * 14;
    let chainMul = 1 + (0.25 + state.chainBonus) * (chain - 1);

    if (state.taxColor != null) {
      const taxed = countColor(state.taxColor);
      base -= Math.floor(taxed * 2);
    }
    if (state.feverTurns > 0) chainMul += 0.5;

    if (source === "hammer") base += 8 + itemPower("hammer") * 4;
    if (source === "row") base += (state.feverTurns > 0 ? 26 : 18) + itemPower("row") * 5;
    if (source === "cross") base += (state.feverTurns > 0 ? 34 : 24) + itemPower("cross") * 6;
    if (source === "color") base += (state.feverTurns > 0 ? 40 : 28) + itemPower("color") * 6;
    if (source === "combo") base += 45;

    if (skillChainDepth > 1) base += skillChainDepth * 12;
    if (state.perks.blast_core && (source !== "normal" || skillChainDepth > 1)) base = Math.floor(base * 1.22);
    if (state.perks.glass_breaker && glassBroken > 0) base += glassBroken * 10;
    if (state.perks.score_bloom && gemCount > 0) base += gemCount * 5;
    if (state.perks.prism_heart && source === "normal") base += Math.floor(gemCount * 1.5);

    return Math.max(0, Math.floor(base * chainMul));
  }

  function countColor(color) {
    let n = 0;
    for (const c of state.board) if (isGem(c) && c.color === color) n += 1;
    return Math.floor(n / 6);
  }

  function updateMomentum(gems, chain) {
    const gain = Math.min(26, gems + chain * 4);
    state.momentum = Math.min(MOMENTUM_MAX, state.momentum + gain);
    if (state.momentum >= MOMENTUM_MAX) {
      state.momentum = 0;
      state.feverTurns = (state.perks.fever_loop ? 4 : 3) + (state.blessings.fever_engine ? 1 : 0);
      spawnFloatText("FEVER!", Math.floor((boardSize * boardSize) / 2));
      notify(i18n.getLanguage() === "zh-CN" ? "热潮启动：得分和掉落都已提升！" : "FEVER started: score and drops are boosted!", "ok");
      audio.play("fever");
    }
  }

  function maybeDropItem(chain) {
    if (chain < 2) return;
    let chance = 0.16 - (state.floor - 1) * 0.012 + state.dropBoost;
    if (state.feverTurns > 0) chance += 0.1;
    if (state.perks.relic_magnet) chance += 0.1;
    chance = Math.max(0.08, Math.min(0.5, chance));
    if (Math.random() >= chance) return;

    const carried = getCarriedItems();
    const pool = carried.length >= MAX_ITEM_TYPES ? [...carried] : ITEM_ORDER.filter((id) => ITEM_DEFS[id].rarity !== "legendary");
    if (state.perks.arcane_stockpile && Math.random() < 0.35) pool.push("screen_wipe", "rainbow_burst", "time_freeze", "boss_breaker");
    const weighted = [];
    for (const id of pool) {
      const weight = hasItemType(id) ? 2 + getItemLevel(id) : 1;
      for (let i = 0; i < weight; i += 1) weighted.push(id);
    }
    const picked = randomPick(weighted);
    if (!addItemCharges(picked, 1, itemSlotAvailable())) return;
    spawnFloatText(`+${lt(ITEM_DEFS[picked].name)}`, Math.floor(Math.random() * boardSize * boardSize));
    audio.play("itemGain", { volume: 0.32 });
  }

  function breakAdjacentObstacles(gemIndices) {
    const broken = new Set();
    for (const idx of gemIndices) {
      const r = rowOf(idx);
      const c = colOf(idx);
      const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
      for (const [nr, nc] of neighbors) {
        if (!inside(nr, nc)) continue;
        const ni = nr * boardSize + nc;
        if (isObstacle(state.board[ni])) broken.add(ni);
      }
    }
    for (const idx of broken) state.board[idx] = null;
  }

  function checkFloorState() {
    if (state.floorScore >= state.targetScore) return onFloorCleared();
    if (state.movesLeft <= 0) return onDefeat();
  }

  function onFloorCleared() {
    grantMetaShards(1 + (state.routePlan?.shardBonus || 0));
    saveMeta();
    const localFloor = getChapterLocalFloor();
    const chapterLength = state.selectedChapter ? state.selectedChapter.end - state.selectedChapter.start + 1 : 3;
    if (state.selectedChapter && state.floor >= state.selectedChapter.end) return onVictory();
    if (localFloor < chapterLength - 1) return showRewardChoices();
    if (localFloor === chapterLength - 1) return showEventNode();
    showRewardChoices();
  }

  function showChapterBlessings(isChapterStart = false) {
    overlayTitleEl.textContent = `${t("chapterBlessingPrefix")}${lt(state.floorTheme.title)}`;
    overlayDescEl.textContent = isChapterStart ? t("chapterBlessingStart") : t("chapterBlessingNext");
    choiceWrapEl.innerHTML = "";
    overlayActionsEl.innerHTML = "";

    const missing = Object.entries(BLESSING_DEFS).filter(([id]) => !state.blessings[id]);
    shuffle(missing);
    const picks = missing.slice(0, 3);

    for (const [, def] of picks) {
      const btn = document.createElement("button");
      btn.className = `choice rarity-${def.rarity}`;
      btn.innerHTML = `<span class="choice-rarity">${t("blessing")}</span><strong>${lt(def.title)}</strong><small>${lt(def.desc)}</small>`;
      btn.addEventListener("click", () => {
        def.apply(state);
        audio.play("rewardPick");
        overlayEl.classList.add("hidden");
        notify(t("blessingAcquired", { name: lt(def.title) }), "ok");
        renderAll();
        if (isChapterStart) startFloor(state.selectedChapter.start);
        else startFloor(state.floor + 1);
      });
      choiceWrapEl.appendChild(btn);
    }

    overlayEl.classList.remove("hidden");
  }

  function onVictory() {
    state.victory = true;
    grantMetaShards(6 + Math.floor(state.score / 900));
    let nextUnlockedChapter = null;
    if (state.selectedChapter?.id) {
      meta.progression.clearedChapters[state.selectedChapter.id] = true;
      const currentIndex = CHAPTER_THEMES.findIndex((x) => x.id === state.selectedChapter.id);
      const next = CHAPTER_THEMES[currentIndex + 1];
      if (next && !meta.progression.unlockedChapters.includes(next.id)) meta.progression.unlockedChapters.push(next.id);
      nextUnlockedChapter = next || null;
    }
    updateMeta();
    renderAll();
    audio.play("victory");
    overlayTitleEl.textContent = `${lt(state.selectedChapter?.title || { zh: "章节", en: "Chapter" })} ${i18n.getLanguage() === "zh-CN" ? "已通关！" : "Cleared!"}`;
    overlayDescEl.textContent = `${i18n.getLanguage() === "zh-CN" ? "你击败了" : "You defeated "}${lt(state.floorTheme.bossName)}${i18n.getLanguage() === "zh-CN" ? `，并以最终分数 ${state.score} 完成本章节挑战。` : ` and cleared this chapter challenge with a final score of ${state.score}.`} ${unlockSummaryText()}`;
    choiceWrapEl.innerHTML = "";
    if (nextUnlockedChapter) {
      overlayActionsEl.innerHTML = `<button type="button" class="btn overlay-btn" data-action="next-chapter">${t("nextChapter")}</button><button type="button" class="btn danger overlay-btn" data-action="chapter-select">${t("backToChapters")}</button>`;
    } else {
      overlayActionsEl.innerHTML = `<button type="button" class="btn overlay-btn" data-action="chapter-select">${t("backToHome")}</button><button type="button" class="btn danger overlay-btn" data-action="restart-run">${t("startNewRun")}</button>`;
    }
    bindOverlayActions();
    overlayEl.classList.remove("hidden");
  }

  function startNextChapter() {
    if (!state.selectedChapter?.id) return showChapterSelect();
    const currentIndex = CHAPTER_THEMES.findIndex((x) => x.id === state.selectedChapter.id);
    const next = CHAPTER_THEMES[currentIndex + 1];
    if (!next) return showChapterSelect();
    state = createInitialState();
    state.selectedChapter = next;
    state.floorTheme = next;
    overlayEl.classList.add("hidden");
    closeChapterScreen();
    showChapterBlessings(true);
  }

  function onDefeat() {
    state.gameOver = true;
    grantMetaShards(Math.max(2, state.floor - 1));
    updateMeta();
    renderAll();
    audio.play("defeat");
    overlayTitleEl.textContent = t("runFailed");
    overlayDescEl.textContent = i18n.getLanguage() === "zh-CN"
      ? `${lt(state.selectedChapter?.title || { zh: "本轮", en: "Run" })} 在第 ${getChapterLocalFloor()} 层结束。最终分数：${state.score}。`
      : `Chapter ${lt(state.selectedChapter?.title || { zh: "本轮", en: "Run" })} ended on floor ${getChapterLocalFloor()}. Final score: ${state.score}.`;
    choiceWrapEl.innerHTML = "";
    overlayActionsEl.innerHTML = `<button type="button" class="btn danger overlay-btn" data-action="restart-run">${t("restartNow")}</button>`;
    bindOverlayActions();
    overlayEl.classList.remove("hidden");
  }

  function unlockSummaryText() {
    if (!state.selectedChapter?.id) return "";
    const currentIndex = CHAPTER_THEMES.findIndex((x) => x.id === state.selectedChapter.id);
    const next = CHAPTER_THEMES[currentIndex + 1];
    if (next && meta.progression.unlockedChapters.includes(next.id)) return i18n.getLanguage() === "zh-CN" ? `已解锁下一章节：${lt(next.title)}。` : `Next chapter unlocked: ${lt(next.title)}.`;
    return "";
  }

  function showEventNode() {
    overlayTitleEl.textContent = `${t("branchRoutePrefix")}${lt(state.floorTheme.title)}`;
    overlayDescEl.textContent = t("branchRouteDesc", { name: lt(state.floorTheme.shortLabel) });
    choiceWrapEl.innerHTML = "";
    overlayActionsEl.innerHTML = "";

    const events = buildBranchRoutes();

    for (const ev of events) {
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.innerHTML = `<strong>${lt(ev.title)}</strong><small>${lt(ev.desc)}</small>`;
      btn.addEventListener("click", () => {
        ev.apply();
        audio.play("rewardPick", { volume: 0.42 });
        overlayEl.classList.add("hidden");
        startFloor(state.floor + 1);
      });
      choiceWrapEl.appendChild(btn);
    }

    overlayEl.classList.remove("hidden");
  }

  function buildBranchRoutes() {
    const theme = state.floorTheme.id;
    const names = {
      ember_hollows: [zhen("火星路线", "Spark Route"), zhen("贪欲路线", "Greed Route"), zhen("烈焰路线", "Blaze Route")],
      frost_spire: [zhen("平稳路线", "Calm Route"), zhen("学者路线", "Scholar Route"), zhen("风险路线", "Risk Route")],
      stone_grove: [zhen("地道路线", "Tunnel Route"), zhen("贪欲路线", "Greed Route"), zhen("坍塌路线", "Collapse Route")],
      storm_peaks: [zhen("护盾路线", "Shielded Route"), zhen("收获路线", "Harvest Route"), zhen("过载路线", "Overdrive Route")],
      venom_bloom: [zhen("净化路线", "Purge Route"), zhen("花粉路线", "Pollen Route"), zhen("腐朽路线", "Rot Route")],
      tidal_depths: [zhen("锚定路线", "Anchor Route"), zhen("洋流路线", "Current Route"), zhen("漩涡路线", "Maelstrom Route")],
      mirror_circus: [zhen("聚焦路线", "Focus Route"), zhen("奖赏路线", "Prize Route"), zhen("回廊路线", "Hall Route")],
      iron_forge: [zhen("淬火路线", "Quench Route"), zhen("矿脉路线", "Ore Route"), zhen("重锤路线", "Hammer Route")],
      eclipse_sanctum: [zhen("黎明路线", "Dawn Route"), zhen("圣环路线", "Halo Route"), zhen("夜幕路线", "Night Route")],
      void_throne: [zhen("封印路线", "Seal Route"), zhen("裂隙路线", "Rift Route"), zhen("灾变路线", "Cataclysm Route")],
    }[theme] || [zhen("稳妥路线", "Safe Route"), zhen("贪婪路线", "Greedy Route"), zhen("试炼路线", "Trial Route")];

    return [
      {
        title: names[0],
        desc: zhen("最终 Boss 层：+2 步，目标压力更低，节奏更稳。", "Final boss floor: +2 moves, lower target pressure, calmer pacing."),
        apply: () => {
          state.routePlan = { id: "safe", title: lt(names[0]), floorsRemaining: 1, moveBonus: 2, movePenalty: 0, targetMulDelta: -0.08, pressureDelta: -1, dropBoost: 0, chainBonus: 0, shardBonus: 0 };
          notify(i18n.getLanguage() === "zh-CN" ? `已选择路线：${lt(names[0])}。` : `Route chosen: ${lt(names[0])}.`, "ok");
        },
      },
      {
        title: names[1],
        desc: zhen("最终 Boss 层：额外掉落并获得 +1 碎片，但目标略高。", "Final boss floor: extra drops and +1 shard, but targets are slightly higher."),
        apply: () => {
          state.routePlan = { id: "greed", title: lt(names[1]), floorsRemaining: 1, moveBonus: 0, movePenalty: 0, targetMulDelta: 0.08, pressureDelta: 0, dropBoost: 0.1, chainBonus: 0, shardBonus: 1 };
          notify(i18n.getLanguage() === "zh-CN" ? `已选择路线：${lt(names[1])}。` : `Route chosen: ${lt(names[1])}.`, "warn");
        },
      },
      {
        title: names[2],
        desc: zhen("最终 Boss 层：步数更少、压力更大，但连锁更强且立刻补满一次道具。", "Final boss floor: fewer moves and more pressure, but stronger chains and a full item refill now."),
        apply: () => {
          state.routePlan = { id: "trial", title: lt(names[2]), floorsRemaining: 1, moveBonus: 0, movePenalty: 1, targetMulDelta: 0.12, pressureDelta: 1, dropBoost: 0.04, chainBonus: 0.18, shardBonus: 0 };
          refillCarriedCharges();
          notify(i18n.getLanguage() === "zh-CN" ? `已选择路线：${lt(names[2])}。` : `Route chosen: ${lt(names[2])}.`, "warn");
        },
      },
    ];
  }

  function buildEventChoices() {
    const commonEvents = [
      {
        title: zhen("诅咒契约", "Cursed Pact"),
        desc: zhen("接下来两层会更严苛，但连锁奖励和掉落提高，并获得 +1 十字爆发。", "The next two floors are harsher, but chain rewards and drops increase and you gain +1 Cross Burst."),
        apply: () => {
          state.eventCurseFloors = 2;
          addItemCharges("cross", 1, true);
          notify(i18n.getLanguage() === "zh-CN" ? "你签下了诅咒契约。" : "You signed the Cursed Pact.", "warn");
        },
      },
      {
        title: zhen("修复熔炉", "Repair Forge"),
        desc: zhen("下一层 +2 步，并重置 Boss 充能。", "Gain +2 moves next floor and reset the boss charge."),
        apply: () => {
          state.nextFloorMoveBonus += 2;
          state.boss.charge = 0;
          notify(i18n.getLanguage() === "zh-CN" ? "熔炉稳定了下一层局势。" : "The forge stabilizes the next floor.", "ok");
        },
      },
      {
        title: zhen("贪欲祭坛", "Greed Altar"),
        desc: zhen("立即获得 +180 分，但下一层失去 2 步。", "Gain +180 score now, but lose 2 moves next floor."),
        apply: () => {
          state.score += 180;
          state.floorScore += 40;
          state.nextFloorMovePenalty += 2;
          notify(i18n.getLanguage() === "zh-CN" ? "贪欲祭坛启动：高收益，高压力。" : "Greed Altar activated: high reward, high pressure.", "warn");
        },
      },
      {
        title: zhen("战术地图", "Tactical Map"),
        desc: zhen("侦察下一层，获得 +3 步和 +20 动量。", "Scout the next floor to gain +3 moves and +20 momentum."),
        apply: () => {
          state.nextFloorMoveBonus += 3;
          state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 20);
          notify(i18n.getLanguage() === "zh-CN" ? "你规划出了一条更安全的路线。" : "You charted a safer route.", "ok");
        },
      },
    ];

    const chapterEvents = {
      ember_hollows: [
        {
          title: zhen("引燃储备", "Kindling Cache"),
          desc: zhen("从余烬营地获得 +1 锤子和 +1 横扫。", "Gain +1 Hammer and +1 Row Sweep from the ember camp."),
          apply: () => {
            addItemCharges("hammer", 1, true);
            addItemCharges("row", 1, true);
            notify(i18n.getLanguage() === "zh-CN" ? "引燃工具已加入你的配置。" : "Kindling tools added to your kit.", "ok");
          },
        },
      ],
      frost_spire: [
        {
          title: zhen("寒霜提灯", "Frozen Lantern"),
          desc: zhen("稳定档案馆：移除当前所有锁定并获得 +25 动量。", "Stabilize the archive: remove all current locks and gain +25 momentum."),
          apply: () => {
            for (let i = 0; i < state.board.length; i += 1) if (isGem(state.board[i])) { state.board[i].lockedTurns = 0; state.board[i].frozen = false; }
            state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 25);
            notify(i18n.getLanguage() === "zh-CN" ? "提灯安抚了冻结的档案馆。" : "The lantern calms the frozen archive.", "ok");
          },
        },
      ],
      stone_grove: [
        {
          title: zhen("地穴地图", "Burrow Map"),
          desc: zhen("下一层 +2 步，并立刻移除 2 个随机障碍。", "Gain +2 moves next floor and remove 2 random obstacles now."),
          apply: () => {
            state.nextFloorMoveBonus += 2;
            const obstacles = collectIndices((x) => isObstacle(x));
            shuffle(obstacles);
            for (const idx of obstacles.slice(0, 2)) state.board[idx] = { kind: "gem", color: randColor(), special: null, glass: false, burning: false, poisonedTurns: 0, frozen: false, lockedTurns: 0 };
            notify(i18n.getLanguage() === "zh-CN" ? "地穴地图揭示了岩层薄弱点。" : "The burrow map reveals weak stone sections.", "ok");
          },
        },
      ],
      storm_peaks: [
        {
          title: zhen("熔炉过载", "Forge Overdrive"),
          desc: zhen("获得 +1 彩色炸弹，并提高下一次诅咒楼层收益。", "Gain +1 Color Bomb and boost the next cursed floor payoff."),
          apply: () => {
            addItemCharges("color", 1, true);
            state.eventCurseFloors = Math.max(state.eventCurseFloors, 1);
            notify(i18n.getLanguage() === "zh-CN" ? "熔炉轰鸣着苏醒。" : "The forge roars to life.", "warn");
          },
        },
      ],
      venom_bloom: [
        {
          title: zhen("净化花蜜", "Purifier Nectar"),
          desc: zhen("移除当前所有锁定，并清除本层颜色税。", "Remove all current locks and clear your taxed color for the floor."),
          apply: () => {
            for (let i = 0; i < state.board.length; i += 1) if (isGem(state.board[i])) { state.board[i].lockedTurns = 0; state.board[i].frozen = false; }
            state.taxColor = null;
            state.taxColorTurns = 0;
            notify(i18n.getLanguage() === "zh-CN" ? "净化花蜜净化了花域。" : "Purifier Nectar cleanses the bloom.", "ok");
          },
        },
      ],
      tidal_depths: [
        {
          title: zhen("潮汐罗盘", "Tidal Compass"),
          desc: zhen("下一层 +3 步，并获得 +1 洗牌充能。", "Gain +3 moves next floor and +1 Shuffle charge."),
          apply: () => {
            state.nextFloorMoveBonus += 3;
            addItemCharges("shuffle", 1, true);
            notify(i18n.getLanguage() === "zh-CN" ? "潮汐暂时与你同调。" : "The tides briefly align in your favor.", "ok");
          },
        },
      ],
      mirror_circus: [
        {
          title: zhen("真实透镜", "True Lens"),
          desc: zhen("获得 +30 动量，并将 3 个随机玻璃宝石变为普通宝石。", "Gain +30 momentum and convert 3 random glass gems into normal gems."),
          apply: () => {
            state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 30);
            const glass = collectIndices((x) => isGem(x) && x.glass);
            shuffle(glass);
            for (const idx of glass.slice(0, 3)) state.board[idx].glass = false;
            notify(i18n.getLanguage() === "zh-CN" ? "真实透镜刺穿了幻象。" : "The true lens cuts through illusion.", "ok");
          },
        },
      ],
      iron_forge: [
        {
          title: zhen("冷却阀门", "Cooling Valve"),
          desc: zhen("立刻移除 3 个障碍，并让下一层 Boss 从 0 能量开始。", "Remove 3 obstacles now and start next floor with the boss at 0 energy."),
          apply: () => {
            const obstacles = collectIndices((x) => isObstacle(x));
            shuffle(obstacles);
            for (const idx of obstacles.slice(0, 3)) state.board[idx] = { kind: "gem", color: randColor(), special: null, glass: false, burning: false, poisonedTurns: 0, frozen: false, lockedTurns: 0 };
            state.boss.charge = 0;
            notify(i18n.getLanguage() === "zh-CN" ? "冷却阀门释放了熔炉压力。" : "Cooling valves release the furnace pressure.", "ok");
          },
        },
      ],
      eclipse_sanctum: [
        {
          title: zhen("圣环碎片", "Halo Fragment"),
          desc: zhen("获得 +1 彩虹爆发和 +25 动量。", "Gain +1 Rainbow Burst and +25 momentum."),
          apply: () => {
            addItemCharges("rainbow_burst", 1, true);
            state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 25);
            notify(i18n.getLanguage() === "zh-CN" ? "圣环碎片强化了你的配置。" : "A halo fragment empowers your kit.", "ok");
          },
        },
      ],
      void_throne: [
        {
          title: zhen("虚空交易", "Void Bargain"),
          desc: zhen("获得 +240 分和 +1 彩虹爆发，但下一层 -1 步。", "Gain +240 score and +1 Rainbow Burst, but suffer -1 move next floor."),
          apply: () => {
            state.score += 240;
            state.floorScore += 60;
            state.nextFloorMovePenalty += 1;
            addItemCharges("rainbow_burst", 1, true);
            notify(i18n.getLanguage() === "zh-CN" ? "裂隙以代价赐予了力量。" : "The rift grants power at a cost.", "warn");
          },
        },
      ],
    };

    const pool = [...commonEvents, ...(chapterEvents[state.floorTheme.id] || [])];
    shuffle(pool);
    return pool.slice(0, 3);
  }

  function showRewardChoices() {
    const choices = buildRewardChoices();
    overlayTitleEl.textContent = t("floorCleared", { floor: state.floor });
    overlayDescEl.textContent = t("rewardChooseDesc");
    choiceWrapEl.innerHTML = "";
    overlayActionsEl.innerHTML = "";

    for (const reward of choices) {
      const btn = document.createElement("button");
      btn.className = `choice rarity-${reward.rarity || "common"}`;
      btn.innerHTML = `<span class="choice-rarity">${lt(RARITY_LABELS[reward.rarity]) || t("common")}</span><strong>${lt(reward.title)}</strong><small>${lt(reward.desc)}</small>`;
      btn.addEventListener("click", () => {
        reward.apply();
        audio.play("rewardPick");
        overlayEl.classList.add("hidden");
        startFloor(state.floor + 1);
      });
      choiceWrapEl.appendChild(btn);
    }

    overlayEl.classList.remove("hidden");
  }

  function buildRewardChoices() {
    const result = [];
    const perkReward = buildPerkReward();
    if (perkReward) result.push(perkReward);

    const itemRewards = buildItemRewards();
    const supportRewards = buildSupportRewards();
    const combined = [...itemRewards, ...supportRewards];
    shuffle(combined);

    for (const reward of combined) {
      if (result.length >= 3) break;
      if (!result.some((x) => x.title === reward.title)) result.push(reward);
    }
    return result.slice(0, 3);
  }

  function buildPerkReward() {
    const missing = Object.entries(PERK_DEFS).filter(([k]) => !state.perks[k]);
    if (missing.length === 0) return null;
    const weighted = [];
    for (const [id, def] of missing) {
      const weight = def.rarity === "legendary" ? 1 : def.rarity === "epic" ? 2 : def.rarity === "rare" ? 3 : 4;
      for (let i = 0; i < weight; i += 1) weighted.push([id, def]);
    }
    const [id, def] = randomPick(weighted);
    return {
      type: "perk",
      rarity: def.rarity,
        title: `${lt(RARITY_LABELS[def.rarity])}${i18n.getLanguage() === "zh-CN" ? "技能：" : " Skill: "}${lt(def.title)}`,
        desc: lt(def.desc),
      apply: () => def.apply(state),
    };
  }

  function buildItemRewards() {
    const rewards = [];
    const carried = getCarriedItems();
    const newCandidates = ITEM_ORDER.filter((id) => !hasItemType(id));

    if (carried.length < MAX_ITEM_TYPES && newCandidates.length > 0) {
      const preferred = newCandidates.filter((id) => ITEM_DEFS[id].rarity !== "legendary");
      const candidate = randomPick(preferred.length > 0 ? preferred : newCandidates);
      rewards.push(createNewItemReward(candidate));
    }

    const upgradePool = [];
    for (const id of carried) {
      const weight = 2 + getItemLevel(id) * 2 + (getItemCount(id) === 0 ? 1 : 0);
      for (let i = 0; i < weight; i += 1) upgradePool.push(id);
    }
    while (upgradePool.length > 0 && rewards.length < 2) {
      const id = randomPick(upgradePool);
      rewards.push(createUpgradeReward(id));
      for (let i = upgradePool.length - 1; i >= 0; i -= 1) if (upgradePool[i] === id) upgradePool.splice(i, 1);
    }

    return rewards;
  }

  function buildSupportRewards() {
    return [
      { type: "support", rarity: "common", title: zhen("额外步数 +2", "Extra Moves +2"), desc: zhen("降低下一层压力", "Reduce next-floor pressure"), apply: () => (state.nextFloorMoveBonus += 2) },
      { type: "support", rarity: "common", title: zhen("动量激增", "Momentum Surge"), desc: zhen("+40 动量", "+40 momentum"), apply: () => (state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 40)) },
      { type: "support", rarity: "rare", title: zhen("战地修复", "Field Repair"), desc: zhen("为已携带道具随机恢复 2 次充能", "Restore 2 random item charges across carried gear"), apply: restoreRandomCharges },
      { type: "support", rarity: "common", title: zhen("仓库补给", "Vault Refill"), desc: zhen("为每个已携带道具恢复 1 次充能", "Restore 1 charge to every carried item"), apply: refillCarriedCharges },
      { type: "support", rarity: "rare", title: zhen("熔炉调校", "Forge Tune-Up"), desc: zhen("随机升级一个已携带道具 1 级并获得 1 次充能", "Upgrade a random carried item by 1 level and gain 1 charge"), apply: upgradeRandomCarriedItem },
      { type: "support", rarity: "rare", title: zhen("Boss 抑制", "Boss Suppressant"), desc: zhen("下一层开始时 +2 步，并完全重置 Boss 能量槽", "Start the next floor with +2 moves and a fully reset boss gauge"), apply: () => { state.nextFloorMoveBonus += 2; state.boss.charge = 0; } },
      { type: "support", rarity: "epic", title: zhen("热潮电池", "Fever Battery"), desc: zhen("获得 +70 动量，为下一次爆发蓄力", "Gain +70 momentum to prime your next power spike"), apply: () => (state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 70)) },
      { type: "support", rarity: "epic", title: zhen("裂隙宝藏", "Rift Cache"), desc: zhen("随机获得 1 次史诗或更高阶道具充能", "Gain +1 random epic-or-higher item charge"), apply: grantHighTierCharge },
    ];
  }

  function createNewItemReward(id) {
    const bonus = state.perks.vault_expander ? 2 : 1;
    return {
      type: "item",
      rarity: ITEM_DEFS[id].rarity,
      title: i18n.getLanguage() === "zh-CN" ? `新道具：${lt(ITEM_DEFS[id].name)}` : `New Item: ${lt(ITEM_DEFS[id].name)}`,
      desc: i18n.getLanguage() === "zh-CN" ? `将 ${lt(ITEM_DEFS[id].name)} 加入你的装配，并获得 ${bonus} 点充能。` : `Add ${lt(ITEM_DEFS[id].name)} to your loadout with ${bonus} charge${bonus > 1 ? "s" : ""}.`,
      apply: () => addItemCharges(id, bonus, true),
    };
  }

  function createUpgradeReward(id) {
    const charges = ITEM_DEFS[id].rarity === "legendary" ? 1 : 2;
    return {
      type: "item",
      rarity: ITEM_DEFS[id].rarity,
      title: i18n.getLanguage() === "zh-CN" ? `升级 ${lt(ITEM_DEFS[id].name)}` : `Upgrade ${lt(ITEM_DEFS[id].name)}`,
      desc: i18n.getLanguage() === "zh-CN" ? `将 ${lt(ITEM_DEFS[id].name)} 提升到 ${t("itemLevel", { level: getItemLevel(id) + 1 })}，并获得 +${charges} 充能。` : `Raise ${lt(ITEM_DEFS[id].name)} to Lv.${getItemLevel(id) + 1} and gain +${charges} charge${charges > 1 ? "s" : ""}.`,
      apply: () => upgradeItem(id, 1, charges),
    };
  }

  function restoreRandomCharges() {
    const carried = getCarriedItems();
    if (carried.length === 0) return;
    const bag = [];
    for (const id of carried) {
      for (let i = 0; i < Math.max(1, getItemLevel(id)); i += 1) bag.push(id);
    }
    for (let i = 0; i < 2; i += 1) addItemCharges(randomPick(bag), 1, false);
  }

  function refillCarriedCharges() {
    for (const id of getCarriedItems()) addItemCharges(id, 1, false);
  }

  function upgradeRandomCarriedItem() {
    const carried = getCarriedItems();
    if (carried.length === 0) return;
    const id = randomPick(carried);
    upgradeItem(id, 1, 1);
  }

  function grantHighTierCharge() {
    const carried = getCarriedItems().filter((id) => ["epic", "legendary"].includes(ITEM_DEFS[id].rarity));
    const fallback = getCarriedItems();
    const pool = carried.length > 0 ? carried : fallback;
    if (pool.length === 0) return;
    addItemCharges(randomPick(pool), 1, false);
  }

  function consumeMove() {
    state.movesLeft = Math.max(0, state.movesLeft - 1);
  }

  async function playSwapAnimation(a, b) {
    await runSwapAnimation(boardEl, a, b, sleep);
  }

  async function playItemCastAnimation(item, idx) {
    await runItemCastAnimation({ itemWrapEl, boardEl, item, idx, imageSrc: getAnimatedItemImage(item), itemName: lt(ITEM_DEFS[item].name), sleep });
  }

  function spawnShatterFX(indices) {
    runShatterFX({ indices, boardEl, state, isGem, fxLayerEl, MAX_ACTIVE_SHARDS, activeShards, setActiveShards: (value) => { activeShards = value; } });
  }

  function spawnShockwaveFX(index, strong = false) {
    runShockwaveFX({ boardEl, fxLayerEl, index, strong });
  }

  function spawnFloatText(text, index) {
    runFloatText({ boardEl, fxLayerEl, text, index });
  }

  function spawnScreenPulse(theme = "boss", duration = 420) {
    runScreenPulse({ fxLayerEl, theme, duration });
  }

  function shakeBoard(power = 1) {
    runShakeBoard(boardWrapEl, power);
  }

  function updateMeta() {
    meta.bestFloor = Math.max(meta.bestFloor, state.floor);
    meta.bestScore = Math.max(meta.bestScore, state.score);
    saveMeta();
  }

  function grantMetaShards(amount) {
    meta.progression.shards = Number(meta.progression.shards || 0) + Math.max(0, amount);
  }

  function createBoard() {
    return createBoardState(boardSize, randColor);
  }

  function resolveAutoBoard() {
    resolveAutoBoardState(state, findMatchGroups, isGem, randColor);
  }

  function collapseBoard() {
    return collapseBoardState(state, boardSize, isGem);
  }

  function refillBoard() {
    return refillBoardState(state, randColor);
  }

  function isAdjacent(a, b) {
    return checkIsAdjacent(boardSize, a, b);
  }

  function rowOf(i) { return getRowOf(boardSize, i); }
  function colOf(i) { return getColOf(boardSize, i); }
  function inside(r, c) { return isInside(boardSize, r, c); }
  function indicesInRow(r) { return getIndicesInRow(boardSize, r); }
  function indicesInCol(c) { return getIndicesInCol(boardSize, c); }

  function swap(a, b) {
    swapBoardCells(state, a, b);
  }

  function randColor() { return randomPick(state.activeGemColors || GEM_POOL_BY_FLOOR[0]); }
  function randomPick(arr) { return pickRandom(arr); }

  function shuffle(arr) {
    shuffleArray(arr);
  }

  function sleep(ms) { return wait(ms); }
  function isGem(c) { return checkIsGem(c); }
  function isObstacle(c) { return checkIsObstacle(c); }

  function renderAll() {
    renderHUD();
    renderBossSkillbook();
    renderItems();
    renderPerks();
    renderGuideList();
    renderBoard();
    boardEl.style.setProperty("--board-size", String(boardSize));
  }

  function renderHUD() {
    const chapterLength = state.selectedChapter ? state.selectedChapter.end - state.selectedChapter.start + 1 : TOTAL_FLOORS;
    floorEl.textContent = state.selectedChapter ? `${getChapterLocalFloor()}/${chapterLength}` : `${state.floor}/${TOTAL_FLOORS}`;
    if (boardTargetScoreEl) boardTargetScoreEl.textContent = String(state.targetScore);
    movesLeftEl.textContent = String(state.movesLeft);
    floorScoreEl.textContent = String(state.floorScore);
    if (boardFloorScoreEl) boardFloorScoreEl.textContent = String(state.floorScore);
    scoreEl.textContent = String(state.score);
    bestFloorEl.textContent = String(meta.bestFloor);
    bestScoreEl.textContent = String(meta.bestScore);

    momentumBarEl.style.width = `${(state.momentum / MOMENTUM_MAX) * 100}%`;
    feverTurnsEl.textContent = `${t("fever")} ${state.feverTurns}`;

    const displayedCharge = getBossDisplayedCharge();
    const bossPct = Math.max(0, Math.min(100, (displayedCharge / state.boss.max) * 100));
    if (bossBarEl) bossBarEl.style.width = `${bossPct}%`;
    if (bossSkillHintEl) {
      const nextSkills = getAvailableBossSkills().map((skill) => `${lt(skill.name)}(${skill.cost})`).join(" · ");
      bossSkillHintEl.textContent = nextSkills ? `${state.boss.hint} · ${t("readyPrefix")}${nextSkills}` : state.boss.hint;
    }
    if (bossTitleEl) bossTitleEl.textContent = lt(state.boss.elite ? state.floorTheme.eliteBossName : state.floorTheme.bossName);
    if (bossStateEl) {
      const profile = getBossProfile();
      const tier = getBossThreatLevel();
      const charge = getBossDisplayedCharge();
      bossStateEl.textContent = state.boss.casting
          ? t("bossCastingNow", { name: lt(state.floorTheme.shortLabel), element: lt(profile.element) })
          : charge >= 20
            ? t("bossReadyTier", { tier })
            : t("bossChargingIdle");
    }
    if (bossThreatEl) bossThreatEl.textContent = getBossThreatLabel();
    if (bossPatternEl) {
      const profile = getBossProfile();
      const charge = getBossDisplayedCharge();
      bossPatternEl.textContent = state.boss.elite
        ? `${lt(state.floorTheme.pattern)} / ${lt(profile.element)} elite / ${charge}/100`
        : `${lt(state.floorTheme.pattern)} / ${lt(profile.element)} / ${charge}/100`;
    }
    if (modifierEl) modifierEl.textContent = state.modifier ? `${lt(state.floorTheme.shortLabel)} · ${state.routePlan.title} · ${lt(state.modifier.name)} · ${state.activeGemColors.length}C` : `${lt(state.floorTheme.shortLabel)} · ${state.routePlan.title} · ${state.activeGemColors.length}C`;
    if (bossMeterEl) {
      bossMeterEl.classList.remove("charging", "ready", "casting");
      if (state.boss.casting) bossMeterEl.classList.add("casting");
      else if (state.boss.phase === "ready") bossMeterEl.classList.add("ready");
      else bossMeterEl.classList.add("charging");
    }

    if (state.mode.type === "normal") modeTextEl.textContent = t("modeStandard");
    if (state.mode.type === "target_item") modeTextEl.textContent = t("modeTarget", { name: lt(ITEM_DEFS[state.mode.item].name) });
  }

  function renderBossSkillbook() {
    if (!bossSkillbookListEl) return;
    const profile = getBossProfile();
    const charge = getBossDisplayedCharge();
    bossSkillbookListEl.innerHTML = "";

    for (const skill of profile.skills || []) {
      const entry = document.createElement("div");
      entry.className = "boss-skill-entry";
      if (charge >= skill.cost) entry.classList.add("ready");

      const title = document.createElement("strong");
      title.textContent = `${lt(skill.name)} · ${skill.cost}`;

      const desc = document.createElement("small");
      desc.textContent = lt(skill.desc) || t("chapterBossAttackFallback");

      entry.appendChild(title);
      entry.appendChild(desc);
      bossSkillbookListEl.appendChild(entry);
    }
  }

  function getBossThreatLabel() {
    if (state.boss.casting) return t("cataclysmic");
    const pct = state.boss.charge / Math.max(1, state.boss.max);
    if (pct >= 1) return t("ultimate");
    if (pct >= 0.8) return t("critical");
    if (pct >= 0.6) return t("severe");
    if (pct >= 0.4) return t("rising");
    if (pct >= 0.2) return t("active");
    return t("low");
  }

  function renderItems() {
    renderItemsView({
      itemWrapEl,
      getCarriedItems,
      state,
      getItemCount,
      getItemLevel,
      ITEM_DEFS,
      getAnimatedItemImage,
      MAX_ITEM_TYPES,
      UI_IMAGES,
      t,
      lt,
    });
  }

  function renderPerks() {
    renderPerksView({ perkWrapEl, state, PERK_DEFS, BLESSING_DEFS, RARITY_LABELS, t, lt });
  }

  function renderBoard() {
    renderBoardView({
      boardEl,
      state,
      selected,
      isObstacle,
      isGem,
      clearAnim,
      fallAnim,
      getAnimatedGemImage,
    });
  }

  function notify(text, type = "ok") {
    messageEl.textContent = text;
    if (type === "warn") {
      messageEl.style.background = "#3a2226";
      messageEl.style.borderColor = "#9a3f58";
      return;
    }
    messageEl.style.background = "#16213f";
    messageEl.style.borderColor = "#2f4678";
  }
})();
