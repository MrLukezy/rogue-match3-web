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
import { CONDITIONAL_PASSIVE_DEFS } from "./src/config/blessings-config.js";
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
  const TEST_UNLOCK_ALL_CHAPTERS = true;
  const zhen = (zh, en) => ({ zh, en });
  const MODIFIERS = [
    { id: "glass", name: zhen("玻璃蔓延", "Glass"), desc: zhen("开局附带更多玻璃层", "Start with extra glass layers"), apply: (s) => (s.modGlass = 8) },
    { id: "heavy", name: zhen("重压", "Heavy"), desc: zhen("失去 2 步，但连锁更强", "Lose 2 moves, gain stronger chains"), apply: (s) => { s.movesLeft = Math.max(8, s.movesLeft - 2); s.chainBonus += 0.2; } },
    { id: "color_tax", name: zhen("颜色税", "Color Tax"), desc: zhen("一种颜色得分降低", "One color scores less"), apply: (s) => { s.taxColor = randColor(); } },
    { id: "lucky", name: zhen("幸运掉落", "Lucky Drop"), desc: zhen("道具掉落概率更高", "Item drop chance is higher"), apply: (s) => { s.dropBoost += 0.12; } },
    { id: "frost_seal", name: zhen("霜封", "Frost Seal"), desc: zhen("若干宝石开局被锁定", "Several gems begin locked"), apply: (s) => { s.modLocks = 4; } },
    { id: "stormfront", name: zhen("风暴前线", "Stormfront"), desc: zhen("动量更快积累，但少 1 步", "Builds momentum faster but trims one move"), apply: (s) => { s.movesLeft = Math.max(8, s.movesLeft - 1); s.chainBonus += 0.12; s.dropBoost += 0.04; } },
    { id: "rich_vein", name: zhen("丰矿脉", "Rich Vein"), desc: zhen("本层额外得分并提高工具密度", "Gain score and extra tool density on this floor"), apply: (s) => { s.score += 80; s.dropBoost += 0.08; } },
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
    bossHpRingEl,
    bossHpValueEl,
    bossHpMaxEl,
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
  let bossAiTicking = false;
  const audio = createAudioManager();

  bindEvents();
  startItemIconAnimation();
  startBossHudTicker();
  updateResponsiveScale();
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
        if (!bossAiTicking) {
          bossAiTicking = true;
          Promise.resolve(tickBoss()).finally(() => {
            bossAiTicking = false;
          });
        }
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

  function grantSkillLevel(id, levelGain = 1) {
    if (!hasItemType(id)) ensureItemType(id);
    state.itemLevels[id] = Math.max(ITEM_BASE_LEVEL, getItemLevel(id) + levelGain);
    state.items[id] = 0;
  }

  function unlockOrUpgradeSkill(id, levelGain = 1) {
    grantSkillLevel(id, levelGain);
  }

  function replaceSkill(replacedId, newId, levelGain = 1) {
    const slotIndex = state.itemSlots.indexOf(replacedId);
    if (slotIndex < 0) return false;
    delete state.itemLevels[replacedId];
    delete state.items[replacedId];
    state.itemSlots[slotIndex] = newId;
    state.itemLevels[newId] = Math.max(ITEM_BASE_LEVEL, (state.itemLevels[newId] || 0) + levelGain);
    state.items[newId] = 0;
    return true;
  }

  function pickReplacementCandidates() {
    return getCarriedItems();
  }

  function grantDragonHoardBonus() {
    applyDragonHoardBonus(state, ITEM_DEFS, (id, amount) => unlockOrUpgradeSkill(id, amount));
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

    window.addEventListener("resize", updateResponsiveScale);
    window.addEventListener("orientationchange", updateResponsiveScale);

    applyStaticText();
    syncSettingsControls();
  }

  function updateResponsiveScale() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const appScale = Math.min(1, viewportWidth / 1920, viewportHeight / 1080);
    document.documentElement.style.setProperty("--app-scale", `${Math.max(0.56, appScale)}`);

    const chapterScale = Math.min(1, (viewportWidth - 40) / 1280, (viewportHeight - 40) / 900);
    document.documentElement.style.setProperty("--chapter-scale", `${Math.max(0.64, chapterScale)}`);
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
    setPanelRowLabel(2, t("encounterHp"));
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
    setTextBySelector(".target-chip span", t("encounterMaxHp"));
    setTextBySelector(".board-chip.accent span", t("encounterHp"));
    setTextBySelector(".dock-title span", t("equippedItems"));
    setTextBySelector(".dock-title small", t("equippedItemsHint"));
    const encounterUiText = getEncounterUiText();
    setTextBySelector(".boss-card .eyebrow", encounterUiText.pressure);
    setTextBySelector(".boss-card h2", t("encounterGauge"));
    setTextBySelector("#bossMeter > span", t("bossEnergy"));
    setBossMiniCardLabel(0, t("threat"));
    setBossMiniCardLabel(1, t("pattern"));
    setTextBySelector(".boss-skillbook h3", encounterUiText.attacks);
    setTextBySelector(".boss-copy", encounterUiText.copy);

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
        if (btn.dataset.action === "skip-reward") {
          overlayEl.classList.add("hidden");
          startFloor(state.floor + 1);
        }
        if (btn.dataset.action === "skip-late-draft") {
          showChapterBlessings(true);
        }
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

  function getThemeLocalFloor(floor = state.floor, theme = getFloorTheme(floor)) {
    return floor - theme.start + 1;
  }

  function isMinionEncounter(theme = state.floorTheme, floor = state.floor) {
    return getThemeLocalFloor(floor, theme) < 3;
  }

  function getEncounterName(theme = state.floorTheme, { floor = state.floor, elite = state.boss.elite } = {}) {
    if (isMinionEncounter(theme, floor)) return theme.minionName || theme.bossName;
    return elite ? theme.eliteBossName : theme.bossName;
  }

  function getEncounterUiText(theme = state.floorTheme, floor = state.floor) {
    if (isMinionEncounter(theme, floor)) {
      return {
        pressure: t("minionPressure"),
        attacks: t("minionAttacks"),
        copy: t("minionCopy"),
      };
    }
    return {
      pressure: t("bossPressure"),
      attacks: t("bossAttacks"),
      copy: t("bossCopy"),
    };
  }

  function getEncounterMaxHp(cfg, threat, route, theme = state.floorTheme, floor = state.floor) {
    const localFloor = getThemeLocalFloor(floor, theme);
    const baseHp = Math.floor(cfg.target * (threat.targetMul + route.targetMulDelta));
    const laneFactor = localFloor === 1 ? 0.62 : localFloor === 2 ? 0.78 : 1;
    const eliteFactor = ELITE_FLOORS.includes(floor) ? 1.08 : 1;
    return Math.max(40, Math.round(baseHp * laneFactor * eliteFactor));
  }

  function getChapterOrder(chapter = state.selectedChapter || state.floorTheme) {
    const index = CHAPTER_THEMES.findIndex((entry) => entry.id === chapter?.id);
    return index >= 0 ? index + 1 : 1;
  }

  function showChapterSelect() {
    openChapterScreen();
    overlayEl.classList.add("hidden");
    chapterListEl.innerHTML = "";
    const unlocked = TEST_UNLOCK_ALL_CHAPTERS
      ? new Set(CHAPTER_THEMES.map((chapter) => chapter.id))
      : new Set(meta.progression.unlockedChapters || ["ember_hollows"]);
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
        state = createInitialState();
        state.selectedChapter = chapter;
        state.floorTheme = chapter;
        state.routePlan = { id: "main", title: t("carryingPath"), floorsRemaining: 0, moveBonus: 0, movePenalty: 0, targetMulDelta: 0, pressureDelta: 0, dropBoost: 0, chainBonus: 0, shardBonus: 0 };
        closeChapterScreen();
        const catchUpDrafts = Math.min(MAX_ITEM_TYPES, Math.max(0, getChapterOrder(chapter) - 1));
        if (catchUpDrafts > 0) {
          showLateChapterSkillDraft(chapter, catchUpDrafts);
        } else {
          showChapterBlessings(true);
        }
      });
      chapterListEl.appendChild(btn);
    }
  }

  function startFloor(floor) {
    state.floor = floor;
    state.gameOver = false;
    state.victory = false;
    inputLocked = false;
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
    if (unlockedNewColor) {
      state.movesLeft += 1;
      state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 18);
    }
    grantDragonHoardBonus();

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

    const purifierOffset = 0;
    if (state.modGlass > 0) placeGlass(Math.max(0, state.modGlass + threat.glassBonus - purifierOffset));
    if (state.modLocks > 0) placeLocks(Math.max(0, state.modLocks + Math.max(0, threat.pressure - 1) - purifierOffset));

    const isElite = ELITE_FLOORS.includes(state.floor);
    const bossProfile = getBossProfile(theme);
    const encounterName = getEncounterName(theme, { floor: state.floor, elite: isElite });
    state.boss.elite = isElite;
    state.boss.charge = 0;
    state.boss.max = 100;
    state.boss.maxHp = getEncounterMaxHp(cfg, threat, route, theme, state.floor);
    state.boss.hp = state.boss.maxHp;
    state.boss.hint = i18n.getLanguage() === "zh-CN"
      ? `${lt(encounterName)}正在积蓄${lt(bossProfile.element)}能量 - ${lt(threat.label)}`
      : `${lt(encounterName)} gathers ${lt(bossProfile.element)} energy - ${lt(threat.label)}`;
    state.boss.phase = "charging";
    state.boss.casting = false;
    state.boss.lastActionEndedAt = Date.now();
    state.boss.pendingIdleMs = 0;
    state.boss.lastChargeTickAt = Date.now();
    state.boss.nextDecisionAt = Date.now() + 900;
    state.boss.smallCastCount = 0;
    state.boss.warningStage = 0;

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
    const profile = BOSS_PROFILES[theme?.id] || BOSS_PROFILES.ember_hollows;
    if (!isMinionEncounter(theme)) return profile;
    return {
      ...profile,
      ...(profile.minion || {}),
      isMinion: true,
    };
  }

  function getEncounterCastThreshold(profile = getBossProfile()) {
    const skillCosts = Array.isArray(profile.skills) ? profile.skills.map((skill) => Number(skill.cost || 0)).filter((cost) => cost > 0) : [];
    const lowestCost = skillCosts.length ? Math.min(...skillCosts) : 20;
    return Math.max(lowestCost, Number(profile.castThreshold || lowestCost));
  }

  function getBossEnergyGain() {
    const profile = getBossProfile();
    const permanentDampener = state.floor <= 6 ? Number(meta.progression.upgrades.boss_dampener || 0) : 0;
    const base = Number(profile.baseGain || 8);
    const threat = Number(state.floorThreat.bossGain || 0);
    const elite = state.boss.elite ? 2 : 0;
    const blessing = 0;
    return Math.max(6, base + threat + elite - blessing - permanentDampener);
  }

  function getBossChargeRatePerSecond() {
    return Math.max(6, Math.round(getBossEnergyGain() * 0.72));
  }

  function getBossIdleChargeGain(idleMs = 0) {
    if (!idleMs || idleMs <= 0) return 0;
    return Math.max(0, Math.floor((idleMs / 1000) * getBossChargeRatePerSecond()));
  }

  function getBossDisplayedCharge() {
    return Math.min(state.boss.max, Number(state.boss.charge || 0));
  }

  function getAvailableBossSkills() {
    const profile = getBossProfile();
    if (profile.isMinion) return Array.isArray(profile.skills) ? profile.skills : [];
    const cycle = [...(profile.smallSkills || []), profile.ultimateSkill].filter(Boolean);
    return cycle;
  }

  function pickBossSkill(now = Date.now()) {
    const profile = getBossProfile();
    if (profile.isMinion) {
      const available = getAvailableBossSkills();
      if (available.length === 0) return null;
      return Number(state.boss.charge || 0) >= getEncounterCastThreshold(profile) ? available[0] : null;
    }
    if (now < Number(state.boss.nextDecisionAt || 0)) return null;
    if (Number(state.boss.charge || 0) < getEncounterCastThreshold(profile)) return null;
    if (Number(state.boss.smallCastCount || 0) >= 5) return profile.ultimateSkill;
    const smallSkills = profile.smallSkills || [];
    if (smallSkills.length === 0) return profile.ultimateSkill || null;
    return smallSkills[Math.floor(Math.random() * smallSkills.length)] || null;
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
    state.boss.pendingIdleMs = 0;
  }

  function finishPlayerAction() {
    state.boss.pendingIdleMs = 0;
  }

  function maybeShowBossChargeGuide() {
    if (meta.codex.guideSeen.boss_charge_rule) return false;
    meta.codex.guideSeen.boss_charge_rule = 1;
    saveMeta();
    overlayTitleEl.textContent = t("encounterGuideTitle");
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
    if (!item || !hasItemType(item)) return;
    audio.play("uiClick", { volume: 0.34 });
    notify(i18n.getLanguage() === "zh-CN"
      ? `${lt(ITEM_DEFS[item].name)}为被动进攻技能，当前等级 ${getItemLevel(item)}。`
      : `${lt(ITEM_DEFS[item].name)} is a passive offensive skill at Lv.${getItemLevel(item)}.`, "ok");
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
      renderAll();
      consumeMove();
      const comboTargets = specialComboTargets(a, b, ca.special, cb.special);
      await resolveAction(comboTargets, "combo");
      await consumePostAction();
      return (inputLocked = false);
    }

    swap(a, b);
    applySlipperySwapEffect(a, b);
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
    renderAll();
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

  function drainEncounterCharge(gemCount, chainCount = 1, source = "normal") {
    if (gemCount <= 0) return 0;
    const sourceBonus = source === "legend" ? 2 : source === "combo" ? 1 : 0;
    const reduction = Math.min(12, Math.max(1, Math.floor(gemCount / 4) + Math.max(0, chainCount - 1) + sourceBonus));
    state.boss.charge = Math.max(0, Number(state.boss.charge || 0) - reduction);
    return reduction;
  }

  function damageEncounter(amount, source = "attack") {
    const damage = Math.max(0, Math.floor(amount || 0));
    if (damage <= 0 || Number(state.boss.hp || 0) <= 0) return 0;
    const applied = Math.min(Number(state.boss.hp || 0), damage);
    state.boss.hp = Math.max(0, Number(state.boss.hp || 0) - applied);
    if (source === "attack") {
      spawnFloatText(i18n.getLanguage() === "zh-CN" ? `伤害 ${applied}` : `Hit ${applied}`, Math.floor((boardSize * boardSize) / 2));
    }
    return applied;
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
    advanceFrost();
    decayElementMarks();
    spreadBurning();
    spreadPoison();
    resolveTideFlow();
    decayTaxColor();
    if (state.feverTurns > 0) state.feverTurns -= 1;
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

  function advanceFrost() {
    let upgraded = 0;
    for (let i = 0; i < state.board.length; i += 1) {
      const cell = state.board[i];
      if (!isGem(cell) || (cell.frostedTurns || 0) <= 0) continue;
      cell.frostedTurns -= 1;
      if (cell.frostedTurns <= 0 && cell.glass && !cell.frozen) {
        cell.frozen = true;
        upgraded += 1;
      }
    }
    if (upgraded > 0) {
      notify(i18n.getLanguage() === "zh-CN" ? `${upgraded} 枚覆霜宝石升级为冻结！` : `${upgraded} frosted gems upgrade into freeze!`, "warn");
    }
  }

  function decayElementMarks() {
    for (let i = 0; i < state.board.length; i += 1) {
      const cell = state.board[i];
      if (!isGem(cell)) continue;
      if (cell.slippery) cell.slippery = false;
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

  function resolveTideFlow() {
    const tideRows = [...new Set(state.tideRows || [])].filter((row) => row >= 0 && row < boardSize);
    const tideCols = [...new Set(state.tideCols || [])].filter((col) => col >= 0 && col < boardSize);
    if (tideRows.length === 0 && tideCols.length === 0) return;

    for (const row of tideRows) {
      const indices = indicesInRow(row);
      const values = indices.map((idx) => state.board[idx]);
      values.unshift(values.pop());
      indices.forEach((idx, i) => { state.board[idx] = values[i]; });
    }
    for (const col of tideCols) {
      const indices = indicesInCol(col);
      const values = indices.map((idx) => state.board[idx]);
      values.push(values.shift());
      indices.forEach((idx, i) => { state.board[idx] = values[i]; });
    }

    const total = tideRows.length + tideCols.length;
    const center = Math.floor((boardSize * boardSize) / 2);
    spawnFloatText(i18n.getLanguage() === "zh-CN" ? `潮流再变位 ${total}` : `Tide shifts ${total}`, center);
    notify(i18n.getLanguage() === "zh-CN" ? `潮流区域在回合后再次滑动！` : `Tide lanes shift again after your move!`, "warn");
    state.tideRows = [];
    state.tideCols = [];
    state.suppressSpecialSpawnOnce = true;
    state.suppressSpecialNotice = i18n.getLanguage() === "zh-CN" ? "潮流余波" : "tide flow";
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

  function applyHolyMark(indices) {
    let count = 0;
    for (const idx of indices) {
      const cell = state.board[idx];
      if (!isGem(cell)) continue;
      cell.holyMarked = true;
      cell.glass = true;
      count += 1;
    }
    return count;
  }

  function choosePriorityGemIndices(limit, { preferSpecial = false, preferFrozen = false, preferHolyMarked = false, excludeBurning = false } = {}) {
    const buckets = [];
    if (preferSpecial) buckets.push(collectIndices((cell) => isGem(cell) && cell.special));
    if (preferFrozen) buckets.push(collectIndices((cell) => isGem(cell) && cell.frozen));
    if (preferHolyMarked) buckets.push(collectIndices((cell) => isGem(cell) && cell.holyMarked));
    buckets.push(collectIndices((cell) => isGem(cell)));
    const chosen = [];
    const seen = new Set();
    for (const bucket of buckets) {
      shuffle(bucket);
      for (const idx of bucket) {
        if (seen.has(idx)) continue;
        const cell = state.board[idx];
        if (!isGem(cell)) continue;
        if (excludeBurning && cell.burning) continue;
        chosen.push(idx);
        seen.add(idx);
        if (chosen.length >= limit) return chosen;
      }
    }
    return chosen;
  }

  function spreadExistingBurning(limit) {
    const burningSeeds = collectIndices((cell) => isGem(cell) && cell.burning);
    shuffle(burningSeeds);
    const spreadTargets = [];
    const seen = new Set();
    for (const idx of burningSeeds) {
      const r = rowOf(idx);
      const c = colOf(idx);
      const local = [];
      for (let rr = r - 1; rr <= r + 1; rr += 1) {
        for (let cc = c - 1; cc <= c + 1; cc += 1) {
          if (rr === r && cc === c) continue;
          if (!inside(rr, cc)) continue;
          const nextIdx = rr * boardSize + cc;
          const cell = state.board[nextIdx];
          if (!isGem(cell) || cell.burning || seen.has(nextIdx)) continue;
          local.push(nextIdx);
        }
      }
      shuffle(local);
      for (const nextIdx of local) {
        spreadTargets.push(nextIdx);
        seen.add(nextIdx);
        if (spreadTargets.length >= limit) {
          for (const target of spreadTargets) {
            if (!isGem(state.board[target])) continue;
            state.board[target].burning = true;
            state.board[target].glass = false;
          }
          return spreadTargets.length;
        }
      }
    }
    for (const target of spreadTargets) {
      if (!isGem(state.board[target])) continue;
      state.board[target].burning = true;
      state.board[target].glass = false;
    }
    return spreadTargets.length;
  }

  function recolorNearPotentialMatches(limit) {
    const candidates = [];
    for (let i = 0; i < state.board.length; i += 1) {
      const cell = state.board[i];
      if (!isGem(cell) || cell.lockedTurns > 0 || cell.frozen) continue;
      const r = rowOf(i);
      const c = colOf(i);
      const sameNeighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([rr, cc]) => inside(rr, cc) && isGem(state.board[rr * boardSize + cc]) && state.board[rr * boardSize + cc].color === cell.color).length;
      if (sameNeighbors >= 1) candidates.push(i);
    }
    shuffle(candidates);
    const picked = candidates.slice(0, limit);
    for (const idx of picked) {
      const cell = state.board[idx];
      let to = randColor();
      if (to === cell.color) to = nextGemColor(cell.color);
      cell.color = to;
    }
    return picked.length;
  }

  function markTideRows(count) {
    const rows = Array.from({ length: boardSize }, (_, idx) => idx);
    shuffle(rows);
    state.tideRows = rows.slice(0, Math.min(count, rows.length));
    return state.tideRows.length;
  }

  function markTideCols(count) {
    const cols = Array.from({ length: boardSize }, (_, idx) => idx);
    shuffle(cols);
    state.tideCols = cols.slice(0, Math.min(count, cols.length));
    return state.tideCols.length;
  }

  function shiftRow(row, direction = 1) {
    const indices = indicesInRow(row);
    const values = indices.map((idx) => state.board[idx]);
    if (direction >= 0) values.unshift(values.pop());
    else values.push(values.shift());
    indices.forEach((idx, i) => { state.board[idx] = values[i]; });
    return row;
  }

  function shiftCol(col, direction = 1) {
    const indices = indicesInCol(col);
    const values = indices.map((idx) => state.board[idx]);
    if (direction >= 0) values.push(values.shift());
    else values.unshift(values.pop());
    indices.forEach((idx, i) => { state.board[idx] = values[i]; });
    return col;
  }

  function addObstaclesNearExisting(count) {
    const existing = collectIndices((cell) => isObstacle(cell));
    if (existing.length === 0) return addObstacles(count);
    const candidates = new Set();
    for (const idx of existing) {
      const r = rowOf(idx);
      const c = colOf(idx);
      for (const [rr, cc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
        if (!inside(rr, cc)) continue;
        const nextIdx = rr * boardSize + cc;
        if (isGem(state.board[nextIdx])) candidates.add(nextIdx);
      }
    }
    const picked = [...candidates];
    shuffle(picked);
    const chosen = picked.slice(0, count);
    for (const idx of chosen) state.board[idx] = { kind: "obstacle" };
    if (chosen.length < count) return chosen.length + addObstacles(count - chosen.length);
    return chosen.length;
  }

  function buildObstacleWallSegment(length, preferLowerHalf = true) {
    const rows = Array.from({ length: boardSize }, (_, idx) => idx);
    if (preferLowerHalf) rows.sort((a, b) => b - a);
    for (const row of rows) {
      const maxStart = boardSize - length;
      const starts = Array.from({ length: Math.max(0, maxStart + 1) }, (_, idx) => idx);
      shuffle(starts);
      for (const start of starts) {
        const segment = Array.from({ length }, (_, offset) => row * boardSize + start + offset);
        if (segment.every((idx) => isGem(state.board[idx]))) {
          for (const idx of segment) state.board[idx] = { kind: "obstacle" };
          return segment.length;
        }
      }
    }
    return 0;
  }

  function pickLocalizedVoidArea(center = null) {
    let chosenCenter = center;
    if (chosenCenter == null) {
      const gemCenters = collectIndices((cell) => isGem(cell));
      shuffle(gemCenters);
      chosenCenter = gemCenters[0];
    }
    if (chosenCenter == null) return { center: null, area: [] };
    const r = rowOf(chosenCenter);
    const c = colOf(chosenCenter);
    const area = [];
    for (let rr = r - 1; rr <= r + 1; rr += 1) {
      for (let cc = c - 1; cc <= c + 1; cc += 1) {
        if (!inside(rr, cc)) continue;
        area.push(rr * boardSize + cc);
      }
    }
    shuffle(area);
    return { center: chosenCenter, area };
  }

  function applyLocalizedVoidZone(area, { obstacleCount = 2, lockCount = 2, markCount = 3 } = {}) {
    if (!area || area.length === 0) return { obstacles: 0, locks: 0, marks: 0 };
    let obstacles = 0;
    let locks = 0;
    let marks = 0;
    for (const idx of area) {
      const cell = state.board[idx];
      if (!isGem(cell)) continue;
      if (obstacles < obstacleCount) {
        state.board[idx] = { kind: "obstacle" };
        obstacles += 1;
        continue;
      }
      if (locks < lockCount) {
        cell.lockedTurns = Math.max(cell.lockedTurns, 2);
        locks += 1;
        continue;
      }
      if (marks < markCount) {
        cell.glass = true;
        marks += 1;
      }
    }
    return { obstacles, locks, marks };
  }

  function setBossTelegraph(data) {
    state.bossTelegraph = {
      rows: data.rows || [],
      cols: data.cols || [],
      indices: data.indices || [],
      center: data.center ?? null,
    };
    renderAll();
  }

  function clearBossTelegraph() {
    state.bossTelegraph = null;
    renderAll();
  }

  async function showBossTelegraph(data, duration = 320) {
    setBossTelegraph(data);
    await sleep(duration);
    clearBossTelegraph();
  }

  async function tickBoss() {
    if (state.gameOver || state.victory || state.boss.casting) return;
    const now = Date.now();
    const lastTickAt = Number(state.boss.lastChargeTickAt || now);
    const elapsedMs = Math.max(0, now - lastTickAt);
    const profile = getBossProfile();
    const castThreshold = getEncounterCastThreshold(profile);
    const gain = getBossIdleChargeGain(elapsedMs);
    state.boss.lastChargeTickAt = now;
    state.boss.charge = Math.min(state.boss.max, state.boss.charge + gain);
    const chargePct = state.boss.charge / Math.max(1, state.boss.max);
    if (chargePct >= 0.95 && state.boss.warningStage < 2) {
      state.boss.warningStage = 2;
      notify(i18n.getLanguage() === "zh-CN"
        ? `${profile.isMinion ? "小怪" : "Boss"} 蓄能即将拉满！`
        : `${profile.isMinion ? "Minion" : "Boss"} is about to hit full charge!`, "warn");
      audio.play("uiError", { volume: 0.22, rate: 1.18 });
    } else if (chargePct >= 0.8 && state.boss.warningStage < 1) {
      state.boss.warningStage = 1;
      notify(i18n.getLanguage() === "zh-CN"
        ? `${profile.isMinion ? "小怪" : "Boss"} 蓄能接近满值，准备出招。`
        : `${profile.isMinion ? "Minion" : "Boss"} charge is nearing full. Get ready.`, "warn");
      audio.play("uiClick", { volume: 0.18, rate: 1.24 });
    }
    state.boss.phase = state.boss.charge >= castThreshold ? "ready" : "charging";
    if (state.boss.charge < castThreshold) {
      const rate = getBossChargeRatePerSecond();
      state.boss.hint = i18n.getLanguage() === "zh-CN"
        ? `${profile.isMinion ? "小怪" : "Boss"} 每秒蓄能 ${rate}，满能后自动出招`
        : `${profile.isMinion ? "Minion" : "Boss"} gains ${rate} charge per second and auto-casts at full charge`;
      return;
    }

    if (inputLocked || !overlayEl?.classList.contains("hidden")) {
      state.boss.hint = i18n.getLanguage() === "zh-CN"
        ? (profile.isMinion ? "小怪已满能，棋盘稳定后会立刻施放轻技能" : "Boss 已满能，棋盘稳定后会按循环规则自动施法")
        : (profile.isMinion ? "Minion is fully charged and will cast as soon as the board settles" : "Boss is fully charged and will auto-cast by cycle rule when the board settles");
      return;
    }

    const skill = pickBossSkill(now);
    if (!skill) {
      state.boss.hint = i18n.getLanguage() === "zh-CN"
        ? (profile.isMinion ? "小怪已满能，马上就会施放轻技能" : "Boss 已进入技能循环，准备释放当前轮次技能")
        : (profile.isMinion ? "Minion is primed to fire its light skill" : "Boss is in cycle mode and preparing its current cast");
      return;
    }

    state.boss.casting = true;
    state.boss.phase = "ready";
    state.boss.hint = i18n.getLanguage() === "zh-CN"
      ? (profile.isMinion ? "小怪蓄能已满，立刻释放轻技能！" : `Boss 自主决定施放【${lt(skill.name)}】`)
      : (profile.isMinion ? "Minion reached full charge and immediately fires a light skill!" : `Boss chooses to cast [${lt(skill.name)}]`);
    notify(i18n.getLanguage() === "zh-CN"
      ? (profile.isMinion ? "小怪满能后主动释放了轻技能！" : "Boss 主动出招了！")
      : (profile.isMinion ? "The minion auto-casts as soon as it fills its gauge!" : "The boss makes its own move!"), "warn");
    audio.play("bossCast", { volume: 0.24, rate: 0.84 });
    boardWrapEl.classList.add("boss-telegraph");
    renderAll();
    await sleep(360);
    await castBossSkill(skill);

    boardWrapEl.classList.remove("boss-telegraph");
    state.boss.phase = "charging";
    state.boss.casting = false;
    state.boss.warningStage = 0;
    if (!profile.isMinion) {
      if (profile.ultimateSkill && skill.id === profile.ultimateSkill.id) state.boss.smallCastCount = 0;
      else state.boss.smallCastCount = Number(state.boss.smallCastCount || 0) + 1;
    }
    state.boss.lastChargeTickAt = Date.now();
    state.boss.nextDecisionAt = Date.now() + (profile.isMinion ? 1600 : 700 + Math.floor(Math.random() * 500));
  }

  async function castBossSkill(skillEntry) {
    const skill = typeof skillEntry === "string" ? { id: skillEntry, cost: 20, name: zhen(skillEntry, skillEntry) } : skillEntry;
    recordCodex("bossSeen", skill.id);
    audio.play("bossCast", { volume: 0.44, rate: skill.id === "star_abyss_end" ? 0.82 : 1 });
    boardWrapEl.classList.add("boss-cast");
    if (bossPortraitEl) bossPortraitEl.classList.add("casting");
    spawnScreenPulse("boss", 520);
    await resolveBossSkill(skill);
    state.boss.charge = 0;
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
    const profile = getBossProfile();
    const casterZh = profile.isMinion ? "小怪" : "Boss";
    const casterEn = profile.isMinion ? "Minion" : "Boss";
    notify(i18n.getLanguage() === "zh-CN"
      ? `${casterZh}施放【${skillName}】！${extraZh}`
      : `${casterEn} casts [${skillName}]! ${extraEn}`, "warn");
  }

  async function resolveBossSkill(skill) {
    const gems = collectIndices((x) => isGem(x));
    const unlockedGems = collectIndices((x) => isGem(x) && x.lockedTurns <= 0 && !x.frozen);
    shuffle(gems);
    shuffle(unlockedGems);

    const markGlass = (count) => {
      const targets = gems.slice(0, Math.min(count, gems.length));
      for (const idx of targets) if (isGem(state.board[idx])) state.board[idx].glass = true;
      return targets;
    };

    const markBurning = (count) => {
      const targets = gems.slice(0, Math.min(count, gems.length));
      for (const idx of targets) {
        if (!isGem(state.board[idx])) continue;
        state.board[idx].burning = true;
        state.board[idx].glass = false;
      }
      return targets;
    };

    const markLocks = (count, turns = 2) => {
      const targets = unlockedGems.slice(0, Math.min(count, unlockedGems.length));
      for (const idx of targets) if (isGem(state.board[idx])) state.board[idx].lockedTurns = Math.max(state.board[idx].lockedTurns, turns);
      return targets;
    };

    const recolor = (count) => {
      const from = randColor();
      let to = randColor();
      if (to === from) to = nextGemColor(from);
      const candidates = collectIndices((x) => isGem(x) && x.color === from && x.lockedTurns <= 0 && !x.frozen);
      shuffle(candidates);
      const size = Math.min(count, candidates.length);
      for (let i = 0; i < size; i += 1) state.board[candidates[i]].color = to;
      return candidates.slice(0, size);
    };

    const addObstacles = (count) => {
      const candidates = collectIndices((x) => isGem(x));
      shuffle(candidates);
      const size = Math.min(count, candidates.length);
      for (let i = 0; i < size; i += 1) state.board[candidates[i]] = { kind: "obstacle" };
      return candidates.slice(0, size);
    };

    const rotateRow = () => {
      const row = Math.floor(Math.random() * boardSize);
      const indices = indicesInRow(row);
      const values = indices.map((idx) => state.board[idx]);
      values.unshift(values.pop());
      indices.forEach((idx, i) => { state.board[idx] = values[i]; });
      return { row, indices };
    };

    const rotateCol = () => {
      const col = Math.floor(Math.random() * boardSize);
      const indices = indicesInCol(col);
      const values = indices.map((idx) => state.board[idx]);
      values.push(values.shift());
      indices.forEach((idx, i) => { state.board[idx] = values[i]; });
      return { col, indices };
    };

    const pulseBoard = (count = 6, power = 1.4) => {
      for (let i = 0; i < count; i += 1) spawnShockwaveFX(Math.floor(Math.random() * boardSize * boardSize), true);
      shakeBoard(power);
    };

    const castAt = async (indices) => {
      const exact = [...new Set((indices || []).filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < boardSize * boardSize))];
      await playEncounterCastFX(skill, exact);
    };

    switch (skill.id) {
      case "emberling_flare": {
        const targets = gems.slice(0, 1);
        await castAt(targets);
        const count = markBurning(1).length;
        setBossCastHint(lt(skill.name), `轻点燃 ${count} 枚宝石`, `lightly ignited ${count} gem`);
        notifyBossCast(lt(skill.name), "只是留下了一点可控火苗。", "It only leaves a tiny, manageable flame.");
        break;
      }
      case "frostling_burst": {
        const targets = choosePriorityGemIndices(2, { preferSpecial: true });
        await castAt(targets);
        let frozen = 0;
        let frosted = 0;
        for (const [index, idx] of targets.entries()) {
          const cell = state.board[idx];
          if (!isGem(cell)) continue;
          if (index === 0) {
            cell.frozen = true;
            frozen += 1;
          } else {
            cell.glass = true;
            cell.frostedTurns = Math.max(cell.frostedTurns || 0, 1);
            frosted += 1;
          }
        }
        setBossCastHint(lt(skill.name), `冻结 ${frozen} 枚，覆霜 ${frosted} 枚`, `${frozen} frozen, ${frosted} frosted`);
        notifyBossCast(lt(skill.name), "只是补上一笔轻度寒霜。", "It adds only a light frost mark.");
        break;
      }
      case "burrowling_toss": {
        const planned = collectIndices((x) => isGem(x)).slice(0, 1);
        await castAt(planned);
        const obstacles = addObstacles(1).length;
        setBossCastHint(lt(skill.name), `顶起 ${obstacles} 个障碍`, `raised ${obstacles} blocker`);
        notifyBossCast(lt(skill.name), "地面只轻轻隆起了一格。", "The ground only rises by a single tile.");
        break;
      }
      case "stormling_jolt": {
        const targets = unlockedGems.slice(0, 1);
        await castAt(targets);
        const locks = markLocks(1, 1).length;
        setBossCastHint(lt(skill.name), `麻痹 ${locks} 枚宝石`, `pinned ${locks} gem`);
        notifyBossCast(lt(skill.name), "只是一记短促电击。", "It is just a brief electric jab.");
        break;
      }
      case "sporeling_puff": {
        const targets = choosePriorityGemIndices(2);
        await castAt(targets);
        let infected = 0;
        for (const idx of targets) {
          const cell = state.board[idx];
          if (!isGem(cell)) continue;
          cell.poisonedTurns = Math.max(cell.poisonedTurns || 0, 1);
          infected += 1;
        }
        setBossCastHint(lt(skill.name), `轻度感染 ${infected} 枚宝石`, `lightly infected ${infected} gems`);
        notifyBossCast(lt(skill.name), "只是飘来一小团试探性孢粉。", "Only a small probing cloud of spores drifts in.");
        break;
      }
      case "tideling_surge": {
        const rowPick = Math.floor(Math.random() * boardSize);
        const rowIndices = indicesInRow(rowPick);
        await castAt(rowIndices);
        const { row } = rotateRow();
        setBossCastHint(lt(skill.name), `第 ${row + 1} 行被轻推 1 格`, `row ${row + 1} shifts by 1`);
        notifyBossCast(lt(skill.name), "只是一次浅潮试探。", "It is only a shallow test wave.");
        break;
      }
      case "mirrorling_glimmer": {
        await castAt(choosePriorityGemIndices(2, { preferSpecial: true }));
        let count = recolorNearPotentialMatches(2);
        if (count <= 0) count = recolor(1);
        setBossCastHint(lt(skill.name), `伪装 ${count} 枚宝石`, `disguised ${count} gems`);
        notifyBossCast(lt(skill.name), "只是轻微扰乱你的第一眼判断。", "It only slightly disrupts your first read.");
        break;
      }
      case "slagling_drop": {
        const planned = collectIndices((x) => isGem(x)).slice(0, 1);
        await castAt(planned);
        const obstacles = addObstacles(1).length;
        setBossCastHint(lt(skill.name), `锻出 ${obstacles} 个熔渣障碍`, `forged ${obstacles} slag blocker`);
        notifyBossCast(lt(skill.name), "炉渣只压下了一小格。", "The slag only locks down a small patch.");
        break;
      }
      case "eclipseling_sign": {
        const targets = choosePriorityGemIndices(1, { preferSpecial: true });
        await castAt(targets);
        const marked = applyHolyMark(targets);
        setBossCastHint(lt(skill.name), `标记 ${marked} 枚宝石`, `marked ${marked} gem`);
        notifyBossCast(lt(skill.name), "只是提前落下一枚审判前兆。", "It only leaves behind a single omen of judgment.");
        break;
      }
      case "voidling_ripple": {
        const selection = pickLocalizedVoidArea();
        await castAt(selection.area);
        if (selection.center != null) await showBossTelegraph({ indices: selection.area, center: selection.center }, 280);
        const zone = applyLocalizedVoidZone(selection.area, { obstacleCount: 1, lockCount: 0, markCount: 1 });
        setBossCastHint(lt(skill.name), `局部生成 ${zone.obstacles} 裂口，烙印 ${zone.marks} 枚`, `${zone.obstacles} rift and ${zone.marks} mark in a local zone`);
        notifyBossCast(lt(skill.name), "只是一次局部虚空试探。", "It is only a localized void probe.");
        break;
      }
      case "ember_spark": {
        const targets = gems.slice(0, Math.min(state.boss.elite ? 4 : 2, gems.length));
        await castAt(targets);
        const count = markBurning(state.boss.elite ? 4 : 2).length;
        state.boss.hint = i18n.getLanguage() === "zh-CN" ? `余烬火花：${count} 枚宝石进入灼伤态，需先熄火再消除` : `Ember Spark: ${count} gems are burning and need an extra clear`;
        notify(i18n.getLanguage() === "zh-CN" ? "Boss 施放了余烬火花！" : "Boss casts Ember Spark!", "warn");
        applyBossPressure(skill.id);
        break;
      }
      case "tail_scorch": {
        const row = Math.floor(Math.random() * boardSize);
        await castAt(indicesInRow(row));
        await showBossTelegraph({ rows: [row], indices: indicesInRow(row) }, 320);
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
        const burningNow = collectIndices((cell) => isGem(cell) && cell.burning);
        await castAt(burningNow.length > 0 ? burningNow : gems.slice(0, Math.min(state.boss.elite ? 5 : 3, gems.length)));
        const existingBurning = collectIndices((cell) => isGem(cell) && cell.burning).length;
        const count = existingBurning > 0
          ? spreadExistingBurning(state.boss.elite ? 6 : 4)
          : (() => {
              const ignited = markBurning(state.boss.elite ? 5 : 3);
              return ignited + spreadExistingBurning(2);
            })();
        state.boss.hint = i18n.getLanguage() === "zh-CN" ? `灰烬扩散：${count} 枚宝石被复燃或引燃` : `Cinder Spread: ${count} gems reignited or ignited`;
        notify(i18n.getLanguage() === "zh-CN" ? "灰烬在棋盘上蔓延！" : "Cinders spread across the board!", "warn");
        applyBossPressure(skill.id);
        break;
      }
      case "foxfire_ring": {
        const center = gems[0];
        const r = rowOf(center);
        const c = colOf(center);
        const ring = [];
        for (let rr = r - 1; rr <= r + 1; rr += 1) {
          for (let cc = c - 1; cc <= c + 1; cc += 1) {
            if (!inside(rr, cc)) continue;
            if (rr === r && cc === c) continue;
            ring.push(rr * boardSize + cc);
          }
        }
        await castAt([center, ...ring]);
        await showBossTelegraph({ indices: ring, center }, 340);
        let count = 0;
        for (const idx of ring) {
          const cell = state.board[idx];
          if (!isGem(cell)) continue;
          cell.glass = false;
          cell.burning = true;
          count += 1;
        }
        let locked = 0;
        for (const idx of [center, ...ring]) {
          const cell = state.board[idx];
          if (!isGem(cell)) continue;
          if (locked >= (state.boss.elite ? 3 : 2)) break;
          cell.lockedTurns = Math.max(cell.lockedTurns, 1);
          locked += 1;
        }
        state.boss.hint = i18n.getLanguage() === "zh-CN" ? `狐火之环：环形点燃 ${count} 枚，封位 ${locked} 枚` : `Foxfire Ring: ${count} ring ignites, ${locked} pinned`;
        notify(i18n.getLanguage() === "zh-CN" ? "狐火之环包围了关键格子！" : "Foxfire Ring surrounds key tiles!", "warn");
        applyBossPressure(skill.id);
        break;
      }
      case "wildfire_pounce": {
        const targets = gems.slice(0, Math.min(state.boss.elite ? 12 : 8, gems.length));
        await castAt(targets);
        const burning = markBurning(state.boss.elite ? 12 : 8).length;
        const locks = markLocks(state.boss.elite ? 4 : 2, 2).length;
        state.boss.hint = i18n.getLanguage() === "zh-CN" ? `野火扑袭：${burning} 枚宝石进入灼伤态，${locks} 枚被锁定` : `Wildfire Pounce: ${burning} burning gems, ${locks} pinned`;
        notify(i18n.getLanguage() === "zh-CN" ? "野火扑袭吞没了棋盘！" : "Wildfire Pounce engulfs the board!", "warn");
        pulseBoard(8, 1.55);
        applyBossPressure(skill.id);
        break;
      }
      case "chill_script": {
        const targets = choosePriorityGemIndices(state.boss.elite ? 4 : 2, { preferSpecial: true, preferFrozen: true });
        await castAt(targets);
        let frozen = 0;
        let frosted = 0;
        for (const idx of targets) {
          const cell = state.board[idx];
          if (!isGem(cell)) continue;
          if (cell.frozen) {
            cell.glass = true;
            cell.frostedTurns = Math.max(cell.frostedTurns || 0, 1);
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
        await castAt(cross.map(([rr, cc]) => rr * boardSize + cc).filter((idx) => idx >= 0 && idx < boardSize * boardSize));
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
            cell.frostedTurns = Math.max(cell.frostedTurns || 0, 1);
            frosted += 1;
          }
        }
        setBossCastHint(lt(skill.name), `中心冻结 ${frozen} 枚，十字覆霜 ${frosted} 枚`, `center ${frozen} frozen, cross ${frosted} frosted`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "winter_seal": {
        const targets = gems.slice(0, Math.min(state.boss.elite ? 10 : 6, gems.length));
        await castAt(targets);
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
            cell.frostedTurns = Math.max(cell.frostedTurns || 0, 1);
            frosted += 1;
          }
        }
        setBossCastHint(lt(skill.name), `${frosted} 覆霜，${upgraded} 升级冻结`, `${frosted} frosted, ${upgraded} upgraded to freeze`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "glacier_column": {
        const col = Math.floor(Math.random() * boardSize);
        await castAt([...indicesInCol(col), ...indicesInCol(Math.max(0, col - 1)), ...indicesInCol(Math.min(boardSize - 1, col + 1))]);
        const targets = indicesInCol(col).filter((idx) => isGem(state.board[idx]));
        for (const idx of targets) state.board[idx].frozen = true;
        for (const sideCol of [col - 1, col + 1]) {
          if (sideCol < 0 || sideCol >= boardSize) continue;
          for (const idx of indicesInCol(sideCol).filter((index) => isGem(state.board[index])).slice(0, 2)) {
            state.board[idx].glass = true;
            state.board[idx].frostedTurns = Math.max(state.board[idx].frostedTurns || 0, 1);
          }
        }
        setBossCastHint(lt(skill.name), `第 ${col + 1} 列被冻结，侧格覆霜`, `column ${col + 1} frozen and side tiles frosted`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "absolute_stillness": {
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * boardSize);
        await castAt([...indicesInRow(row), ...indicesInCol(col)]);
        let frozen = 0;
        let frosted = 0;
        for (const idx of [...indicesInRow(row), ...indicesInCol(col)]) {
          const cell = state.board[idx];
          if (!isGem(cell)) continue;
          cell.glass = true;
          cell.frostedTurns = Math.max(cell.frostedTurns || 0, 1);
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
        const targets = collectIndices((x) => isGem(x)).slice(0, Math.min(state.boss.elite ? 3 : 2, gems.length));
        await castAt(targets);
        const count = addObstacles(state.boss.elite ? 3 : 2).length;
        setBossCastHint(lt(skill.name), `新增 ${count} 个障碍`, `${count} obstacles added`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "bark_armor": {
        const targets = gems.slice(0, Math.min(state.boss.elite ? 6 : 4, gems.length));
        await castAt(targets);
        const count = markGlass(state.boss.elite ? 6 : 4).length;
        setBossCastHint(lt(skill.name), `${count} 枚宝石获得护甲`, `${count} armored gems`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "burrow_rise": {
        const existing = collectIndices((cell) => isObstacle(cell)).length;
        const targets = existing > 0 ? collectIndices((cell) => isObstacle(cell)).slice(0, state.boss.elite ? 4 : 3) : gems.slice(0, state.boss.elite ? 3 : 2);
        await castAt(targets);
        const count = existing > 0
          ? addObstaclesNearExisting(state.boss.elite ? 4 : 3)
          : Math.max(buildObstacleWallSegment(state.boss.elite ? 3 : 2), addObstacles(state.boss.elite ? 1 : 0));
        setBossCastHint(lt(skill.name), `地穴抬升 ${count} 处封锁，通路被切断`, `${count} burrow blockers rise and sever routes`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "cave_in": {
        const targets = collectIndices((x) => isGem(x)).slice(0, Math.min(state.boss.elite ? 6 : 4, gems.length));
        await castAt(targets);
        const count = addObstacles(state.boss.elite ? 6 : 4).length;
        markLocks(state.boss.elite ? 4 : 2, 1);
        setBossCastHint(lt(skill.name), `${count} 个格子坍塌`, `${count} tiles collapsed`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "elder_root_wall": {
        const targets = collectIndices((x) => isGem(x)).slice(0, Math.min(state.boss.elite ? 8 : 6, gems.length));
        await castAt(targets);
        const count = addObstacles(state.boss.elite ? 8 : 6).length;
        markGlass(state.boss.elite ? 6 : 4);
        setBossCastHint(lt(skill.name), `生长出 ${count} 个封锁点`, `${count} blockers grown`);
        notifyBossCast(lt(skill.name));
        pulseBoard(8, 1.55);
        applyBossPressure(skill.id);
        break;
      }
      case "static_pin": {
        const targets = choosePriorityGemIndices(state.boss.elite ? 5 : 3, { preferSpecial: true });
        await castAt(targets);
        const locks = markLocks(state.boss.elite ? 3 : 2, 1).length;
        const count = recolor(state.boss.elite ? 5 : 3).length;
        const ash = convertTargetsToAsh(collectIndices((cell) => isGem(cell) && cell.lockedTurns <= 0 && !cell.frozen), state.boss.elite ? 2 : 1);
        setBossCastHint(lt(skill.name), `${locks} 枚短暂钉锁，${count} 枚宝石过载，${ash} 枚被击成灰`, `${locks} pinned, ${count} overloaded, ${ash} reduced to ash`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "thunder_lance": {
        const col = Math.floor(Math.random() * boardSize);
        await castAt(indicesInCol(col));
        await showBossTelegraph({ cols: [col], indices: indicesInCol(col) }, 320);
        const indices = indicesInCol(col);
        const values = indices.map((idx) => state.board[idx]);
        values.push(values.shift());
        indices.forEach((idx, i) => { state.board[idx] = values[i]; });
        setBossCastHint(lt(skill.name), `第 ${col + 1} 列被偏移`, `column ${col + 1} displaced`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "overload_mark": {
        const targets = choosePriorityGemIndices(state.boss.elite ? 12 : 8, { preferSpecial: true });
        await castAt(targets);
        const count = recolor(state.boss.elite ? 12 : 8).length;
        markLocks(state.boss.elite ? 3 : 2, 1);
        setBossCastHint(lt(skill.name), `${count} 枚宝石被改变`, `${count} gems altered`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "chain_burst": {
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * boardSize);
        await castAt([...indicesInRow(row), ...indicesInCol(col)]);
        await showBossTelegraph({ rows: [row], cols: [col], indices: [...indicesInRow(row), ...indicesInCol(col)] }, 320);
        shiftRow(row);
        shiftCol(col);
        setBossCastHint(lt(skill.name), `第 ${row + 1} 行 / 第 ${col + 1} 列发生位移`, `row ${row + 1} / col ${col + 1} shifted`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "duel_of_storms": {
        await castAt(collectIndices((cell) => isGem(cell)).slice(0, state.boss.elite ? 12 : 8));
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
        await castAt(targets);
        for (const idx of targets) if (isGem(state.board[idx])) state.board[idx].poisonedTurns = Math.max(state.board[idx].poisonedTurns || 0, 2);
        setBossCastHint(lt(skill.name), `${targets.length} 枚宝石被感染`, `${targets.length} gems infected`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "thorn_bind": {
        const infected = collectIndices((cell) => isGem(cell) && (cell.poisonedTurns || 0) > 0);
        await castAt(infected.length ? infected.slice(0, state.boss.elite ? 5 : 3) : gems.slice(0, state.boss.elite ? 5 : 3));
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
        const poisonTargets = collectIndices((cell) => isGem(cell) && (cell.poisonedTurns || 0) > 0);
        await castAt(poisonTargets.length ? poisonTargets : gems.slice(0, state.boss.elite ? 12 : 8));
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
        await castAt(infectedTargets);
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
        await castAt(gems.slice(0, Math.min(state.boss.elite ? 12 : 8, gems.length)));
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
        const locks = markLocks(state.boss.elite ? 6 : 4, 2).length;
        setBossCastHint(lt(skill.name), `${gems.length} 感染，颜色税锁定 2 回合`, `${gems.length} infected, color tax for 2 turns`);
        notifyBossCast(lt(skill.name));
        pulseBoard(8, 1.55);
        applyBossPressure(skill.id);
        break;
      }
      case "splash_shift": {
        const rowPick = Math.floor(Math.random() * boardSize);
        await castAt(indicesInRow(rowPick));
        const { row } = rotateRow();
        const rowTargets = indicesInRow(row).filter((idx) => isGem(state.board[idx]));
        for (const idx of rowTargets.slice(0, state.boss.elite ? 4 : 2)) state.board[idx].slippery = true;
        setBossCastHint(lt(skill.name), `第 ${row + 1} 行被潮水推移`, `row ${row + 1} washed aside`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "undertow_pull": {
        const colPick = Math.floor(Math.random() * boardSize);
        await castAt(indicesInCol(colPick));
        const { col } = rotateCol();
        const colTargets = indicesInCol(col).filter((idx) => isGem(state.board[idx]));
        for (const idx of colTargets.slice(0, state.boss.elite ? 4 : 2)) state.board[idx].slippery = true;
        setBossCastHint(lt(skill.name), `第 ${col + 1} 列被暗流拖拽`, `column ${col + 1} dragged`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "tide_pool": {
        await castAt(gems.slice(0, state.boss.elite ? 8 : 5));
        const rows = state.boss.elite ? 2 : 1;
        for (let i = 0; i < rows; i += 1) rotateRow();
        const marked = markTideRows(rows);
        setBossCastHint(lt(skill.name), `形成 ${marked} 条潮流行，回合后会再次滑动`, `${marked} tide rows will shift again after your move`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "tail_wave": {
        const shifts = state.boss.elite ? 3 : 2;
        const cols = Array.from({ length: boardSize }, (_, idx) => idx);
        shuffle(cols);
        const selectedCols = cols.slice(0, shifts);
        await castAt(selectedCols.flatMap((col) => indicesInCol(col)));
        await showBossTelegraph({ cols: selectedCols, indices: selectedCols.flatMap((col) => indicesInCol(col)) }, 340);
        for (const col of selectedCols) shiftCol(col);
        state.tideCols = selectedCols.slice(0, 1);
        const tideCols = state.tideCols.length;
        const coral = addObstacles(state.boss.elite ? 2 : 1).length;
        setBossCastHint(lt(skill.name), `列被推移，${tideCols} 条潮流列与 ${coral} 处珊瑚锚点形成`, `${tideCols} tide cols and ${coral} coral anchors formed`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "abyss_tsunami": {
        const rowPool = Array.from({ length: boardSize }, (_, idx) => idx);
        const colPool = Array.from({ length: boardSize }, (_, idx) => idx);
        shuffle(rowPool);
        shuffle(colPool);
        const selectedRows = rowPool.slice(0, 2);
        const selectedCols = colPool.slice(0, 2);
        await castAt([...selectedRows.flatMap((row) => indicesInRow(row)), ...selectedCols.flatMap((col) => indicesInCol(col))]);
        await showBossTelegraph({ rows: selectedRows, cols: selectedCols, indices: [...selectedRows.flatMap((row) => indicesInRow(row)), ...selectedCols.flatMap((col) => indicesInCol(col))] }, 360);
        for (const row of selectedRows) shiftRow(row);
        for (const col of selectedCols) shiftCol(col);
        state.tideRows = selectedRows.slice(0, 1);
        state.tideCols = selectedCols.slice(0, 1);
        const rows = state.tideRows.length;
        const cols = state.tideCols.length;
        const coral = addObstacles(state.boss.elite ? 4 : 3).length;
        setBossCastHint(lt(skill.name), `全盘错位，并留下 ${rows} 条潮流行、${cols} 条潮流列`, `full-board displacement with ${rows} tide row and ${cols} tide col left behind`);
        notifyBossCast(lt(skill.name));
        pulseBoard(8, 1.55);
        applyBossPressure(skill.id);
        break;
      }
      case "mirror_glint": {
        await castAt(choosePriorityGemIndices(state.boss.elite ? 8 : 5, { preferSpecial: true }));
        const count = recolorNearPotentialMatches(state.boss.elite ? 8 : 5);
        setBossCastHint(lt(skill.name), `${count} 枚宝石被伪装`, `${count} gems disguised`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "false_match": {
        const rowPick = Math.floor(Math.random() * boardSize);
        await castAt(indicesInRow(rowPick));
        const { row } = rotateRow();
        const rowTargets = indicesInRow(row).filter((idx) => isGem(state.board[idx]));
        shuffle(rowTargets);
        let changed = 0;
        for (const idx of rowTargets.slice(0, state.boss.elite ? 3 : 2)) {
          const cell = state.board[idx];
          if (!isGem(cell)) continue;
          let to = randColor();
          if (to === cell.color) to = nextGemColor(cell.color);
          cell.color = to;
          changed += 1;
        }
        setBossCastHint(lt(skill.name), `第 ${row + 1} 行出现伪装连线，${changed} 枚被伪装`, `row ${row + 1} faked, ${changed} disguised`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "prism_shuffle": {
        await castAt(choosePriorityGemIndices(state.boss.elite ? 12 : 8, { preferSpecial: true }));
        const count = recolor(state.boss.elite ? 12 : 8).length;
        rotateRow();
        setBossCastHint(lt(skill.name), `${count} 枚宝石被棱镜扭转`, `${count} gems refracted`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "mirror_maze": {
        const rowPick = Math.floor(Math.random() * boardSize);
        const colPick = Math.floor(Math.random() * boardSize);
        await castAt([...indicesInRow(rowPick), ...indicesInCol(colPick)]);
        const { row } = rotateRow();
        const { col } = rotateCol();
        const crossTargets = [...new Set([...indicesInRow(row), ...indicesInCol(col)])].filter((idx) => isGem(state.board[idx]));
        shuffle(crossTargets);
        let locks = 0;
        for (const idx of crossTargets.slice(0, state.boss.elite ? 4 : 2)) {
          state.board[idx].lockedTurns = Math.max(state.board[idx].lockedTurns, 1);
          locks += 1;
        }
        setBossCastHint(lt(skill.name), `镜像扭曲第 ${row + 1} 行与第 ${col + 1} 列，${locks} 枚被封住`, `row ${row + 1} and col ${col + 1} bent, ${locks} gems sealed`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "thousand_masks": {
        await castAt(collectIndices((cell) => isGem(cell)).slice(0, state.boss.elite ? 18 : 12));
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
        const targets = collectIndices((x) => isGem(x)).slice(0, Math.min(state.boss.elite ? 3 : 2, gems.length));
        await castAt(targets);
        const count = addObstacles(state.boss.elite ? 3 : 2).length;
        setBossCastHint(lt(skill.name), `锻造出 ${count} 个炽热障碍`, `${count} hot blocks forged`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "anvil_slam": {
        const targets = unlockedGems.slice(0, Math.min(state.boss.elite ? 5 : 3, unlockedGems.length));
        await castAt(targets);
        const count = markLocks(state.boss.elite ? 5 : 3, 2).length;
        setBossCastHint(lt(skill.name), `${count} 个格子被压制`, `${count} tiles pinned`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "furnace_core": {
        const targets = collectIndices((x) => isGem(x)).slice(0, Math.min(state.boss.elite ? 5 : 3, gems.length));
        await castAt(targets);
        const obstacles = addObstacles(state.boss.elite ? 5 : 3).length;
        const locks = markLocks(state.boss.elite ? 3 : 2, 1).length;
        setBossCastHint(lt(skill.name), `${obstacles} 障碍，${locks} 枚被热压定住`, `${obstacles} blocks, ${locks} heat-pinned`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "heavy_press": {
        const targets = collectIndices((x) => isGem(x)).slice(0, Math.min(state.boss.elite ? 6 : 4, gems.length));
        await castAt(targets);
        const obstacles = addObstacles(state.boss.elite ? 6 : 4).length;
        setBossCastHint(lt(skill.name), `${obstacles} 处区域被压缩`, `${obstacles} sections compressed`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "steelflame_domain": {
        const targets = collectIndices((x) => isGem(x)).slice(0, Math.min(state.boss.elite ? 8 : 6, gems.length));
        await castAt(targets);
        const obstacles = addObstacles(state.boss.elite ? 8 : 6).length;
        const locks = markLocks(state.boss.elite ? 5 : 3, 2).length;
        setBossCastHint(lt(skill.name), `${obstacles} 障碍，${locks} 锁定`, `${obstacles} blocks, ${locks} pinned`);
        notifyBossCast(lt(skill.name));
        pulseBoard(8, 1.55);
        applyBossPressure(skill.id);
        break;
      }
      case "radiance_mark": {
        const targets = choosePriorityGemIndices(state.boss.elite ? 8 : 5, { preferSpecial: true });
        await castAt(targets);
        const count = applyHolyMark(targets);
        setBossCastHint(lt(skill.name), `${count} 枚宝石被烙印`, `${count} gems branded`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "eclipse_wing": {
        const preferred = collectIndices((cell) => isGem(cell) && cell.holyMarked && cell.lockedTurns <= 0 && !cell.frozen);
        shuffle(preferred);
        const fallback = collectIndices((cell) => isGem(cell) && cell.lockedTurns <= 0 && !cell.frozen);
        shuffle(fallback);
        const targets = [...new Set([...preferred, ...fallback])].slice(0, state.boss.elite ? 5 : 3);
        await castAt(targets);
        let count = 0;
        for (const idx of targets) {
          if (!isGem(state.board[idx])) continue;
          state.board[idx].lockedTurns = Math.max(state.board[idx].lockedTurns, 2);
          count += 1;
        }
        setBossCastHint(lt(skill.name), `${count} 枚宝石被压制`, `${count} gems subdued`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "judgment_wheel": {
        const marked = collectIndices((cell) => isGem(cell) && (cell.holyMarked || cell.lockedTurns > 0));
        shuffle(marked);
        await castAt(marked.slice(0, state.boss.elite ? 14 : 10));
        let count = 0;
        for (const idx of marked.slice(0, state.boss.elite ? 14 : 10)) {
          const cell = state.board[idx];
          if (!isGem(cell)) continue;
          let to = randColor();
          if (to === cell.color) to = nextGemColor(cell.color);
          cell.color = to;
          count += 1;
        }
        if (count === 0) count = recolor(state.boss.elite ? 14 : 10);
        setBossCastHint(lt(skill.name), `${count} 枚宝石被重判`, `${count} gems judged`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "abyss_gaze": {
        const selection = pickLocalizedVoidArea();
        await castAt(selection.area);
        if (selection.center != null) await showBossTelegraph({ indices: selection.area, center: selection.center }, 360);
        const zone = applyLocalizedVoidZone(selection.area, { obstacleCount: state.boss.elite ? 4 : 2, lockCount: state.boss.elite ? 4 : 2, markCount: state.boss.elite ? 3 : 2 });
        setBossCastHint(lt(skill.name), `深渊凝视压暗一区：${zone.obstacles} 裂口，${zone.locks} 封锁`, `${zone.obstacles} rifts and ${zone.locks} seals open in one dark zone`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "revelation_zero": {
        const markTargets = choosePriorityGemIndices(state.boss.elite ? 8 : 5, { preferSpecial: true });
        await castAt(markTargets);
        const marked = applyHolyMark(markTargets);
        const locks = markLocks(state.boss.elite ? 6 : 4, 2).length;
        const recolored = recolor(state.boss.elite ? 16 : 12).length;
        setBossCastHint(lt(skill.name), `${marked} 烙印，${locks} 封锁，${recolored} 重判`, `${marked} marked, ${locks} sealed, ${recolored} judged`);
        notifyBossCast(lt(skill.name));
        pulseBoard(8, 1.55);
        applyBossPressure(skill.id);
        break;
      }
      case "void_scale": {
        const areaCenter = gems[0];
        const r = rowOf(areaCenter);
        const c = colOf(areaCenter);
        const area = [[r, c], [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([rr, cc]) => inside(rr, cc)).map(([rr, cc]) => rr * boardSize + cc);
        await castAt(area);
        const useLockTheme = Math.random() < 0.5;
        let affected = 0;
        for (const idx of area.slice(0, 3)) {
          const cell = state.board[idx];
          if (!isGem(cell)) continue;
          if (useLockTheme) {
            cell.lockedTurns = Math.max(cell.lockedTurns, 2);
            let to = randColor();
            if (to === cell.color) to = nextGemColor(cell.color);
            cell.color = to;
          } else {
            cell.glass = true;
          }
          cell.voidMarked = true;
          affected += 1;
        }
        if (!useLockTheme) addObstacles(1);
        state.suppressSpecialNotice = i18n.getLanguage() === "zh-CN" ? "裂界扭曲" : "rift distortion";
        setBossCastHint(lt(skill.name), useLockTheme ? `小范围扭曲并封锁 ${affected} 格` : `小范围裂蚀并升起裂口`, useLockTheme ? `small area warped and pinned` : `small area cracked and armored`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "dragon_breath": {
        const row = Math.floor(Math.random() * boardSize);
        await castAt(indicesInRow(row));
        await showBossTelegraph({ rows: [row], indices: indicesInRow(row) }, 340);
        const targets = indicesInRow(row).filter((idx) => isGem(state.board[idx]));
        shuffle(targets);
        let marked = 0;
        let locked = 0;
        for (const idx of targets.slice(0, state.boss.elite ? 6 : 4)) {
          if (!isGem(state.board[idx])) continue;
          state.board[idx].glass = true;
          state.board[idx].voidMarked = true;
          marked += 1;
        }
        for (const idx of targets.slice(state.boss.elite ? 6 : 4, state.boss.elite ? 9 : 6)) {
          if (!isGem(state.board[idx])) continue;
          state.board[idx].lockedTurns = Math.max(state.board[idx].lockedTurns, 1);
          locked += 1;
        }
        state.suppressSpecialNotice = i18n.getLanguage() === "zh-CN" ? "虚空龙息" : "void breath";
        setBossCastHint(lt(skill.name), `第 ${row + 1} 行被龙息压制：${marked} 护层，${locked} 锁定`, `row ${row + 1} scorched: ${marked} marked, ${locked} pinned`);
        notifyBossCast(lt(skill.name));
        break;
      }
      case "world_crack": {
        const targets = choosePriorityGemIndices(state.boss.elite ? 8 : 6, { preferSpecial: true });
        await castAt(targets);
        const obstacles = addObstacles(state.boss.elite ? 6 : 4).length;
        const recolored = recolor(state.boss.elite ? 12 : 8).length;
        for (const idx of choosePriorityGemIndices(state.boss.elite ? 6 : 4, {})) {
          if (isGem(state.board[idx])) state.board[idx].voidMarked = true;
        }
        state.suppressSpecialNotice = i18n.getLanguage() === "zh-CN" ? "裂界区域" : "rift zone";
        setBossCastHint(lt(skill.name), `${obstacles} 处裂隙，${recolored} 枚扭曲宝石`, `${obstacles} voids, ${recolored} warped gems`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "emperor_decree": {
        const pickA = pickLocalizedVoidArea();
        const pickB = pickLocalizedVoidArea();
        await castAt([...pickA.area, ...pickB.area]);
        if (pickA.center != null) await showBossTelegraph({ indices: pickA.area, center: pickA.center }, 260);
        if (pickB.center != null) await showBossTelegraph({ indices: pickB.area, center: pickB.center }, 260);
        const zoneA = applyLocalizedVoidZone(pickA.area, { obstacleCount: state.boss.elite ? 2 : 1, lockCount: state.boss.elite ? 3 : 2, markCount: state.boss.elite ? 4 : 3 });
        const zoneB = applyLocalizedVoidZone(pickB.area, { obstacleCount: state.boss.elite ? 2 : 1, lockCount: state.boss.elite ? 2 : 1, markCount: state.boss.elite ? 4 : 3 });
        setBossCastHint(lt(skill.name), `帝令压下两处危险区：${zoneA.obstacles + zoneB.obstacles} 裂口，${zoneA.locks + zoneB.locks} 束缚`, `${zoneA.obstacles + zoneB.obstacles} rifts and ${zoneA.locks + zoneB.locks} bindings across two decree zones`);
        notifyBossCast(lt(skill.name));
        applyBossPressure(skill.id);
        break;
      }
      case "star_abyss_end": {
        const phaseOnePick = pickLocalizedVoidArea();
        const phaseTwoPick = pickLocalizedVoidArea();
        await castAt([...phaseOnePick.area, ...phaseTwoPick.area]);
        const recolored = recolor(state.boss.elite ? 20 : 14).length;
        if (phaseOnePick.center != null) await showBossTelegraph({ indices: phaseOnePick.area, center: phaseOnePick.center }, 260);
        if (phaseTwoPick.center != null) await showBossTelegraph({ indices: phaseTwoPick.area, center: phaseTwoPick.center }, 260);
        const phaseOne = applyLocalizedVoidZone(phaseOnePick.area, { obstacleCount: state.boss.elite ? 3 : 2, lockCount: state.boss.elite ? 3 : 2, markCount: state.boss.elite ? 4 : 3 });
        const phaseTwo = applyLocalizedVoidZone(phaseTwoPick.area, { obstacleCount: state.boss.elite ? 4 : 3, lockCount: state.boss.elite ? 4 : 3, markCount: state.boss.elite ? 5 : 4 });
        setBossCastHint(lt(skill.name), `${recolored} 扭曲，星渊两段塌缩共撕开 ${phaseOne.obstacles + phaseTwo.obstacles} 处裂口`, `${recolored} warped, two abyss waves tear open ${phaseOne.obstacles + phaseTwo.obstacles} rifts`);
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

  function getDominantGemColor(indices) {
    const counts = new Map();
    for (const idx of indices) {
      const cell = state.board[idx];
      if (!isGem(cell)) continue;
      counts.set(cell.color, (counts.get(cell.color) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }

  function gatherAreaIndices(center, radius = 1) {
    const row = rowOf(center);
    const col = colOf(center);
    const out = [];
    for (let rr = row - radius; rr <= row + radius; rr += 1) {
      for (let cc = col - radius; cc <= col + radius; cc += 1) {
        if (inside(rr, cc)) out.push(rr * boardSize + cc);
      }
    }
    return out;
  }

  function gatherAdjacentGemIndices(center) {
    const row = rowOf(center);
    const col = colOf(center);
    const out = [];
    for (const [rr, cc] of [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]) {
      if (!inside(rr, cc)) continue;
      const idx = rr * boardSize + cc;
      if (isGem(state.board[idx]) || isObstacle(state.board[idx])) out.push(idx);
    }
    return out;
  }

  function buildOffensiveSkillEffects(valid, gemTargets, chain, expandedInfo) {
    const reserved = new Set(valid);
    const effects = [];
    const orderedSkills = getCarriedItems();
    let aggregateTargets = [...valid];

    const pushEffect = (id, indices) => {
      const unique = [...new Set((indices || []).filter((idx) => !reserved.has(idx) && idx >= 0 && idx < boardSize * boardSize && state.board[idx] !== null))];
      if (unique.length <= 0) return;
      unique.forEach((idx) => reserved.add(idx));
      aggregateTargets.push(...unique);
      effects.push({ id, name: lt(ITEM_DEFS[id].name), indices: unique });
    };

    for (const id of orderedSkills) {
      const currentGemTargets = [...new Set(aggregateTargets)].filter((idx) => isGem(state.board[idx]));
      const baseTargets = currentGemTargets.length > 0 ? currentGemTargets : aggregateTargets;
      const anchor = baseTargets[0];
      const secondary = baseTargets[baseTargets.length - 1] ?? anchor;
      if (anchor == null) continue;
      const dominantColor = getDominantGemColor(baseTargets);
      const hpRatio = Number(state.boss.hp || 0) / Math.max(1, Number(state.boss.maxHp || 1));

      switch (id) {
        case "hammer": {
          const anchors = baseTargets.slice(0, Math.min(itemPower(id), baseTargets.length));
          const picks = [];
          for (const idx of anchors) {
            const extras = gatherAdjacentGemIndices(idx).filter((candidate) => !reserved.has(candidate));
            picks.push(...extras.slice(0, 1));
          }
          pushEffect(id, picks);
          break;
        }
        case "row": {
          if (currentGemTargets.length < 4) break;
          const indices = [...getIndicesInRow(rowOf(anchor))];
          if (itemPower(id) >= 2) indices.push(...getIndicesInRow(rowOf(secondary)));
          if (itemPower(id) >= 3) indices.push(...getIndicesInCol(colOf(anchor)));
          pushEffect(id, indices);
          break;
        }
        case "cross": {
          if (!(currentGemTargets.length >= 4 || chain >= 2 || expandedInfo.chainCount > 1)) break;
          const indices = [...gatherAreaIndices(anchor, 1)];
          if (itemPower(id) >= 2) indices.push(...gatherAreaIndices(secondary, 1));
          if (itemPower(id) >= 3) indices.push(...getIndicesInRow(rowOf(anchor)), ...getIndicesInCol(colOf(anchor)));
          pushEffect(id, indices);
          break;
        }
        case "color": {
          if (!(dominantColor != null && currentGemTargets.length >= 4)) break;
          const sameColor = collectIndices((cell) => isGem(cell) && cell.color === dominantColor).filter((idx) => !reserved.has(idx));
          shuffle(sameColor);
          pushEffect(id, sameColor.slice(0, 2 + itemPower(id) * 2));
          break;
        }
        case "shuffle": {
          const roam = collectIndices((cell) => isGem(cell) || isObstacle(cell)).filter((idx) => !reserved.has(idx));
          shuffle(roam);
          pushEffect(id, roam.slice(0, 1 + itemPower(id)));
          break;
        }
        case "screen_wipe": {
          if (!(currentGemTargets.length >= (itemPower(id) >= 2 ? 4 : 5))) break;
          const indices = [...gatherAreaIndices(anchor, 1)];
          if (itemPower(id) >= 2) indices.push(...gatherAreaIndices(secondary, 1));
          if (itemPower(id) >= 3 && currentGemTargets[1] != null) indices.push(...gatherAreaIndices(currentGemTargets[1], 1));
          pushEffect(id, indices);
          break;
        }
        case "rainbow_burst": {
          if (chain < 2) break;
          const indices = [];
          const uniqueColors = [...new Set(baseTargets.map((idx) => state.board[idx]?.color).filter((x) => Number.isInteger(x)))];
          for (const color of uniqueColors) {
            const pool = collectIndices((cell) => isGem(cell) && cell.color === color).filter((idx) => !reserved.has(idx) && !indices.includes(idx));
            shuffle(pool);
            indices.push(...pool.slice(0, Math.max(1, itemPower(id) - 1)));
          }
          pushEffect(id, indices);
          break;
        }
        case "time_freeze": {
          if (expandedInfo.chainCount <= 1) break;
          const indices = [...gatherAreaIndices(anchor, itemPower(id) >= 3 ? 2 : 1)];
          if (itemPower(id) >= 2) indices.push(...gatherAreaIndices(secondary, 1));
          pushEffect(id, indices);
          break;
        }
        case "boss_breaker": {
          if (hpRatio > 0.5) break;
          const indices = [...gatherAreaIndices(anchor, 1)];
          if (itemPower(id) >= 2) indices.push(...gatherAreaIndices(secondary, 1));
          if (itemPower(id) >= 3) {
            const finishers = collectIndices((cell) => isGem(cell) || isObstacle(cell)).filter((idx) => !reserved.has(idx) && !indices.includes(idx));
            shuffle(finishers);
            indices.push(...finishers.slice(0, 4));
          }
          pushEffect(id, indices);
          break;
        }
        default:
          break;
      }
    }

    return effects;
  }

  function buildConditionalPassiveEffect(valid, gemTargets, chain, expandedInfo) {
    const id = state.conditionalPassive;
    if (!id || valid.length === 0) return null;
    const anchor = gemTargets[0] ?? valid[0];
    if (anchor == null) return null;

    switch (id) {
      case "chain_matrix": {
        if (expandedInfo.chainCount <= 1 && chain <= 1) return null;
        const indices = [...new Set([...getIndicesInRow(rowOf(anchor)), ...getIndicesInCol(colOf(anchor))])].filter((idx) => !valid.includes(idx));
        return indices.length > 0 ? { id, name: lt(CONDITIONAL_PASSIVE_DEFS[id].title), indices, type: "clear" } : null;
      }
      case "fever_engine": {
        if (state.feverTurns <= 0) return null;
        const indices = gatherAreaIndices(anchor, 1).filter((idx) => !valid.includes(idx));
        return indices.length > 0 ? { id, name: lt(CONDITIONAL_PASSIVE_DEFS[id].title), indices, type: "clear" } : null;
      }
      case "purifier_sigil": {
        const targets = collectIndices((cell) => isGem(cell) && (cell.glass || cell.frozen || cell.lockedTurns > 0)).filter((idx) => !valid.includes(idx)).slice(0, 3);
        return targets.length > 0 ? { id, name: lt(CONDITIONAL_PASSIVE_DEFS[id].title), indices: targets, type: "purify" } : null;
      }
      case "boss_shunt": {
        if (Number(state.boss.charge || 0) < 60) return null;
        const indices = choosePriorityGemIndices(3, { preferSpecial: true }).filter((idx) => !valid.includes(idx));
        return indices.length > 0 ? { id, name: lt(CONDITIONAL_PASSIVE_DEFS[id].title), indices, type: "clear", chargeDrain: 14 } : null;
      }
      default:
        return null;
    }
  }

  async function resolveAction(initialTargets, source, spawnMap = null, preferSpawnIndex = null) {
    let chain = 1;
    let current = [...new Set(initialTargets)];
    let localSpawnMap = spawnMap;
    let passiveSkillTriggered = false;
    let conditionalSkillTriggered = false;

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
      if (expandedInfo.chainCount > 1) shakeBoard(1.25);
      else shakeBoard(1);
      renderAll();
      await sleep(260);

      const conditionalEffect = !conditionalSkillTriggered && (source === "normal" || source === "combo")
        ? buildConditionalPassiveEffect(valid, valid.filter((i) => isGem(state.board[i])), chain, expandedInfo)
        : null;
      if (conditionalEffect) {
        conditionalSkillTriggered = true;
        await playConditionalPassiveSequence(conditionalEffect);
        for (const idx of conditionalEffect.indices) if (!valid.includes(idx) && state.board[idx] !== null) valid.push(idx);
      }

      const skillEffects = !passiveSkillTriggered && (source === "normal" || source === "combo")
        ? buildOffensiveSkillEffects(valid, valid.filter((i) => isGem(state.board[i])), chain, expandedInfo)
        : [];
      if (skillEffects.length > 0) {
        passiveSkillTriggered = true;
        await playPassiveSkillSequence(skillEffects);
        for (const effect of skillEffects) {
          for (const idx of effect.indices) if (!valid.includes(idx) && state.board[idx] !== null) valid.push(idx);
        }
      }
      clearAnim = new Set(valid);
      renderAll();
      await sleep(skillEffects.length > 0 ? 120 : 40);

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
      const inflicted = await playEncounterDamageFX(gemTargets, gain);
      state.floorScore += gain;
      state.score += gain;
      updateMomentum(gemTargets.length, chain);
      const chargeReduced = drainEncounterCharge(gemTargets.length, chain, source);
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
      const ashCreated = triggerThunderAshOnClear(gemTargets);
      breakAdjacentObstacles(gemTargets);

        if (chain === 1 && localSpawnMap && localSpawnMap.size > 0) {
        const spawnIndex = pickSpawnIndex(localSpawnMap, preferSpawnIndex);
        if (spawnIndex !== null && state.board[spawnIndex] === null) {
          state.board[spawnIndex] = { kind: "gem", color: randColor(), special: localSpawnMap.get(spawnIndex), glass: false, burning: false, poisonedTurns: 0, frostedTurns: 0, frozen: false, lockedTurns: 0, holyMarked: false, voidMarked: false, slippery: false };
          spawnShockwaveFX(spawnIndex, true);
        }
      }

      if (burningCleared > 0) {
        spawnFloatText(i18n.getLanguage() === "zh-CN" ? `熄灭 ${burningCleared}` : `Snuff ${burningCleared}`, gemTargets[0] ?? valid[0]);
      }
      if (ashCreated > 0) {
        spawnFloatText(i18n.getLanguage() === "zh-CN" ? `雷击成灰 ${ashCreated}` : `Ash ${ashCreated}`, gemTargets[0] ?? valid[0]);
      }
      if (chargeReduced > 0) {
        spawnFloatText(i18n.getLanguage() === "zh-CN" ? `压制 -${chargeReduced}` : `Charge -${chargeReduced}`, Math.floor((boardSize * boardSize) / 2));
      }
      if (inflicted > 0) {
        state.boss.hint = i18n.getLanguage() === "zh-CN"
          ? `${lt(getEncounterName(state.floorTheme))} 受到 ${inflicted} 点伤害，剩余 ${state.boss.hp}/${state.boss.maxHp}`
          : `${lt(getEncounterName(state.floorTheme))} takes ${inflicted} damage and drops to ${state.boss.hp}/${state.boss.maxHp}`;
      }

      renderAll();
      await sleep(120);

      clearAnim.clear();
      renderAll();
      await sleep(90);

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
      state.suppressSpecialSpawnOnce = false;
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
    const suppressAllSpecials = Boolean(state.suppressSpecialSpawnOnce);
    let preventedSpecials = 0;

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
      const involvedCells = arr.flatMap((x) => x.indices).map((i) => state.board[i]).filter((cell) => isGem(cell));
      const blockedByElementRule = suppressAllSpecials || involvedCells.some((cell) => cell.burning || (cell.poisonedTurns || 0) > 0 || cell.voidMarked);
      if (hasH && hasV && !blockedByElementRule) spawnMap.set(idx, "bomb");
      else if (hasH && hasV && blockedByElementRule) preventedSpecials += 1;
    }

    for (const g of groups) {
      const blockedByElementRule = suppressAllSpecials || g.indices.some((idx) => {
        const cell = state.board[idx];
        return isGem(cell) && (cell.burning || (cell.poisonedTurns || 0) > 0 || cell.voidMarked);
      });
      if (blockedByElementRule) {
        if (g.len >= 4) preventedSpecials += 1;
        continue;
      }
      if (g.len >= 5) {
        spawnMap.set(g.indices[2], "rainbow");
      } else if (g.len === 4 && !spawnMap.has(g.indices[1])) {
        if (state.perks.prism_heart && Math.random() < 0.18) spawnMap.set(g.indices[1], "rainbow");
        else if (state.perks.combo_forge && Math.random() < 0.4) spawnMap.set(g.indices[1], "bomb");
        else spawnMap.set(g.indices[1], g.dir === "h" ? "line_h" : "line_v");
      }
    }

    if (preventedSpecials > 0) {
      const reason = state.suppressSpecialNotice || (i18n.getLanguage() === "zh-CN" ? "元素压制" : "elemental pressure");
      notify(i18n.getLanguage() === "zh-CN" ? `${reason}阻止了 ${preventedSpecials} 次特殊宝石生成` : `${preventedSpecials} special spawns were blocked by ${reason}`, "warn");
      state.suppressSpecialNotice = null;
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
      state.feverTurns = (state.perks.fever_loop ? 4 : 3);
      spawnFloatText("FEVER!", Math.floor((boardSize * boardSize) / 2));
      notify(i18n.getLanguage() === "zh-CN" ? "热潮启动：得分和掉落都已提升！" : "FEVER started: score and drops are boosted!", "ok");
      audio.play("fever");
    }
  }

  function maybeDropItem(chain) {
    return;
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

  function convertTargetsToAsh(indices, count) {
    const gemTargets = indices.filter((idx) => isGem(state.board[idx]));
    shuffle(gemTargets);
    let converted = 0;
    for (const idx of gemTargets.slice(0, count)) {
      state.board[idx] = { kind: "obstacle", ash: true };
      converted += 1;
    }
    return converted;
  }

  function triggerThunderAshOnClear(gemIndices, chance = 0.35) {
    const affected = new Set();
    for (const idx of gemIndices) {
      const cell = state.board[idx];
      if (!isGem(cell) || (!cell.lockedTurns && !cell.special && !cell.holyMarked)) continue;
      const r = rowOf(idx);
      const c = colOf(idx);
      for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
        if (!inside(nr, nc)) continue;
        const ni = nr * boardSize + nc;
        if (Math.random() < chance && isGem(state.board[ni])) affected.add(ni);
      }
    }
    return convertTargetsToAsh([...affected], affected.size);
  }

  function applySlipperySwapEffect(a, b) {
    const ca = state.board[a];
    const cb = state.board[b];
    const slipperySource = (isGem(ca) && ca.slippery) ? a : ((isGem(cb) && cb.slippery) ? b : null);
    if (slipperySource == null) return false;
    const sourceRow = rowOf(slipperySource);
    const sourceCol = colOf(slipperySource);
    if (Math.random() < 0.5) shiftRow(sourceRow);
    else shiftCol(sourceCol);
    notify(i18n.getLanguage() === "zh-CN" ? "潮湿宝石打滑，牵动了周围水流！" : "A slippery gem slid and dragged the current with it!", "warn");
    state.suppressSpecialSpawnOnce = true;
    state.suppressSpecialNotice = i18n.getLanguage() === "zh-CN" ? "潮湿滑移" : "slippery flow";
    return true;
  }

  function checkFloorState() {
    if (Number(state.boss.hp || 0) <= 0) return onFloorCleared();
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
    overlayTitleEl.textContent = `${t("conditionalPassivePrefix") || t("chapterBlessingPrefix")}${lt(state.floorTheme.title)}`;
    overlayDescEl.textContent = isChapterStart ? t("conditionalPassiveStart") || t("chapterBlessingStart") : t("conditionalPassiveNext") || t("chapterBlessingNext");
    choiceWrapEl.innerHTML = "";
    overlayActionsEl.innerHTML = "";

    const pool = Object.entries(CONDITIONAL_PASSIVE_DEFS).filter(([id]) => id !== state.conditionalPassive);
    shuffle(pool);
    const picks = pool.slice(0, 3);

    for (const [id, def] of picks) {
      const btn = document.createElement("button");
      btn.className = `choice rarity-${def.rarity}`;
      btn.innerHTML = `<span class="choice-rarity">${t("conditionalPassive") || t("blessing")}</span><strong>${lt(def.title)}</strong><small>${lt(def.desc)}</small>`;
      btn.addEventListener("click", () => {
        def.apply(state);
        audio.play("rewardPick");
        overlayEl.classList.add("hidden");
        notify(t("conditionalPassiveAcquired", { name: lt(def.title) }) || t("blessingAcquired", { name: lt(def.title) }), "ok");
        renderAll();
        if (isChapterStart) startFloor(state.selectedChapter.start);
        else startFloor(state.floor + 1);
      });
      choiceWrapEl.appendChild(btn);
    }

    overlayEl.classList.remove("hidden");
  }

  function showLateChapterSkillDraft(chapter, draftsRemaining) {
    overlayTitleEl.textContent = t("lateChapterDraftTitle");
    overlayDescEl.textContent = t("lateChapterDraftDesc", { count: draftsRemaining });
    choiceWrapEl.innerHTML = "";
    overlayActionsEl.innerHTML = "";

    const choices = buildCatchUpSkillChoices(chapter, draftsRemaining);
    for (const reward of choices) {
      const btn = document.createElement("button");
      btn.className = `choice rarity-${reward.rarity || "common"}`;
      btn.innerHTML = `<span class="choice-rarity">${lt(RARITY_LABELS[reward.rarity]) || t("common")}</span><strong>${lt(reward.title)}</strong><small>${lt(reward.desc)}</small>`;
      btn.addEventListener("click", async () => {
        const proceed = await reward.apply();
        if (proceed === false) return;
        audio.play("rewardPick");
        if (draftsRemaining > 1) {
          showLateChapterSkillDraft(chapter, draftsRemaining - 1);
        } else {
          showChapterBlessings(true);
        }
      });
      choiceWrapEl.appendChild(btn);
    }

    overlayActionsEl.innerHTML = `<button type="button" class="btn overlay-btn" data-action="skip-late-draft">${t("skipReward")}</button>`;
    bindOverlayActions();

    overlayEl.classList.remove("hidden");
  }

  function buildCatchUpSkillChoices(chapter, draftsRemaining) {
    const result = [];
    const newCandidates = ITEM_ORDER.filter((id) => !hasItemType(id));
    const carried = getCarriedItems();
    if (newCandidates.length > 0 && carried.length < MAX_ITEM_TYPES) {
      const pool = [...newCandidates];
      shuffle(pool);
      for (const id of pool.slice(0, 2)) result.push(createNewItemReward(id, { onCancel: () => showLateChapterSkillDraft(chapter, draftsRemaining) }));
    }

    const upgrades = [...carried].sort((a, b) => getItemLevel(a) - getItemLevel(b));
    for (const id of upgrades.slice(0, 2)) result.push(createUpgradeReward(id));

    while (result.length < 3) {
      const fallback = randomPick(ITEM_ORDER);
      result.push(hasItemType(fallback) ? createUpgradeReward(fallback) : createNewItemReward(fallback, { onCancel: () => showLateChapterSkillDraft(chapter, draftsRemaining) }));
    }
    return result.slice(0, 3);
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
    state.selectedChapter = next;
    state.floorTheme = next;
    state.routePlan = { id: "main", title: t("carryingPath"), floorsRemaining: 0, moveBonus: 0, movePenalty: 0, targetMulDelta: 0, pressureDelta: 0, dropBoost: 0, chainBonus: 0, shardBonus: 0 };
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
        desc: zhen("最终 Boss 层：步数更少、压力更大，但连锁更强且立刻让全部作战技能 +1 级。", "Final boss floor: fewer moves and more pressure, but stronger chains and all combat skills gain +1 level immediately."),
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
          desc: zhen("接下来两层会更严苛，但连锁奖励和掉落提高，并获得 +1 十字核爆。", "The next two floors are harsher, but chain rewards and drops increase and you gain +1 Cross Nova."),
          apply: () => {
            state.eventCurseFloors = 2;
            unlockOrUpgradeSkill("cross", 1);
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
          desc: zhen("从余烬营地获得 +1 回响溅射和 +1 裂阵直击。", "Gain +1 Ricochet Splash and +1 Line Breaker from the ember camp."),
          apply: () => {
            unlockOrUpgradeSkill("hammer", 1);
            unlockOrUpgradeSkill("row", 1);
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
            for (const idx of obstacles.slice(0, 2)) state.board[idx] = { kind: "gem", color: randColor(), special: null, glass: false, burning: false, poisonedTurns: 0, frostedTurns: 0, frozen: false, lockedTurns: 0, holyMarked: false, voidMarked: false, slippery: false };
            notify(i18n.getLanguage() === "zh-CN" ? "地穴地图揭示了岩层薄弱点。" : "The burrow map reveals weak stone sections.", "ok");
          },
        },
      ],
      storm_peaks: [
        {
          title: zhen("熔炉过载", "Forge Overdrive"),
          desc: zhen("获得 +1 同调收割，并提高下一次诅咒楼层收益。", "Gain +1 Color Harvest and boost the next cursed floor payoff."),
          apply: () => {
            unlockOrUpgradeSkill("color", 1);
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
          desc: zhen("下一层 +3 步，并获得 +1 追击尾流。", "Gain +3 moves next floor and +1 Cascade Tailwind."),
          apply: () => {
            state.nextFloorMoveBonus += 3;
            unlockOrUpgradeSkill("shuffle", 1);
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
            for (const idx of obstacles.slice(0, 3)) state.board[idx] = { kind: "gem", color: randColor(), special: null, glass: false, burning: false, poisonedTurns: 0, frostedTurns: 0, frozen: false, lockedTurns: 0, holyMarked: false, voidMarked: false, slippery: false };
            state.boss.charge = 0;
            notify(i18n.getLanguage() === "zh-CN" ? "冷却阀门释放了熔炉压力。" : "Cooling valves release the furnace pressure.", "ok");
          },
        },
      ],
      eclipse_sanctum: [
        {
          title: zhen("圣环碎片", "Halo Fragment"),
          desc: zhen("获得 +1 棱镜溢流和 +25 动量。", "Gain +1 Prism Overflow and +25 momentum."),
          apply: () => {
            unlockOrUpgradeSkill("rainbow_burst", 1);
            state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 25);
            notify(i18n.getLanguage() === "zh-CN" ? "圣环碎片强化了你的配置。" : "A halo fragment empowers your kit.", "ok");
          },
        },
      ],
      void_throne: [
        {
          title: zhen("虚空交易", "Void Bargain"),
          desc: zhen("获得 +240 分和 +1 处决矩阵，但下一层 -1 步。", "Gain +240 score and +1 Execution Matrix, but suffer -1 move next floor."),
          apply: () => {
            state.score += 240;
            state.nextFloorMovePenalty += 1;
            unlockOrUpgradeSkill("boss_breaker", 1);
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
      btn.addEventListener("click", async () => {
        const proceed = await reward.apply();
        if (proceed === false) return;
        audio.play("rewardPick");
        overlayEl.classList.add("hidden");
        startFloor(state.floor + 1);
      });
      choiceWrapEl.appendChild(btn);
    }

    overlayActionsEl.innerHTML = `<button type="button" class="btn overlay-btn" data-action="skip-reward">${t("skipReward")}</button>`;
    bindOverlayActions();

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
    return null;
  }

  function buildItemRewards() {
    const rewards = [];
    const carried = getCarriedItems();
    const newCandidates = ITEM_ORDER.filter((id) => !hasItemType(id));

    if (carried.length < MAX_ITEM_TYPES && newCandidates.length > 0) {
      const pool = [...newCandidates];
      shuffle(pool);
      const preferred = pool.filter((id) => ITEM_DEFS[id].rarity !== "legendary");
      const picks = (preferred.length >= 3 ? preferred : pool).slice(0, 3);
      for (const id of picks) rewards.push(createNewItemReward(id, { onCancel: () => showRewardChoices() }));
      return rewards;
    }

    if (newCandidates.length > 0) {
      const pool = [...newCandidates];
      shuffle(pool);
      rewards.push(createNewItemReward(pool[0], { onCancel: () => showRewardChoices() }));
    }

    const upgradePool = [];
    for (const id of carried) {
      const weight = 2 + getItemLevel(id) * 2;
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
      { type: "support", rarity: "rare", title: zhen("战术加装", "Tactical Retrofit"), desc: zhen("随机提升一个已携带技能 1 级", "Upgrade one random carried skill by 1 level"), apply: upgradeRandomCarriedItem },
      { type: "support", rarity: "common", title: zhen("战斗手册", "Combat Manual"), desc: zhen("所有已携带技能获得 +1 等级", "All carried skills gain +1 level"), apply: refillCarriedCharges },
      { type: "support", rarity: "rare", title: zhen("过载校准", "Overload Tuning"), desc: zhen("随机解锁一个新技能；若已满则改为升级最低等级技能", "Unlock a new skill, or upgrade your lowest-level one if all slots are full"), apply: grantHighTierCharge },
      { type: "support", rarity: "rare", title: zhen("Boss 抑制", "Boss Suppressant"), desc: zhen("下一层开始时 +2 步，并完全重置 Boss 能量槽", "Start the next floor with +2 moves and a fully reset boss gauge"), apply: () => { state.nextFloorMoveBonus += 2; state.boss.charge = 0; } },
      { type: "support", rarity: "epic", title: zhen("热潮电池", "Fever Battery"), desc: zhen("获得 +70 动量，为下一次爆发蓄力", "Gain +70 momentum to prime your next power spike"), apply: () => (state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 70)) },
      { type: "support", rarity: "epic", title: zhen("裂隙演算", "Rift Computation"), desc: zhen("随机获得 1 个史诗或传说技能；若已拥有则再升 1 级", "Gain a random epic or legendary skill, or level it up if already owned"), apply: grantHighTierCharge },
    ];
  }

  function showSkillReplacementChoices({ newId, levelGain = 1, onCancel = null }) {
    return new Promise((resolve) => {
    overlayTitleEl.textContent = i18n.getLanguage() === "zh-CN" ? `替换为 ${lt(ITEM_DEFS[newId].name)}` : `Replace with ${lt(ITEM_DEFS[newId].name)}`;
    overlayDescEl.textContent = i18n.getLanguage() === "zh-CN"
      ? "技能栏已满，请主动选择一个已有技能进行替换，或者取消本次选择。"
      : "Your skill bar is full. Choose one equipped skill to replace, or cancel this pick.";
    choiceWrapEl.innerHTML = "";
    overlayActionsEl.innerHTML = `<button type="button" class="btn overlay-btn" data-action="cancel-replace">${t("close")}</button>`;
    bindOverlayActions();

    for (const id of pickReplacementCandidates()) {
      const btn = document.createElement("button");
      btn.className = `choice rarity-${ITEM_DEFS[id].rarity}`;
      btn.innerHTML = `<span class="choice-rarity">${t("itemLevel", { level: getItemLevel(id) })}</span><strong>${lt(ITEM_DEFS[id].name)}</strong><small>${i18n.getLanguage() === "zh-CN" ? `替换后获得 ${lt(ITEM_DEFS[newId].name)} ${t("itemLevel", { level: levelGain })}` : `Replace with ${lt(ITEM_DEFS[newId].name)} Lv.${levelGain}`}</small>`;
      btn.addEventListener("click", () => {
        replaceSkill(id, newId, levelGain);
        resolve(true);
      });
      choiceWrapEl.appendChild(btn);
    }

    const cancelBtn = overlayActionsEl.querySelector('[data-action="cancel-replace"]');
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        if (onCancel) onCancel();
        resolve(false);
      }, { once: true });
    }
    overlayEl.classList.remove("hidden");
    });
  }

  function createNewItemReward(id, options = {}) {
    const bonus = state.perks.vault_expander ? 2 : 1;
    return {
      type: "item",
      rarity: ITEM_DEFS[id].rarity,
      title: i18n.getLanguage() === "zh-CN" ? `新技能：${lt(ITEM_DEFS[id].name)}` : `New Skill: ${lt(ITEM_DEFS[id].name)}`,
      desc: itemSlotAvailable()
        ? (i18n.getLanguage() === "zh-CN" ? `将 ${lt(ITEM_DEFS[id].name)} 加入你的作战槽位，并直接提升到 ${t("itemLevel", { level: bonus })}。` : `Add ${lt(ITEM_DEFS[id].name)} to your combat bar at Lv.${bonus}.`)
        : (i18n.getLanguage() === "zh-CN" ? `技能栏已满，可主动选择替换一个已装备技能。` : `Your skill bar is full, so you may choose one equipped skill to replace.`),
      apply: async () => {
        if (itemSlotAvailable() || hasItemType(id)) {
          unlockOrUpgradeSkill(id, bonus);
          return true;
        }
        const replaced = await showSkillReplacementChoices({ newId: id, levelGain: bonus, onCancel: options.onCancel });
        return replaced;
      },
    };
  }

  function createUpgradeReward(id) {
    const levels = ITEM_DEFS[id].rarity === "legendary" ? 1 : 2;
    return {
      type: "item",
      rarity: ITEM_DEFS[id].rarity,
      title: i18n.getLanguage() === "zh-CN" ? `升级 ${lt(ITEM_DEFS[id].name)}` : `Upgrade ${lt(ITEM_DEFS[id].name)}`,
      desc: i18n.getLanguage() === "zh-CN" ? `将 ${lt(ITEM_DEFS[id].name)} 提升到 ${t("itemLevel", { level: getItemLevel(id) + levels })}。` : `Raise ${lt(ITEM_DEFS[id].name)} to Lv.${getItemLevel(id) + levels}.`,
      apply: () => unlockOrUpgradeSkill(id, levels),
    };
  }

  function restoreRandomCharges() {
    const carried = getCarriedItems();
    if (carried.length === 0) return;
    const bag = [];
    for (const id of carried) {
      for (let i = 0; i < Math.max(1, getItemLevel(id)); i += 1) bag.push(id);
    }
    for (let i = 0; i < 2; i += 1) unlockOrUpgradeSkill(randomPick(bag), 1);
  }

  function refillCarriedCharges() {
    for (const id of getCarriedItems()) unlockOrUpgradeSkill(id, 1);
  }

  function upgradeRandomCarriedItem() {
    const carried = getCarriedItems();
    if (carried.length === 0) return;
    const id = randomPick(carried);
    unlockOrUpgradeSkill(id, 1);
  }

  function grantHighTierCharge() {
    const lockedHighTier = ITEM_ORDER.filter((id) => !hasItemType(id) && ["epic", "legendary"].includes(ITEM_DEFS[id].rarity));
    if (lockedHighTier.length > 0 && itemSlotAvailable()) {
      unlockOrUpgradeSkill(randomPick(lockedHighTier), 1);
      return;
    }
    const carried = getCarriedItems().filter((id) => ["epic", "legendary"].includes(ITEM_DEFS[id].rarity));
    const fallback = getCarriedItems();
    const pool = carried.length > 0 ? carried : fallback;
    if (pool.length === 0) return;
    unlockOrUpgradeSkill(randomPick(pool), 1);
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

  function setActiveSkillHighlight(skillId = null) {
    if (!itemWrapEl) return;
    const abilities = itemWrapEl.querySelectorAll(".ability[data-item]");
    for (const el of abilities) el.classList.toggle("active-skill", el.dataset.item === skillId);
  }

  function getSkillButtonCenter(skillId) {
    const el = itemWrapEl?.querySelector(`.ability[data-item="${skillId}"]`);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function getConditionalPassiveCenter(passiveId) {
    const chips = perkWrapEl?.querySelectorAll(".perk-chip");
    if (!chips?.length) return null;
    const target = [...chips].find((el) => el.textContent?.includes(lt(CONDITIONAL_PASSIVE_DEFS[passiveId]?.title || {}))) || chips[0];
    if (!target) return null;
    const rect = target.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function getViewportCenter() {
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  function getGemBoltPalette(color) {
    const palettes = {
      0: { core: "rgba(255,245,214,0.98)", mid: "rgba(255,122,92,0.96)", glow: "rgba(255,82,82,0.44)" },
      1: { core: "rgba(239,250,255,0.98)", mid: "rgba(98,202,255,0.96)", glow: "rgba(86,142,255,0.42)" },
      2: { core: "rgba(247,255,232,0.98)", mid: "rgba(116,224,118,0.96)", glow: "rgba(66,186,118,0.42)" },
      3: { core: "rgba(255,244,224,0.98)", mid: "rgba(255,214,102,0.96)", glow: "rgba(255,152,82,0.44)" },
      4: { core: "rgba(255,240,255,0.98)", mid: "rgba(214,138,255,0.96)", glow: "rgba(148,92,255,0.44)" },
      5: { core: "rgba(244,255,246,0.98)", mid: "rgba(144,255,220,0.96)", glow: "rgba(96,230,208,0.4)" },
    };
    return palettes[color] || getEncounterBoltPalette("player");
  }

  function spawnTransientFx(className, point, ttl, styleVars = {}) {
    if (!fxLayerEl || !point) return null;
    const el = document.createElement("i");
    el.className = className;
    el.style.left = `${point.x}px`;
    el.style.top = `${point.y}px`;
    for (const [key, value] of Object.entries(styleVars)) el.style.setProperty(key, value);
    fxLayerEl.appendChild(el);
    setTimeout(() => el.remove(), ttl);
    return el;
  }

  function spawnPassiveSkillMarker(point, skillId, delay = 0, scale = 1) {
    spawnTransientFx(`fx-passive-skill fx-${skillId}`, point, 760 + delay, {
      "--fx-delay": `${delay}ms`,
      "--fx-scale": `${scale}`,
    });
  }

  function spawnPassiveLineSweep(indices, skillId = "row", delay = 0) {
    if (!fxLayerEl || !indices || indices.length === 0) return;
    const points = indices.map(getCellCenter).filter(Boolean);
    if (points.length < 2) return;
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const horizontal = Math.max(...xs) - Math.min(...xs) >= Math.max(...ys) - Math.min(...ys);
    spawnTransientFx(`fx-passive-line fx-${skillId}${horizontal ? " horizontal" : " vertical"}`, {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...ys) + Math.max(...ys)) / 2,
    }, 720 + delay, {
      "--line-length": `${horizontal ? Math.max(...xs) - Math.min(...xs) + 44 : Math.max(...ys) - Math.min(...ys) + 44}px`,
      "--fx-delay": `${delay}ms`,
    });
  }

  function spawnPassiveLinkPath(points, skillId = "color", delay = 0) {
    if (!fxLayerEl || !points || points.length < 2) return;
    for (let i = 1; i < points.length; i += 1) {
      const from = points[i - 1];
      const to = points[i];
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      spawnTransientFx(`fx-passive-link fx-${skillId}`, { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }, 780 + delay + i * 36, {
        "--link-length": `${length}px`,
        "--link-angle": `${angle}deg`,
        "--fx-delay": `${delay + i * 36}ms`,
      });
    }
  }

  function spawnPassiveAreaShockwave(indices, skillId = "screen_wipe", delay = 0) {
    if (!fxLayerEl || !indices || indices.length === 0) return;
    const points = indices.map(getCellCenter).filter(Boolean);
    if (points.length === 0) return;
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const center = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
    const radius = Math.max(42, Math.max(...points.map((point) => Math.hypot(point.x - center.x, point.y - center.y))) + 28);
    spawnTransientFx(`fx-passive-area fx-${skillId}`, center, 820 + delay, {
      "--area-size": `${radius * 2}px`,
      "--fx-delay": `${delay}ms`,
    });
  }

  function spawnPassiveSlash(point, skillId = "boss_breaker", delay = 0, angle = -32) {
    spawnTransientFx(`fx-passive-slash fx-${skillId}`, point, 760 + delay, {
      "--slash-angle": `${angle}deg`,
      "--fx-delay": `${delay}ms`,
    });
  }

  function spawnPassiveSpiral(point, skillId = "shuffle", delay = 0, scale = 1) {
    spawnTransientFx(`fx-passive-spiral fx-${skillId}`, point, 820 + delay, {
      "--fx-delay": `${delay}ms`,
      "--fx-scale": `${scale}`,
    });
  }

  function spawnPassiveOverclockGrid(indices, skillId = "time_freeze", delay = 0) {
    if (!fxLayerEl || !indices || indices.length === 0) return;
    const points = indices.map(getCellCenter).filter(Boolean);
    if (points.length === 0) return;
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    spawnTransientFx(`fx-passive-grid fx-${skillId}`, {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...ys) + Math.max(...ys)) / 2,
    }, 860 + delay, {
      "--grid-width": `${Math.max(...xs) - Math.min(...xs) + 54}px`,
      "--grid-height": `${Math.max(...ys) - Math.min(...ys) + 54}px`,
      "--fx-delay": `${delay}ms`,
    });
  }

  async function playSkillIconReveal(effect) {
    const button = itemWrapEl?.querySelector(`.ability[data-item="${effect.id}"] .item-image`);
    const center = getViewportCenter();
    spawnTransientFx("fx-skill-cast-icon", center, 900, {
      "--fx-delay": "0ms",
      "--skill-icon": button ? `url("${button.getAttribute("src")}")` : "none",
    });
    await sleep(320);
    return center;
  }

  function spawnPassiveSkillFX(effect, originOverride = null) {
    const skillOrigin = originOverride || getSkillButtonCenter(effect.id);
    const targets = effect.indices.map((idx) => ({ idx, point: getCellCenter(idx) })).filter((entry) => Boolean(entry.point));
    const points = targets.map((entry) => entry.point);
    if (points.length === 0) return;
    if (skillOrigin) {
      for (const entry of targets.slice(0, Math.min(6, targets.length))) {
        const gemColor = state.board[entry.idx]?.color;
        spawnEncounterBolt(skillOrigin, entry.point, "player", 980, getGemBoltPalette(gemColor));
      }
    }

    switch (effect.id) {
      case "chain_matrix":
        spawnPassiveLineSweep(effect.indices.filter((idx) => rowOf(idx) === rowOf(effect.indices[0])), effect.id, 0);
        spawnPassiveLineSweep(effect.indices.filter((idx) => colOf(idx) === colOf(effect.indices[0])), effect.id, 40);
        points.forEach((point, index) => spawnPassiveSkillMarker(point, effect.id, index * 18, 1));
        break;
      case "fever_engine":
        spawnPassiveAreaShockwave(effect.indices, effect.id, 0);
        points.slice(0, 2).forEach((point, index) => spawnPassiveSkillMarker(point, effect.id, index * 42, 1.12));
        break;
      case "purifier_sigil":
        spawnPassiveLinkPath(points, effect.id, 0);
        points.forEach((point, index) => spawnPassiveSkillMarker(point, effect.id, index * 22, 0.9));
        break;
      case "boss_shunt":
        points.forEach((point, index) => {
          spawnPassiveSlash(point, effect.id, index * 34, index % 2 === 0 ? -20 : 20);
          spawnPassiveSkillMarker(point, effect.id, index * 22, 1.02);
        });
        break;
      case "hammer":
        points.forEach((point, index) => spawnPassiveSkillMarker(point, effect.id, index * 40, 0.82));
        break;
      case "row":
        spawnPassiveLineSweep(effect.indices, effect.id, 0);
        points.forEach((point, index) => spawnPassiveSkillMarker(point, effect.id, index * 12, 0.9));
        break;
      case "cross":
        spawnPassiveLineSweep(effect.indices.filter((idx) => rowOf(idx) === rowOf(effect.indices[0])), effect.id, 0);
        spawnPassiveLineSweep(effect.indices.filter((idx) => colOf(idx) === colOf(effect.indices[0])), effect.id, 40);
        spawnPassiveSkillMarker(points[0], effect.id, 0, 1.2);
        break;
      case "color":
        spawnPassiveLinkPath(points.slice(0, Math.min(points.length, 6)), effect.id, 0);
        points.forEach((point, index) => spawnPassiveSkillMarker(point, effect.id, index * 18, 0.8));
        break;
      case "shuffle":
        points.forEach((point, index) => {
          spawnPassiveSpiral(point, effect.id, index * 36, 0.84 + index * 0.04);
          spawnPassiveSkillMarker(point, effect.id, index * 26, 0.76);
        });
        break;
      case "screen_wipe":
        spawnPassiveAreaShockwave(effect.indices, effect.id, 0);
        points.slice(0, 3).forEach((point, index) => spawnPassiveSkillMarker(point, effect.id, index * 60, 1.08));
        break;
      case "rainbow_burst":
        spawnPassiveLinkPath(points.slice(0, Math.min(points.length, 7)), effect.id, 0);
        points.forEach((point, index) => spawnPassiveSkillMarker(point, effect.id, index * 16, 0.96));
        break;
      case "time_freeze":
        spawnPassiveOverclockGrid(effect.indices, effect.id, 0);
        spawnPassiveLineSweep(effect.indices.slice(0, Math.min(effect.indices.length, 5)), effect.id, 0);
        points.slice(0, 2).forEach((point, index) => spawnPassiveSkillMarker(point, effect.id, index * 60, 1.18));
        break;
      case "boss_breaker":
        points.slice(0, 4).forEach((point, index) => {
          spawnPassiveSlash(point, effect.id, index * 46, index % 2 === 0 ? -32 : 28);
          spawnPassiveSkillMarker(point, effect.id, index * 34, 0.9);
        });
        break;
      default:
        points.forEach((point, index) => spawnPassiveSkillMarker(point, effect.id, index * 24, 1));
        break;
    }
  }

  function getSkillAudioProfile(skillId) {
    const profiles = {
      hammer: { sound: "matchClear", volume: 0.34, rate: 1.22 },
      row: { sound: "itemCast", volume: 0.3, rate: 0.92 },
      cross: { sound: "itemCast", volume: 0.34, rate: 0.84 },
      color: { sound: "rewardPick", volume: 0.26, rate: 1.18 },
      shuffle: { sound: "swap", volume: 0.32, rate: 1.16 },
      screen_wipe: { sound: "bossCast", volume: 0.28, rate: 0.78 },
      rainbow_burst: { sound: "fever", volume: 0.24, rate: 1.18 },
      time_freeze: { sound: "bossCast", volume: 0.22, rate: 1.06 },
      boss_breaker: { sound: "bossCast", volume: 0.32, rate: 0.72 },
      chain_matrix: { sound: "itemCast", volume: 0.24, rate: 0.96 },
      fever_engine: { sound: "fever", volume: 0.2, rate: 1.06 },
      purifier_sigil: { sound: "uiClick", volume: 0.24, rate: 1.2 },
      boss_shunt: { sound: "bossCast", volume: 0.2, rate: 1.24 },
    };
    return profiles[skillId] || { sound: "itemCast", volume: 0.26, rate: 1.06 };
  }

  async function playPassiveSkillSequence(effects) {
    if (!effects || effects.length === 0) return;
    for (const effect of effects) {
      if (!effect.indices || effect.indices.length === 0) continue;
      setActiveSkillHighlight(effect.id);
      clearAnim = new Set(effect.indices);
      const castOrigin = await playSkillIconReveal(effect);
      spawnPassiveSkillFX(effect, castOrigin);
      spawnShatterFX(effect.indices);
      spawnFloatText(effect.name, effect.indices[0]);
      const audioProfile = getSkillAudioProfile(effect.id);
      audio.play(audioProfile.sound, { volume: audioProfile.volume, rate: audioProfile.rate });
      renderAll();
      await sleep(620);
    }
    clearAnim.clear();
    setActiveSkillHighlight(null);
  }

  async function playConditionalPassiveSequence(effect) {
    if (!effect?.indices?.length) return;
    const origin = getConditionalPassiveCenter(effect.id) || getViewportCenter();
    spawnTransientFx("fx-skill-cast-icon passive-conditional", origin, 560, {
      "--fx-delay": "0ms",
      "--skill-icon": "none",
    });
    spawnPassiveSkillFX(effect, origin);
    spawnFloatText(effect.name, effect.indices[0]);
    const audioProfile = getSkillAudioProfile(effect.id);
    audio.play(audioProfile.sound, { volume: Math.max(0.18, audioProfile.volume - 0.04), rate: audioProfile.rate });
    clearAnim = new Set(effect.indices);
    renderAll();
    await sleep(280);
    if (effect.id === "boss_shunt" && effect.chargeDrain) {
      state.boss.charge = Math.max(0, Number(state.boss.charge || 0) - effect.chargeDrain);
    }
    if (effect.id === "purifier_sigil") {
      for (const idx of effect.indices) {
        const cell = state.board[idx];
        if (!isGem(cell)) continue;
        cell.glass = false;
        cell.frozen = false;
        cell.lockedTurns = 0;
      }
    }
    clearAnim.clear();
    renderAll();
    await sleep(120);
  }

  function getCellCenter(index) {
    const cellEl = boardEl?.querySelector(`.cell[data-index="${index}"]`);
    if (!cellEl) return null;
    const rect = cellEl.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function getEncounterPortraitCenter() {
    if (!bossPortraitEl) return null;
    const rect = bossPortraitEl.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function getBoardCenter() {
    if (!boardWrapEl) return null;
    const rect = boardWrapEl.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function getEncounterBoltPalette(modifier = "player") {
    const themeId = state.floorTheme?.id || "ember_hollows";
    const palettes = {
      ember_hollows: modifier === "player"
        ? { core: "rgba(255,245,220,0.96)", mid: "rgba(255,177,82,0.92)", glow: "rgba(255,98,64,0.34)" }
        : { core: "rgba(255,231,214,0.96)", mid: "rgba(255,118,74,0.92)", glow: "rgba(255,86,120,0.34)" },
      frost_spire: modifier === "player"
        ? { core: "rgba(240,250,255,0.98)", mid: "rgba(138,214,255,0.92)", glow: "rgba(110,164,255,0.3)" }
        : { core: "rgba(239,250,255,0.98)", mid: "rgba(140,224,255,0.92)", glow: "rgba(130,168,255,0.34)" },
      stone_grove: modifier === "player"
        ? { core: "rgba(255,243,218,0.96)", mid: "rgba(202,168,114,0.9)", glow: "rgba(120,98,62,0.28)" }
        : { core: "rgba(241,226,196,0.96)", mid: "rgba(164,130,88,0.92)", glow: "rgba(96,82,62,0.32)" },
      storm_peaks: modifier === "player"
        ? { core: "rgba(246,249,255,0.98)", mid: "rgba(136,194,255,0.94)", glow: "rgba(98,122,255,0.32)" }
        : { core: "rgba(245,238,255,0.98)", mid: "rgba(167,136,255,0.92)", glow: "rgba(88,126,255,0.34)" },
      venom_bloom: modifier === "player"
        ? { core: "rgba(248,255,228,0.96)", mid: "rgba(172,225,108,0.92)", glow: "rgba(74,152,76,0.32)" }
        : { core: "rgba(237,255,228,0.96)", mid: "rgba(112,214,118,0.92)", glow: "rgba(78,138,82,0.34)" },
      tidal_depths: modifier === "player"
        ? { core: "rgba(236,250,255,0.98)", mid: "rgba(112,224,255,0.92)", glow: "rgba(68,154,255,0.28)" }
        : { core: "rgba(230,248,255,0.98)", mid: "rgba(98,194,255,0.92)", glow: "rgba(64,124,236,0.34)" },
      mirror_circus: modifier === "player"
        ? { core: "rgba(255,241,255,0.98)", mid: "rgba(255,170,236,0.92)", glow: "rgba(186,112,255,0.3)" }
        : { core: "rgba(255,236,250,0.98)", mid: "rgba(238,128,224,0.92)", glow: "rgba(142,108,255,0.34)" },
      iron_forge: modifier === "player"
        ? { core: "rgba(255,244,225,0.98)", mid: "rgba(255,186,102,0.94)", glow: "rgba(192,94,46,0.3)" }
        : { core: "rgba(255,234,214,0.98)", mid: "rgba(255,138,84,0.92)", glow: "rgba(168,78,42,0.34)" },
      eclipse_sanctum: modifier === "player"
        ? { core: "rgba(255,251,228,0.98)", mid: "rgba(255,220,116,0.92)", glow: "rgba(186,132,255,0.28)" }
        : { core: "rgba(252,239,255,0.98)", mid: "rgba(226,166,255,0.92)", glow: "rgba(122,96,196,0.34)" },
      void_throne: modifier === "player"
        ? { core: "rgba(248,236,255,0.98)", mid: "rgba(192,132,255,0.92)", glow: "rgba(102,84,214,0.34)" }
        : { core: "rgba(242,230,255,0.98)", mid: "rgba(162,108,255,0.92)", glow: "rgba(76,62,162,0.4)" },
    };
    return palettes[themeId] || palettes.ember_hollows;
  }

  function getEncounterHitPalette() {
    const themeId = state.floorTheme?.id || "ember_hollows";
    const palettes = {
      ember_hollows: { glow: "rgba(255, 102, 84, 0.24)", flash: "rgba(255, 132, 82, 0.4)", portrait: "rgba(255, 98, 64, 0.42)" },
      frost_spire: { glow: "rgba(122, 210, 255, 0.24)", flash: "rgba(182, 236, 255, 0.38)", portrait: "rgba(118, 176, 255, 0.42)" },
      stone_grove: { glow: "rgba(198, 166, 112, 0.22)", flash: "rgba(224, 204, 160, 0.34)", portrait: "rgba(144, 110, 78, 0.34)" },
      storm_peaks: { glow: "rgba(146, 148, 255, 0.24)", flash: "rgba(176, 202, 255, 0.38)", portrait: "rgba(118, 128, 255, 0.42)" },
      venom_bloom: { glow: "rgba(118, 214, 116, 0.24)", flash: "rgba(198, 244, 152, 0.34)", portrait: "rgba(78, 154, 86, 0.38)" },
      tidal_depths: { glow: "rgba(96, 208, 255, 0.24)", flash: "rgba(154, 236, 255, 0.36)", portrait: "rgba(72, 154, 255, 0.38)" },
      mirror_circus: { glow: "rgba(236, 132, 255, 0.22)", flash: "rgba(255, 188, 244, 0.34)", portrait: "rgba(172, 108, 255, 0.38)" },
      iron_forge: { glow: "rgba(255, 148, 84, 0.24)", flash: "rgba(255, 208, 132, 0.34)", portrait: "rgba(196, 94, 48, 0.4)" },
      eclipse_sanctum: { glow: "rgba(255, 220, 118, 0.22)", flash: "rgba(255, 245, 182, 0.34)", portrait: "rgba(196, 140, 255, 0.38)" },
      void_throne: { glow: "rgba(172, 110, 255, 0.24)", flash: "rgba(220, 178, 255, 0.34)", portrait: "rgba(110, 88, 214, 0.44)" },
    };
    return palettes[themeId] || palettes.ember_hollows;
  }

  function estimateSkillImpactIndices(skill) {
    if (!skill) return [];
    const randomGemIndices = (count) => collectIndices((cell) => isGem(cell)).slice(0, count);
    const randomRow = () => indicesInRow(Math.floor(Math.random() * boardSize));
    const randomCol = () => indicesInCol(Math.floor(Math.random() * boardSize));
    const cross = () => {
      const row = Math.floor(Math.random() * boardSize);
      const col = Math.floor(Math.random() * boardSize);
      return [...new Set([...indicesInRow(row), ...indicesInCol(col)])];
    };
    const localCluster = () => {
      const center = choosePriorityGemIndices(1, { preferSpecial: true })[0] ?? collectIndices((cell) => isGem(cell))[0] ?? 0;
      const r = rowOf(center);
      const c = colOf(center);
      const area = [];
      for (let rr = r - 1; rr <= r + 1; rr += 1) {
        for (let cc = c - 1; cc <= c + 1; cc += 1) {
          if (inside(rr, cc)) area.push(rr * boardSize + cc);
        }
      }
      return area;
    };
    const id = skill.id;
    if (["tail_scorch", "splash_shift", "false_match", "prism_shuffle", "tideling_surge"].includes(id)) return randomRow();
    if (["thunder_lance", "glacier_column", "undertow_pull"].includes(id)) return randomCol();
    if (["absolute_stillness", "chain_burst", "mirror_maze"].includes(id)) return cross();
    if (["foxfire_ring", "frost_page", "voidling_ripple", "abyss_gaze", "emperor_decree"].includes(id)) return localCluster();
    if (["wildfire_pounce", "winter_seal", "duel_of_storms", "royal_pollution", "abyss_tsunami", "thousand_masks", "steelflame_domain", "revelation_zero", "star_abyss_end"].includes(id)) return randomGemIndices(8);
    if (["cave_in", "elder_root_wall", "heavy_press", "world_crack"].includes(id)) return randomGemIndices(6);
    return choosePriorityGemIndices(4, { preferSpecial: true });
  }

  function spawnEncounterBolt(start, end, modifier = "player", duration = 420, paletteOverride = null) {
    if (!fxLayerEl || !start || !end) return;
    const bolt = document.createElement("i");
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const palette = paletteOverride || getEncounterBoltPalette(modifier);
    bolt.className = `fx-encounter-bolt ${modifier}`;
    bolt.style.left = `${start.x}px`;
    bolt.style.top = `${start.y}px`;
    bolt.style.setProperty("--fx-dx", `${dx}px`);
    bolt.style.setProperty("--fx-dy", `${dy}px`);
    bolt.style.setProperty("--fx-duration", `${duration}ms`);
    bolt.style.setProperty("--bolt-core", palette.core);
    bolt.style.setProperty("--bolt-mid", palette.mid);
    bolt.style.setProperty("--bolt-glow", palette.glow);
    bolt.style.setProperty("--bolt-angle", `${Math.atan2(dy, dx)}rad`);
    fxLayerEl.appendChild(bolt);
    setTimeout(() => bolt.remove(), duration + 60);
  }

  async function playEncounterDamageFX(indices, damage) {
    const target = getEncounterPortraitCenter();
    if (!target || !indices?.length) {
      const applied = damageEncounter(damage, "attack");
      if (applied > 0) spawnFloatText(i18n.getLanguage() === "zh-CN" ? `-${applied} 血` : `-${applied} HP`, Math.floor((boardSize * boardSize) / 2));
      return applied;
    }
    spawnShatterFX(indices);
    const shots = indices.slice(0, 6);
    shots.forEach((idx, order) => {
      const start = getCellCenter(idx);
      if (!start) return;
      const gemColor = state.board[idx]?.color;
      spawnEncounterBolt(start, target, "player", 620 + order * 42, getGemBoltPalette(gemColor));
    });
    await sleep(700);
    const shell = bossPortraitEl?.parentElement;
    if (shell) shell.classList.add("hit");
    if (bossPortraitEl) bossPortraitEl.classList.add("hit");
    const applied = damageEncounter(damage, "fx");
    if (applied > 0) spawnFloatText(i18n.getLanguage() === "zh-CN" ? `-${applied} 血` : `-${applied} HP`, Math.floor((boardSize * boardSize) / 2));
    await sleep(220);
    if (shell) shell.classList.remove("hit");
    if (bossPortraitEl) bossPortraitEl.classList.remove("hit");
    return applied;
  }

  async function playEncounterCastFX(skill, impactIndices = null) {
    const start = getEncounterPortraitCenter();
    if (!start) return;
    const shell = bossPortraitEl?.parentElement;
    if (shell) shell.classList.add("casting");
    const exactIndices = Array.isArray(impactIndices) && impactIndices.length > 0 ? impactIndices : estimateSkillImpactIndices(skill);
    const impactPoints = exactIndices.map(getCellCenter).filter(Boolean);
    const fallback = getBoardCenter();
    const targets = impactPoints.length > 0 ? impactPoints.slice(0, 6) : (fallback ? [fallback] : []);
    targets.forEach((target, i) => {
      spawnEncounterBolt(start, target, "enemy", 560 + i * 34);
    });
    await sleep(640);
    if (shell) shell.classList.remove("casting");
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
    const encounterUiText = getEncounterUiText();
    const chapterLength = state.selectedChapter ? state.selectedChapter.end - state.selectedChapter.start + 1 : TOTAL_FLOORS;
    floorEl.textContent = state.selectedChapter ? `${getChapterLocalFloor()}/${chapterLength}` : `${state.floor}/${TOTAL_FLOORS}`;
    if (boardTargetScoreEl) boardTargetScoreEl.textContent = String(state.boss.maxHp || 0);
    movesLeftEl.textContent = String(state.movesLeft);
    floorScoreEl.textContent = String(state.boss.hp || 0);
    if (boardFloorScoreEl) boardFloorScoreEl.textContent = String(state.boss.hp || 0);
    scoreEl.textContent = String(state.score);
    bestFloorEl.textContent = String(meta.bestFloor);
    bestScoreEl.textContent = String(meta.bestScore);

    momentumBarEl.style.width = `${(state.momentum / MOMENTUM_MAX) * 100}%`;
    feverTurnsEl.textContent = `${t("fever")} ${state.feverTurns}`;

    const displayedCharge = getBossDisplayedCharge();
    const profile = getBossProfile();
    const castThreshold = getEncounterCastThreshold(profile);
    const hp = Math.max(0, Number(state.boss.hp || 0));
    const maxHp = Math.max(1, Number(state.boss.maxHp || 1));
    const hpPct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
    setTextBySelector(".boss-card .eyebrow", encounterUiText.pressure);
    setTextBySelector(".boss-skillbook h3", encounterUiText.attacks);
    setTextBySelector(".boss-copy", encounterUiText.copy);
    const bossPct = Math.max(0, Math.min(100, (displayedCharge / state.boss.max) * 100));
    if (bossBarEl) bossBarEl.style.width = `${bossPct}%`;
    if (bossSkillHintEl) {
      if (profile.isMinion) {
        bossSkillHintEl.textContent = i18n.getLanguage() === "zh-CN"
          ? `${Math.round(bossPct)}% · ${lt(profile.skills?.[0]?.name || profile.title)}`
          : `${Math.round(bossPct)}% · ${lt(profile.skills?.[0]?.name || profile.title)}`;
      } else {
        const cycleStep = Number(state.boss.smallCastCount || 0) >= 5 ? lt(profile.ultimateSkill?.name) : `S ${state.boss.smallCastCount || 0}/5`;
        bossSkillHintEl.textContent = `${Math.round(bossPct)}% · ${cycleStep}`;
      }
    }
    if (bossHpRingEl) {
      bossHpRingEl.style.setProperty("--hp-pct", `${hpPct}%`);
      bossHpRingEl.style.setProperty("--hp-angle", `${(hpPct / 100) * 360}deg`);
      bossHpRingEl.classList.toggle("empty", hp <= 0);
    }
    const hitPalette = getEncounterHitPalette();
    const portraitShell = bossPortraitEl?.parentElement;
    if (portraitShell?.style) {
      portraitShell.style.setProperty("--encounter-hit-glow", hitPalette.glow);
      portraitShell.style.setProperty("--encounter-hit-flash", hitPalette.flash);
      portraitShell.style.setProperty("--encounter-hit-portrait", hitPalette.portrait);
    }
    if (bossHpValueEl) bossHpValueEl.textContent = String(hp);
    if (bossHpMaxEl) bossHpMaxEl.textContent = `/${maxHp}`;
    if (bossTitleEl) bossTitleEl.textContent = lt(getEncounterName(state.floorTheme));
    if (bossStateEl) {
      const charge = displayedCharge;
      bossStateEl.textContent = state.boss.casting
          ? t("bossCastingNow", { name: lt(state.floorTheme.shortLabel), element: lt(profile.element) })
          : charge >= castThreshold
            ? (profile.isMinion
                ? (i18n.getLanguage() === "zh-CN" ? "小怪已满能，会立刻自行释放轻技能" : "Minion is fully charged and auto-casts immediately")
                : (Number(state.boss.smallCastCount || 0) >= 5
                    ? (i18n.getLanguage() === "zh-CN" ? "Boss 大招已就绪，下一次满能必定释放" : "Boss ultimate is primed for the next full charge")
                    : (i18n.getLanguage() === "zh-CN" ? `Boss 小技能循环中：${state.boss.smallCastCount || 0}/5` : `Boss small-skill cycle: ${state.boss.smallCastCount || 0}/5`)))
            : t("bossChargingIdle");
    }
    if (bossThreatEl) bossThreatEl.textContent = getBossThreatLabel();
    if (bossPatternEl) {
      const charge = displayedCharge;
      bossPatternEl.textContent = profile.isMinion
        ? `${lt(state.floorTheme.pattern)} / ${lt(profile.element)} / ${i18n.getLanguage() === "zh-CN" ? "小怪" : "Minion"} / ${charge}/100`
        : state.boss.elite
          ? `${lt(state.floorTheme.pattern)} / ${lt(profile.element)} elite / S${state.boss.smallCastCount || 0}/5 / ${charge}/100`
          : `${lt(state.floorTheme.pattern)} / ${lt(profile.element)} / S${state.boss.smallCastCount || 0}/5 / ${charge}/100`;
    }
    if (modifierEl) modifierEl.textContent = state.modifier ? `${lt(state.floorTheme.shortLabel)} · ${state.routePlan.title} · ${lt(state.modifier.name)} · ${state.activeGemColors.length}C` : `${lt(state.floorTheme.shortLabel)} · ${state.routePlan.title} · ${state.activeGemColors.length}C`;
    if (bossMeterEl) {
      bossMeterEl.classList.remove("charging", "ready", "casting");
      if (state.boss.casting) bossMeterEl.classList.add("casting");
      else if (displayedCharge >= castThreshold || state.boss.phase === "ready") bossMeterEl.classList.add("ready");
      else bossMeterEl.classList.add("charging");
      bossMeterEl.classList.toggle("warning", !state.boss.casting && Number(state.boss.warningStage || 0) > 0);
      bossMeterEl.classList.toggle("critical-warning", !state.boss.casting && Number(state.boss.warningStage || 0) > 1);
    }

    if (state.mode.type === "normal") modeTextEl.textContent = t("modeStandard");
    if (state.mode.type === "target_item") modeTextEl.textContent = t("modeTarget", { name: lt(ITEM_DEFS[state.mode.item].name) });
  }

  function renderBossSkillbook() {
    if (!bossSkillbookListEl) return;
    const profile = getBossProfile();
    const charge = getBossDisplayedCharge();
    bossSkillbookListEl.innerHTML = "";

    const skills = profile.isMinion
      ? (profile.skills || [])
      : [
          ...(profile.smallSkills || []).map((skill) => ({ ...skill, cycleLabel: i18n.getLanguage() === "zh-CN" ? "小技能" : "Small" })),
          profile.ultimateSkill ? { ...profile.ultimateSkill, cycleLabel: i18n.getLanguage() === "zh-CN" ? "大技能" : "Ultimate" } : null,
        ].filter(Boolean);

    for (const skill of skills) {
      const entry = document.createElement("div");
      entry.className = "boss-skill-entry";
      const isUltimate = !profile.isMinion && profile.ultimateSkill?.id === skill.id;
      const cycleReady = profile.isMinion ? charge >= skill.cost : (isUltimate ? Number(state.boss.smallCastCount || 0) >= 5 : Number(state.boss.smallCastCount || 0) < 5);
      if (charge >= skill.cost && cycleReady) entry.classList.add("ready");
      const pct = Math.max(0, Math.min(100, Math.round((charge / Math.max(1, skill.cost)) * 100)));
      entry.style.setProperty("--skill-charge", `${pct}%`);

      const meter = document.createElement("div");
      meter.className = "boss-skill-meter";
      const fill = document.createElement("i");
      fill.className = "boss-skill-meter-fill";
      fill.style.height = `${pct}%`;
      meter.appendChild(fill);

      const body = document.createElement("div");
      body.className = "boss-skill-body";

      const title = document.createElement("strong");
      title.textContent = `${lt(skill.name)} · ${charge}/${skill.cost}`;

      const desc = document.createElement("small");
      desc.textContent = lt(skill.desc) || t("chapterBossAttackFallback");

      const threshold = document.createElement("span");
      threshold.className = "boss-skill-threshold";
      threshold.textContent = profile.isMinion
        ? (i18n.getLanguage() === "zh-CN" ? `阈值 ${skill.cost}` : `Need ${skill.cost}`)
        : (isUltimate
            ? (i18n.getLanguage() === "zh-CN" ? `累计 5 次小技能后触发` : `Triggers after 5 small casts`)
            : `${skill.cycleLabel} · ${i18n.getLanguage() === "zh-CN" ? "满能随机释放" : "Random on full charge"}`);

      body.appendChild(title);
      body.appendChild(desc);
      body.appendChild(threshold);
      entry.appendChild(meter);
      entry.appendChild(body);
      bossSkillbookListEl.appendChild(entry);
    }
  }

  function getBossThreatLabel() {
    if (state.boss.casting) return t("cataclysmic");
    const pct = getBossDisplayedCharge() / Math.max(1, state.boss.max);
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
    renderPerksView({ perkWrapEl, state, PERK_DEFS, BLESSING_DEFS: CONDITIONAL_PASSIVE_DEFS, RARITY_LABELS, t, lt });
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
