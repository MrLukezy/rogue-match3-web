# Fantasy Icon Prompt Pack

These prompts are staged for future image generation. Current runtime can already load local SVG image assets, and these prompts can be used later with any available image agent such as `lulu-image` / `suxi` / `sora-image` once callable.

## Global Art Direction

- Style: fantasy gem casual game icon
- Composition: centered single object, no cropping
- Output: PNG
- Size strategy for web game assets:
  - Gem icons: 512x512 source, displayed smaller in CSS
  - Item icons: 384x384 source
  - Boss sigil: 384x384 source
  - Avoid unnecessary 1024x1024 unless the asset needs heavy repainting or marketing use
- Background: transparent
- Lighting: bright rim light, soft magical glow
- Rendering: clean silhouette, readable at 64px, polished mobile-game icon look
- Exclude: no text, no watermark, no UI frame, no hands, no background scene

## Character Cutout Add-on Rules

- When generating full-body characters that will be auto-cut out later, do **not** rely on the model to return real transparency.
- Prefer: plain solid studio background with strong contrast against the subject.
- Require: single isolated character, centered composition, full body fully visible, clean readable silhouette.
- Exclude: floor, cast shadow plate, scene props, fog, smoke, busy particles, decorative frame.
- If the character has bright flame / white glow / pale VFX, prefer a darker neutral background.
- If the character is mostly dark or saturated warm colors, prefer a light neutral background.
- Add this clause to prompts when needed:
  - `single isolated character, full body fully visible, centered composition, plain solid studio background with strong contrast against the character, edge clarity prioritized for clean cutout extraction, no scenery, no floor, no cast shadow plate, no frame, no text, no watermark`

## Gem Icons

### gem_fire.png
- Content: a faceted ruby-like crystal with warm inner flame streaks
- Size note: generate at 512x512 for in-game board readability; crystal should occupy about 72% of canvas height
- Prompt: `A single fantasy casual web match-3 gem icon, faceted ruby crystal with glowing ember core and subtle flame veins, bright red and orange palette, polished highlights, centered composition, transparent background, highly readable at 32px to 64px display size, premium game UI icon, no text, no frame, no watermark, 512x512`

### gem_water.png
- Content: a sapphire droplet crystal with liquid shine
- Size note: generate at 512x512 for in-game board readability; crystal should occupy about 72% of canvas height
- Prompt: `A single fantasy casual web match-3 gem icon, faceted sapphire water gem shaped like a rounded crystal droplet, inner aqua glow, polished highlights, blue and cyan palette, centered composition, transparent background, highly readable at 32px to 64px display size, premium game UI icon, no text, no frame, no watermark, 512x512`

### gem_nature.png
- Content: an emerald leaf crystal with natural magical glow
- Size note: generate at 512x512 for in-game board readability; crystal should occupy about 72% of canvas height
- Prompt: `A single fantasy casual web match-3 gem icon, faceted emerald crystal with subtle leaf-like silhouette and green magical core, lush green palette, polished highlights, centered composition, transparent background, highly readable at 32px to 64px display size, premium game UI icon, no text, no frame, no watermark, 512x512`

### gem_lightning.png
- Content: a golden-yellow crystal with lightning energy trapped inside
- Size note: generate at 512x512 for in-game board readability; crystal should occupy about 72% of canvas height
- Prompt: `A single fantasy casual web match-3 gem icon, faceted amber-yellow lightning gem with crackling electric core, gold and yellow palette, sharp readable silhouette, polished highlights, centered composition, transparent background, highly readable at 32px to 64px display size, premium game UI icon, no text, no frame, no watermark, 512x512`

### gem_arcane.png
- Content: a violet arcane gem with starlight sparkles
- Size note: generate at 512x512 for in-game board readability; crystal should occupy about 72% of canvas height
- Prompt: `A single fantasy casual web match-3 gem icon, faceted violet arcane crystal with soft star magic glow and mystical sparkles, purple and lilac palette, polished highlights, centered composition, transparent background, highly readable at 32px to 64px display size, premium game UI icon, no text, no frame, no watermark, 512x512`

### gem_alchemy.png
- Content: an orange science/alchemy crystal with luminous core
- Size note: generate at 512x512 for in-game board readability; crystal should occupy about 72% of canvas height
- Prompt: `A single fantasy casual web match-3 gem icon, faceted orange alchemy crystal with luminous inner core and subtle arcane laboratory energy, orange and copper palette, polished highlights, centered composition, transparent background, highly readable at 32px to 64px display size, premium game UI icon, no text, no frame, no watermark, 512x512`

## Item Icons

### item_hammer.png
- Content: enchanted silver hammer with blue rune glow
- Prompt: `A single fantasy casual web game item icon, enchanted silver hammer with blue rune glow, compact readable silhouette, centered composition, transparent background, highly readable at 24px to 48px display size, premium game UI icon, no text, no frame, no watermark, 384x384`

### item_row_sweep.png
- Content: horizontal energy blade / wave slash
- Prompt: `A single fantasy casual web game item icon, horizontal magical sweep slash made of blue energy, compact readable silhouette, centered composition, transparent background, highly readable at 24px to 48px display size, premium game UI icon, no text, no frame, no watermark, 384x384`

### item_cross_burst.png
- Content: purple cross-shaped blast sigil
- Prompt: `A single fantasy casual web game item icon, glowing purple cross burst sigil with magical explosion center, compact readable silhouette, centered composition, transparent background, highly readable at 24px to 48px display size, premium game UI icon, no text, no frame, no watermark, 384x384`

### item_color_bomb.png
- Content: rainbow orb bomb with paint-like magical aura
- Prompt: `A single fantasy casual web game item icon, colorful magical color bomb orb with rainbow aura, compact readable silhouette, centered composition, transparent background, highly readable at 24px to 48px display size, premium game UI icon, no text, no frame, no watermark, 384x384`

### item_shuffle.png
- Content: twin looping green arrows with magic spark
- Prompt: `A single fantasy casual web game item icon, pair of green magical shuffle arrows forming a loop, compact readable silhouette, centered composition, transparent background, highly readable at 24px to 48px display size, premium game UI icon, no text, no frame, no watermark, 384x384`

### item_screen_pulse.png
- Content: crimson radial shockwave crystal
- Prompt: `A single fantasy casual web game item icon, crimson screen pulse shockwave with bright radial magical ring, compact readable silhouette, centered composition, transparent background, highly readable at 24px to 48px display size, premium game UI icon, no text, no frame, no watermark, 384x384`

### item_rainbow_burst.png
- Content: iridescent rainbow flare starburst
- Prompt: `A single fantasy casual web game item icon, iridescent rainbow burst star with magical flare, compact readable silhouette, centered composition, transparent background, highly readable at 24px to 48px display size, premium game UI icon, no text, no frame, no watermark, 384x384`

### item_time_freeze.png
- Content: icy crystal clock / frozen snowflake sigil
- Prompt: `A single fantasy casual web game item icon, frozen time sigil combining snowflake and arcane clock motif, blue-white palette, compact readable silhouette, centered composition, transparent background, highly readable at 24px to 48px display size, premium game UI icon, no text, no frame, no watermark, 384x384`

### item_boss_breaker.png
- Content: golden gauntlet strike sigil / impact crest
- Prompt: `A single fantasy casual web game item icon, golden boss breaker impact crest with heavy strike motif and bright shockwave, compact readable silhouette, centered composition, transparent background, highly readable at 24px to 48px display size, premium game UI icon, no text, no frame, no watermark, 384x384`

## Boss Icon

### boss_sigil.png
- Content: stylized ominous skull crest with crimson glow
- Size note: icon should feel like a boss emblem, not a realistic head
- Prompt: `A single fantasy casual web game boss emblem icon, stylized ominous skull crest with crimson glow and dark magical plating, centered composition, transparent background, highly readable at 32px to 64px display size, premium game UI icon, no text, no frame, no watermark, 384x384`
