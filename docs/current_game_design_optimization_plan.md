# 当前项目设计优化方案

## 1. 当前项目问题汇总

### 核心优点
- 核心三消手感已可玩
- 已有 Fever、Boss、道具、奖励、事件基础框架
- 已有较完整的视觉资源与引导结构

### 核心缺陷
- 总楼层过少，run 时长偏短
- 楼层之间缺少主题切换，更多只是数值升级
- Boss 只有单一主形态，章节辨识度不足
- 事件池和 support reward 池偏小
- 奖励分流不够明显，长线构筑变化有限

## 2. 改版目标
- 把当前 7 层 run 扩成 12 层 4 章节结构
- 每章有不同主题、楼层文案、目标压力和额外机制倾向
- 增加新的事件节点和 support reward，提升中局分支感
- 增加章节 Boss 变种命名和威胁描述
- 保持当前可玩框架，不重写底层玩法

## 3. 新 Run 结构

### Chapter 1：Crystal Mines（1-3层）
- 目标：教学、熟悉基础消除与基础道具
- 倾向：基础玻璃、轻障碍、低压 Boss

### Chapter 2：Frozen Archive（4-6层）
- 目标：强调锁定、控制、规划
- 倾向：锁定与额外 glass、控制型事件

### Chapter 3：Storm Forge（7-9层）
- 目标：强调连锁、压迫和高收益高风险
- 倾向：掉落、链式加成、更多 elite pressure

### Chapter 4：Void Rift（10-12层）
- 目标：混合终盘，综合考验
- 倾向：更高 Boss 压力、更多障碍与更强修饰

## 4. 本轮要落地的内容

### 实现项 A：扩总楼层与章节主题
- TOTAL_FLOORS 7 -> 12
- 新增章节主题配置
- HUD / Floor Intro / Boss 文案跟随章节变化

### 实现项 B：扩楼层配置与主题化修饰
- 扩 FLOOR_CONFIG / BOARD_SIZE / FLOOR_DIFFICULTY
- 让不同章节更偏向不同风险：glass / lock / pressure / score tax / drop bonus

### 实现项 C：扩事件池
- 新增 4-6 个事件
- 包含保守收益、激进收益、Boss 交互、道具成长、主题化加成

### 实现项 D：扩 support reward 池
- 增加更多非 item/perk 类奖励
- 如：护盾层、额外 reroll、章节加成、开局 bonus

### 实现项 E：扩 Boss 主题化表现
- 不同章节用不同 Boss 名称、Pattern 文案、Hint 文案
- 强化章节辨识度，即便底层 Boss 技能仍可复用

## 5. 开发顺序
1. 先扩楼层与章节主题
2. 再扩事件和 reward 池
3. 再补 Boss 主题化与章节文案
4. 最后做验证与平衡微调

## 6. Git 提交策略
- 提交 1：扩楼层与章节结构
- 提交 2：扩事件池与 support reward
- 提交 3：Boss 主题化与文案/UI 同步
- 提交 4：平衡与小修
