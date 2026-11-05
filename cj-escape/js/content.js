/*
 * 게임 콘텐츠 파일
 * - 퍼즐 문구, 정답, 힌트, 등장인물, 안내 팝업을 여기서만 고치면 됩니다.
 * - 줄바꿈 규칙: 문장 안의 "\n"은 의미 단위 줄바꿈입니다. 아무 데서나 끊기지 않게 직접 끊어 주세요.
 * - 자물쇠 정답은 해시값(hash)으로 저장합니다. 정답을 바꾸려면 node tools/hash.js 새정답
 * - 사실 정보 출처: cj.co.kr, cj.net (2026-11-04 확인)
 */
window.GAME = {
  meta: {
    title: "ONLYONE 레시피를 찾아라",
    subtitle: "햇반 30주년 타임캡슐",
    disclaimer:
      "이 게임은 CJ제일제당 입사 지원자가 온보딩 프로그램 제안용으로 만든 비공식 포트폴리오입니다.\n" +
      "로고·브랜드·사진의 권리는 CJ제일제당에 있으며 출처는 cj.co.kr, cj.net입니다.\n" +
      "등장인물과 선배 메시지는 모두 가상으로 지어낸 내용입니다."
  },

  /* 시작 화면: 끌어서 30년 건너기 (왼쪽 1996 → 오른쪽 2026) */
  intro: {
    then: { img: "assets/history/1996_hetbahn.jpg", alt: "1996년 햇반 출시 당시 매장" },
    now: { img: "assets/photo/hetbahn_2026_banner.png", alt: "2026년 오늘, 햇반 생산 라인" },
    beats: [
      { until: 0.12, lines: ["1996년, 햇반이 처음 나온 날", "「ONLYONE 레시피북」을 타임캡슐에 묻었어요."] },
      { until: 0.97, lines: ["캡슐이 땅속에 잠든 동안", "비비고 같은 새 맛이 나왔어요."] },
      { until: 1.01, lines: ["그리고 2026년 오늘,", "30년 만에 캡슐을 엽니다."] }
    ],
    yearNotes: { 1996: "햇반이 처음 나온 해", 2010: "비비고가 나온 해", 2026: "햇반 30주년, 오늘" },
    punch: "캡슐을 열었는데, <b>레시피북이 없어요.</b>",
    go: "1953년부터 추적하기"
  },

  /* 말풍선 화자 */
  speakers: {
    "블라썸": { emoji: "ti-sparkles", kind: "ai" },
    "한햇님": { emoji: "ti-bowl", kind: "person" }
  },

  /* ───────── 안내 팝업 (가운데 정렬, 줄 길이 차이 30% 이내) ───────── */
  guides: {
    rules: {
      cards: [
        { icon: "ti-device-mobile", title: "한 사람, 한 기기", lines: ["처음부터 끝까지 같은 기기로", "조장 기기의 기록이 조 기록이에요."] },
        { icon: "ti-messages", title: "같이 보고, 같이 풀기", lines: ["단서는 나눠 보고 말로 공유해요.", "정답은 누가 입력해도 돼요."] },
        { icon: "ti-bulb", title: "막히면 힌트", lines: ["힌트는 3단계까지 볼 수 있어요.", "대신 기록에 +1·3·5분이 더해져요."] }
      ],
      done: "게임 시작"
    },
    coach: [
      { target: ".objects", text: "점선 버튼에 단서가 숨어 있어요." },
      { target: "#puzzle", text: "퍼즐을 풀면 비밀번호 실마리가 나와요." },
      { target: "#lockbox", text: "비밀번호를 넣으면 다음 방이 열려요." },
      { target: ".hud", text: "시간은 계속 흘러요. 막히면 힌트 버튼!" }
    ],
    acts: {
      act1: { icon: "ti-door", title: "방 5개를 탈출하세요", lines: ["방마다 회사 이야기가 숨어 있어요.", "목표 시간은 약 25분이에요.", "단서는 같이, 입력은 아무나!"] },
      act2: { icon: "ti-search", title: "범인을 찾으세요", lines: ["증언 5개와 출입 기록을 비교하세요.", "확인 질문 3개를 맞히면 지목할 수 있어요.", "잘못 지목하면 기록에 +1분이 더해져요."] },
      act3: { icon: "ti-lock", title: "셋이 함께 여세요", lines: ["역할마다 보이는 단서가 달라요.", "내 단서를 말로 설명해 주세요.", "잠금장치는 모두 3개예요."] }
    },
    roleRule: { icon: "ti-eye-off", title: "내 화면은 나만 봐요", lines: ["화면은 보여주지 말고 말로만!", "잘 설명하는 것도 실력이에요."] },
    stuck: ["이 방에서 7분이 지났어요.", "힌트 1은 1분만 더해져요."],
    demos: {
      frames:   { kind: "drag",    text: "액자를 끌어서 벽에 거세요." },
      connect:  { kind: "connect", text: "카드에서 원칙까지 선을 이으세요." },
      postit:   { kind: "drag",    text: "포스트잇을 상자에 붙이세요." },
      scratch:  { kind: "scrub",   text: "지우개로 문질러 보세요." },
      basket:   { kind: "drag",    text: "재료를 바구니에 담으세요." },
      dial:     { kind: "dial",    text: "다이얼을 위아래로 돌리세요." },
      tanks:    { kind: "drag",    text: "샘플을 탱크에 넣으세요." },
      flip:     { kind: "tap",     text: "카드를 눌러서 뒤집으세요." },
      accuse:   { kind: "hold",    text: "길게 눌러서 지목하세요." },
      pins:     { kind: "tap",     text: "핀 2개를 순서대로 누르세요." },
      pieces:   { kind: "drag",    text: "조각을 빈칸에 끼우세요." },
      alarm:    { kind: "hold",    text: "버튼을 길게 눌러 경보를 끄세요." },
      drop:     { kind: "drag",    text: "편지를 캡슐로 끌어 넣으세요." }
    }
  },

  prologue: [
    "2026년 11월, CJ제일제당센터.\n햇반 30주년 타임캡슐을 여는 날이에요.",
    "1996년에 묻은 캡슐을 30년 만에 열었는데,\n안에 있어야 할 <b>「ONLYONE 레시피북」</b>이 없어요.",
    { who: "블라썸", text: "레시피북이 사라졌습니다. 찾을 때까지 센터를 봉쇄합니다." },
    { who: "블라썸", text: "걱정 마세요, 신입님. 레시피북의 첫 장인 1953년부터 차근차근 따라가 보면 단서가 나올 거예요. 먼저 경보부터 꺼 볼까요?" }
  ],
  alarmOff: "경보가 꺼졌어요.\n하지만 문은 아직 잠겨 있어요!",

  hintPenalty: [60, 180, 300],
  lockout: { tries: 5, seconds: 30 },

  rooms: [
    /* ───────── 방 1 ───────── */
    {
      id: "room1",
      no: 1,
      title: "로비 「1953 설탕 공장」",
      theme: "70년의 역사",
      intro: "로비 벽면의 역사 갤러리.\n경보 진동에 액자 7개가 바닥으로 떨어져 뒤섞였어요.\n액자 아래 연도 표지는 지워져 있습니다.",
      objects: [
        {
          icon: "ti-photo",
          label: "벽에 남은 안내문",
          title: "역사 갤러리 안내문",
          body:
            "<p>CJ제일제당은 1953년\n<b>대한민국 최초의 설탕 제조업</b>으로 출발해\n다양한 사업 영역으로 성장해 왔습니다.</p>" +
            "<p class='note'>액자를 <b>오래된 순서대로</b> 다시 걸면\n액자 뒷면의 글자가 보입니다.</p>"
        },
        {
          icon: "ti-bell",
          label: "안내 데스크 메모",
          title: "안내 데스크 메모",
          body: "<p>“금고 비밀번호는 액자 뒷면에 적힌 <b>일곱 글자</b>. 우리 회사의 경영철학이기도 하지.”</p>"
        }
      ],
      puzzle: {
        type: "timeline",
        demo: "frames",
        alt: "끌기가 어려우면 액자를 누르세요. 빈칸에 차례로 걸려요.",
        help: "바닥의 액자를 끌어서 벽의 빈칸에 거세요.\n잘못 걸었으면 다른 칸으로 옮기거나 바닥으로 내리면 돼요.",
        cards: [
          { year: "1953", text: "제일제당공업주식회사 설립,\n국내 최초 설탕 생산", letter: "O", img: "assets/history/1953_factory.jpg" },
          { year: "1958", text: "제분 사업 시작", letter: "N", emoji: "ti-grain" },
          { year: "1965", text: "식품 대표 브랜드\n'백설' 출시", letter: "L", img: "assets/history/1965_sugar.jpg" },
          { year: "1975", text: "종합 조미료\n'다시다' 생산 개시", letter: "Y", img: "assets/history/1975_dasida.jpg" },
          { year: "1996", text: "한국 최초 즉석밥\n'햇반' 출시", letter: "O", img: "assets/history/1996_hetbahn.jpg" },
          { year: "2010", text: "글로벌 한식 브랜드\n'비비고' 출시", letter: "N", img: "assets/brands/bibigo.png" },
          { year: "2017", text: "융복합 연구소\n'CJ블로썸파크' 개관", letter: "E", img: "assets/ci/blossompark.jpg" }
        ],
        doneText: "액자가 뒤집히며 뒷면의 글자가 나타났어요.\n70년 넘게 쌓아온 변화와 성장의 DNA예요."
      },
      lock: { prompt: "금고 비밀번호 (영문 7자)", hash: "f0178e35", placeholder: "예: ABCDEFG" },
      hints: [
        "액자 속 사건들의 시대를 떠올려 보세요.\n설탕이 가장 먼저, 연구소가 가장 나중이에요.",
        "순서: 설탕 생산 → 제분 → 백설 → 다시다\n→ 햇반 → 비비고 → 블로썸파크",
        "정답은 ONLYONE이에요."
      ],
      reward: { id: "onlyone", label: "열쇠 단어 ONLYONE", icon: "ti-key" },
      outro: { who: "블라썸", text: "ONLYONE은 CJ의 경영철학이에요. '최초, 최고, 차별화'를 추구한다는 뜻이죠. 이 단어는 나중에 또 필요하니 꼭 기억해 두세요!" }
    },

    /* ───────── 방 2 ───────── */
    {
      id: "room2",
      no: 2,
      title: "회의실 「ONLYONE 회의」",
      theme: "미션 · 핵심가치",
      intro: "회의실 화이트보드에 회사의 미션이 적혀 있는데,\n마지막 부분이 지워져 있어요.\n테이블 위에는 상황 카드와 포스트잇이 흩어져 있습니다.",
      objects: [
        {
          icon: "ti-presentation",
          label: "화이트보드",
          title: "화이트보드",
          body:
            "<p class='board'>MISSION<br><b>ONLYONE 제품과 서비스로<br>최고의 가치를 창출하여<br>▢▢ ▢▢에 기여한다</b></p>" +
            "<p class='board small'>VISION<br>건강, 즐거움, 편리를 창조하는<br>글로벌 생활문화기업</p>"
        },
        {
          icon: "ti-file-text",
          label: "벽에 걸린 액자",
          title: "창업 정신",
          body:
            "<p>1953년, CJ제일제당은\n<b>사업보국(事業報國)</b>의 일념으로 출발했습니다.</p>" +
            "<p class='note'>사업보국: 사업을 통해\n나라와 사회에 보답한다는 뜻</p>"
        }
      ],
      puzzle: {
        type: "values",
        alt: "끌기가 어려우면 카드나 포스트잇을 누른 뒤, 원칙이나 상자를 누르세요.",
        help: "① 상황 카드에서 알맞은 행동원칙까지 선을 이으세요.\n② 포스트잇을 끌어서 핵심가치 상자에 붙이세요.",
        principles: ["정직", "열정", "창의", "존중"],
        situations: [
          { text: "실수로 납기를 놓쳤어요.\n숨기지 않고 바로 팀에 공유했어요.", answer: "정직" },
          { text: "아무도 해본 적 없는 신제품이지만\n끝까지 해보겠습니다!", answer: "열정" },
          { text: "기존 방식 말고, 남는 재료로\n새 제품을 만들어 보면 어떨까요?", answer: "창의" },
          { text: "의견은 다르지만, 끝까지 듣고 나서\n제 생각을 말할게요.", answer: "존중" }
        ],
        values: ["인재", "ONLYONE", "상생"],
        keywords: [
          { text: "일류인재", answer: "인재" },
          { text: "일류문화", answer: "인재" },
          { text: "최초최고", answer: "ONLYONE" },
          { text: "차별화", answer: "ONLYONE" },
          { text: "생태계 조성", answer: "상생" },
          { text: "공유가치", answer: "상생" }
        ],
        scratchHidden: "ㄱ ▢ ㅅ ▢",
        doneText: "화이트보드의 지워진 자리에 희미한 자국이 남아 있어요.\n지우개로 문질러 보세요."
      },
      lock: { prompt: "화이트보드 빈칸 네 글자", hash: "bc3b0880", placeholder: "예: ○○○○" },
      hints: [
        "미션은 '사업보국' 정신과 이어져 있어요.\n사업으로 누구에게 보답하나요?",
        "두 단어예요.\n'나라'를 뜻하는 두 글자 + '세상'을 뜻하는 두 글자",
        "정답은 '국가사회'예요."
      ],
      reward: null,
      outro: { who: "블라썸", text: "핵심가치는 인재 · ONLYONE · 상생, 행동원칙은 정직 · 열정 · 창의 · 존중이에요. 회의할 때 자주 듣게 될 거예요." }
    },

    /* ───────── 방 3 ───────── */
    {
      id: "room3",
      no: 3,
      title: "K-Food 키친 「신입 환영 한 상」",
      theme: "대표 브랜드",
      intro: "시식 키친.\n조리대 위에 '신입 환영 한 상' 레시피 카드가 놓여 있어요.\n그런데 재료 이름 대신 브랜드의 역사만 적혀 있습니다.",
      objects: [
        {
          icon: "ti-notes",
          label: "레시피 카드",
          title: "신입 환영 한 상",
          body:
            "<ol class='recipe'>" +
            "<li>1996년에 태어난\n<b>한국 최초의 즉석밥</b></li>" +
            "<li>2010년 출시,\n2016년 <b>美 만두 시장 1위</b>에 오른 글로벌 한식 브랜드</li>" +
            "<li>1975년부터 국물 맛을 책임져 온\n<b>종합 조미료</b></li>" +
            "<li>1965년, 설탕을 <b>가정용 소포장</b>으로 바꾼\n식품 대표 브랜드</li>" +
            "</ol><p class='note'>재료를 <b>레시피 순서대로</b> 바구니에 담으면\n바구니에 칸 번호가 찍혀요.</p>"
        }
      ],
      puzzle: {
        type: "shelf",
        alt: "끌기가 어려우면 제품을 누르세요. '바구니에 담기' 버튼이 있어요.",
        help: "제품을 끌어서 바구니에 담으세요.\n제품을 누르면 브랜드 이야기를 읽을 수 있어요.",
        basketSize: 4,
        items: [
          { slot: 1, name: "다시다", img: "assets/brands/dasida.png", info: "1975년 생산을 시작한 종합 조미료 브랜드.\n반세기 가까이 한국 가정의 국물 맛을 책임져 왔어요." },
          { slot: 2, name: "고메", img: "assets/brands/gourmet.png", info: "레스토랑 같은 맛을 집에서 즐기는\n프리미엄 가정간편식 브랜드예요." },
          { slot: 3, name: "햇반", img: "assets/brands/hetbahn.png", info: "1996년 출시된 한국 최초의 즉석밥.\n2026년, 출시 30주년을 맞았어요." },
          { slot: 4, name: "스팸", img: "assets/brands/spam.png", info: "CJ제일제당이 국내에서 선보이는 캔햄 브랜드예요.\n(SPAM®은 Hormel Foods의 등록상표)" },
          { slot: 5, name: "백설", img: "assets/brands/beksul.png", info: "1965년 출시된 식품 대표 브랜드.\n포대자루 설탕을 가정용 소포장으로 바꿔\n부엌 풍경을 바꿨어요." },
          { slot: 6, name: "해찬들", img: "assets/brands/haechandle.png", info: "고추장·된장 등 장류 브랜드.\n2006년 CJ제일제당과 합병했어요." },
          { slot: 7, name: "비비고", img: "assets/brands/bibigo.png", info: "2010년 출시된 글로벌 한식 브랜드.\n2016년 美 만두 시장 1위,\n2020년 만두 매출 1조 원을 돌파했어요." },
          { slot: 8, name: "쁘띠첼", img: "assets/brands/petitzel.png", info: "새로운 디저트 문화를 만들어 가는\n디저트 브랜드예요." },
          { slot: 9, name: "맛밤", img: "assets/brands/matbam.png", info: "자연의 밤 그대로를 담은\n간식 브랜드예요." }
        ]
      },
      lock: { type: "dial", digits: 4, prompt: "냉장고 다이얼 자물쇠 (숫자 4자리)", hash: "7ad95a9d" },
      hints: [
        "레시피 순서대로 브랜드를 떠올려 보세요.\n즉석밥 → 만두 → 조미료 → 설탕",
        "햇반 → 비비고 → 다시다 → 백설.\n이제 선반에서 칸 번호를 찾으세요.",
        "정답은 3715예요."
      ],
      reward: null,
      outro: { who: "블라썸", text: "선반에 있는 브랜드는 일부일 뿐이에요. CJ제일제당에는 20개가 넘는 식품·BIO 브랜드가 있답니다." }
    },

    /* ───────── 방 4 ───────── */
    {
      id: "room4",
      no: 4,
      title: "CJ블로썸파크 「발효 연구실」",
      theme: "사업 구조 · BIO",
      intro: "한국 최대의 식품·바이오 융복합 연구소, CJ블로썸파크.\n연구실 한가운데 발효 탱크 3개가 있고,\n바닥에 제품 샘플 9개가 흩어져 있어요.",
      objects: [
        {
          icon: "ti-microscope",
          label: "현미경",
          title: "현미경 슬라이드",
          motion: "magnifier",
          body:
            "<p class='slide-text'>“CJ제일제당은\n세계 유일의 친환경 발효기술 기반\n<b>▢대 사료용 아미노산</b> 공급 기업입니다.”</p>" +
            "<p class='chips'><span>라이신</span><span>트립토판</span><span>알지닌</span><span>발린</span><span>쓰레오닌</span><span>이소류신</span><span>메치오닌</span><span>히스티딘</span></p>"
        },
        {
          icon: "ti-pin",
          label: "연구실 게시판",
          title: "연구실 게시판",
          body:
            "<p>CJ제일제당의 사업은 세 부문으로 나뉘어요.</p>" +
            "<ul><li><b>라이프스타일 식품</b>\nK-Food 세계화, 새로운 식문화 창조</li>" +
            "<li><b>기술소재</b>\n발효 기술 기반 Taste·Nutrition·\nHealth & Wellness·생분해 소재</li>" +
            "<li><b>핵심소재</b>\n설탕·밀가루·식용유 같은 식품소재와\n동물영양(아미노산·그린 프로틴)</li></ul>" +
            "<p class='note'>탱크 비밀번호 =\n탱크 3개에 나타나는 글자 + 현미경 속 숫자</p>"
        }
      ],
      puzzle: {
        type: "tanks",
        alt: "끌기가 어려우면 샘플을 누른 뒤 탱크를 누르세요.",
        help: "샘플을 끌어서 알맞은 사업부문 탱크에 넣으세요.\n탱크가 가득 차면 글자가 나타나요.",
        tanks: [
          { id: "food", name: "라이프스타일 식품", letter: "B", color: "#F39200" },
          { id: "tech", name: "기술소재", letter: "I", color: "#2D7FF9" },
          { id: "core", name: "핵심소재", letter: "O", color: "#1AA260" }
        ],
        samples: [
          { name: "비비고", img: "assets/brands/bibigo.png", tank: "food", info: "글로벌 한식 브랜드" },
          { name: "햇반", img: "assets/brands/hetbahn.png", tank: "food", info: "한국 최초 즉석밥" },
          { name: "크레잇", img: "assets/brands/creeat.png", tank: "food", info: "외식·급식용 B2B 식품 브랜드" },
          { name: "TasteNrich", img: "assets/brands/tastenrich.png", tank: "tech", info: "식물성 발효 조미소재" },
          { name: "PHACT", img: "assets/brands/phact.png", tank: "tech", info: "생분해 바이오 소재 PHA" },
          { name: "AMINATURE", img: "assets/brands/aminature.png", tank: "tech", info: "발효 기반 영양 솔루션" },
          { name: "BestAmino", img: "assets/brands/bestamino.png", tank: "core", info: "사료용 아미노산" },
          { name: "X·SOY", img: "assets/brands/xsoy.png", tank: "core", info: "발효 대두 단백" },
          { name: "Nextide", img: "assets/brands/nextide.png", tank: "core", info: "차세대 그린 프로틴" }
        ],
        doneText: "세 탱크가 모두 차올랐어요!\n탱크 표면에 글자 B, I, O가 떠올랐습니다."
      },
      lock: { prompt: "탱크 비밀번호 (영문 3자 + 숫자 1자)", hash: "b58a1ceb", placeholder: "예: ABC0" },
      hints: [
        "먹는 완제품은 라이프스타일 식품,\n발효로 만든 맛·영양·생분해 소재는 기술소재,\n아미노산과 단백질 원료는 핵심소재예요.",
        "탱크 글자는 왼쪽부터 B, I, O.\n현미경 속 아미노산 개수를 세어 보세요.",
        "정답은 BIO8이에요."
      ],
      reward: null,
      outro: { who: "블라썸", text: "자연에서 얻고 자연으로 돌려주는 기술, 이것이 CJ제일제당 BIO 사업의 철학이에요." }
    },

    /* ───────── 방 5 ───────── */
    {
      id: "room5",
      no: 5,
      title: "라운지 「님 문화」",
      theme: "CJ 생활 가이드",
      intro: "사내 라운지.\n노트북 화면에 어떤 신입이 선배에게 보내려다 만\n메신저 초안이 열려 있어요.\n옆에는 '신입 생존 용어 카드'가 놓여 있습니다.",
      objects: [
        {
          icon: "ti-coffee",
          label: "라운지 포스터",
          title: "라운지 포스터",
          body:
            "<p><b>CJ는 2000년,\n대기업 최초로 '님' 문화를 도입했어요.</b></p>" +
            "<p>직급 대신 이름 뒤에 '님'을 붙여 부르면\n누구나 수평적으로 의견을 낼 수 있어요.</p>"
        }
      ],
      puzzle: {
        type: "lounge",
        help: "① 메신저 초안의 어색한 호칭을 눌러 CJ식으로 고치고,\n② 용어 카드를 뒤집어 퀴즈를 풀어 보세요.",
        message: [
          "안녕하세요, ",
          { wrong: "김 과장님", right: "김민지님" },
          "! 오늘 신입 OT 자료 받았습니다. 혹시 ",
          { wrong: "박 대리님", right: "박서준님" },
          "께도 공유드릴까요? 그리고 ",
          { wrong: "이 부장님", right: "이현우님" },
          " 회의는 몇 시인지 여쭤봐도 될까요? 😊"
        ],
        quiz: [
          { q: "가정간편식을 뜻하는 말로,\n햇반·비비고 만두 같은 제품을 부르는 용어는?", options: ["HMR", "B2B", "R&D"], answer: 0 },
          { q: "소비자 관점에서 모든 경영 활동을 개선하는\n'CCM'의 뜻은?", options: ["원가관리경영", "소비자중심경영", "품질통합관리"], answer: 1 },
          { q: "2003년 문을 연,\nCJ 임직원 교육·연수의 중심이 되는 곳은?", options: ["CJ블로썸캠퍼스", "CJ인재원", "CJ the Center"], answer: 1 },
          { q: "식품연구소와 BIO연구소가 함께 있는\nCJ제일제당의 융복합 연구소는?", options: ["CJ블로썸파크", "CJ블로썸캠퍼스", "CJ나인브릿지"], answer: 0 }
        ],
        doneText: "메신저도 고치고 용어 카드도 다 맞혔어요!\n라운지 문 옆 키패드에\n'이름 뒤에 붙이는 한 글자'라고 적혀 있어요."
      },
      lock: { prompt: "라운지 문 비밀번호 (한 글자)", hash: "5c5e2aa7", placeholder: "한 글자" },
      hints: [
        "메신저에서 고친 호칭을 다시 보세요.\n공통으로 들어간 글자가 있어요.",
        "직급 대신 이름 뒤에 붙이는 호칭이에요.",
        "정답은 '님'이에요."
      ],
      reward: null,
      outro: { who: "블라썸", text: "라운지 문이 열렸어요! 이제 타임캡슐 보관함이 있는 대표실 앞으로 가 봐요." }
    }
  ],

  /* ───────── 2막 ───────── */
  act2: {
    title: "2막 「사라진 레시피북」",
    intro: "대표실 앞 복도에 도착했어요.",
    introSay: { who: "블라썸", text: "어젯밤 타임캡슐 보관함 근처에 있었던 사람은 다섯 명이에요. 증언을 듣고 레시피북을 꺼낸 사람을 찾아 주세요." },
    suspects: [
      { name: "김연구님", dept: "식품연구소", emoji: "ti-flask",
        testimony: "해외 소비자 입맛에 맞춘\n비비고 만두 신제품을 개발하고 있어요.\n어젯밤 8시부터 10시까지\n<b>블로썸파크</b> 시식 테스트실에서 패널 평가를 했어요.\n센터에는 오지도 않았어요." },
      { name: "박발효님", dept: "BIO연구소", emoji: "ti-dna",
        testimony: "미생물 발효로 아미노산을 만드는\n균주를 연구해요.\n발효 탱크는 밤에도 지켜봐야 해서\n어젯밤 내내 <b>블로썸파크</b>에 있었어요.\n김연구님 시식 테스트에서 만두도 하나 얻어먹었죠." },
      { name: "이글로벌님", dept: "글로벌 마케팅", emoji: "ti-world",
        testimony: "식품사업 해외 매출이 절반을 넘으면서\n해외 법인과 회의가 많아요.\n어젯밤 9시부터 11시까지 센터 회의실에서\n<b>미국 법인과 화상회의</b>를 했어요.\n녹화 기록도 있어요." },
      { name: "최안전님", dept: "품질안전", emoji: "ti-shield-check",
        testimony: "모든 제품이 안전하게 식탁에 오르도록\n품질을 점검해요.\n어젯밤 <b>9시 30분</b>에 순찰하다\n타임캡슐 보관함 앞을 지나갔는데,\n그때 이미 <b>캡슐 봉인이 뜯겨 있었어요</b>." },
      { name: "한햇님", dept: "햇반 30주년 TF", emoji: "ti-bowl",
        testimony: "저는 30주년 캡슐 개봉식을 준비하고 있어요.\n어젯밤엔 <b>8시 50분에 퇴근</b>했어요.\n캡슐이요? 전 손도 안 댔어요.\n정말이에요!" }
    ],
    evidence: {
      icon: "ti-device-cctv",
      label: "보안실 출입 기록",
      title: "어젯밤 보안실 출입 기록",
      note: "보안실 불이 꺼져 있어요.\n손전등으로 모니터를 비춰 보세요.",
      rows: [
        ["20:02", "블로썸파크 시식 테스트실 입실", "김○○"],
        ["20:47", "센터 회의실 입실", "이○○"],
        ["21:10", "타임캡슐 보관함 열림", "한○○ (30주년 TF)"],
        ["21:15", "센터 퇴실", "한○○"],
        ["21:30", "보관함 구역 순찰", "최○○"]
      ]
    },
    questions: [
      { q: "어젯밤 블로썸파크에 있었던 두 사람은?", options: ["김연구님, 박발효님", "이글로벌님, 최안전님", "박발효님, 한햇님"], answer: 0 },
      { q: "캡슐 봉인이 뜯긴 것을\n처음 본 시각은?", options: ["오후 8시 50분", "오후 9시 30분", "오후 11시"], answer: 1 },
      { q: "출입 기록에 따르면\n오후 9시 10분에 보관함을 연 사람의 소속은?", options: ["품질안전", "글로벌 마케팅", "햇반 30주년 TF"], answer: 2 }
    ],
    culprit: 4,
    wrongText: "그분은 알리바이가 확실해요.\n증언과 출입 기록을 다시 비교해 보세요. (+1분)",
    twist: [
      { who: "한햇님", text: "들켰네요! 8시 50분에 퇴근했다는 건 거짓말이었어요. 죄송해요." },
      { who: "한햇님", text: "어젯밤 캡슐을 미리 열어 레시피북을 꺼냈어요. <b>1996년 이후 30년 동안 나온 새 레시피</b>를 붙이고, 마지막 장을 비워 두려고요. 그 장은 올해 입사한 신입분들이 채울 자리예요." },
      { who: "한햇님", text: "완성한 레시피북은 <b>새 30주년 캡슐</b>에 넣어 뒀어요. 그런데 잠금장치가 좀 특별해요. <b>라이프스타일 식품, 기술소재, 핵심소재</b> 세 부문이 힘을 합쳐야만 열려요." },
      { who: "블라썸", text: "한햇님이 메모를 남겼어요. 메모에 적힌 단어는 <b>'건강'</b>이에요. 캡슐에서 쓰일 것 같아요." }
    ],
    reward: { id: "health", label: "단어 조각 '건강'", icon: "ti-puzzle" },
    hints: [
      "증언과 출입 기록의 시간이\n서로 맞지 않는 사람을 찾아보세요.",
      "8시 50분에 퇴근했다는 사람이\n9시 15분에 퇴실 기록이 있어요.",
      "레시피북을 꺼낸 사람은 한햇님이에요."
    ]
  },

  /* ───────── 3막 ───────── */
  act3: {
    title: "3막 「30주년 타임캡슐」",
    intro: "로비에 놓인 새 30주년 타임캡슐. 안에 완성된 레시피북이 들어 있어요.\n잠금장치 3개가 있고,\n각 사업부문 담당자만 볼 수 있는 단서 화면이 따로 있어요.\n조원 세 명이 역할을 하나씩 맡아\n대화로 정보를 모으세요.",
    roles: {
      A: { name: "라이프스타일 식품", color: "#F39200", emoji: "ti-bowl-chopsticks" },
      B: { name: "기술소재", color: "#2D7FF9", emoji: "ti-flask-2" },
      C: { name: "핵심소재", color: "#1AA260", emoji: "ti-seeding" }
    },
    locks: [
      {
        title: "잠금장치 ① 「한 상 차림」",
        type: "dial",
        digits: 4,
        prompt: "다이얼 자물쇠 (숫자 4자리)",
        hash: "fa73f1e2",
        clues: {
          A: "<p>캡슐 뚜껑에 식탁 그림이 새겨져 있어요.\n왼쪽부터 이 순서로 놓여 있어요.</p>" +
             "<p class='big'>햇반 → 비비고 → 다시다 → 쁘띠첼</p>",
          B: "<p>브랜드 포장 색깔표 (게임용 가상 색)</p>" +
             "<table class='tbl'><tr><th>브랜드</th><th>색</th></tr>" +
             "<tr><td>햇반</td><td>🔴</td></tr><tr><td>고메</td><td>🟣</td></tr>" +
             "<tr><td>비비고</td><td>⚫</td></tr><tr><td>스팸</td><td>🔵</td></tr>" +
             "<tr><td>다시다</td><td>🟤</td></tr><tr><td>쁘띠첼</td><td>🟡</td></tr></table>",
          C: "<p>잠금장치 옆 변환표.\n잠금장치는 <b>숫자 4자리</b>예요.</p>" +
             "<table class='tbl'><tr><th>색</th><th>숫자</th></tr>" +
             "<tr><td>🔴</td><td>4</td></tr><tr><td>🟣</td><td>1</td></tr><tr><td>⚫</td><td>2</td></tr>" +
             "<tr><td>🔵</td><td>3</td></tr><tr><td>🟤</td><td>6</td></tr><tr><td>🟡</td><td>9</td></tr><tr><td>⚪</td><td>7</td></tr></table>"
        },
        hints: [
          "A가 본 순서대로 브랜드를\nB의 표에서 색으로, 다시 C의 표에서 숫자로 바꾸세요.",
          "햇반 🔴, 비비고 ⚫, 다시다 🟤, 쁘띠첼 🟡",
          "정답은 4269예요."
        ],
        solvedText: "딸깍! 첫 번째 잠금장치가 풀렸어요."
      },
      {
        title: "잠금장치 ② 「글로벌 지도」",
        type: "pins",
        pins: 6,
        pick: 2,
        prompt: "핀 2개를 순서대로 누르세요",
        hash: "89e14a12",
        clues: {
          A: "<p>캡슐 옆면의 세계지도에\n번호가 붙은 핀 6개가 꽂혀 있어요.</p>" +
             "<p class='pins-clue'><span>① 🇻🇳</span><span>② 🇫🇷</span><span>③ 🇺🇸</span><span>④ 🇬🇧</span><span>⑤ 🇯🇵</span><span>⑥ 🇧🇷</span></p>",
          B: "<p>글로벌 연혁 카드\n(나라 이름만 있고 핀 번호는 없어요)</p>" +
             "<ul class='cards'><li>2017.08 브라질 농축대두단백 업체 셀렉타 인수</li>" +
             "<li>2019.02 미국 냉동식품업체 슈완스 인수</li>" +
             "<li>2022.02 베트남 키즈나 공장 완공</li>" +
             "<li>2022.05 영국 법인 설립</li>" +
             "<li>2024.05 프랑스 법인 설립</li>" +
             "<li>2025.07 일본 치바 신공장 준공</li></ul>" +
             "<p class='note'>2025년 12월,\n식품사업 해외매출 비중이 50%를 넘었어요.</p>",
          C: "<p>잠금장치에 새겨진 지시문</p>" +
             "<p class='big'>\"가장 최근에 <b>공장을 지은</b> 나라의 핀,\n그다음 카드 중 <b>가장 오래된 사건</b>이 있는 나라의 핀\"</p>"
        },
        hints: [
          "B의 카드에서 '공장'이 들어간 사건 중\n가장 최근 것을 찾고,\n그다음 가장 오래된 카드를 찾으세요.",
          "가장 최근 공장은 일본(2025),\n가장 오래된 사건은 브라질(2017)이에요.\nA의 핀 번호를 확인하세요.",
          "정답은 ⑤ → ⑥이에요."
        ],
        solvedText: "딸깍! 두 번째 잠금장치가 풀렸어요."
      },
      {
        title: "잠금장치 ③ 「비전」",
        type: "pieces",
        prompt: "단어 조각을 빈칸에 끼우세요",
        hash: "2b721272",
        before: "",
        after: "를 창조하는\n글로벌 생활문화기업",
        slots: 3,
        pieces: ["건강", "정직", "즐거움", "상생", "편리", "ONLYONE"],
        clues: {
          A: "<p>당신이 모은 아이템</p><p class='big'><i class='ti ti-key'></i> ONLYONE &nbsp; <i class='ti ti-puzzle'></i> 건강</p>",
          B: "<p>캡슐 바닥에 붙어 있던 단어 조각</p><p class='big'><i class='ti ti-puzzle'></i> 즐거움</p>",
          C: "<p>잠금장치 안쪽의 단어 조각과 규칙</p><p class='big'><i class='ti ti-puzzle'></i> 편리</p>" +
             "<p>\"CJ제일제당의 <b>비전</b>에 나오는 순서대로\n세 조각을 끼우시오.\n나머지 조각은 함정이다.\"</p>"
        },
        hints: [
          "비전은 회의실 화이트보드 아래쪽에 있었어요.",
          "\"건강, 즐거움, 편리를 창조하는\n글로벌 생활문화기업\"",
          "건강 → 즐거움 → 편리 순서로 끼우세요."
        ],
        solvedText: "마지막 잠금장치가 풀렸어요!"
      }
    ]
  },

  /* ───────── 엔딩 ───────── */
  ending: {
    capsule: "<b>건강, 즐거움, 편리를 창조하는\n글로벌 생활문화기업</b>\n비전 문장이 완성되자\n캡슐 뚜껑이 살짝 들렸어요.",
    slideLabel: "밀어서 캡슐 열기",
    pages: [
      { year: "1953", title: "설탕 한 숟가락의 시작", lines: ["대한민국 최초의 설탕에서", "우리의 레시피가 시작됐어요."] },
      { year: "1996", title: "햇반이 나온 날", lines: ["이 레시피북은 그날", "타임캡슐에 묻혔어요."] },
      { year: "2010", title: "새로 붙인 페이지", lines: ["캡슐이 잠든 동안 나온 비비고", "한햇님이 30년 치를 이어 붙였어요."] },
      { year: "2026", title: "그리고, 마지막 장", lines: ["ONLYONE 레시피의 마지막 재료는", "지금 이 페이지를 읽고 있는", "<b>당신</b>입니다."], last: true }
    ],
    seniors: [
      { name: "정하늘님", role: "인사팀 · 10년 차", emoji: "",
        msg: "입사를 진심으로 환영해요!\n10년 동안 신입 동기들을 맞이하면서 느낀 건,\n처음 석 달은 모르는 게 당연하다는 거예요.\n모르는 걸 모른다고 말하는 것,\n그게 행동원칙 '정직'의 시작이에요.\n궁금한 건 언제든 '하늘님!' 하고 불러 주세요." },
      { name: "오세린님", role: "식품연구소 · 7년 차", emoji: "",
        msg: "제가 처음 개발에 참여한 만두가\n해외 마트 냉동고에 놓인 걸 봤을 때\n소름이 돋았어요.\n여러분의 작은 아이디어 하나가\n세계 어느 식탁에 오를지 몰라요.\n실패해도 괜찮으니 마음껏 시도해 보세요." },
      { name: "강도윤님", role: "BIO 영업 · 5년 차", emoji: "",
        msg: "BIO는 처음엔 어렵게 느껴질 수 있어요.\n저도 '라이신'이 뭔지 몰랐거든요.\n그런데 우리가 만든 아미노산이\n전 세계 농장과 식탁을 잇는다는 걸 알게 되면\n일이 정말 재미있어져요.\n같이 공부해요!" },
      { name: "윤채원님", role: "마케팅 · 3년 차", emoji: "",
        msg: "저도 3년 전 이 자리에 있었어요.\n지금 옆에 있는 동기들이\n앞으로 가장 든든한 힘이 될 거예요.\n오늘 함께 캡슐을 연 것처럼,\n앞으로도 서로의 단서가 되어 주세요." },
      { name: "햇반 30주년 TF 일동", role: "한햇님과 친구들", emoji: "",
        msg: "레시피북을 몰래 꺼내서 미안해요!\n30년 전 햇반도 처음엔\n'밥을 사 먹는다고?'라는 말을 들었대요.\n세상에 없던 것을 만드는 게 ONLYONE이에요.\n여러분이 만들 다음 30년이 정말 기대돼요." }
    ],
    letterPrompt: "이 레시피북은 다시 캡슐에 넣어\n2053년, 창립 100주년에 열어요.\n그날의 CJ제일제당에게 한 줄을 남겨 주세요.",
    letterDrop: "다 쓴 편지를 끌어서 캡슐에 넣어 주세요.\n편지를 눌러도 넣을 수 있어요.",
    certTitle: "ONLYONE 레시피 수료증"
  }
};
