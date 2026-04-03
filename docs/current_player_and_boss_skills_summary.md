# 当前玩家技能与 Boss 技能梳理

> 口径说明：
> 1. **玩家技能**以当前代码配置 `src/config/items-config.js` 与 `src/config/blessings-config.js` 为准。
> 2. **Boss 技能**以 `src/config/boss-ui-config.js` 的当前配置为主。
> 3. 本文目标是给你一个**能快速总览全部玩家技能与全部 Boss 技能**的单文件索引。

---

## 1. 玩家技能总览

玩家技能分为两类：
- **宝石技能**：围绕棋盘操作，帮助玩家消除宝石
- **祝福**：被动增益，围绕动量、蓄能、技能触发率

### 1.1 宝石技能（24个）

#### 直接销毁类（6个）

| ID | 名称 | 稀有度 | 核心效果 | 等级效果（Lv1→Lv5） |
|---|---|---|---|---|
| `blast` | 爆破 | 普通 | 以目标为圆心消除周围宝石 | 2→5→9→14→21颗 |
| `chainLightning` | 连锁闪电 | 普通 | 消灭一颗后跳跃至相邻同色继续消灭 | 3→6→10→15→21颗 |
| `crossStrike` | 十字斩 | 稀有 | 消除一整行和一整列 | 9→15→25→35→49颗 |
| `meteor` | 宝石雨 | 普通 | 随机掉落特殊宝石，落地时消除周围 | 4→8→15→24→36颗（85%概率） |
| `splatter` | 溅射 | 普通 | 30%-80%概率触发额外溅射伤害 | 3→5→7→10→14颗 |
| `shatter` | 粉碎 | 稀有 | 60%-100%概率粉碎周围同色宝石 | 4→8→13→19→28颗 |

#### 颜色改变类（6个）

| ID | 名称 | 稀有度 | 核心效果 | 三消概率（Lv1→Lv5） |
|---|---|---|---|---|
| `colorAssimilation` | 色彩同化 | 稀有 | 将周围宝石变为主目标颜色 | 60%→70%→85%→92%→100% |
| `paintTarget` | 染色目标 | 普通 | 指定宝石变为指定颜色 | 40%→55%→70%→85%→100% |
| `rainbowBridge` | 彩虹桥 | 稀有 | 路径上宝石变为主目标颜色 | 4→6→8→11→15颗（90%概率） |
| `colorCycle` | 色相轮回 | 史诗 | 区域宝石循环变色 | 50%→65%→80%→90%→100% |
| `neighborMimic` | 邻近模仿 | 普通 | 变为最常见邻居颜色 | 45%→60%→75%→88%→100% |
| `mirrorCopy` | 镜像复制 | 史诗 | 复制区域颜色到另一区域 | 55%→70%→82%→93%→100% |

#### 宝石强化类（6个）

| ID | 名称 | 稀有度 | 核心效果 | 附加触发（Lv1→Lv5） |
|---|---|---|---|---|
| `explosiveEnchant` | 爆炸强化 | 普通 | 添加爆炸属性，被消除时范围伤害 | 3→6→10→15→21颗 |
| `lineEnchant` | 横竖强化 | 稀有 | 添加横竖属性，消除整行/列 | 7→13→21→31→45颗 |
| `comboEnchant` | 连击强化 | 稀有 | 添加连击属性，额外触发 | 2→5→10→18→28颗 |
| `shieldEnchant` | 护盾强化 | 史诗 | 免疫一次消除并反击 | 1→3→6→10→15颗 |
| `absorbEnchant` | 吸收强化 | 史诗 | 消除时偷取对方增益 | 2→4→7→11→16颗 |
| `regenerateEnchant` | 再生强化 | 稀有 | 每回合额外消除 | 1→2→3→4→5颗/回合 |

#### 宝石触发类（6个）

| ID | 名称 | 稀有度 | 核心效果 | 触发效果（Lv1→Lv5） |
|---|---|---|---|---|
| `instantTrigger` | 即时引爆 | 史诗 | 立即触发所有强化宝石 | 3→8→15→25→40颗 |
| `chainTrigger` | 连锁引爆 | 史诗 | 连锁触发强化宝石 | 5→10→18→28→45颗（90%） |
| `timedDetonate` | 定时爆破 | 稀有 | 延迟引爆 | 5→10→18→30→50颗（85%） |
| `conditionalTrigger` | 条件爆破 | 稀有 | 条件触发 | 3→7→12→20→35颗（75%） |
| `resonanceTrigger` | 共鸣引爆 | 传说 | 同色强化宝石共鸣触发 | 6→12→20→30→50颗（80%） |
| `priorityTrigger` | 强化优先 | 史诗 | 优先触发高等级强化 | 4→9→16→26→42颗（95%） |

### 1.2 祝福系统（17个）

#### 动量类（4个）

| ID | 名称 | 稀有度 | 核心机制 |
|---|---|---|---|
| `kineticAccumulation` | 动能累积 | 普通 | 动能转伤害 |
| `comboMania` | 连击狂热 | 稀有 | 连击额外消除 |
| `momentumBreaker` | 势如破竹 | 史诗 | 动量峰值清屏 |
| `kineticConversion` | 动能转化 | 稀有 | 动能转生命 |

#### 蓄能类（4个）

| ID | 名称 | 稀有度 | 核心机制 |
|---|---|---|---|
| `chargeSense` | 蓄能感知 | 稀有 | 预警+反击 |
| `chargedCounter` | 充能反击 | 稀有 | 敌方满充反击 |
| `energyAbsorb` | 能量吸收 | 史诗 | 吸收敌方能量 |
| `chargeWeaken` | 蓄能削弱 | 普通 | 降低敌方蓄能 |

#### 触发类（5个）

| ID | 名称 | 稀有度 | 核心机制 |
|---|---|---|---|
| `luckyAura` | 幸运光环 | 史诗 | 技能触发率+ |
| `cooldownReduction` | 技能冷却缩减 | 稀有 | 冷却减少 |
| `chainAwakening` | 连锁觉醒 | 史诗 | 连锁触发电弧 |
| `criticalBlessing` | 暴击祝福 | 传说 | 暴击翻倍 |
| `skillBarrage` | 技能连发 | 传说 | 技能连锁触发 |

#### 综合类（4个）

| ID | 名称 | 稀有度 | 核心机制 |
|---|---|---|---|
| `desperateSurvival` | 绝境逢生 | 史诗 | 低血量增益 |
| `battlefieldControl` | 战场统治 | 稀有 | 棋盘重排 |
| `perfectionist` | 完美主义 | 稀有 | 精确消除奖励 |
| `resourceRecovery` | 资源回收 | 普通 | 未触发返还 |

### 1.3 玩家技能构筑结论

- **宝石技能总数**：24个
  - 直接销毁：6个
  - 颜色改变：6个
  - 宝石强化：6个
  - 宝石触发：6个
- **祝福总数**：17个
  - 动量类：4个
  - 蓄能类：4个
  - 触发类：5个
  - 综合类：4个
- **装备槽位**：祝福3个

---

## 2. Boss 技能总览

当前章节 Boss 一共 10 章，每章包含：

- 2 个常规小技能
- 1 个终极技能
- 1 个随从技能

**Boss 主技能：30个（10 × 3）**
**随从技能：10个**
**合计：40个 Boss 侧技能**

---

## 3. 各章节 Boss 技能清单

### 3.1 Chapter 1 - 余烬空洞 `ember_hollows`

- Boss：**余烬幼兽 / Ember Cub**
- 主题：**灼烧 / 扩散 / 锁定压制**

| 类型 | 技能 ID | 名称 | 描述 |
|---|---|---|---|
| 小技能 | `ember_spark` | 余烬火花 | 随机点燃少量宝石 |
| 小技能 | `tail_scorch` | 尾焰灼烧 | 灼烧一整行宝石，并轻微扩散火势 |
| 终极技能 | `wildfire_pounce` | 野火扑袭 | 大范围点燃并锁定棋盘 |
| 随从技能 | `emberling_flare` | 火绒轻扑 | 满能后仅点燃1颗宝石 |

### 3.2 Chapter 2 - 寒霜尖塔 `frost_spire`

- Boss：**霜典馆长 / Frost Archivist**
- 主题：**冻结 / 覆霜 / 拖延**

| 类型 | 技能 ID | 名称 | 描述 |
|---|---|---|---|
| 小技能 | `chill_script` | 寒霜刻文 | 优先冻结特殊或高价值宝石 |
| 小技能 | `frost_page` | 霜页扩散 | 以锚点向十字范围扩散寒霜 |
| 终极技能 | `absolute_stillness` | 绝对静止 | 冻结一行与一列 |
| 随从技能 | `frostling_burst` | 霜墨点签 | 冻结1颗并覆霜1颗 |

### 3.3 Chapter 3 - 岩林深处 `stone_grove`

- Boss：**岩穴掘行者 / Stone Burrower**
- 主题：**障碍 / 护甲 / 坍塌**

| 类型 | 技能 ID | 名称 | 描述 |
|---|---|---|---|
| 小技能 | `pebble_drop` | 碎石坠落 | 添加少量岩石障碍 |
| 小技能 | `bark_armor` | 树皮护甲 | 为宝石附加额外保护层 |
| 终极技能 | `elder_root_wall` | 古根之墙 | 形成大片障碍之墙 |
| 随从技能 | `burrowling_toss` | 碎石顶起 | 只会顶起1个岩石障碍 |

### 3.4 Chapter 4 - 风暴峰巅 `storm_peaks`

- Boss：**风暴决斗者 / Storm Duelist**
- 主题：**位移 / 钉锁 / 节奏惩罚**

| 类型 | 技能 ID | 名称 | 描述 |
|---|---|---|---|
| 小技能 | `static_pin` | 静电钉锁 | 短暂钉锁少量宝石 |
| 小技能 | `thunder_lance` | 雷枪贯穿 | 以聚焦雷击推动一列 |
| 终极技能 | `duel_of_storms` | 风暴决斗 | 彻底搅乱棋盘 |
| 随从技能 | `stormling_jolt` | 静电刺击 | 锁定1颗宝石1回合 |

### 3.5 Chapter 5 - 毒绽花域 `venom_bloom`

- Boss：**毒绽女王 / Venom Bloom Queen**
- 主题：**感染 / 束缚 / 税色消耗**

| 类型 | 技能 ID | 名称 | 描述 |
|---|---|---|---|
| 小技能 | `toxin_dust` | 毒尘散播 | 感染少量宝石 |
| 小技能 | `thorn_bind` | 毒藤束缚 | 优先束缚已感染目标 |
| 终极技能 | `royal_pollution` | 王庭污染 | 大规模感染并束缚关键格 |
| 随从技能 | `sporeling_puff` | 孢粉喷吐 | 感染2颗宝石1轮 |

### 3.6 Chapter 6 - 潮汐深渊 `tidal_depths`

- Boss：**潮汐巨兽 / Tidal Leviathan**
- 主题：**行列位移 / 错位 / 水流余波**

| 类型 | 技能 ID | 名称 | 描述 |
|---|---|---|---|
| 小技能 | `splash_shift` | 浪花位移 | 轻度推动一行 |
| 小技能 | `undertow_pull` | 暗流牵引 | 将一列拖离原位 |
| 终极技能 | `abyss_tsunami` | 深渊海啸 | 全盘水流错位 |
| 随从技能 | `tideling_surge` | 浅潮拍击 | 满能后仅推动1行宝石 |

### 3.7 Chapter 7 - 镜幕马戏团 `mirror_circus`

- Boss：**镜幕戏法师 / Mirror Trickster**
- 主题：**伪装 / 误判 / 假连线**

| 类型 | 技能 ID | 名称 | 描述 |
|---|---|---|---|
| 小技能 | `mirror_glint` | 镜光迷彩 | 优先伪装接近成型的连线 |
| 小技能 | `false_match` | 伪装连线 | 先错动一行，再伪装其中数枚宝石 |
| 终极技能 | `thousand_masks` | 千面假相 | 大规模幻象冲击 |
| 随从技能 | `mirrorling_glimmer` | 镜闪误导 | 满能后仅伪装2颗接近成型的宝石 |

### 3.8 Chapter 8 - 铁炉熔城 `iron_forge`

- Boss：**铁炉巨像 / Iron Forge Colossus**
- 主题：**重障碍 / 封锁 / 熔炉压制**

| 类型 | 技能 ID | 名称 | 描述 |
|---|---|---|---|
| 小技能 | `iron_slag` | 铁渣锻铸 | 在棋盘上锻造新的炽热障碍 |
| 小技能 | `anvil_slam` | 铁砧重击 | 以巨力压制多枚格子 |
| 终极技能 | `steelflame_domain` | 钢焰领域 | 大范围熔炉压制 |
| 随从技能 | `slagling_drop` | 铁渣滴落 | 满能后仅锻出1个熔渣障碍 |

### 3.9 Chapter 9 - 蚀光圣所 `eclipse_sanctum`

- Boss：**蚀光炽天使 / Eclipse Seraph**
- 主题：**烙印 / 封锁 / 重判**

| 类型 | 技能 ID | 名称 | 描述 |
|---|---|---|---|
| 小技能 | `radiance_mark` | 辉耀印记 | 以圣印标记多枚宝石 |
| 小技能 | `eclipse_wing` | 蚀翼横扫 | 优先封锁已被圣印标记的宝石 |
| 终极技能 | `revelation_zero` | 启示归零 | 先烙印再封锁并重判棋盘 |
| 随从技能 | `eclipseling_sign` | 微光烙印 | 满能后仅标记1颗宝石 |

### 3.10 Chapter 10 - 虚空王座 `void_throne`

- Boss：**虚空龙帝 / Void Dragon Emperor**
- 主题：**混合腐化 / 裂界终局 / 全状态压制**

| 类型 | 技能 ID | 名称 | 描述 |
|---|---|---|---|
| 小技能 | `void_scale` | 虚空鳞蚀 | 对小范围施加虚空腐化 |
| 小技能 | `dragon_breath` | 龙息横灼 | 一口龙息压制整条路径 |
| 终极技能 | `star_abyss_end` | 星渊终末 | 以两段塌缩式灾变重写棋盘 |
| 随从技能 | `voidling_ripple` | 虚痕涟漪 | 局部虚空腐化 |

---

## 4. Boss 技能按章节汇总表

| 章节 | Boss | 小技能1 | 小技能2 | 终极技能 | 随从技能 |
|---|---|---|---|---|---|
| 余烬空洞 | 余烬幼兽 | `ember_spark` | `tail_scorch` | `wildfire_pounce` | `emberling_flare` |
| 寒霜尖塔 | 霜典馆长 | `chill_script` | `frost_page` | `absolute_stillness` | `frostling_burst` |
| 岩林深处 | 岩穴掘行者 | `pebble_drop` | `bark_armor` | `elder_root_wall` | `burrowling_toss` |
| 风暴峰巅 | 风暴决斗者 | `static_pin` | `thunder_lance` | `duel_of_storms` | `stormling_jolt` |
| 毒绽花域 | 毒绽女王 | `toxin_dust` | `thorn_bind` | `royal_pollution` | `sporeling_puff` |
| 潮汐深渊 | 潮汐巨兽 | `splash_shift` | `undertow_pull` | `abyss_tsunami` | `tideling_surge` |
| 镜幕马戏团 | 镜幕戏法师 | `mirror_glint` | `false_match` | `thousand_masks` | `mirrorling_glimmer` |
| 铁炉熔城 | 铁炉巨像 | `iron_slag` | `anvil_slam` | `steelflame_domain` | `slagling_drop` |
| 蚀光圣所 | 蚀光炽天使 | `radiance_mark` | `eclipse_wing` | `revelation_zero` | `eclipseling_sign` |
| 虚空王座 | 虚空龙帝 | `void_scale` | `dragon_breath` | `star_abyss_end` | `voidling_ripple` |

---

## 5. 最终结论

### 玩家技能

- **宝石技能**：24个
  - 直接销毁：6个
  - 颜色改变：6个
  - 宝石强化：6个
  - 宝石触发：6个
- **祝福**：17个
- **祝福装备槽**：3个
- **玩家技能合计**：41个

### Boss 技能

- **10个章节Boss**
- **每章3个主技能 + 1个随从技能**
- **Boss侧技能合计：40个**

---

## 6. 主要参考来源

- `src/config/items-config.js` - 宝石技能配置
- `src/config/blessings-config.js` - 祝福配置
- `src/config/boss-ui-config.js` - Boss配置
- `docs/gem_skills_design_v2.md` - 宝石技能设计文档
