import { BLESSING_EFFECT_BY_ID, BLESSING_IMAGE_BY_ID } from "../config/blessings-config.js";

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
    btn.classList.add("passive-skill");
    btn.dataset.item = id;
    btn.draggable = true;
    btn.classList.add(`rarity-${ITEM_DEFS[id].rarity}`);
    btn.innerHTML = `<img class="item-icon item-image" data-anim-item="${id}" src="${getAnimatedItemImage(id)}" alt="${lt(ITEM_DEFS[id].name)}"><i class="item-level">${t("itemLevel", { level: getItemLevel(id) })}</i><i class="item-badge passive-tag">AUTO</i><strong>${lt(ITEM_DEFS[id].name)}</strong>`;
    itemWrapEl.appendChild(btn);
  }

  for (let i = carried.length; i < MAX_ITEM_TYPES; i += 1) {
    const slot = document.createElement("div");
    slot.className = "ability disabled empty-slot";
    slot.innerHTML = `<div class="item-icon empty-item-slot"><img class="empty-slot-image" src="${UI_IMAGES.emptySlot}" alt="${t("emptySlot")}"></div><strong>${t("emptySlot")}</strong><small>${t("emptySkillDesc") || t("emptySlotDesc")}</small>`;
    itemWrapEl.appendChild(slot);
  }
}

function getBlessingVisual(def, id) {
  const image = BLESSING_IMAGE_BY_ID[id] || def?.image || "";
  const effect = BLESSING_EFFECT_BY_ID[id] || def?.effectClass || def?.category || "hybrid";
  return {
    image,
    effect,
    alt: def?.title ? `${def.title.en || def.title.zh || id}` : id,
  };
}

export function renderPerksView({ perkWrapEl, state, PERK_DEFS, BLESSING_DEFS, RARITY_LABELS, t, lt }) {
  if (!perkWrapEl) return;
  perkWrapEl.innerHTML = "";
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
  const blessings = (state.blessingSlots || [])
    .filter((id) => BLESSING_DEFS?.[id])
    .map((id) => [id, BLESSING_DEFS[id]])
    .sort((a, b) => rarityOrder[a[1].rarity] - rarityOrder[b[1].rarity]);
  const owned = Object.entries(PERK_DEFS)
    .filter(([id]) => state.perks[id])
    .sort((a, b) => rarityOrder[a[1].rarity] - rarityOrder[b[1].rarity]);

  if (owned.length === 0 && blessings.length === 0) {
    const empty = document.createElement("div");
    empty.className = "perk-empty";
    empty.textContent = t("draftSkillsEmpty");
    perkWrapEl.appendChild(empty);
    return;
  }

  if (blessings.length > 0) {
    const blessingList = document.createElement("div");
    blessingList.className = "blessing-icon-list";
    for (const [id, def] of blessings) {
      const el = document.createElement("div");
      const visual = getBlessingVisual(def, id);
      const level = Number(state.blessingLevels?.[id] || 1);
      el.className = `blessing-icon-chip rarity-${def.rarity} blessing-fx-${visual.effect}`;
      el.dataset.blessing = id;
      el.title = `${lt(def.title)} · ${t("itemLevel", { level })}\n${lt(def.desc)}`;
      el.setAttribute("aria-label", `${lt(def.title)} ${t("itemLevel", { level })}`);
      el.innerHTML = `<div class="blessing-icon-shell"><img class="blessing-icon-image" src="${visual.image}" alt="${visual.alt}"></div><i class="blessing-icon-level">${level}</i>`;
      blessingList.appendChild(el);
    }
    perkWrapEl.appendChild(blessingList);
  }

  for (const [, def] of owned) {
    const el = document.createElement("div");
    el.className = `perk-chip rarity-${def.rarity}`;
    el.innerHTML = `<span>${lt(RARITY_LABELS[def.rarity])}</span><strong>${lt(def.title)}</strong><small>${lt(def.desc)}</small>`;
    perkWrapEl.appendChild(el);
  }
}
