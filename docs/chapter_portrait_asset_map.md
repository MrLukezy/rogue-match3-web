# Chapter Portrait Asset Map

统一后的章节立绘资源目录：

- 根目录：`assets/generated/chapters/`
- 章节目录：`chapter01` ~ `chapter10`
- 每章子目录：`boss/`、`minion/`
- 标准文件名：`boss_portrait.png`、`minion_portrait.png`

## 目录规则

```text
assets/generated/chapters/
  chapter01/
    boss/boss_portrait.png
    minion/minion_portrait.png
  chapter02/
    boss/boss_portrait.png
    minion/minion_portrait.png
  ...
```

## 资源映射表

| Chapter | Boss Path | Minion Path | Notes |
|---|---|---|---|
| 01 | `./assets/generated/chapters/chapter01/boss/boss_portrait.png` | `./assets/generated/chapters/chapter01/minion/minion_portrait.png` | 火系基准风格 |
| 02 | `./assets/generated/chapters/chapter02/boss/boss_portrait.png` | `./assets/generated/chapters/chapter02/minion/minion_portrait.png` | 冰霜 |
| 03 | `./assets/generated/chapters/chapter03/boss/boss_portrait.png` | `./assets/generated/chapters/chapter03/minion/minion_portrait.png` | 岩石 |
| 04 | `./assets/generated/chapters/chapter04/boss/boss_portrait.png` | `./assets/generated/chapters/chapter04/minion/minion_portrait.png` | v2 非人雷暴版 |
| 05 | `./assets/generated/chapters/chapter05/boss/boss_portrait.png` | `./assets/generated/chapters/chapter05/minion/minion_portrait.png` | 剧毒花域 |
| 06 | `./assets/generated/chapters/chapter06/boss/boss_portrait.png` | `./assets/generated/chapters/chapter06/minion/minion_portrait.png` | 潮汐深渊 |
| 07 | `./assets/generated/chapters/chapter07/boss/boss_portrait.png` | `./assets/generated/chapters/chapter07/minion/minion_portrait.png` | 镜幕马戏团 |
| 08 | `./assets/generated/chapters/chapter08/boss/boss_portrait.png` | `./assets/generated/chapters/chapter08/minion/minion_portrait.png` | 铁炉熔城 |
| 09 | `./assets/generated/chapters/chapter09/boss/boss_portrait.png` | `./assets/generated/chapters/chapter09/minion/minion_portrait.png` | v2 非人蚀光版 |
| 10 | `./assets/generated/chapters/chapter10/boss/boss_portrait.png` | `./assets/generated/chapters/chapter10/minion/minion_portrait.png` | 虚空王座 |

## 当前游戏接入规则

当前游戏配置 `src/config/game-config.js` 已切换 Boss 立绘到上述 `boss_portrait.png`。

若后续需要接入小怪立绘，直接按同章的 `minion/minion_portrait.png` 使用即可。
