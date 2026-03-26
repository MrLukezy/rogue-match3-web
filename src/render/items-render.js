export function renderItemsView({
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
}) {
  itemWrapEl.innerHTML = "";
  const carried = getCarriedItems();

  for (const id of carried) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ability";
    btn.dataset.item = id;
    if (state.mode.type === "target_item" && state.mode.item === id) btn.classList.add("active");
    if (getItemCount(id) <= 0) btn.classList.add("disabled");
    btn.classList.add(`rarity-${ITEM_DEFS[id].rarity}`);
    btn.innerHTML = `<img class="item-icon item-image" data-anim-item="${id}" src="${getAnimatedItemImage(id)}" alt="${lt(ITEM_DEFS[id].name)}"><i class="item-badge">${getItemCount(id)}</i><i class="item-level">${t("itemLevel", { level: getItemLevel(id) })}</i><strong>${lt(ITEM_DEFS[id].name)}</strong>`;
    itemWrapEl.appendChild(btn);
  }

  for (let i = carried.length; i < MAX_ITEM_TYPES; i += 1) {
    const slot = document.createElement("div");
    slot.className = "ability disabled empty-slot";
    slot.innerHTML = `<div class="item-icon empty-item-slot"><img class="empty-slot-image" src="${UI_IMAGES.emptySlot}" alt="${t("emptySlot")}"></div><strong>${t("emptySlot")}</strong><small>${t("emptySlotDesc")}</small>`;
    itemWrapEl.appendChild(slot);
  }
}

export function renderPerksView({ perkWrapEl, state, PERK_DEFS, BLESSING_DEFS, RARITY_LABELS, t, lt }) {
  if (!perkWrapEl) return;
  perkWrapEl.innerHTML = "";
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
  const owned = Object.entries(PERK_DEFS)
    .filter(([id]) => state.perks[id])
    .sort((a, b) => rarityOrder[a[1].rarity] - rarityOrder[b[1].rarity]);

  const blessings = Object.entries(BLESSING_DEFS || {})
    .filter(([id]) => state.blessings?.[id])
    .sort((a, b) => rarityOrder[a[1].rarity] - rarityOrder[b[1].rarity]);

  if (owned.length === 0 && blessings.length === 0) {
    const empty = document.createElement("div");
    empty.className = "perk-empty";
    empty.textContent = t("draftSkillsEmpty");
    perkWrapEl.appendChild(empty);
    return;
  }

  for (const [, def] of blessings) {
    const el = document.createElement("div");
    el.className = `perk-chip rarity-${def.rarity}`;
    el.innerHTML = `<span>${t("blessing")}</span><strong>${lt(def.title)}</strong><small>${lt(def.desc)}</small>`;
    perkWrapEl.appendChild(el);
  }

  for (const [, def] of owned) {
    const el = document.createElement("div");
    el.className = `perk-chip rarity-${def.rarity}`;
    el.innerHTML = `<span>${lt(RARITY_LABELS[def.rarity])}</span><strong>${lt(def.title)}</strong><small>${lt(def.desc)}</small>`;
    perkWrapEl.appendChild(el);
  }
}
