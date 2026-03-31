# Character Cutout Prompt Pack

This prompt pack is for full-body character generation that will later go through automatic background removal.

## Goal

Generate source images that are easy to cut out cleanly into transparent PNG assets.

## Core rules

- Single isolated character only
- Full body fully visible from head to feet
- Centered composition
- Clean readable silhouette
- No environment scene
- No floor, no base, no cast shadow plate
- No frame, no border, no text, no watermark
- Use a plain solid studio background with strong contrast against the character
- Prioritize edge clarity for clean cutout extraction

## Background contrast rules

- If the character is mostly dark, fiery, warm, or saturated: use a **light neutral gray background**
- If the character contains large pale glow, white fur, frost, or strong white VFX: use a **dark neutral gray background**
- Avoid background gradients if possible
- Avoid smoke, mist, embers filling the whole canvas, and particle clutter touching the silhouette

## Universal cutout suffix

Append this to full-body character prompts:

```text
single isolated character, full body fully visible, centered composition, clean readable silhouette, plain solid studio background with strong contrast against the character, no scenery, no environment props, no floor, no cast shadow plate, no frame, no border, no text, no watermark, edge clarity prioritized for clean cutout extraction
```

## Boss full-body template

```text
Generate an image of a single isolated full-body boss character for a casual fantasy match-3 game. Match the established in-game boss illustration style: polished fantasy game rendering, soft painted shading, crisp readable silhouette, premium mobile game art, full character visible from head to feet, centered composition. [Describe body shape, materials, color palette, expression, pose, special effects, and chapter identity.] Use a plain solid studio background with strong contrast against the subject so the silhouette is easy to extract later. No scenery, no environment props, no floor, no cast shadow plate, no frame, no border, no text, no watermark. Edge clarity prioritized for clean cutout extraction.
```

## Minion full-body template

```text
Generate an image of a single isolated full-body minion character for a casual fantasy match-3 game. Match the established boss art style of the project: polished fantasy game rendering, soft painted shading, crisp readable silhouette, readable at small size, full character visible from head to feet, centered composition. [Describe minion species, body shape, color palette, expression, pose, and chapter identity.] Use a plain solid studio background with strong contrast against the subject so the silhouette is easy to extract later. No scenery, no environment props, no floor, no cast shadow plate, no frame, no border, no text, no watermark. Edge clarity prioritized for clean cutout extraction.
```

## Example: Chapter 1 boss

```text
Generate an image of a single isolated full-body boss character for a casual fantasy match-3 game. Character: Ember Cub, a cute but mischievous fire spirit fox boss. Match the established in-game boss illustration style: polished fantasy game rendering, soft painted shading, crisp readable silhouette, premium mobile game art, chibi-to-mid proportions, large expressive head, compact body, oversized fluffy ember-flame tail, orange-red fur, warm golden ember glow inside the tail and chest, charcoal ear tips and paws, playful but dangerous expression, dynamic three-quarter standing pose, tiny floating sparks around the body, full character visible from head to feet, centered composition. Use a plain light neutral gray studio background with strong contrast against the subject so the silhouette is easy to extract later. No scenery, no environment props, no floor, no cast shadow plate, no frame, no border, no text, no watermark. Edge clarity prioritized for clean cutout extraction.
```

## Example: Chapter 1 minion

```text
Generate an image of a single isolated full-body minion character for a casual fantasy match-3 game. Character: Ember Scout, a small agile ember foxling minion. Match the established boss art style of the project: polished fantasy game rendering, soft painted shading, crisp readable silhouette, readable at small size, slimmer and lighter than the boss, chibi-to-mid proportions, big ears with ember-glow tips, one fluffy flame tail, orange-red fur, warm yellow inner ember glow, charcoal paws and tiny claws, crouched ready-to-pounce pose, playful scout expression, a few tiny sparks around the feet and tail, full character visible from head to feet, centered composition. Use a plain light neutral gray studio background with strong contrast against the subject so the silhouette is easy to extract later. No scenery, no environment props, no floor, no cast shadow plate, no frame, no border, no text, no watermark. Edge clarity prioritized for clean cutout extraction.
```
