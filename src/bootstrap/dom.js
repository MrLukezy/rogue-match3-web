export function getDomRefs(doc = document) {
  return {
    appRootEl: doc.getElementById("appRoot"),
    chapterScreenEl: doc.getElementById("chapterScreen"),
    chapterSettingsBtn: doc.getElementById("chapterSettingsBtn"),
    chapterShellEl: doc.getElementById("chapterShell"),
    chapterListEl: doc.getElementById("chapterList"),
    chapterOrderTextEl: doc.getElementById("chapterOrderText"),
    chapterNameTextEl: doc.getElementById("chapterNameText"),
    chapterMetaTextEl: doc.getElementById("chapterMetaText"),
    appSettingsBtn: doc.getElementById("appSettingsBtn"),
    floorEl: doc.getElementById("floor"),
    modifierEl: doc.getElementById("modifier"),
    movesLeftEl: doc.getElementById("movesLeft"),
    floorScoreEl: doc.getElementById("floorScore"),
    scoreEl: doc.getElementById("score"),
    boardMovesLeftEl: doc.getElementById("boardMovesLeft"),
    testPassBtn: doc.getElementById("testPassBtn"),
    boardTargetScoreEl: doc.getElementById("boardTargetScore"),
    boardFloorScoreEl: doc.getElementById("boardFloorScore"),
    boardFloorTotalScoreEl: doc.getElementById("boardFloorTotalScore"),
    boardHpBarFillEl: doc.getElementById("boardHpBarFill"),
    bestFloorEl: doc.getElementById("bestFloor"),
    bestScoreEl: doc.getElementById("bestScore"),
    momentumBarEl: doc.getElementById("momentumBar"),
    feverTurnsEl: doc.getElementById("feverTurns"),
    bossMeterEl: doc.getElementById("bossMeter"),
    bossBarEl: doc.getElementById("bossBar"),
    bossSkillHintEl: doc.getElementById("bossSkillHint"),
    bossHpRingEl: doc.getElementById("bossHpRing"),
    bossHpValueEl: doc.getElementById("bossHpValue"),
    bossHpMaxEl: doc.getElementById("bossHpMax"),
    bossPortraitEl: doc.getElementById("bossPortrait"),
    bossTitleEl: doc.getElementById("bossTitle"),
    bossStateEl: doc.getElementById("bossState"),
    bossThreatEl: doc.getElementById("bossThreat"),
    bossPatternEl: doc.getElementById("bossPattern"),
    bossSkillbookListEl: doc.getElementById("bossSkillbookList"),
    modeTextEl: doc.getElementById("modeText"),
    boardWrapEl: doc.getElementById("boardWrap"),
    boardEl: doc.getElementById("board"),
    fxLayerEl: doc.getElementById("fxLayer"),
    itemTooltipEl: doc.getElementById("itemTooltip"),
    messageEl: doc.getElementById("message"),
    messagePanelEl: doc.getElementById("messagePanel"),
    messageHistoryEl: doc.getElementById("messageHistory"),
    logToggleBtn: doc.getElementById("logToggleBtn"),
    audioToggleBtn: doc.getElementById("audioToggleBtn"),
    restartBtn: doc.getElementById("restartBtn"),
    codexBtn: doc.getElementById("codexBtn"),
    guideBtn: doc.getElementById("guideBtn"),
    itemWrapEl: doc.getElementById("itemWrap"),
    perkWrapEl: doc.getElementById("perkWrap"),
    blessingTooltipEl: doc.getElementById("blessingTooltip"),
    overlayEl: doc.getElementById("overlay"),
    overlaySettingsBtn: doc.getElementById("overlaySettingsBtn"),
    overlayTitleEl: doc.getElementById("overlayTitle"),
    overlayDescEl: doc.getElementById("overlayDesc"),
    choiceWrapEl: doc.getElementById("choiceWrap"),
    overlayActionsEl: doc.getElementById("overlayActions"),
    codexModalEl: doc.getElementById("codexModal"),
    codexSettingsBtn: doc.getElementById("codexSettingsBtn"),
    codexContentEl: doc.getElementById("codexContent"),
    codexCloseBtn: doc.getElementById("codexCloseBtn"),
    guideModalEl: doc.getElementById("guideModal"),
    guideSettingsBtn: doc.getElementById("guideSettingsBtn"),
    guideModalTitleEl: doc.getElementById("guideModalTitle"),
    guideModalDescEl: doc.getElementById("guideModalDesc"),
    guideTabRowEl: doc.getElementById("guideTabRow"),
    guideTabGemsEl: doc.getElementById("guideTabGems"),
    guideTabSkillsEl: doc.getElementById("guideTabSkills"),
    guideModalContentEl: doc.getElementById("guideModalContent"),
    guideCloseBtn: doc.getElementById("guideCloseBtn"),
    settingsModalEl: doc.getElementById("settingsModal"),
    settingsTitleEl: doc.getElementById("settingsTitle"),
    settingsDescEl: doc.getElementById("settingsDesc"),
    settingsLanguageLabelEl: doc.getElementById("settingsLanguageLabel"),
    settingsLanguageHintEl: doc.getElementById("settingsLanguageHint"),
    settingsVolumeLabelEl: doc.getElementById("settingsVolumeLabel"),
    settingsVolumeValueEl: doc.getElementById("settingsVolumeValue"),
    settingsCloseBtn: doc.getElementById("settingsCloseBtn"),
    settingsMuteBtn: doc.getElementById("settingsMuteBtn"),
    volumeSliderEl: doc.getElementById("volumeSlider"),
    languageSwitchEl: doc.getElementById("languageSwitch"),
    langZhBtn: doc.getElementById("langZhBtn"),
    langEnBtn: doc.getElementById("langEnBtn"),
  };
}

export function bindCoreEvents({
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
  settingsButtons = [],
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
  getRestartConfirmText = () => "Restart the run?",
}) {
  restartBtn.addEventListener("click", () => {
    if (window.confirm(getRestartConfirmText())) startRun();
  });
  boardEl.addEventListener("click", onBoardClick);
  itemWrapEl.addEventListener("click", onItemClick);
  itemWrapEl.addEventListener("mouseover", onItemHover);
  itemWrapEl.addEventListener("mouseout", onItemHoverOut);

  if (codexBtn) codexBtn.addEventListener("click", openCodex);
  if (guideBtn) guideBtn.addEventListener("click", openGuidePanel);
  if (codexCloseBtn) codexCloseBtn.addEventListener("click", () => codexModalEl.classList.add("hidden"));
  if (guideCloseBtn) guideCloseBtn.addEventListener("click", closeGuideModal);
  for (const btn of settingsButtons) {
    if (btn) btn.addEventListener("click", openSettings);
  }
  if (settingsCloseBtn) settingsCloseBtn.addEventListener("click", closeSettings);
  if (codexModalEl) {
    codexModalEl.addEventListener("click", (e) => {
      if (e.target === codexModalEl) codexModalEl.classList.add("hidden");
    });
  }
  if (guideModalEl) {
    guideModalEl.addEventListener("click", (e) => {
      if (e.target === guideModalEl) closeGuideModal();
    });
  }
  if (settingsModalEl) {
    settingsModalEl.addEventListener("click", (e) => {
      if (e.target === settingsModalEl) closeSettings();
    });
  }
}
