export function getDomRefs(doc = document) {
  return {
    appRootEl: doc.getElementById("appRoot"),
    chapterScreenEl: doc.getElementById("chapterScreen"),
    chapterListEl: doc.getElementById("chapterList"),
    floorEl: doc.getElementById("floor"),
    modifierEl: doc.getElementById("modifier"),
    movesLeftEl: doc.getElementById("movesLeft"),
    floorScoreEl: doc.getElementById("floorScore"),
    scoreEl: doc.getElementById("score"),
    boardTargetScoreEl: doc.getElementById("boardTargetScore"),
    boardFloorScoreEl: doc.getElementById("boardFloorScore"),
    bestFloorEl: doc.getElementById("bestFloor"),
    bestScoreEl: doc.getElementById("bestScore"),
    momentumBarEl: doc.getElementById("momentumBar"),
    feverTurnsEl: doc.getElementById("feverTurns"),
    bossMeterEl: doc.getElementById("bossMeter"),
    bossBarEl: doc.getElementById("bossBar"),
    bossSkillHintEl: doc.getElementById("bossSkillHint"),
    bossTitleEl: doc.getElementById("bossTitle"),
    bossStateEl: doc.getElementById("bossState"),
    bossThreatEl: doc.getElementById("bossThreat"),
    bossPatternEl: doc.getElementById("bossPattern"),
    modeTextEl: doc.getElementById("modeText"),
    boardWrapEl: doc.getElementById("boardWrap"),
    boardEl: doc.getElementById("board"),
    fxLayerEl: doc.getElementById("fxLayer"),
    itemTooltipEl: doc.getElementById("itemTooltip"),
    messageEl: doc.getElementById("message"),
    restartBtn: doc.getElementById("restartBtn"),
    codexBtn: doc.getElementById("codexBtn"),
    guideBtn: doc.getElementById("guideBtn"),
    itemWrapEl: doc.getElementById("itemWrap"),
    perkWrapEl: doc.getElementById("perkWrap"),
    overlayEl: doc.getElementById("overlay"),
    overlayTitleEl: doc.getElementById("overlayTitle"),
    overlayDescEl: doc.getElementById("overlayDesc"),
    choiceWrapEl: doc.getElementById("choiceWrap"),
    overlayActionsEl: doc.getElementById("overlayActions"),
    codexModalEl: doc.getElementById("codexModal"),
    codexContentEl: doc.getElementById("codexContent"),
    codexCloseBtn: doc.getElementById("codexCloseBtn"),
    guideModalEl: doc.getElementById("guideModal"),
    guideModalTitleEl: doc.getElementById("guideModalTitle"),
    guideModalDescEl: doc.getElementById("guideModalDesc"),
    guideModalContentEl: doc.getElementById("guideModalContent"),
    guideCloseBtn: doc.getElementById("guideCloseBtn"),
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
  startRun,
  onBoardClick,
  onItemClick,
  onItemHover,
  onItemHoverOut,
  openCodex,
  openGuidePanel,
  closeGuideModal,
}) {
  restartBtn.addEventListener("click", () => {
    if (window.confirm("Restart the run?")) startRun();
  });
  boardEl.addEventListener("click", onBoardClick);
  itemWrapEl.addEventListener("click", onItemClick);
  itemWrapEl.addEventListener("mouseover", onItemHover);
  itemWrapEl.addEventListener("mouseout", onItemHoverOut);

  if (codexBtn) codexBtn.addEventListener("click", openCodex);
  if (guideBtn) guideBtn.addEventListener("click", openGuidePanel);
  if (codexCloseBtn) codexCloseBtn.addEventListener("click", () => codexModalEl.classList.add("hidden"));
  if (guideCloseBtn) guideCloseBtn.addEventListener("click", closeGuideModal);
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
}
