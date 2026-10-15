# Retro Street Fighter

여섯 명의 오리지널 파이터로 즐기는 1인용 2D 아케이드 격투게임입니다. HTML5 Canvas, CSS, JavaScript와 Web Audio만 사용합니다. 런타임 외부 요청, 서버 API, 데이터베이스, 빌드 과정이 없습니다. 모든 리소스는 상대 경로로 로드합니다.

## 실행

```sh
cd /workspace/retro-street-fighter
python3 -m http.server 8000
```

브라우저로 해당 HTTP 서버의 `index.html`을 열면 됩니다. ES 모듈을 사용하므로 `file://` 대신 정적 서버로 실행하세요. 플레이만 할 때 Node.js나 npm 설치는 필요하지 않습니다.

## 플레이

캐릭터·스테이지·난이도·상대를 선택하고 **ENTER THE ARENA**를 누르세요. 화면을 클릭하면 키보드 입력을 받습니다. 게임 밖의 방향키와 문자는 가로채지 않으며 포커스를 잃으면 자동 일시정지합니다.

| 입력 | 동작 |
| --- | --- |
| ← / → | 좌우 이동, 상대 반대 방향으로 이동하면 방어 |
| ↑ / ↓ | 점프 / 앉기 |
| Z / X / C | 약펀치 / 강펀치 / 킥 |
| A / S / D | 캐릭터별 필살기 |
| Esc / P | 일시정지 / 계속 |
| Enter | 게임 화면에 포커스가 있는 시작 화면에서 시작 |

터치 기기에는 방향 패드와 6개 공격 버튼이 나타납니다. 여러 버튼을 동시에 누를 수 있습니다. 가로 화면과 전체화면 버튼을 권장합니다. 전체화면·오디오 기능은 브라우저의 사용자 동작 및 iframe 권한을 따릅니다. 사운드는 기본 켜짐 상태이며 시작 버튼을 누르면 재생됩니다. 상단 ♫ 버튼으로 끌 수 있고, 조작 가이드의 ARCADE SOUND에서 클래식/합성 팩·음량·배경음악을 선택합니다. 음소거 선택은 저장됩니다.

### 파이터

| 캐릭터 | 체력 | 이동 속도 | 공격 배율 | A / S / D |
| --- | ---: | ---: | ---: | --- |
| RYUJI | 100 | 215 | 1.00 | 블루 에너지 / 라이징 피스트 / 사이클론 킥 |
| KAZAN | 100 | 235 | 0.95 | 플래시 킥 / 소닉 웨이브 / 러시 킥 |
| TITAN | 125 | 150 | 1.32 | 파워 슬램 / 자이언트 러시 / 스핀 크러시 |
| MINA | 90 | 270 | 0.87 | 스피닝 킥 / 에어 스트라이크 / 팬텀 러시 |
| AGNI | 95 | 165 | 0.95 | 플레임 브레스 / 스트레치 펀치 / 플로팅 요가 |
| BOLT | 85 | 305 | 0.85 | 썬더 러시 / 라이트닝 어퍼 / 팬텀 콤보 |

AGNI는 X로 팔, C로 다리를 늘립니다. ↓+S는 스트레치 킥입니다. 늘어나는 길이와 히트박스를 같은 값으로 계산합니다. D 부양 중 방향키로 이동할 수 있습니다. TITAN의 잡기는 가까운 지상 상대에게만 성공하고 방어를 무시합니다. MINA의 S는 지상에서도 도약 후 급강하합니다. BOLT는 이동과 공격에 잔상을 남깁니다.

### 전투 규칙

- 60Hz 고정 시간 간격의 로직, requestAnimationFrame 렌더링, 960×540 내부 해상도.
- 99초, 2선승제. KO 또는 시간 종료 시 남은 **실제 체력**으로 승자를 결정합니다.
- 동시 KO 및 시간 종료 시 체력이 같으면 승수를 올리지 않고 같은 라운드를 재경기합니다.
- 기본 방어는 칩 데미지 16%를 받으며, 앉은 공격은 앉아서 방어해야 합니다.
- 공격에는 발동·활성·회복 구간이 있습니다. 필살기는 1.15초의 공통 재사용 대기시간을 사용하며, 피격 중에는 새 공격을 할 수 없습니다.
- 4회 연속 피격 시 밀려나며 0.65초간 무적을 받아 무한 콤보를 제한합니다.
- AI는 난이도별 관찰 간격·실수율·공격 빈도를 사용합니다. 플레이어 입력을 읽지 않습니다.
- 세 스테이지: 황혼의 골목 / 미드나잇 항구 / 잊혀진 사원.
- 선택한 캐릭터·난이도·스테이지·사운드 설정을 localStorage에 저장합니다. 저장이 제한된 iframe에서도 플레이할 수 있습니다.

## 개발 및 검증

Node.js 22 이상, Python 3, Chromium을 권장합니다. Node 의존성은 개발용 Playwright뿐입니다.

```sh
npm ci
npm test
# 시스템 Chromium이 없으면 브라우저 설치 (Linux에서 필요한 OS 라이브러리는 --with-deps 추가)
npx playwright install chromium
npm run test:browser
```

`CHROMIUM_PATH`로 시스템 브라우저 실행 파일을 지정할 수 있습니다. `/usr/bin/chromium`이 있으면 자동 사용하고, 없으면 Playwright 브라우저를 사용합니다. 브라우저 테스트는 임시 포트에서 자체 정적 서버를 시작하고 종료합니다. 화면 캡처와 10초 사운드 미리듣기 `audio-preview.wav`는 무시되는 `test-results/`에 저장합니다.

전투·포즈·오디오 상태 테스트 21개는 6명 기술 데이터, 발동/판정/후딜레이, 방어·잡기, 투사체, 팔다리 확장, 부양·급강하, 점프·앉기, 재사용 대기시간·경직, 콤보 탈출, KO·시간 종료·무승부, AI 난이도와 시뮬레이션의 범위를 확인합니다. 브라우저 검증은 데스크톱 입력·메뉴·일시정지와 390px 터치 화면의 동시 입력·해제와 가로 전체화면을 확인합니다. 오디오 검사는 29개 파일 디코딩·비무음 여부, 6개 음색, 음소거 시 실제 무음, 음악 스케줄링과 일시정지 시 오디오 정리를 검증합니다. 음색의 원작 유사도는 자동 검사로 판단하지 않습니다. 데스크톱·터치 조작 검사는 AI 방해를 고정하고, AI 전투는 별도 엔진 시뮬레이션으로 확인합니다. 실제 모바일 기기의 성능·체감 밸런스는 추가 검증 대상입니다.

## GitHub Pages

`.github/workflows/pages.yml`은 main 반영 시 전투·브라우저 테스트 후 정적 파일만 Pages에 배포합니다. 저장소 **Settings → Pages → Build and deployment → Source → GitHub Actions**가 활성화되어 있어야 합니다. 최초 활성화는 저장소 관리 권한이 필요합니다. GitHub Actions의 배포 결과에 나온 `page_url`을 실제로 열어 확인한 후 사용하세요. 워크플로 파일 추가만으로 배포 성공이 보장되지는 않습니다.

### 티스토리 삽입

확인된 사이트: https://yunsangyeong.github.io/retro-street-fighter/

아래 코드를 티스토리 HTML 모드에 넣으세요. 화면 변경 직후 이전 화면이 보이면 브라우저에서 새로고침하세요.

```html
<iframe
  src="https://yunsangyeong.github.io/retro-street-fighter/"
  title="Retro Street Fighter 격투게임"
  style="display:block;width:100%;height:900px;max-height:90vh;border:0;background:#101b20;"
  allow="autoplay; fullscreen"
  allowfullscreen
  loading="lazy"
></iframe>
```

iframe 안에서 선택 화면은 스크롤할 수 있고, 게임 화면은 16:9 비율을 유지합니다. 모바일에서는 게임의 전체화면 버튼으로 확장할 수 있습니다. 티스토리 편집기나 브라우저가 전체화면 권한을 제한할 수 있습니다.

## 파일 구성

- `index.html`, `style.css`: 반응형 로비·선택 화면·HUD 메뉴·터치 조작.
- `engine.js`: 브라우저에 의존하지 않는 전투·물리·기술·AI·라운드 로직.
- `render.js`, `fighter-art.js`: 스테이지·효과·HUD와 다단계 명암·근육·복장 디테일을 갖춘 픽셀 캐릭터. 절반 해상도에 그린 뒤 스무딩 없이 확대합니다. 공격 후 복귀 동작과 AGNI의 팔다리 길이는 실제 공격 상태에 연결됩니다.
- `game.js`, `audio.js`: 고정 시간 루프, 입력·포커스·UI, 클래식 샘플·캐릭터별 합성 기합·오리지널 아케이드 BGM·오디오 믹서.
- `assets/`: 아이콘, 로컬 폰트와 폰트 라이선스.
- `tests/engine.test.js`, `tests/fighter-art.test.js`, `scripts/browser-check.mjs`: 전투 및 브라우저 검증.
- `.github/workflows/pages.yml`: 검증·Pages 배포.

그래픽은 코드로 직접 그립니다. 클래식 사운드 팩에는 사용자 요청에 따라 원작 계열의 짧은 음성·타격음 샘플을 포함했습니다. 원작 배경음악은 포함하지 않았고 BGM과 MINA·BOLT 기합은 직접 합성합니다. 샘플별 출처·권리 표기는 `assets/audio/SOURCES.md`, 파일별 해시는 `assets/audio/manifest.json`에서 확인할 수 있습니다. Kenney의 대체 타격음 5개는 CC0입니다. 로컬 Barlow Condensed 글꼴은 Fontsource `@fontsource/barlow-condensed` 5.2.8에서 가져왔으며 SIL Open Font License는 `assets/FONT-LICENSE.txt`에 포함됩니다.

현재 범위는 싱글 플레이 AI 대전입니다. 향후 실제 기기 플레이테스트를 통한 밸런스·애니메이션 개선, 게임패드, 리플레이 등을 확장할 수 있습니다.
