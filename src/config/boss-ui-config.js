const zhen = (zh, en) => ({ zh, en });

export const UI_IMAGES = {
  obstacle: "./assets/generated/ui/tile_obstacle_obsidian.png",
  emptySlot: "./assets/generated/ui/icon_empty_slot_relic.png",
};

export const BOSS_ANIM_FRAMES = [
  "./assets/generated/boss/anim/boss_sigil_f1.png",
  "./assets/generated/boss/anim/boss_sigil_f2.png",
  "./assets/generated/boss/anim/boss_sigil_f3.png",
  "./assets/generated/boss/anim/boss_sigil_f4.png",
  "./assets/generated/boss/anim/boss_sigil_f5.png",
  "./assets/generated/boss/anim/boss_sigil_f6.png",
  "./assets/generated/boss/anim/boss_sigil_f7.png",
  "./assets/generated/boss/anim/boss_sigil_f8.png",
];

const skill = (id, cost, zhName, enName, zhDesc, enDesc) => ({
  id,
  cost,
  name: zhen(zhName, enName),
  desc: zhen(zhDesc, enDesc),
});

const minion = (title, baseGain, skillEntry) => ({
  title,
  baseGain,
  castThreshold: 100,
  skills: [skillEntry],
});

export const BOSS_PROFILES = {
  ember_hollows: {
    title: zhen("余烬幼兽", "Ember Cub"),
    element: zhen("火焰", "fire"),
    baseGain: 8,
    skillWeights: { ember_spark: 10, tail_scorch: 12, cinder_spread: 14, foxfire_ring: 16, wildfire_pounce: 18 },
    minion: minion(
      zhen("巡火狐", "Ember Scout"),
      6,
      skill("emberling_flare", 100, "火绒轻扑", "Kindle Pounce", "满能后仅点燃 1 颗宝石，作为灼烧教学前置。", "At full charge it only ignites 1 gem as a gentle burn tutorial.")
    ),
    skills: [
      skill("ember_spark", 20, "余烬火花", "Ember Spark", "点燃少量宝石；灼伤宝石首次清除只会熄火，存活到下回合会向周围蔓延。", "Ignites a few gems; the first clear only snuffs the flames, and survivors spread fire next turn."),
      skill("tail_scorch", 40, "尾焰灼烧", "Tail Scorch", "灼烧一整行宝石；未扑灭的火焰会继续扩散。", "Scorches a row of gems, and unresolved fire keeps spreading."),
      skill("cinder_spread", 60, "灰烬扩散", "Cinder Spread", "若场上已有火焰则优先向周围复燃；否则先点燃再扩散。", "If flames already exist, they reignite nearby gems first; otherwise the skill ignites new gems before spreading."),
      skill("foxfire_ring", 80, "狐火之环", "Foxfire Ring", "点燃关键宝石并附带短暂锁定，火势会继续蔓延。", "Ignites key gems, adds short pinning, and lets the flames spread."),
      skill("wildfire_pounce", 100, "野火扑袭", "Wildfire Pounce", "大范围点燃并锁定棋盘，多枚宝石若未扑灭会在下回合烧向周围。", "Ignites and pins the board in a wide burst; surviving flames spread to nearby gems next turn."),
    ],
  },
  frost_spire: {
    title: zhen("霜典馆长", "Frost Archivist"),
    element: zhen("寒冰", "ice"),
    baseGain: 9,
    skillWeights: { chill_script: 10, frost_page: 12, winter_seal: 14, glacier_column: 16, absolute_stillness: 18 },
    minion: minion(
      zhen("霜页抄写灵", "Frost Scribe"),
      6,
      skill("frostling_burst", 100, "霜墨点签", "Frost Note", "满能后冻结 1 颗并覆霜 1 颗，只做轻度拖延。", "At full charge it freezes 1 gem and frosts 1 more for a light stall."),
    ),
    skills: [
      skill("chill_script", 20, "寒霜刻文", "Chill Script", "优先冻结特殊或高价值宝石；已冻结目标会再附加覆霜。", "Prioritizes special or high-value gems for freezing; already frozen targets gain extra frost."),
      skill("frost_page", 40, "霜页扩散", "Frost Page", "以锚点向十字范围扩散寒霜，中心会被冻结。", "Spread frost in a cross from one anchor and freeze the center."),
      skill("winter_seal", 60, "冬之封印", "Winter Seal", "为多枚宝石附加覆霜；已覆霜目标会升级为额外冻结。", "Apply frost to many gems; already frosted targets escalate into extra freeze."),
      skill("glacier_column", 80, "冰川立柱", "Glacier Column", "冻结整列并让相邻侧格覆盖寒霜。", "Freeze a full column and frost the neighboring side tiles."),
      skill("absolute_stillness", 100, "绝对静止", "Absolute Stillness", "冻结一行与一列并附加覆霜，交点承受更强压制。", "Freeze a row and a column with frost, with stronger suppression at their intersection."),
    ],
  },
  stone_grove: {
    title: zhen("岩穴掘行者", "Stone Burrower"),
    element: zhen("大地", "earth"),
    baseGain: 10,
    skillWeights: { pebble_drop: 10, bark_armor: 12, burrow_rise: 14, cave_in: 16, elder_root_wall: 18 },
    minion: minion(
      zhen("岩壳穴行兽", "Burrowling"),
      7,
      skill("burrowling_toss", 100, "碎石顶起", "Pebble Heave", "满能后只会顶起 1 个岩石障碍。", "At full charge it only raises 1 stone blocker."),
    ),
    skills: [
      skill("pebble_drop", 20, "碎石坠落", "Pebble Drop", "添加少量岩石障碍。", "Adds a couple of stone blockers."),
      skill("bark_armor", 40, "树皮护甲", "Bark Armor", "为宝石附加额外保护层。", "Hardens gems with extra protective layers."),
      skill("burrow_rise", 60, "地穴升起", "Burrow Rise", "若已有障碍则沿障碍生长；否则在中下盘顶起短墙。", "If blockers already exist, it grows from them; otherwise it raises a short wall from below."),
      skill("cave_in", 80, "洞穴坍塌", "Cave-In", "投下沉重障碍，打乱安全区域。", "Drops heavy blockers and disrupts safe space."),
      skill("elder_root_wall", 100, "古根之墙", "Elder Root Wall", "创造大片根须与岩石之墙。", "Creates a large wall of growth and stone."),
    ],
  },
  storm_peaks: {
    title: zhen("风暴决斗者", "Storm Duelist"),
    element: zhen("雷电", "lightning"),
    baseGain: 11,
    skillWeights: { static_pin: 10, thunder_lance: 12, overload_mark: 14, chain_burst: 16, duel_of_storms: 18 },
    minion: minion(
      zhen("电枪侍从", "Storm Sentry"),
      7,
      skill("stormling_jolt", 100, "静电刺击", "Static Jab", "满能后锁定 1 颗宝石 1 回合，只做节奏提醒。", "At full charge it pins 1 gem for 1 turn as a tempo warning."),
    ),
    skills: [
      skill("static_pin", 20, "静电钉锁", "Static Pin", "短暂钉锁少量宝石，并让附近宝石发生过载改色。", "Pins a few gems briefly, then overloads nearby gems with recolor pressure."),
      skill("thunder_lance", 40, "雷枪贯穿", "Thunder Lance", "以聚焦雷击推动一列。", "Shifts a column with a focused lightning strike."),
      skill("overload_mark", 60, "过载烙印", "Overload Mark", "对强势布局施加重染压力。", "Punishes strong setups with recolor pressure."),
      skill("chain_burst", 80, "连锁冲裂", "Chain Burst", "错动行列，打断节奏。", "Displaces rows and columns to break tempo."),
      skill("duel_of_storms", 100, "风暴决斗", "Duel of Storms", "高压风暴连段，彻底搅乱棋盘。", "A heavy storm sequence that scrambles the board."),
    ],
  },
  venom_bloom: {
    title: zhen("毒绽女王", "Venom Bloom Queen"),
    element: zhen("剧毒", "poison"),
    baseGain: 12,
    skillWeights: { toxin_dust: 10, thorn_bind: 12, spore_bloom: 14, rot_garden: 16, royal_pollution: 18 },
    minion: minion(
      zhen("毒芽侍花", "Spore Servant"),
      8,
      skill("sporeling_puff", 100, "孢粉喷吐", "Spore Puff", "满能后感染 2 颗宝石 1 轮，作为轻度污染前置。", "At full charge it infects 2 gems for 1 round as a light corruption primer."),
    ),
    skills: [
      skill("toxin_dust", 20, "毒尘散播", "Toxin Dust", "感染少量宝石；感染会在回合后向周围扩散。", "Infect a few gems; infection spreads to nearby gems after turns."),
      skill("thorn_bind", 40, "毒藤束缚", "Thorn Bind", "优先束缚已感染目标；感染不足时会先补种毒素。", "Prioritize binding infected gems; seed poison first if too few are infected."),
      skill("spore_bloom", 60, "孢子绽放", "Spore Bloom", "让已有感染快速扩散；若场上无感染，则立即播撒新孢子。", "Rapidly spread existing infection, or seed fresh spores if none exist."),
      skill("rot_garden", 80, "腐败花圃", "Rot Garden", "扩散感染，并将部分感染格腐化成阻塞性的腐株。", "Spread infection, then corrupt part of it into blocking rot growths."),
      skill("royal_pollution", 100, "王庭污染", "Royal Pollution", "指定主导颜色为临时税色并大规模感染，随后束缚关键格。", "Set the dominant color as a temporary tax color, mass-infect the board, then bind key tiles."),
    ],
  },
  tidal_depths: {
    title: zhen("潮汐巨兽", "Tidal Leviathan"),
    element: zhen("潮水", "water"),
    baseGain: 13,
    skillWeights: { splash_shift: 10, undertow_pull: 12, tide_pool: 14, tail_wave: 16, abyss_tsunami: 18 },
    minion: minion(
      zhen("潮鳍幼渊兽", "Tide Whelp"),
      8,
      skill("tideling_surge", 100, "浅潮拍击", "Ripple Slap", "满能后仅推动 1 行宝石，演示轻度错位。", "At full charge it only shifts 1 row to teach mild displacement."),
    ),
    skills: [
      skill("splash_shift", 20, "浪花位移", "Splash Shift", "轻度推动一行。", "Pushes a row with a light tide movement."),
      skill("undertow_pull", 40, "暗流牵引", "Undertow Pull", "将一列拖离原位。", "Drags a column out of position."),
      skill("tide_pool", 60, "潮池回旋", "Tide Pool", "形成潮流行：本回合先位移，玩家行动后还会再次滑动。", "Creates tide lanes that shift now, then slide again after the player acts."),
      skill("tail_wave", 80, "尾浪横扫", "Tail Wave", "多列错位并留下潮流列与少量珊瑚锚点。", "Displaces several columns, then leaves behind tide columns and a few coral anchors."),
      skill("abyss_tsunami", 100, "深渊海啸", "Abyss Tsunami", "全盘水流错位后保留潮流行列，让海啸余波在下回合继续推进。", "After full-board displacement, the tsunami leaves tide rows and columns that continue moving next turn."),
    ],
  },
  mirror_circus: {
    title: zhen("镜幕戏法师", "Mirror Trickster"),
    element: zhen("幻象", "illusion"),
    baseGain: 14,
    skillWeights: { mirror_glint: 10, false_match: 12, prism_shuffle: 14, mirror_maze: 16, thousand_masks: 18 },
    minion: minion(
      zhen("镜片戏偶", "Mirror Page"),
      9,
      skill("mirrorling_glimmer", 100, "镜闪误导", "Mirror Glimmer", "满能后仅伪装 2 颗接近成型的宝石。", "At full charge it only disguises 2 near-match gems."),
    ),
    skills: [
      skill("mirror_glint", 20, "镜光迷彩", "Mirror Glint", "优先伪装接近成型的连线，误导快速判断。", "Disguises gems near promising matches to mislead quick reads."),
      skill("false_match", 40, "伪装连线", "False Match", "先错动一行，再伪装其中数枚宝石，制造假连线。", "Shifts a row, then disguises several gems in it to create a false line."),
      skill("prism_shuffle", 60, "棱镜乱序", "Prism Shuffle", "同时扭曲颜色与位置。", "Twists colors and positions together."),
      skill("mirror_maze", 80, "镜中迷宫", "Mirror Maze", "同时扭曲一行一列，并在交界附近短暂封住关键格。", "Warps one row and one column, then briefly seals gems near their intersection."),
      skill("thousand_masks", 100, "千面假相", "Thousand Masks", "大规模幻象冲击，扰乱识别。", "Mass illusion assault that scrambles recognition."),
    ],
  },
  iron_forge: {
    title: zhen("铁炉巨像", "Iron Forge Colossus"),
    element: zhen("熔炉", "forge"),
    baseGain: 15,
    skillWeights: { iron_slag: 10, anvil_slam: 12, furnace_core: 14, heavy_press: 16, steelflame_domain: 18 },
    minion: minion(
      zhen("炉渣锻工", "Slag Smith"),
      9,
      skill("slagling_drop", 100, "铁渣滴落", "Slag Drop", "满能后仅锻出 1 个熔渣障碍。", "At full charge it only forges 1 slag blocker."),
    ),
    skills: [
      skill("iron_slag", 20, "铁渣锻铸", "Iron Slag", "在棋盘上锻造新的炽热障碍。", "Forges new hot blockers onto the board."),
      skill("anvil_slam", 40, "铁砧重击", "Anvil Slam", "以巨力压制多枚格子。", "Pins several tiles with crushing force."),
      skill("furnace_core", 60, "熔炉核心", "Furnace Core", "从炉心喷出障碍并以热压定住关键宝石。", "Forges blockers from the core and heat-pins key gems in place."),
      skill("heavy_press", 80, "重压冲床", "Heavy Press", "极大压缩空间，形成封锁。", "Compresses space with serious board lockdown."),
      skill("steelflame_domain", 100, "钢焰领域", "Steelflame Domain", "大范围熔炉压制并附带障碍与锁定。", "Mass forge pressure with obstacles and locks."),
    ],
  },
  eclipse_sanctum: {
    title: zhen("蚀光炽天使", "Eclipse Seraph"),
    element: zhen("光暗", "light-dark"),
    baseGain: 16,
    skillWeights: { radiance_mark: 10, eclipse_wing: 12, judgment_wheel: 14, abyss_gaze: 16, revelation_zero: 18 },
    minion: minion(
      zhen("蚀痕侍天使", "Eclipse Acolyte"),
      10,
      skill("eclipseling_sign", 100, "微光烙印", "Gleam Sigil", "满能后仅标记 1 颗宝石，为后续审判做预热。", "At full charge it only marks 1 gem as a warm-up for later judgment."),
    ),
    skills: [
      skill("radiance_mark", 20, "辉耀印记", "Radiance Mark", "以圣印标记多枚宝石，为后续封锁与审判铺路。", "Marks multiple gems with holy sigils, setting up later sealing and judgment."),
      skill("eclipse_wing", 40, "蚀翼横扫", "Eclipse Wing", "优先封锁已被圣印标记的宝石。", "Prioritizes sealing gems already branded with holy marks."),
      skill("judgment_wheel", 60, "审判轮回", "Judgment Wheel", "优先重判被标记或已封锁区域的颜色。", "Rejudges colors around marked or sealed zones first."),
      skill("abyss_gaze", 80, "深渊凝视", "Abyss Gaze", "将黑暗压力集中成一片凝视区，在局部生成裂口与封锁。", "Focuses dark pressure into a single gaze zone, opening rifts and seals in one area."),
      skill("revelation_zero", 100, "启示归零", "Revelation Zero", "先烙印，再封锁，最后大规模重判棋盘。", "Marks first, seals next, then massively rejudges the board."),
    ],
  },
  void_throne: {
    title: zhen("虚空龙帝", "Void Dragon Emperor"),
    element: zhen("虚空", "void"),
    baseGain: 18,
    skillWeights: { void_scale: 10, dragon_breath: 12, world_crack: 14, emperor_decree: 16, star_abyss_end: 18 },
    minion: minion(
      zhen("虚鳞侍龙", "Void Drakekin"),
      10,
      skill("voidling_ripple", 100, "虚痕涟漪", "Void Ripple", "满能后只在 1 个小区域施加局部虚空腐化。", "At full charge it only applies localized void corruption to a small zone."),
    ),
    skills: [
      skill("void_scale", 20, "虚空鳞蚀", "Void Scale", "对小范围施加一组主题化的虚空腐化，而非零散拼接。", "Applies one focused set of void corruption effects to a small area instead of scattered scraps."),
      skill("dragon_breath", 40, "龙息横灼", "Dragon Breath", "一口龙息压制整条路径，施加护层与短暂封锁。", "A sweeping breath suppresses a full lane with protective scars and brief pinning."),
      skill("world_crack", 60, "裂界崩痕", "World Crack", "以虚空裂隙撕开棋盘。", "Splits the board with void tears and warped gems."),
      skill("emperor_decree", 80, "帝皇敕令", "Emperor Decree", "在两处帝令区集中叠加裂口、束缚与护层，而非全盘零散施压。", "Concentrates rifts, bindings, and scars into two decree zones instead of scattering pressure everywhere."),
      skill("star_abyss_end", 100, "星渊终末", "Star Abyss End", "以两段塌缩式虚空灾变重写棋盘，终局压力分波推进。", "Rewrites the board with a two-wave abyss collapse, pushing endgame pressure in stages."),
    ],
  },
};
