export async function playSwapAnimation(boardEl, a, b, sleep) {
  const cellA = boardEl.querySelector(`.cell[data-index="${a}"]`);
  const cellB = boardEl.querySelector(`.cell[data-index="${b}"]`);
  if (!cellA || !cellB) return;

  const ra = cellA.getBoundingClientRect();
  const rb = cellB.getBoundingClientRect();
  const dx = rb.left - ra.left;
  const dy = rb.top - ra.top;

  cellA.style.transition = "transform 140ms ease";
  cellB.style.transition = "transform 140ms ease";
  cellA.style.transform = `translate(${dx}px, ${dy}px)`;
  cellB.style.transform = `translate(${-dx}px, ${-dy}px)`;

  await sleep(145);
  cellA.style.transform = "";
  cellB.style.transform = "";
  await sleep(20);
}

export async function playItemCastAnimation({ itemWrapEl, boardEl, item, idx, imageSrc, itemName, sleep }) {
  const fromEl = itemWrapEl.querySelector(`.ability[data-item="${item}"]`);
  const toEl = boardEl.querySelector(`.cell[data-index="${idx}"]`);
  if (!fromEl || !toEl) return;

  const from = fromEl.getBoundingClientRect();
  const to = toEl.getBoundingClientRect();
  const fx = document.createElement("div");
  fx.className = `item-cast-fx item-${item}`;
  fx.innerHTML = `<img src="${imageSrc}" alt="${itemName}" class="item-cast-image" data-anim-item="${item}">`;

  const sx = from.left + from.width / 2;
  const sy = from.top + from.height / 2;
  const ex = to.left + to.width / 2;
  const ey = to.top + to.height / 2;

  fx.style.left = `${sx}px`;
  fx.style.top = `${sy}px`;
  document.body.appendChild(fx);

  requestAnimationFrame(() => {
    fx.style.transform = `translate(${ex - sx}px, ${ey - sy}px) scale(0.7)`;
    fx.style.opacity = "0.2";
  });

  await sleep(240);
  fx.remove();
}

export function spawnShatterFX({ indices, boardEl, state, isGem, fxLayerEl, MAX_ACTIVE_SHARDS, activeShards, setActiveShards }) {
  const host = document.body;
  const capped = indices.slice(0, 16);
  const shardBudget = Math.max(0, MAX_ACTIVE_SHARDS - activeShards);
  if (shardBudget <= 0) return;

  let useBudget = shardBudget;
  for (const idx of capped) {
    if (useBudget <= 0) break;
    const cell = boardEl.querySelector(`.cell[data-index="${idx}"]`);
    if (!cell) continue;
    const rect = cell.getBoundingClientRect();
    const source = state.board[idx];
    const specialBoost = isGem(source) && source.special ? 1.75 : 1;
    const pieces = Math.min(useBudget, Math.floor((18 + Math.random() * 12) * specialBoost));
    useBudget -= pieces;

    const burst = document.createElement("i");
    burst.className = "fx-burst";
    burst.style.left = `${rect.left + rect.width / 2}px`;
    burst.style.top = `${rect.top + rect.height / 2}px`;
    if (isGem(source)) {
      const color = `var(--gem-color-${source.color}, #ffffff)`;
      burst.style.background = `radial-gradient(circle, rgba(255,255,255,1) 0%, ${color} 24%, color-mix(in srgb, ${color} 72%, white 28%) 46%, rgba(255,255,255,0.18) 68%, rgba(255,255,255,0) 84%)`;
      burst.style.boxShadow = `0 0 28px ${color}, 0 0 54px color-mix(in srgb, ${color} 62%, white 38%)`;
    }
    host.appendChild(burst);
    burst.style.transform = "translate(-50%, -50%) scale(1.72)";
    setTimeout(() => burst.remove(), 430);

    if (isGem(source) && source.special) {
      const streakCount = source.special === "bomb" || source.special === "rainbow" ? 6 : 4;
      for (let s = 0; s < streakCount; s += 1) {
        const streak = document.createElement("i");
        streak.className = "fx-streak";
        streak.style.left = `${rect.left + rect.width / 2}px`;
        streak.style.top = `${rect.top + rect.height / 2}px`;
        const rot = `${(360 / streakCount) * s + (source.special === "line_h" ? 0 : source.special === "line_v" ? 90 : 30)}deg`;
        streak.style.setProperty("--streak-rot", rot);
        streak.style.background = `linear-gradient(90deg, rgba(255,255,255,0), var(--gem-color-${source.color}, #fff), rgba(255,255,255,0))`;
        streak.style.width = source.special === "bomb" || source.special === "rainbow" ? "156px" : "124px";
        streak.style.height = "14px";
        host.appendChild(streak);
        setTimeout(() => streak.remove(), 460);
      }
    }

    for (let i = 0; i < pieces; i += 1) {
      const p = document.createElement("i");
      p.className = "fx-shard";
      p.style.left = `${rect.left + rect.width / 2}px`;
      p.style.top = `${rect.top + rect.height / 2}px`;
      const ang = Math.random() * Math.PI * 2;
      const speed = 34 + Math.random() * 86;
      const dx = Math.cos(ang) * speed;
      const dy = Math.sin(ang) * speed + 24;
      const rot = `${(Math.random() - 0.5) * 520}deg`;
      p.style.width = `${4 + Math.random() * 8}px`;
      p.style.height = `${3 + Math.random() * 6}px`;
      p.style.background = isGem(source) ? `var(--gem-color-${source.color}, #dce8ff)` : "#dce8ff";
      p.style.opacity = String(0.72 + Math.random() * 0.28);
      p.style.clipPath = Math.random() > 0.5 ? "polygon(50% 0%, 0% 100%, 100% 100%)" : "polygon(0% 0%, 100% 18%, 76% 100%, 14% 82%)";
      p.style.setProperty("--dx", `${dx}px`);
      p.style.setProperty("--dy", `${dy}px`);
      p.style.setProperty("--rot", rot);
      host.appendChild(p);
      setActiveShards(activeShards + 1);
      activeShards += 1;
      setTimeout(() => {
        p.remove();
        activeShards = Math.max(0, activeShards - 1);
        setActiveShards(activeShards);
      }, 620);
    }
  }
}

export function spawnShockwaveFX({ boardEl, fxLayerEl, index, strong = false }) {
  const host = document.body;
  const cell = boardEl.querySelector(`.cell[data-index="${index}"]`);
  if (!cell) return;
  const r = cell.getBoundingClientRect();
  const spawnWave = (size, border, life, alpha = 0.9) => {
    const wave = document.createElement("i");
    wave.className = "fx-wave";
    wave.style.left = `${r.left + r.width / 2}px`;
    wave.style.top = `${r.top + r.height / 2}px`;
    wave.style.width = `${size}px`;
    wave.style.height = `${size}px`;
    wave.style.marginLeft = `${-size / 2}px`;
    wave.style.marginTop = `${-size / 2}px`;
    wave.style.borderWidth = `${border}px`;
    wave.style.borderColor = `rgba(255,255,255,${alpha})`;
      host.appendChild(wave);
    setTimeout(() => wave.remove(), life);
  };

  spawnWave(strong ? 34 : 24, strong ? 5 : 4, strong ? 480 : 420, strong ? 1 : 0.94);
    if (strong) {
      spawnWave(56, 4, 520, 0.76);
      spawnWave(82, 3, 620, 0.44);
      const flash = document.createElement("i");
      flash.style.position = "fixed";
      flash.style.left = `${r.left + r.width / 2}px`;
      flash.style.top = `${r.top + r.height / 2}px`;
      flash.style.width = "58px";
      flash.style.height = "58px";
      flash.style.borderRadius = "50%";
      flash.style.transform = "translate(-50%, -50%)";
      flash.style.background = "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0) 100%)";
      flash.style.animation = "waveExpand 240ms ease forwards";
      host.appendChild(flash);
    setTimeout(() => flash.remove(), 260);
  }
}

export function spawnFloatText({ boardEl, fxLayerEl, text, index }) {
  const host = document.body;
  const cell = boardEl.querySelector(`.cell[data-index="${index}"]`);
  if (!cell) return;
  const r = cell.getBoundingClientRect();
  const el = document.createElement("i");
  el.className = "fx-text";
  el.textContent = text;
  el.style.left = `${r.left + r.width / 2}px`;
  el.style.top = `${r.top + r.height / 2}px`;
  host.appendChild(el);
  setTimeout(() => el.remove(), 540);
}

export function spawnScreenPulse({ fxLayerEl, theme = "boss", duration = 420 }) {
  const host = document.body;
  const el = document.createElement("i");
  el.className = `fx-screen-pulse ${theme}`;
  host.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

export function shakeBoard(boardWrapEl, power = 1) {
  boardWrapEl.classList.remove("shake");
  boardWrapEl.style.setProperty("--shake-power", String(power));
  boardWrapEl.offsetWidth;
  boardWrapEl.classList.add("shake");
}
