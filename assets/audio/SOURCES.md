# Audio sources

클래식 팩은 사용자가 요청한 원작 계열의 짧은 음성·타격음 샘플을 사용합니다. 원작 배경음악, 장시간 트랙 또는 YouTube 영상 오디오는 포함하지 않습니다. 배경음악과 MINA·BOLT의 기합은 `audio.js`의 오리지널 합성 사운드입니다.

## Classic voice / SFX clips

Original game and character audio: **Street Fighter / CAPCOM**. Original copyright remains with the respective rights holders. The public mirrors below do not supply a separate asset redistribution license; these clips are not labeled CC0 or original recordings by this project.

- https://github.com/jhonatanrojasbastidas/Keyboard-street-fighter-sounds/tree/3536bbeee6cbec2247b8916f4accb603a7b81d84/sounds
  - Ryu/Ken Hadoken, Shoryuken, Kick; Guile Sonic Boom; Dhalsim Yoga Fire / Yoga Flame; Zangief Grunt / Laugh; Fight / You win / You lose.
- https://github.com/Don-BP/super-street-fighter-2-soundboard/tree/61cff38ced71281f8d5eccd84dc9790f131dbcc9/sounds
  - Announcer Round / One / Two / Three; Ryu grunts / ouch; jab, strong, fierce, roundhouse hits; block; electric.

Character mapping: RYUJI uses the Ryu/Ken move calls; KAZAN's shockwave uses Sonic Boom; TITAN's grab uses a wrestling grunt; AGNI's breath alternates Yoga Fire / Yoga Flame. Other move calls use character-specific synthesized kiai. MINA and BOLT do not claim original Chun-Li / Blanka recordings.

Reference supplied by the user: https://www.youtube.com/shorts/sUjsyme6ac8 . Access returned HTTP 403 in the development environment; its audio was not extracted or directly compared.

## Alternate impact recordings

**Kenney Impact Sounds** — Kenney, CC0 1.0 Universal. Full license: `KENNEY-CC0.txt`.

- https://github.com/Boyquotes/kenney-impact-sounds-for-godot/tree/999dd1684873f8b020a3aa5b26e713da21688924
- Four punch-impact clips and one metallic block impact. Used by the alternate sound pack.

`manifest.json` records the source URL, pinned source commit, SHA-256 and byte size for every included recording. These are local files; the game does not hotlink or download from third-party sites while playing.
