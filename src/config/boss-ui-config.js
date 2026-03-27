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

const bossCycle = (title, element, baseGain, smallSkills, ultimateSkill, minionProfile) => ({
  title,
  element,
  baseGain,
  castThreshold: 100,
  smallSkills,
  ultimateSkill,
  skills: [...smallSkills, ultimateSkill],
  minion: minionProfile,
});

export const BOSS_PROFILES = {
  ember_hollows: bossCycle(
    zhen("余烬幼兽", "Ember Cub"),
    zhen("火焰", "fire"),
    8,
    [
      skill("ember_spark", 100, "余烬火花", "Ember Spark", "随机点燃少量宝石。", "Ignites a few gems at random."),
      skill("tail_scorch", 100, "尾焰灼烧", "Tail Scorch", "灼烧一整行宝石并轻微扩散火势。", "Scorches a full row and lightly spreads fire."),
    ],
    skill("wildfire_pounce", 100, "野火扑袭", "Wildfire Pounce", "每累计 5 次小技能后释放一次，大范围点燃并锁定棋盘。", "Triggers after 5 small casts, igniting and pinning the board in a wide burst."),
    minion(zhen("巡火狐", "Ember Scout"), 6, skill("emberling_flare", 100, "火绒轻扑", "Kindle Pounce", "满能后仅点燃 1 颗宝石。", "At full charge it only ignites 1 gem."))
  ),
  frost_spire: bossCycle(
    zhen("霜典馆长", "Frost Archivist"),
    zhen("寒冰", "ice"),
    9,
    [
      skill("chill_script", 100, "寒霜刻文", "Chill Script", "优先冻结特殊或高价值宝石。", "Prioritizes special or high-value gems for freezing."),
      skill("frost_page", 100, "霜页扩散", "Frost Page", "以锚点向十字范围扩散寒霜。", "Spreads frost in a cross from one anchor."),
    ],
    skill("absolute_stillness", 100, "绝对静止", "Absolute Stillness", "每累计 5 次小技能后释放一次，冻结一行与一列。", "Triggers after 5 small casts to freeze a row and column."),
    minion(zhen("霜页抄写灵", "Frost Scribe"), 6, skill("frostling_burst", 100, "霜墨点签", "Frost Note", "满能后冻结 1 颗并覆霜 1 颗。", "At full charge it freezes 1 gem and frosts 1 more."))
  ),
  stone_grove: bossCycle(
    zhen("岩穴掘行者", "Stone Burrower"),
    zhen("大地", "earth"),
    10,
    [
      skill("pebble_drop", 100, "碎石坠落", "Pebble Drop", "添加少量岩石障碍。", "Adds a few stone blockers."),
      skill("bark_armor", 100, "树皮护甲", "Bark Armor", "为宝石附加额外保护层。", "Hardens gems with extra protection."),
    ],
    skill("elder_root_wall", 100, "古根之墙", "Elder Root Wall", "每累计 5 次小技能后释放一次，形成大片障碍之墙。", "Triggers after 5 small casts to build a large wall of blockers."),
    minion(zhen("岩壳穴行兽", "Burrowling"), 7, skill("burrowling_toss", 100, "碎石顶起", "Pebble Heave", "满能后只会顶起 1 个岩石障碍。", "At full charge it only raises 1 stone blocker."))
  ),
  storm_peaks: bossCycle(
    zhen("风暴决斗者", "Storm Duelist"),
    zhen("雷电", "lightning"),
    11,
    [
      skill("static_pin", 100, "静电钉锁", "Static Pin", "短暂钉锁少量宝石。", "Pins a few gems briefly."),
      skill("thunder_lance", 100, "雷枪贯穿", "Thunder Lance", "以聚焦雷击推动一列。", "Shifts a column with a focused lightning strike."),
    ],
    skill("duel_of_storms", 100, "风暴决斗", "Duel of Storms", "每累计 5 次小技能后释放一次，高压风暴彻底搅乱棋盘。", "Triggers after 5 small casts to fully scramble the board."),
    minion(zhen("电枪侍从", "Storm Sentry"), 7, skill("stormling_jolt", 100, "静电刺击", "Static Jab", "满能后锁定 1 颗宝石 1 回合。", "At full charge it pins 1 gem for 1 turn."))
  ),
  venom_bloom: bossCycle(
    zhen("毒绽女王", "Venom Bloom Queen"),
    zhen("剧毒", "poison"),
    12,
    [
      skill("toxin_dust", 100, "毒尘散播", "Toxin Dust", "感染少量宝石。", "Infects a few gems."),
      skill("thorn_bind", 100, "毒藤束缚", "Thorn Bind", "优先束缚已感染目标。", "Prioritizes binding infected gems."),
    ],
    skill("royal_pollution", 100, "王庭污染", "Royal Pollution", "每累计 5 次小技能后释放一次，大规模感染并束缚关键格。", "Triggers after 5 small casts to mass-infect and bind key tiles."),
    minion(zhen("毒芽侍花", "Spore Servant"), 8, skill("sporeling_puff", 100, "孢粉喷吐", "Spore Puff", "满能后感染 2 颗宝石 1 轮。", "At full charge it infects 2 gems for 1 round."))
  ),
  tidal_depths: bossCycle(
    zhen("潮汐巨兽", "Tidal Leviathan"),
    zhen("潮水", "water"),
    13,
    [
      skill("splash_shift", 100, "浪花位移", "Splash Shift", "轻度推动一行。", "Pushes a row with a light tide movement."),
      skill("undertow_pull", 100, "暗流牵引", "Undertow Pull", "将一列拖离原位。", "Drags a column out of position."),
    ],
    skill("abyss_tsunami", 100, "深渊海啸", "Abyss Tsunami", "每累计 5 次小技能后释放一次，全盘水流错位。", "Triggers after 5 small casts to displace the whole board in a tsunami."),
    minion(zhen("潮鳍幼渊兽", "Tide Whelp"), 8, skill("tideling_surge", 100, "浅潮拍击", "Ripple Slap", "满能后仅推动 1 行宝石。", "At full charge it only shifts 1 row."))
  ),
  mirror_circus: bossCycle(
    zhen("镜幕戏法师", "Mirror Trickster"),
    zhen("幻象", "illusion"),
    14,
    [
      skill("mirror_glint", 100, "镜光迷彩", "Mirror Glint", "优先伪装接近成型的连线。", "Disguises gems near promising matches."),
      skill("false_match", 100, "伪装连线", "False Match", "先错动一行，再伪装其中数枚宝石。", "Shifts a row and disguises gems in it."),
    ],
    skill("thousand_masks", 100, "千面假相", "Thousand Masks", "每累计 5 次小技能后释放一次，大规模幻象冲击。", "Triggers after 5 small casts to unleash a mass illusion assault."),
    minion(zhen("镜片戏偶", "Mirror Page"), 9, skill("mirrorling_glimmer", 100, "镜闪误导", "Mirror Glimmer", "满能后仅伪装 2 颗接近成型的宝石。", "At full charge it only disguises 2 near-match gems."))
  ),
  iron_forge: bossCycle(
    zhen("铁炉巨像", "Iron Forge Colossus"),
    zhen("熔炉", "forge"),
    15,
    [
      skill("iron_slag", 100, "铁渣锻铸", "Iron Slag", "在棋盘上锻造新的炽热障碍。", "Forges new hot blockers onto the board."),
      skill("anvil_slam", 100, "铁砧重击", "Anvil Slam", "以巨力压制多枚格子。", "Pins several tiles with crushing force."),
    ],
    skill("steelflame_domain", 100, "钢焰领域", "Steelflame Domain", "每累计 5 次小技能后释放一次，大范围熔炉压制。", "Triggers after 5 small casts to unleash mass forge pressure."),
    minion(zhen("炉渣锻工", "Slag Smith"), 9, skill("slagling_drop", 100, "铁渣滴落", "Slag Drop", "满能后仅锻出 1 个熔渣障碍。", "At full charge it only forges 1 slag blocker."))
  ),
  eclipse_sanctum: bossCycle(
    zhen("蚀光炽天使", "Eclipse Seraph"),
    zhen("光暗", "light-dark"),
    16,
    [
      skill("radiance_mark", 100, "辉耀印记", "Radiance Mark", "以圣印标记多枚宝石。", "Marks multiple gems with holy sigils."),
      skill("eclipse_wing", 100, "蚀翼横扫", "Eclipse Wing", "优先封锁已被圣印标记的宝石。", "Prioritizes sealing holy-marked gems."),
    ],
    skill("revelation_zero", 100, "启示归零", "Revelation Zero", "每累计 5 次小技能后释放一次，先烙印再封锁并重判棋盘。", "Triggers after 5 small casts to mark, seal, and rejudge the board."),
    minion(zhen("蚀痕侍天使", "Eclipse Acolyte"), 10, skill("eclipseling_sign", 100, "微光烙印", "Gleam Sigil", "满能后仅标记 1 颗宝石。", "At full charge it only marks 1 gem."))
  ),
  void_throne: bossCycle(
    zhen("虚空龙帝", "Void Dragon Emperor"),
    zhen("虚空", "void"),
    18,
    [
      skill("void_scale", 100, "虚空鳞蚀", "Void Scale", "对小范围施加虚空腐化。", "Applies focused void corruption to a small area."),
      skill("dragon_breath", 100, "龙息横灼", "Dragon Breath", "一口龙息压制整条路径。", "A sweeping breath suppresses a full lane."),
    ],
    skill("star_abyss_end", 100, "星渊终末", "Star Abyss End", "每累计 5 次小技能后释放一次，以两段塌缩式灾变重写棋盘。", "Triggers after 5 small casts to rewrite the board with a two-wave abyss collapse."),
    minion(zhen("虚鳞侍龙", "Void Drakekin"), 10, skill("voidling_ripple", 100, "虚痕涟漪", "Void Ripple", "满能后只在 1 个小区域施加局部虚空腐化。", "At full charge it only applies localized void corruption to a small zone."))
  ),
};
