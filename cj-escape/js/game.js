/* ONLYONE 레시피를 찾아라: 게임 엔진 v2 (안내 팝업 + 마우스 모션) */
(function () {
  "use strict";

  const C = window.GAME;
  const G = C.guides;
  const KEY = "cj-escape-v2";
  const STEPS = ["prologue", "room1", "room2", "room3", "room4", "room5", "act2", "act3", "ending"];
  const STEP_LABEL = ["프롤로그", "로비", "회의실", "키친", "연구소", "라운지", "추리", "캡슐", "엔딩"];
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const main = $("#main");
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ═════════ 상태 ═════════ */
  function fresh() {
    return {
      team: "", name: "", start: null, end: null, penalty: 0, hintsUsed: 0,
      scene: "start", solved: {}, items: [], hintLv: {}, wrong: {}, lockUntil: {},
      puzzle: {}, role: null, act3Step: 0, act2: { q: {}, done: false, twist: 0 },
      endingStage: 0, letter: "", demo: false, seen: {}, enterAt: {}, alarmOff: false
    };
  }
  let S = load() || fresh();
  function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 저장 실패해도 진행 */ } }

  /* ═════════ 글자 처리: 의미 단위 줄바꿈 ═════════ */
  // "\n" → 줄바꿈, 숫자+단위+조사는 한 덩어리로 묶어 중간에서 안 끊기게
  const UNIT = /(\+?\d[\d,.:]*\s?(?:주년|년|월|일|시|분|초|개|명|번|대|%|자리|자|원|회|위|층|기|호|종|억|조원|조|만|단계|인 \d+조)(?:에서|부터|까지|[을를이가은는의에도로와과만])?)/g;
  // 고유명사도 한 덩어리로 (CJ제일제당, CJ블로썸파크, 식품·BIO …)
  const NOUN = /((?:CJ|K-)[가-힣A-Za-z]+(?:[을를이가은는의에도로와과]|에서|으로)?|식품·BIO|정직 · 열정 · 창의 · 존중|인재 · ONLYONE · 상생)/g;
  const guardText = (t) => t.replace(UNIT, '<span class="nw">$1</span>')
    .split(/(<[^>]+>)/).map((p) => (p.startsWith("<") ? p : p.replace(NOUN, '<span class="nw">$1</span>'))).join("");

  // 디스플레이용 (가운데 정렬 3줄 이하): "\n"은 직접 줄바꿈
  function fix(s) {
    if (s == null) return "";
    return String(s)
      .split(/(<[^>]+>)/)
      .map((part) => (part.startsWith("<") ? part : guardText(part)))
      .join("")
      .replace(/\n/g, "<br>");
  }
  // 본문용: 직접 넣은 줄바꿈은 무시하고 너비에 맞춰 자연스럽게 감기게 (의미 단위 묶음은 유지)
  const body = (s) => fix(s == null ? "" : String(s).replace(/\s*\n\s*/g, " "));
  const lines = (arr) => arr.map((l) => `<span class="ln">${fix(l)}</span>`).join("");

  // 아이콘: 콘텐츠의 "ti-…" 값을 선 아이콘으로
  const ic = (v) => (v && String(v).startsWith("ti-") ? `<i class="ti ${v}" aria-hidden="true"></i>` : (v || ""));
  // 이름 첫 글자 아바타 (사람)
  const initial = (name) => `<span class="av-initial" aria-hidden="true">${esc(String(name).trim().charAt(0))}</span>`;

  // 말풍선: 화자 이름은 위에 따로, 따옴표 없이, 안은 왼쪽 정렬 + 자동 줄바꿈
  function say(who, text) {
    const sp = (C.speakers && C.speakers[who]) || { emoji: "ti-message-circle", kind: "person" };
    return `<div class="say say-${sp.kind}">
      <p class="say-who"><span class="say-av" aria-hidden="true">${ic(sp.emoji)}</span>${esc(who)}</p>
      <p class="say-body">${body(text)}</p></div>`;
  }
  // 스토리 장면: 문자열이면 가운데 내레이션(직접 줄바꿈), {who, text}면 말풍선
  const beat = (b, cls = "") => (typeof b === "string" ? `<p class="line ${cls}">${fix(b)}</p>` : `<div class="${cls}">${say(b.who, b.text)}</div>`);

  /* ═════════ 유틸 ═════════ */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function norm(s) { return String(s).normalize("NFC").replace(/\s+/g, "").toUpperCase(); }
  function hash(s) {
    let h = 0x811c9dc5;
    for (const ch of norm(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, "0");
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  }
  function elapsed() { return S.start ? ((S.end || Date.now()) - S.start) / 1000 + S.penalty : 0; }
  function hasItem(id) { return S.items.some((i) => i.id === id); }
  function addItem(it) { if (it && !hasItem(it.id)) S.items.push(it); }
  function pz(id, init) { if (!S.puzzle[id]) S.puzzle[id] = init(); return S.puzzle[id]; }

  function toast(msg, kind = "", ms = 2600) {
    const t = document.createElement("div");
    t.className = "toast " + kind;
    t.innerHTML = fix(msg);
    $("#toasts").appendChild(t);
    setTimeout(() => t.classList.add("out"), ms);
    setTimeout(() => t.remove(), ms + 500);
  }
  function shake(el) { if (!el) return; el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
  function pop(el) { if (!el) return; el.classList.remove("bounce"); void el.offsetWidth; el.classList.add("bounce"); }

  // 포인터 잡기 (지원 안 되는 환경에서도 멈추지 않게)
  function capture(el, e) { try { el.setPointerCapture(e.pointerId); } catch (err) { /* 무시 */ } }

  /* ═════════ 포커스 가두기 (팝업 안에서만 Tab 이동) ═════════ */
  function trapFocus(box, e) {
    if (e.key !== "Tab") return;
    const f = $$("button, input, textarea, [tabindex]:not([tabindex='-1'])", box).filter((x) => !x.disabled && x.offsetParent);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ═════════ 일반 모달 (단서 보기) ═════════ */
  function openModal(title, html, onOpen) {
    $("#modal-title").innerHTML = fix(title);
    $("#modal-body").innerHTML = html;
    $("#modal").hidden = false;
    $("#modal-close").focus();
    if (onOpen) onOpen($("#modal-body"));
  }
  function closeModal() { $("#modal").hidden = true; }
  $("#modal-close").addEventListener("click", closeModal);
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
  $("#modal").addEventListener("keydown", (e) => trapFocus($(".modal-box"), e));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#modal").hidden) closeModal(); });

  /* ═════════════════════════════════════════
   *  안내 팝업
   * ═════════════════════════════════════════ */
  let guideOpen = false;

  // 카드 여러 장 또는 한 장짜리 안내. 닫히면 Promise가 풀림
  function guideCards(cards, { done = "알겠어요", warn = false, strict = false } = {}) {
    return new Promise((resolve) => {
      const wrap = $("#guide"), box = $("#guide-box");
      let i = 0;
      guideOpen = true;
      const close = () => {
        wrap.hidden = true; guideOpen = false;
        document.removeEventListener("keydown", onKey);
        resolve();
      };
      const draw = () => {
        const c = cards[i], lastCard = i === cards.length - 1;
        box.className = "guide-box" + (warn ? " warn" : "");
        box.innerHTML = `
          <div class="g-icon">${ic(c.icon)}</div>
          <h3 class="g-title">${fix(c.title)}</h3>
          <p class="g-lines">${lines(c.lines)}</p>
          ${cards.length > 1 ? `<div class="g-dots">${cards.map((_, k) => `<span class="${k === i ? "on" : ""}"></span>`).join("")}</div>` : ""}
          <div class="g-actions">
            ${i > 0 ? `<button class="btn" id="g-prev">이전</button>` : ""}
            <button class="btn primary" id="g-next">${lastCard ? done : "다음"}</button>
          </div>`;
        $("#g-next").onclick = () => { if (lastCard) close(); else { i++; draw(); } };
        const p = $("#g-prev"); if (p) p.onclick = () => { i--; draw(); };
        $("#g-next").focus();
      };
      const onKey = (e) => {
        trapFocus(box, e);
        if (e.key === "Escape" && !strict) close();
      };
      wrap.onclick = (e) => { if (e.target === wrap && !strict) close(); };
      document.addEventListener("keydown", onKey);
      wrap.hidden = false;
      draw();
    });
  }

  // 처음 한 번만 자동으로 띄우기
  async function guideOnce(id, cards, opts) {
    if (S.seen[id]) return;
    S.seen[id] = true; save();
    await guideCards(cards, opts);
  }

  /* ── ② 화면 사용법: 스포트라이트 ── */
  function coach() {
    return new Promise(async (resolve) => {
      const wrap = $("#coach"), hole = $("#coach-hole"), tip = $("#coach-tip");
      const steps = G.coach.filter((s) => $(s.target));
      let i = 0;
      guideOpen = true;
      const finish = () => { wrap.hidden = true; guideOpen = false; window.removeEventListener("resize", place); resolve(); };
      const place = () => {
        const el = $(steps[i].target);
        if (!el) return;
        const r = el.getBoundingClientRect(), pad = 8;
        const L = r.left - pad, T = r.top - pad, W = r.width + pad * 2, H = r.height + pad * 2;
        Object.assign(hole.style, { left: L + "px", top: T + "px", width: W + "px", height: H + "px" });
        // 구멍 주변을 어둡게 덮는 사각형 4개 (위·아래·왼쪽·오른쪽)
        const [s1, s2, s3, s4] = $$(".c-shade", wrap);
        Object.assign(s1.style, { left: 0, top: 0, width: "100vw", height: Math.max(0, T) + "px" });
        Object.assign(s2.style, { left: 0, top: T + H + "px", width: "100vw", height: `calc(100vh - ${T + H}px)` });
        Object.assign(s3.style, { left: 0, top: T + "px", width: Math.max(0, L) + "px", height: H + "px" });
        Object.assign(s4.style, { left: L + W + "px", top: T + "px", width: `calc(100vw - ${L + W}px)`, height: H + "px" });
        const below = r.bottom + 180 < innerHeight;
        tip.style.left = Math.min(Math.max(12, r.left), innerWidth - tip.offsetWidth - 12) + "px";
        tip.style.top = (below ? r.bottom + 16 : Math.max(12, r.top - tip.offsetHeight - 16)) + "px";
      };
      const show = async () => {
        const el = $(steps[i].target);
        el.scrollIntoView({ block: "center", behavior: REDUCED ? "auto" : "smooth" });
        await sleep(REDUCED ? 0 : 350);
        const last = i === steps.length - 1;
        tip.innerHTML = `
          <p class="c-step">${i + 1} / ${steps.length}</p>
          <p class="c-text">${fix(steps[i].text)}</p>
          <div class="g-actions">
            <button class="btn small" id="c-skip">건너뛰기</button>
            <button class="btn primary small" id="c-next">${last ? "시작!" : "다음"}</button>
          </div>`;
        place();
        $("#c-next").onclick = () => { if (last) finish(); else { i++; show(); } };
        $("#c-skip").onclick = finish;
        $("#c-next").focus();
      };
      window.addEventListener("resize", place);
      wrap.hidden = false;
      show();
    });
  }

  /* ── ④ 조작법 시연: 손 모양 말풍선 ── */
  function demo(host, id, force) {
    const d = G.demos[id];
    if (!host || !d) return;
    if (!force && S.seen["demo-" + id]) return;
    if (!force && guideOpen) return; // 팝업이 떠 있으면 다음 기회에
    S.seen["demo-" + id] = true; save();
    $$(".demo-bubble", host).forEach((b) => b.remove());
    const b = document.createElement("div");
    b.className = "demo-bubble";
    b.innerHTML = `<span class="hand h-${d.kind}">${d.kind === "hold" || d.kind === "tap" ? '<i class="ti ti-hand-finger" aria-hidden="true"></i>' : '<i class="ti ti-hand-grab" aria-hidden="true"></i>'}</span><span>${fix(d.text)}</span>`;
    host.classList.add("has-demo");
    host.prepend(b);
    const kill = () => { b.classList.add("out"); setTimeout(() => b.remove(), 300); host.removeEventListener("pointerdown", kill); };
    host.addEventListener("pointerdown", kill);
    setTimeout(kill, 3800);
  }

  /* ── ⑥ 막힘 도움 ── */
  setInterval(() => {
    const sc = S.scene;
    if (!(sc.startsWith("room") || sc === "act2" || sc === "act3")) return;
    if (S.solved[sc] || S.seen["stuck-" + sc] || !S.enterAt[sc]) return;
    if (Date.now() - S.enterAt[sc] < 7 * 60 * 1000) return;
    S.seen["stuck-" + sc] = true; save();
    const n = $("#nudge");
    n.innerHTML = `<p>${lines(G.stuck)}</p><button class="x" aria-label="닫기"><i class="ti ti-x" aria-hidden="true"></i></button>`;
    n.hidden = false;
    $(".x", n).onclick = () => (n.hidden = true);
    setTimeout(() => (n.hidden = true), 12000);
  }, 15000);

  /* ── 장면에 들어갈 때 안내 순서 ── */
  async function sceneGuides() {
    const sc = S.scene;
    if (!S.enterAt[sc]) { S.enterAt[sc] = Date.now(); save(); }
    if (sc === "room1") {
      await guideOnce("act1", [G.acts.act1], { done: "시작하기" });
      if (!S.seen.coach) { S.seen.coach = true; save(); await coach(); }
    }
    if (sc === "act2") await guideOnce("act2", [G.acts.act2], { done: "시작하기" });
    if (sc === "act3" && !S.role) await guideOnce("act3", [G.acts.act3], { done: "시작하기" });
    runDemos();
  }
  // 지금 화면에 있는 조작법 시연을 띄움
  function runDemos(force) {
    const targets = $$("[data-demo]", main).filter((el) => el.offsetParent);
    if (force) { targets.forEach((el) => demo(el, el.dataset.demo, true)); return; }
    // 아직 안 본 조작법 중 화면 맨 위의 것 하나만
    const next = targets.find((el) => !S.seen["demo-" + el.dataset.demo]);
    if (next) demo(next, next.dataset.demo);
  }

  /* ═════════════════════════════════════════
   *  모션 엔진
   * ═════════════════════════════════════════ */

  /* ── 드래그 앤 드롭: 잡기 → 끌기(고스트) → 드롭 존 강조 → 스냅 / 스냅백 ──
   * opts.item: 끌 수 있는 요소, opts.zone: 놓을 수 있는 곳
   * opts.drop(itemEl, zoneEl) → "ok" | "bad"
   * opts.tap(itemEl): 끌지 않고 눌렀을 때 (클릭 대안)
   * opts.zoneTap(zoneEl): 놓을 곳을 눌렀을 때 (클릭 대안)
   */
  function dnd(root, opts) {
    $$(opts.item, root).forEach((el) => {
      el.classList.add("draggable");
      $$("img", el).forEach((im) => (im.draggable = false));
      el.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        const start = { x: e.clientX, y: e.clientY };
        const r = el.getBoundingClientRect();
        const off = { x: e.clientX - r.left, y: e.clientY - r.top };
        let ghost = null, over = null;
        const move = (ev) => {
          if (!ghost) {
            if (Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 6) return;
            ghost = el.cloneNode(true);
            ghost.classList.add("drag-ghost");
            Object.assign(ghost.style, { width: r.width + "px", height: r.height + "px" });
            document.body.appendChild(ghost);
            el.classList.add("dragging");
            document.body.classList.add("grabbing");
            $$(opts.zone, root).forEach((z) => z.classList.add("can-drop"));
          }
          ev.preventDefault();
          ghost.style.transform = `translate(${ev.clientX - off.x}px, ${ev.clientY - off.y}px) rotate(3deg) scale(1.05)`;
          const hit = document.elementFromPoint(ev.clientX, ev.clientY);
          const z = hit && hit.closest(opts.zone);
          const zz = z && root.contains(z) && z !== el ? z : null;
          if (zz !== over) { over && over.classList.remove("over"); zz && zz.classList.add("over"); over = zz; }
        };
        const up = () => {
          removeEventListener("pointermove", move);
          removeEventListener("pointerup", up);
          removeEventListener("pointercancel", up);
          document.body.classList.remove("grabbing");
          el.classList.remove("dragging");
          $$(opts.zone, root).forEach((z) => z.classList.remove("can-drop", "over"));
          if (!ghost) { opts.tap && opts.tap(el); return; }
          const target = over;
          const res = target ? opts.drop(el, target) : "none";
          if (res === "ok") {
            const zr = target.getBoundingClientRect();
            flyGhost(ghost, zr.left + zr.width / 2 - r.width / 2, zr.top + zr.height / 2 - r.height / 2, true);
          } else {
            flyGhost(ghost, r.left, r.top, false);
            if (res === "bad") shake(target);
          }
        };
        addEventListener("pointermove", move, { passive: false });
        addEventListener("pointerup", up);
        addEventListener("pointercancel", up);
      });
      // 키보드(Enter/Space)로 누른 경우
      el.addEventListener("click", (e) => { if (e.detail === 0 && opts.tap) opts.tap(el); });
    });
    if (opts.zoneTap) $$(opts.zone, root).forEach((z) => z.addEventListener("click", () => opts.zoneTap(z)));
  }
  function flyGhost(ghost, x, y, ok) {
    if (REDUCED) { ghost.remove(); return; }
    ghost.style.transition = "transform .25s ease, opacity .25s ease";
    ghost.style.transform = `translate(${x}px, ${y}px) scale(${ok ? 0.5 : 1})`;
    ghost.style.opacity = ok ? "0" : "0.2";
    setTimeout(() => ghost.remove(), 260);
  }

  /* ── 길게 누르기: 원형 게이지가 다 차면 실행 ── */
  function longPress(btn, ms, done) {
    let t0 = 0, raf = 0;
    const stop = (reset = true) => {
      cancelAnimationFrame(raf); t0 = 0; btn.classList.remove("holding");
      if (reset) btn.style.setProperty("--p", 0);
    };
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / ms);
      btn.style.setProperty("--p", p);
      if (p >= 1) { stop(false); done(); } else raf = requestAnimationFrame(step);
    };
    const start = (e) => {
      if (t0 || btn.disabled) return;
      e.preventDefault();
      t0 = performance.now(); btn.classList.add("holding");
      raf = requestAnimationFrame(step);
    };
    btn.addEventListener("pointerdown", start);
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, () => { if (t0) stop(); }));
    btn.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) start(e); });
    btn.addEventListener("keyup", (e) => { if ((e.key === "Enter" || e.key === " ") && t0) stop(); });
    btn.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  const holdBtn = (label, cls = "") =>
    `<button class="btn hold ${cls}"><span class="ring"></span><span class="hold-label">${label}</span></button>`;

  /* ── 다이얼: 위아래로 끌기 · 휠 · ▲▼ · 방향키 ── */
  function dialLock(box, n, onTry) {
    const vals = Array(n).fill(0);
    box.innerHTML = `
      <div class="dials">${vals.map((_, i) => `
        <div class="dial" data-i="${i}" tabindex="0" role="spinbutton" aria-label="${i + 1}번째 숫자" aria-valuemin="0" aria-valuemax="9" aria-valuenow="0">
          <button class="d-up" tabindex="-1" aria-hidden="true">▲</button>
          <div class="d-win"><span class="d-prev">9</span><b class="d-cur">0</b><span class="d-next">1</span></div>
          <button class="d-down" tabindex="-1" aria-hidden="true">▼</button>
        </div>`).join("")}</div>
      <button class="btn primary" id="dial-go">열기</button>`;
    const set = (i, v) => {
      vals[i] = (v + 10) % 10;
      const d = $(`.dial[data-i="${i}"]`, box);
      $(".d-cur", d).textContent = vals[i];
      $(".d-prev", d).textContent = (vals[i] + 9) % 10;
      $(".d-next", d).textContent = (vals[i] + 1) % 10;
      d.setAttribute("aria-valuenow", vals[i]);
      d.classList.remove("tick"); void d.offsetWidth; d.classList.add("tick");
    };
    $$(".dial", box).forEach((d) => {
      const i = +d.dataset.i;
      $(".d-up", d).onclick = () => set(i, vals[i] + 1);
      $(".d-down", d).onclick = () => set(i, vals[i] - 1);
      d.addEventListener("wheel", (e) => { e.preventDefault(); set(i, vals[i] + (e.deltaY < 0 ? 1 : -1)); }, { passive: false });
      d.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") { e.preventDefault(); set(i, vals[i] + 1); }
        if (e.key === "ArrowDown") { e.preventDefault(); set(i, vals[i] - 1); }
        if (e.key === "Enter") tryIt();
      });
      const win = $(".d-win", d);
      win.addEventListener("pointerdown", (e) => {
        let last = e.clientY;
        capture(win, e);
        d.classList.add("turning");
        const mv = (ev) => {
          const dy = ev.clientY - last;
          if (Math.abs(dy) >= 22) { set(i, vals[i] + (dy < 0 ? 1 : -1)); last = ev.clientY; }
        };
        const upf = () => { d.classList.remove("turning"); win.removeEventListener("pointermove", mv); win.removeEventListener("pointerup", upf); };
        win.addEventListener("pointermove", mv);
        win.addEventListener("pointerup", upf);
      });
    });
    const tryIt = () => onTry(vals.join(""));
    $("#dial-go", box).onclick = tryIt;
  }

  /* ── 핀 누르기 ── */
  function pinLock(box, count, pick, onTry) {
    let seq = [];
    const draw = () => {
      box.innerHTML = `
        <div class="pinboard">${Array.from({ length: count }, (_, k) => k + 1).map((n) =>
          `<button class="pin ${seq.includes(n) ? "on" : ""}" data-pin="${n}" aria-label="${n}번 핀"><span class="pin-in"><b>${n}</b>${seq.includes(n) ? `<small>${seq.indexOf(n) + 1}번째</small>` : ""}</span></button>`).join("")}</div>
        <div class="row"><button class="btn small" id="pin-reset">다시 고르기</button><button class="btn primary" id="pin-go" ${seq.length < pick ? "disabled" : ""}>열기</button></div>`;
      $$("[data-pin]", box).forEach((b) => (b.onclick = () => {
        const n = +b.dataset.pin;
        if (seq.includes(n) || seq.length >= pick) return;
        seq.push(n); draw(); pop($(`[data-pin="${n}"]`, box));
      }));
      $("#pin-reset", box).onclick = () => { seq = []; draw(); };
      $("#pin-go", box).onclick = () => { const ok = onTry(seq.join("")); if (!ok) { seq = []; draw(); } };
    };
    draw();
  }

  /* ── 단어 조각 끼우기 ── */
  function pieceLock(box, lock, onTry) {
    const st = { slots: Array(lock.slots).fill(null), bank: shuffle(lock.pieces.map((_, i) => i)), sel: null };
    const draw = () => {
      const slotHtml = st.slots.map((p, i) =>
        `<button class="pslot ${p !== null ? "filled" : ""}" data-slot="${i}">${p !== null ? lock.pieces[p] : "&nbsp;"}</button>`).join(", ");
      box.innerHTML = `
        <p class="sentence">${fix(lock.before)}${slotHtml}${fix(lock.after)}</p>
        <div class="bank" data-demo="pieces">${st.bank.filter((p) => !st.slots.includes(p)).map((p) =>
          `<button class="piece ${st.sel === p ? "sel" : ""}" data-piece="${p}"><i class="ti ti-puzzle" aria-hidden="true"></i> ${lock.pieces[p]}</button>`).join("")}</div>
        <p class="alt-hint center"><i class="ti ti-hand-click" aria-hidden="true"></i>${body("끌기가 어려우면 조각을 누른 뒤 빈칸을 누르세요.")}</p>
        <div class="row"><button class="btn primary" id="piece-go" ${st.slots.includes(null) ? "disabled" : ""}>열기</button></div>`;
      const put = (p, slot) => {
        const prev = st.slots.indexOf(p); if (prev >= 0) st.slots[prev] = null;
        st.slots[slot] = p; st.sel = null; draw(); pop($(`[data-slot="${slot}"]`, box));
      };
      dnd(box, {
        item: "[data-piece]", zone: "[data-slot]",
        drop: (el, z) => { put(+el.dataset.piece, +z.dataset.slot); return "ok"; },
        tap: (el) => { st.sel = +el.dataset.piece; draw(); },
        zoneTap: (z) => {
          const i = +z.dataset.slot;
          if (st.sel !== null) put(st.sel, i);
          else if (st.slots[i] !== null) { st.slots[i] = null; draw(); }
        }
      });
      $("#piece-go", box).onclick = () => onTry(st.slots.map((p) => lock.pieces[p]).join(""));
    };
    draw();
  }

  /* ── 돋보기 (현미경) ── */
  function magnifier(box, html) {
    box.innerHTML = `
      <p class="note">${body("렌즈를 움직여\n흐릿한 슬라이드를 들여다보세요.")}</p>
      <div class="scope">
        <div class="sr-only">${body(html)}</div>
        <div class="slide blur" aria-hidden="true">${fix(html)}</div>
        <div class="slide sharp" aria-hidden="true">${fix(html)}</div>
        <div class="lens"></div>
      </div>`;
    const scope = $(".scope", box), sharp = $(".sharp", box), lens = $(".lens", box);
    const R = 70;
    const at = (x, y) => {
      sharp.style.clipPath = `circle(${R}px at ${x}px ${y}px)`;
      lens.style.transform = `translate(${x - R}px, ${y - R}px)`;
    };
    const mv = (e) => { const r = scope.getBoundingClientRect(); at(e.clientX - r.left, e.clientY - r.top); };
    scope.addEventListener("pointermove", mv);
    scope.addEventListener("pointerdown", mv);
    requestAnimationFrame(() => at(scope.clientWidth / 2, scope.clientHeight / 2));
  }

  /* ── 손전등 (보안실) ── */
  function flashlight(box, html, note) {
    box.innerHTML = `<p class="note">${body(note)}</p><div class="darkroom">${html}<div class="torch" aria-hidden="true"></div></div>`;
    const room = $(".darkroom", box), torch = $(".torch", box);
    const mv = (e) => {
      const r = room.getBoundingClientRect();
      torch.style.setProperty("--x", e.clientX - r.left + "px");
      torch.style.setProperty("--y", e.clientY - r.top + "px");
    };
    room.addEventListener("pointermove", mv);
    room.addEventListener("pointerdown", mv);
  }

  /* ── 문지르기 (화이트보드) ── */
  function scratch(box, onReveal) {
    const cv = $("canvas", box);
    const r = box.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    const x = cv.getContext("2d");
    x.scale(dpr, dpr);
    x.fillStyle = "#D9DEE2"; x.fillRect(0, 0, r.width, r.height);
    x.strokeStyle = "#B7BEC4"; x.lineWidth = 14; x.lineCap = "round";
    for (let k = 0; k < 7; k++) { x.beginPath(); x.moveTo(10, 14 + k * 13); x.bezierCurveTo(r.width * .3, k * 9, r.width * .6, 30 + k * 12, r.width - 10, 10 + k * 14); x.stroke(); }
    x.globalCompositeOperation = "destination-out";
    let drawing = false, rubbed = 0, done = false;
    const rub = (e) => {
      if (!drawing) return;
      const b = cv.getBoundingClientRect();
      x.beginPath(); x.arc(e.clientX - b.left, e.clientY - b.top, 22, 0, Math.PI * 2); x.fill();
      rubbed++;
      if (rubbed > 45 && !done) { done = true; cv.classList.add("clear"); onReveal(); }
    };
    cv.addEventListener("pointerdown", (e) => { drawing = true; capture(cv, e); rub(e); });
    cv.addEventListener("pointermove", rub);
    cv.addEventListener("pointerup", () => (drawing = false));
  }

  /* ── 슬라이드 열기 ── */
  function slideOpen(box, label, onOpen) {
    box.innerHTML = `<div class="slider" role="slider" tabindex="0" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <span class="s-label">${label} →</span><span class="s-fill"></span><button class="s-knob" tabindex="-1" aria-hidden="true"><i class="ti ti-chevrons-right" aria-hidden="true"></i></button></div>`;
    const track = $(".slider", box), knob = $(".s-knob", box), fill = $(".s-fill", box);
    let p = 0, opened = false;
    const setP = (v, anim) => {
      p = Math.max(0, Math.min(1, v));
      const max = track.clientWidth - knob.offsetWidth - 8;
      knob.style.transition = fill.style.transition = anim ? "all .3s" : "none";
      knob.style.transform = `translateX(${p * max}px)`;
      fill.style.width = `${p * max + knob.offsetWidth / 2 + 4}px`;
      track.setAttribute("aria-valuenow", Math.round(p * 100));
      if (p >= 0.95 && !opened) { opened = true; track.classList.add("done"); onOpen(); }
    };
    knob.addEventListener("pointerdown", (e) => {
      capture(knob, e);
      const x0 = e.clientX, p0 = p, max = track.clientWidth - knob.offsetWidth - 8;
      const mv = (ev) => setP(p0 + (ev.clientX - x0) / max);
      const upf = () => { knob.removeEventListener("pointermove", mv); knob.removeEventListener("pointerup", upf); if (!opened) setP(0, true); };
      knob.addEventListener("pointermove", mv);
      knob.addEventListener("pointerup", upf);
    });
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") setP(p + 0.25, true);
      if (e.key === "ArrowLeft") setP(p - 0.25, true);
      if (e.key === "Enter" || e.key === "End") setP(1, true);
    });
    setP(0);
  }

  /* ═════════ 헤더 · 힌트 · 메뉴 ═════════ */
  function hintKey() {
    if (S.scene.startsWith("room")) return S.scene;
    if (S.scene === "act2" && !S.act2.done) return "act2";
    if (S.scene === "act3" && S.role && S.act3Step < C.act3.locks.length) return "act3-" + S.act3Step;
    return null;
  }
  function hintList(key) {
    if (!key) return null;
    if (key.startsWith("room")) return C.rooms.find((r) => r.id === key).hints;
    if (key === "act2") return C.act2.hints;
    return C.act3.locks[+key.split("-")[1]].hints;
  }
  function renderHeader() {
    const inGame = S.scene !== "start";
    $("#hud").hidden = !inGame;
    $("#progress").hidden = !inGame;
    if (!inGame) { $("#items").innerHTML = ""; return; }
    const idx = STEPS.indexOf(S.scene);
    $("#progress").innerHTML = STEPS.map((s, i) =>
      `<li class="${i < idx ? "done" : i === idx ? "now" : ""}" ${i === idx ? "aria-current=\"step\"" : ""}><span>${STEP_LABEL[i]}</span></li>`).join("");
    $("#items").innerHTML = S.items.map((i) => `<span class="item">${ic(i.icon)} ${esc(i.label)}</span>`).join("");
    const key = hintKey();
    $("#hint-btn").disabled = !key || !!S.solved[key];
    tick();
  }
  function tick() {
    $("#timer").textContent = fmt(elapsed());
    $("#penalty").textContent = S.penalty ? `(벌점 +${fmt(S.penalty)})` : "";
  }
  setInterval(tick, 1000);

  $("#hint-btn").addEventListener("click", () => {
    const key = hintKey(), list = hintList(key);
    if (!list) return;
    const show = () => {
      const lv = S.hintLv[key] || 0;
      let html = lv ? "" : `<p>${body("막혔나요?\n힌트를 열면 기록에 벌점 시간이 더해져요.")}</p>`;
      for (let i = 0; i < lv; i++) html += `<div class="hint"><b>힌트 ${i + 1}</b><span>${body(list[i])}</span></div>`;
      if (lv < list.length) {
        const cost = C.hintPenalty[lv] / 60;
        html += `<button class="btn primary" id="more-hint">${lv === list.length - 1 ? "정답 보기" : `힌트 ${lv + 1} 보기`} <span class="nw">(+${cost}분)</span></button>`;
      } else html += `<p class="note">모든 힌트를 열었어요.</p>`;
      $("#modal-body").innerHTML = html;
      const b = $("#more-hint");
      if (b) b.onclick = () => {
        S.penalty += C.hintPenalty[S.hintLv[key] || 0];
        S.hintLv[key] = (S.hintLv[key] || 0) + 1;
        S.hintsUsed++;
        save(); tick(); show();
      };
    };
    openModal('<i class="ti ti-bulb" aria-hidden="true"></i> 힌트', "", show);
  });

  /* ── ? 다시 보기 메뉴 ── */
  $("#help-btn").addEventListener("click", () => {
    const sc = S.scene;
    const act = sc.startsWith("room") ? "act1" : sc === "act2" ? "act2" : sc === "act3" ? "act3" : null;
    const inRoom = sc.startsWith("room") && $(".objects");
    const hasDemo = $$("[data-demo]", main).some((el) => el.offsetParent);
    openModal('<i class="ti ti-help" aria-hidden="true"></i> 안내 다시 보기', `
      <div class="help-menu">
        <button class="btn" data-h="rules"><i class="ti ti-users" aria-hidden="true"></i> 팀 플레이 규칙</button>
        <button class="btn" data-h="coach" ${inRoom ? "" : "disabled"}><i class="ti ti-pointer" aria-hidden="true"></i> 화면 사용법</button>
        <button class="btn" data-h="act" ${act ? "" : "disabled"}><i class="ti ti-target" aria-hidden="true"></i> 지금 막의 목표</button>
        <button class="btn" data-h="demo" ${hasDemo ? "" : "disabled"}><i class="ti ti-hand-grab" aria-hidden="true"></i> 지금 퍼즐 조작법</button>
      </div>`, (b) => {
      $$("[data-h]", b).forEach((x) => (x.onclick = async () => {
        closeModal();
        const h = x.dataset.h;
        if (h === "rules") await guideCards(G.rules.cards, { done: "알겠어요" });
        if (h === "coach") await coach();
        if (h === "act") await guideCards([G.acts[act]]);
        if (h === "demo") runDemos(true);
      }));
    });
  });

  /* 처음부터 다시: 브라우저 기본 confirm 창은 일부 브라우저(앱 안 브라우저 등)에서 뜨지 않아 게임 안 확인 창을 쓴다 */
  function askRestart() {
    openModal('<i class="ti ti-refresh" aria-hidden="true"></i> 처음부터 다시 하기', `
      <p class="center">${fix("지금까지의 기록이 지워져요.\n처음부터 다시 할까요?")}</p>
      <div class="row">
        <button class="btn" id="r-cancel">취소</button>
        <button class="btn primary" id="r-ok">처음부터 다시</button>
      </div>`, (b) => {
      $("#r-cancel", b).onclick = closeModal;
      $("#r-ok", b).onclick = () => { S = fresh(); save(); closeModal(); render(); window.scrollTo(0, 0); };
      setTimeout(() => $("#r-cancel", b).focus(), 50);
    });
  }

  $("#menu-btn").addEventListener("click", () => {
    openModal("메뉴", `
      <p>${body("진행 상황은\n이 브라우저에 자동 저장돼요.")}</p>
      <div class="row">
        <button class="btn" id="m-restart">처음부터 다시 하기</button>
        <button class="btn primary" id="m-close">계속하기</button>
      </div>`, (b) => {
      $("#m-close", b).onclick = closeModal;
      $("#m-restart", b).onclick = askRestart;
    });
  });

  /* ═════════ 장면 전환 ═════════ */
  function go(scene) {
    S.scene = scene;
    save();
    render();
    window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
  }
  function nextScene() { go(STEPS[STEPS.indexOf(S.scene) + 1]); }

  function render() {
    document.body.classList.toggle("is-intro", S.scene === "start");
    if (S.scene !== "start" && introStop) introStop();
    renderHeader();
    const fn = { start: renderStart, prologue: renderPrologue, act2: renderAct2, act3: renderAct3, ending: renderEnding }[S.scene];
    if (fn) fn();
    else if (S.scene.startsWith("room")) renderRoom(C.rooms.find((r) => r.id === S.scene));
    if (S.scene !== "start") setTimeout(sceneGuides, 60);
  }

  /* ═════════ 시작 화면: 끌어서 30년 건너기 (왼쪽 1996 → 오른쪽 2026) ═════════ */
  let introStop = null;
  function renderStart() {
    if (introStop) introStop();
    const saved = load();
    const canResume = saved && saved.scene && saved.scene !== "start";
    const N = C.intro;
    main.innerHTML = `
      <section class="cine" id="cine">
        <div class="cine-layer then"><img src="${N.then.img}" alt="${esc(N.then.alt)}"></div>
        <div class="cine-layer now"><img src="${N.now.img}" alt="${esc(N.now.alt)}"></div>
        <div class="cine-grain" aria-hidden="true"></div><div class="cine-shade" aria-hidden="true"></div>
        <div class="cine-top">
          <div class="cine-brand"><i class="brand-mark">CJ</i>제일제당 온보딩</div>
          <div class="cine-tools">
            <button class="cine-chip" id="c-auto">${ic("ti-player-play")} 자동으로 보기</button>
            <button class="cine-chip" id="c-skip">${ic("ti-player-skip-forward")} 건너뛰기</button>
            <button class="cine-chip" id="c-jump">${ic("ti-list")} 장면 바로 가기</button>
          </div>
        </div>
        <p class="cine-year" id="c-year" aria-live="polite">1996<small id="c-sub"></small></p>
        <div class="cine-beats" aria-live="polite">${N.beats.map((b, i) =>
          `<p class="cine-beat ${i === 0 ? "on" : ""}" data-until="${b.until}">${b.lines.map((l) => `<span>${fix(l)}</span>`).join("")}</p>`).join("")}</div>
        <div class="cine-track" id="c-track">
          <div class="cine-rail"></div><div class="cine-fill"></div>
          ${[1996, 2006, 2016, 2026].map((y, k) => `<i class="cine-tick ${k % 3 === 0 ? "end" : ""}" style="left:${(k * 100) / 3}%"><span>${y}</span></i>`).join("")}
          <span class="cine-hlabel" id="c-hlabel">오른쪽으로 끌어서 30년 건너오기 ${ic("ti-arrow-right")}</span>
          <button class="cine-handle" id="c-handle" role="slider" aria-label="1996년에서 2026년으로 넘기기" aria-valuemin="1996" aria-valuemax="2026" aria-valuenow="1996">${ic("ti-chevrons-right")}</button>
        </div>
        <section class="cine-arrive" aria-label="게임 입장">
          <p class="cine-kicker">${esc(C.meta.subtitle)} · 2026</p>
          <h1 class="cine-title"><em>ONLYONE</em><br>레시피를 찾아라</h1>
          <p class="cine-punch">${N.punch}</p>
          <div class="cine-entry">
            <label>조 이름<input id="f-team" maxlength="20" placeholder="햇반 조" value="${esc(S.team)}"></label>
            <label>내 이름<input id="f-name" maxlength="20" placeholder="홍길동" value="${esc(S.name)}"></label>
            <button class="cine-go" id="b-start">${esc(N.go)} ${ic("ti-arrow-right")}</button>
            ${canResume ? `<button class="cine-resume" id="b-resume">${ic("ti-history")} 이어하기</button>` : ""}
          </div>
          <p class="cine-meta"><span>${ic("ti-clock")} 약 45분</span><span>${ic("ti-users")} 3인 1조</span><span>${ic("ti-history")} 1953년부터 70년의 역사</span></p>
        </section>
      </section>`;

    const cine = $("#cine"), handle = $("#c-handle"), track = $("#c-track"), hlabel = $("#c-hlabel");
    const yearEl = $("#c-year"), subEl = $("#c-sub"), beats = $$(".cine-beat", cine);
    let p = 0, target = 0, dragging = false, done = false, alive = true, arriveTimer = 0, autoRun = 0;

    const draw = () => {
      cine.style.setProperty("--p", p.toFixed(4));
      handle.style.left = hlabel.style.left = p * 100 + "%";
      const y = Math.round(1996 + 30 * p);
      yearEl.firstChild.nodeValue = y;
      subEl.textContent = N.yearNotes[y] || `캡슐을 묻은 지 ${y - 1996}년`;
      handle.setAttribute("aria-valuenow", y);
      const idx = beats.findIndex((b) => p < +b.dataset.until);
      beats.forEach((b, i) => b.classList.toggle("on", i === idx));
      /* 2026에 닿으면 마지막 문장을 읽을 시간을 준 뒤 입장 화면 */
      if (p >= 0.995 && !done && !arriveTimer) arriveTimer = setTimeout(arrive, REDUCED ? 0 : 2600);
      if (p < 0.99 && arriveTimer) { clearTimeout(arriveTimer); arriveTimer = 0; }
    };
    const arrive = () => {
      done = true; p = target = 1; draw(); clearTimeout(arriveTimer);
      cine.classList.add("done");
      setTimeout(() => { const f = $("#f-name"); if (f && !S.name) f.focus({ preventScroll: true }); }, 700);
    };
    const setFromX = (x) => { const r = track.getBoundingClientRect(); target = Math.max(0, Math.min(1, (x - r.left) / r.width)); };

    handle.addEventListener("pointerdown", (e) => {
      if (done) return;
      dragging = true; autoRun++; cine.classList.add("dragged"); capture(handle, e);
    });
    handle.addEventListener("pointermove", (e) => { if (dragging) setFromX(e.clientX); });
    handle.addEventListener("pointerup", () => { dragging = false; if (target > 0.8) target = 1; });
    track.addEventListener("pointerdown", (e) => {
      if (done || e.target.closest("button")) return;
      autoRun++; cine.classList.add("dragged"); setFromX(e.clientX);
    });
    handle.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { cine.classList.add("dragged"); target = Math.min(1, target + 1 / 30); }
      if (e.key === "ArrowLeft") target = Math.max(0, target - 1 / 30);
      if (e.key === "End" || e.key === "Enter") target = 1;
    });

    /* 자동으로 보기: 1996 → 2010 → 2026, 문장마다 멈춤 */
    const moveTo = (to, run) => new Promise((res) => {
      const from = target, t0 = performance.now(), dur = REDUCED ? 1 : 1800;
      const ease = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      (function step(now) {
        if (run !== autoRun || !alive) return res();
        const k = Math.min(1, (now - t0) / dur);
        target = from + (to - from) * ease(k);
        if (k < 1) requestAnimationFrame(step); else res();
      })(t0);
    });
    $("#c-auto").onclick = async () => {
      if (done) return;
      cine.classList.add("dragged");
      const run = ++autoRun;
      for (const stop of [0, 0.4667, 1]) {
        await moveTo(stop, run);
        if (run !== autoRun) return;
        if (stop < 1) await sleep(REDUCED ? 0 : 3800);
        if (run !== autoRun) return;
      }
    };
    $("#c-skip").onclick = () => { autoRun++; arrive(); };
    $("#c-jump").onclick = () => openModal(`${ic("ti-list")} 장면 바로 가기`,
      `<p class="note">${body("심사·데모용이에요. 고른 장면부터 바로 시작해요.")}</p>
       <div class="chips">${STEPS.map((s, i) => `<button class="btn small" data-jump="${s}">${STEP_LABEL[i]}</button>`).join("")}</div>`,
      (b) => $$("[data-jump]", b).forEach((x) => (x.onclick = () => { closeModal(); demoJump(x.dataset.jump); })));

    $("#b-start").onclick = async () => {
      const team = $("#f-team").value.trim(), name = $("#f-name").value.trim();
      if (!name) { shake($("#f-name")); $("#f-name").focus(); return; }
      await guideCards(G.rules.cards, { done: G.rules.done, strict: true });
      introStop();
      S = fresh(); S.team = team || "우리 조"; S.name = name; S.start = Date.now(); S.seen.rules = true;
      go("prologue");
    };
    const r = $("#b-resume");
    if (r) r.onclick = () => { introStop(); S = saved; render(); };

    (function loop() {
      if (!alive) return;
      if (!done) {
        p += (target - p) * (REDUCED ? 1 : 0.14);
        if (Math.abs(target - p) < 0.0005) p = target;
        draw();
      }
      requestAnimationFrame(loop);
    })();
    introStop = () => { alive = false; autoRun++; clearTimeout(arriveTimer); introStop = null; };
  }

  function demoJump(scene) {
    const team = ($("#f-team") || {}).value?.trim() || "", name = ($("#f-name") || {}).value?.trim() || "";
    if (introStop) introStop();
    S = fresh();
    S.team = team || "데모 조"; S.name = name || "심사위원"; S.start = Date.now(); S.demo = true;
    const idx = STEPS.indexOf(scene);
    C.rooms.forEach((r) => { if (STEPS.indexOf(r.id) < idx) { S.solved[r.id] = true; addItem(r.reward); } });
    if (idx > STEPS.indexOf("act2")) { S.act2.done = true; addItem(C.act2.reward); }
    if (scene === "ending") S.act3Step = 3;
    go(scene);
  }

  /* ═════════ 프롤로그: 길게 눌러 경보 끄기 ═════════ */
  function renderPrologue() {
    const L = C.prologue;
    let n = 1;
    main.innerHTML = `
      <section class="card story alarm" id="pro">
        <div class="siren"><i class="ti ti-alarm" aria-hidden="true"></i> SECURITY LOCKDOWN</div>
        <div id="lines"></div>
        <div class="row" id="pro-act"></div>
      </section>`;
    const draw = () => {
      $("#lines").innerHTML = L.slice(0, n).map((l, i) => beat(l, i === n - 1 ? "fade" : "")).join("");
      const act = $("#pro-act");
      if (n < L.length) {
        act.innerHTML = `<button class="btn primary big" id="b-next">다음</button>`;
        $("#b-next").onclick = () => { n++; draw(); };
      } else {
        act.innerHTML = `<div data-demo="alarm" class="demo-host">${holdBtn('<i class="ti ti-alarm" aria-hidden="true"></i> 길게 눌러 경보 끄기', "big danger")}</div>`;
        longPress($(".hold", act), 1500, () => {
          $("#pro").classList.remove("alarm"); $(".siren").innerHTML = '<i class="ti ti-bell-off" aria-hidden="true"></i> 경보 해제';
          $(".siren").classList.add("off");
          toast(C.alarmOff, "good");
          setTimeout(nextScene, 1200);
        });
        demo($(".demo-host", act), "alarm");
      }
    };
    draw();
  }

  /* ═════════ 방 ═════════ */
  function renderRoom(room) {
    const solved = !!S.solved[room.id];
    main.innerHTML = `
      <section class="room">
        <header class="room-head">
          <p class="eyebrow">1막 「70년의 DNA」 · 방 ${room.no} / ${C.rooms.length} · ${room.theme}</p>
          <h2>${room.title}</h2>
          <p>${body(room.intro)}</p>
        </header>
        <div class="objects">${room.objects.map((o, i) =>
          `<button class="obj" data-obj="${i}"><span class="obj-ic">${ic(o.icon)}</span>${o.label}</button>`).join("")}</div>
        <div class="card puzzle" id="puzzle"></div>
        <div class="card lockbox" id="lockbox"></div>
      </section>`;
    $$("[data-obj]").forEach((b) => (b.onclick = () => {
      const o = room.objects[+b.dataset.obj];
      if (o.motion === "magnifier") openModal(`${ic(o.icon)} ${o.title}`, "", (body) => magnifier(body, o.body));
      else openModal(`${ic(o.icon)} ${o.title}`, body(o.body));
    }));
    PUZZLES[room.puzzle.type](room, $("#puzzle"));
    if (solved) renderOutro(room);
    else renderLock($("#lockbox"), room.id, room.lock, () => {
      S.solved[room.id] = true;
      addItem(room.reward);
      save(); renderHeader();
      if (room.reward) toast(`${ic(room.reward.icon)} <b>${room.reward.label}</b> 획득!`, "good");
      renderOutro(room);
    });
  }

  function renderOutro(room) {
    const box = $("#lockbox");
    // 틀 A 결과 카드: 아이콘 · 제목 · 말풍선 · 버튼이 모두 가운데 한 줄 기준선
    box.innerHTML = `
      <div class="result">
        <div class="result-ic" aria-hidden="true"><i class="ti ti-lock-open" aria-hidden="true"></i></div>
        <h3 class="result-title">문이 열렸어요!</h3>
        ${say(room.outro.who, room.outro.text)}
        <button class="btn primary big" id="b-next">다음 방으로 →</button>
      </div>`;
    box.classList.add("solved");
    $("#b-next").onclick = nextScene;
  }

  /* ═════════ 자물쇠 (입력칸 · 다이얼 · 핀 · 조각) ═════════ */
  function renderLock(box, key, lock, onSolve) {
    const type = lock.type || "text";
    box.innerHTML = `
      <div class="lock">
        <div class="lock-ic"><i class="ti ti-lock" aria-hidden="true"></i></div>
        <p class="lock-label">${body(lock.prompt)}</p>
        <div class="lock-ui" ${type === "dial" ? 'data-demo="dial"' : type === "pins" ? 'data-demo="pins"' : ""}></div>
        <p class="lock-msg" id="lock-msg"></p>
      </div>`;
    const ui = $(".lock-ui", box), msg = $("#lock-msg", box);
    let timer = null;
    const lockedFor = () => Math.ceil(((S.lockUntil[key] || 0) - Date.now()) / 1000);
    const refresh = () => {
      const s = lockedFor();
      if (s > 0) {
        $$("button, input", ui).forEach((x) => { if (!x.disabled) { x.disabled = true; x.dataset.locked = "1"; } });
        msg.innerHTML = fix(`오답이 많아 잠금장치가 잠시 잠겼어요.\n${s}초 뒤에 다시 시도하세요.`);
        msg.className = "lock-msg bad";
        clearTimeout(timer); timer = setTimeout(refresh, 1000);
      } else {
        $$("[data-locked]", ui).forEach((x) => { x.disabled = false; delete x.dataset.locked; });
        if (msg.textContent.includes("잠시 잠겼")) msg.textContent = "";
      }
    };
    // 정답 확인. 맞으면 true
    const tryValue = (v) => {
      if (lockedFor() > 0 || !String(v).trim()) return false;
      if (hash(v) === lock.hash) {
        box.classList.add("unlock");
        onSolve();
        return true;
      }
      S.wrong[key] = (S.wrong[key] || 0) + 1;
      if (S.wrong[key] % C.lockout.tries === 0) S.lockUntil[key] = Date.now() + C.lockout.seconds * 1000;
      save();
      shake($(".lock", box));
      msg.textContent = "철컥… 열리지 않아요. 다시 생각해 보세요.";
      msg.className = "lock-msg bad";
      refresh();
      return false;
    };
    if (type === "dial") dialLock(ui, lock.digits, tryValue);
    else if (type === "pins") pinLock(ui, lock.pins, lock.pick, tryValue);
    else if (type === "pieces") pieceLock(ui, lock, tryValue);
    else {
      ui.innerHTML = `<div class="lock-row">
        <input id="lock-in" autocomplete="off" spellcheck="false" aria-label="${esc(lock.prompt)}" placeholder="${lock.placeholder || ""}">
        <button class="btn primary" id="lock-go">열기</button></div>`;
      const input = $("#lock-in", ui);
      const go = () => { if (!tryValue(input.value)) input.select(); };
      $("#lock-go", ui).onclick = go;
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
    }
    refresh();
  }

  /* ═════════ 퍼즐 ═════════ */
  const PUZZLES = {
    /* 방 1: 액자 끌어서 걸기 → 뒤집기 */
    timeline(room, el) {
      const P = room.puzzle, N = P.cards.length;
      const st = pz(room.id, () => ({ order: shuffle(P.cards.map((_, i) => i)), slots: Array(N).fill(null), done: false }));
      const draw = () => {
        const onWall = st.slots.filter((x) => x !== null);
        el.innerHTML = `
          <h3><i class="ti ti-photo" aria-hidden="true"></i> 역사 갤러리</h3>
          <p class="help">${body(P.help)}</p>${P.alt ? `<p class="alt-hint"><i class="ti ti-hand-click" aria-hidden="true"></i>${body(P.alt)}</p>` : ""}
          <ol class="wall">${st.slots.map((ci, i) => {
            if (ci === null) return `<li class="slot empty" data-slot="${i}"><span>${i + 1}</span></li>`;
            const c = P.cards[ci];
            return `<li class="slot" data-slot="${i}">
              <div class="frame ${st.done ? "flipped" : ""}" ${st.done ? "" : `data-card="${ci}"`}>
                <div class="f-front">${frameInner(c)}</div>
                <div class="f-back"><b>${c.letter}</b><small>${c.year}</small></div>
              </div></li>`;
          }).join("")}</ol>
          ${st.done ? `<p class="done-msg"><i class="ti ti-sparkles" aria-hidden="true"></i> ${body(P.doneText)}</p>` : `
          <p class="sub-h">바닥에 떨어진 액자</p>
          <div class="floor" data-floor="1" data-demo="frames">${st.order.filter((i) => !onWall.includes(i)).map((i) =>
            `<div class="frame pick" data-card="${i}" tabindex="0" role="button"><div class="f-front">${frameInner(P.cards[i])}</div></div>`).join("")
            || `<p class="note">${body("모든 액자를 걸었어요.\n순서가 맞지 않으면 액자를 끌어 자리를 바꿔 보세요.")}</p>`}</div>`}`;
        if (st.done) return;
        const placeAt = (ci, slot) => {
          const from = st.slots.indexOf(ci);
          if (from >= 0) st.slots[from] = st.slots[slot]; // 다른 칸 액자와 자리 바꾸기
          else if (st.slots[slot] !== null) { /* 바닥에서 온 액자가 찬 칸에 놓이면 원래 액자는 바닥으로 */ }
          st.slots[slot] = ci;
          check(slot);
        };
        dnd(el, {
          item: "[data-card]", zone: "[data-slot], [data-floor]",
          drop: (item, zone) => {
            const ci = +item.dataset.card;
            if (zone.dataset.floor) { const f = st.slots.indexOf(ci); if (f < 0) return "none"; st.slots[f] = null; save(); draw(); return "ok"; }
            placeAt(ci, +zone.dataset.slot); return "ok";
          },
          tap: (item) => {
            const ci = +item.dataset.card, f = st.slots.indexOf(ci);
            if (f >= 0) { st.slots[f] = null; save(); draw(); return; } // 벽의 액자를 누르면 바닥으로
            const empty = st.slots.indexOf(null);
            if (empty >= 0) placeAt(ci, empty);
          }
        });
        $$(".frame.pick", el).forEach((f) => f.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); f.click(); } }));
      };
      const check = (slot) => {
        save();
        if (st.slots.every((x) => x !== null)) {
          const ok = st.slots.every((ci, i) => P.cards[ci].year === P.cards[i].year);
          if (ok) { st.done = true; save(); draw(); toast("액자를 모두 제자리에 걸었어요!", "good"); return; }
          draw(); shake($(".wall", el));
          toast("순서가 맞지 않아요.\n액자를 끌어서 자리를 바꿔 보세요.", "bad");
          return;
        }
        draw();
        const s = $(`[data-slot="${slot}"]`, el); pop(s);
      };
      draw();
    },

    /* 방 2: 선 잇기 + 포스트잇 붙이기 + 문지르기 */
    values(room, el) {
      const P = room.puzzle;
      const st = pz(room.id, () => ({ sit: {}, kw: {}, sel: null, ksel: null, scratched: false }));
      // 원칙 순서를 섞어서 선이 엇갈리게 (상황 카드 순서와 같으면 너무 쉬움)
      if (!st.prOrder) {
        do { st.prOrder = shuffle(P.principles); } while (st.prOrder.some((p, k) => P.situations[k].answer === p));
        save();
      }
      const draw = () => {
        const sitDone = P.situations.every((s, i) => st.sit[i] === s.answer);
        const kwDone = P.keywords.every((k, i) => st.kw[i] === k.answer);
        el.innerHTML = `
          <h3><i class="ti ti-cards" aria-hidden="true"></i> 상황 카드와 포스트잇</h3>
          <p class="help">${body(P.help)}</p>${P.alt ? `<p class="alt-hint"><i class="ti ti-hand-click" aria-hidden="true"></i>${body(P.alt)}</p>` : ""}
          <p class="sub-h">① 이 행동은 어떤 행동원칙일까요?</p>
          <div class="connect" data-demo="connect">
            <svg class="wires"></svg>
            <div class="c-left">${P.situations.map((s, i) => `
              <button class="c-card ${st.sit[i] ? "ok" : ""} ${st.sel === i ? "sel" : ""}" data-sit="${i}" ${st.sit[i] ? "disabled" : ""}>
                <span>${body(s.text)}</span><i class="dot"></i></button>`).join("")}</div>
            <div class="c-right">${st.prOrder.map((p) => `
              <button class="c-pr" data-pr="${p}"><i class="dot"></i>${p}</button>`).join("")}</div>
          </div>
          <p class="sub-h">② 포스트잇을 핵심가치 상자에 붙이세요</p>
          <div class="notes" data-demo="postit">${P.keywords.map((k, i) => st.kw[i] ? "" :
            `<button class="postit ${st.ksel === i ? "sel" : ""}" data-kw="${i}">${k.text}</button>`).join("") || `<p class="note">포스트잇을 모두 붙였어요.</p>`}</div>
          <div class="boxes">${P.values.map((v) => `
            <div class="vbox" data-box="${v}" role="button" tabindex="0"><b>${v}</b>
              <span>${P.keywords.map((k, i) => st.kw[i] === v ? `<em>${k.text}</em>` : "").join("")}</span>
            </div>`).join("")}</div>
          ${sitDone && kwDone ? `
            <p class="done-msg"><i class="ti ti-sparkles" aria-hidden="true"></i> ${body(P.doneText)}</p>
            <div class="scratch ${st.scratched ? "revealed" : ""}" data-demo="scratch" role="img" aria-label="화이트보드의 지워진 자리: ${P.scratchHidden}">
              <span class="hidden-text">${P.scratchHidden}</span>
              ${st.scratched ? "" : "<canvas></canvas>"}
            </div>` : ""}`;
        wires();
        bindConnect();
        dnd(el, {
          item: "[data-kw]", zone: "[data-box]",
          drop: (item, z) => tryKw(+item.dataset.kw, z),
          tap: (item) => { st.ksel = +item.dataset.kw; draw(); },
          zoneTap: (z) => { if (st.ksel === null) toast("먼저 포스트잇을 고르세요."); else if (tryKw(st.ksel, z) === "bad") shake(z); }
        });
        if (sitDone && kwDone && !st.scratched) {
          const sb = $(".scratch", el);
          scratch(sb, () => { st.scratched = true; save(); setTimeout(draw, 600); });
          demo(sb, "scratch");
        }
      };
      const tryKw = (i, z) => {
        if (P.keywords[i].answer === z.dataset.box) { st.kw[i] = z.dataset.box; st.ksel = null; save(); draw(); pop($(`[data-box="${z.dataset.box}"]`, el)); return "ok"; }
        toast("이 상자가 아닌 것 같아요.", "bad"); return "bad";
      };
      const trySit = (i, p) => {
        if (P.situations[i].answer === p) { st.sit[i] = p; st.sel = null; save(); draw(); return true; }
        toast("다른 행동원칙에 더 가까워요.", "bad");
        shake($(`[data-sit="${i}"]`, el));
        return false;
      };
      // 맞힌 짝은 초록 선으로 고정
      const wires = (temp) => {
        const box = $(".connect", el), svg = $(".wires", el);
        if (!box) return;
        const b = box.getBoundingClientRect();
        svg.setAttribute("width", b.width); svg.setAttribute("height", b.height);
        const pt = (dot) => { const r = dot.getBoundingClientRect(); return [r.left + r.width / 2 - b.left, r.top + r.height / 2 - b.top]; };
        let html = "";
        P.situations.forEach((s, i) => {
          if (!st.sit[i]) return;
          const [x1, y1] = pt($(`[data-sit="${i}"] .dot`, el)), [x2, y2] = pt($(`[data-pr="${st.sit[i]}"] .dot`, el));
          html += `<path class="wire ok" d="M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}"/>`;
        });
        if (temp) html += `<path class="wire ${temp.cls}" d="M${temp.x1},${temp.y1} C${(temp.x1 + temp.x2) / 2},${temp.y1} ${(temp.x1 + temp.x2) / 2},${temp.y2} ${temp.x2},${temp.y2}"/>`;
        svg.innerHTML = html;
      };
      const bindConnect = () => {
        const box = $(".connect", el);
        $$("[data-sit]", el).forEach((card) => {
          if (card.disabled) return;
          const i = +card.dataset.sit;
          card.addEventListener("pointerdown", (e) => {
            if (e.button !== 0) return;
            const b = box.getBoundingClientRect(), d = $(".dot", card).getBoundingClientRect();
            const x1 = d.left + d.width / 2 - b.left, y1 = d.top + d.height / 2 - b.top;
            const s0 = { x: e.clientX, y: e.clientY };
            let dragging = false, over = null;
            const mv = (ev) => {
              if (!dragging && Math.hypot(ev.clientX - s0.x, ev.clientY - s0.y) < 6) return;
              dragging = true; ev.preventDefault();
              document.body.classList.add("grabbing");
              const hit = document.elementFromPoint(ev.clientX, ev.clientY);
              const pr = hit && hit.closest("[data-pr]");
              if (pr !== over) { over && over.classList.remove("over"); pr && pr.classList.add("over"); over = pr; }
              wires({ x1, y1, x2: ev.clientX - b.left, y2: ev.clientY - b.top, cls: "drawing" });
            };
            const upf = () => {
              removeEventListener("pointermove", mv); removeEventListener("pointerup", upf);
              document.body.classList.remove("grabbing");
              over && over.classList.remove("over");
              if (!dragging) { st.sel = i; draw(); return; } // 클릭 대안: 카드 고르기
              if (over && trySit(i, over.dataset.pr)) return;
              wires(); // 틀리거나 빈 곳이면 선이 끊어짐
            };
            addEventListener("pointermove", mv, { passive: false });
            addEventListener("pointerup", upf);
          });
          card.addEventListener("click", (e) => { if (e.detail === 0) { st.sel = i; draw(); } });
        });
        $$("[data-pr]", el).forEach((pr) => pr.addEventListener("click", () => {
          if (st.sel === null) { toast("먼저 왼쪽 상황 카드를 고르세요."); return; }
          trySit(st.sel, pr.dataset.pr);
        }));
        $$("[data-box]", el).forEach((z) => z.addEventListener("keydown", (e) => { if (e.key === "Enter") z.click(); }));
      };
      window.addEventListener("resize", () => { if (S.scene === room.id) wires(); });
      draw();
    },

    /* 방 3: 장바구니에 담기 */
    shelf(room, el) {
      const P = room.puzzle;
      const st = pz(room.id, () => ({ basket: [] }));
      const draw = () => {
        el.innerHTML = `
          <h3><i class="ti ti-shopping-cart" aria-hidden="true"></i> 식료품 선반</h3>
          <p class="help">${body(P.help)}</p>${P.alt ? `<p class="alt-hint"><i class="ti ti-hand-click" aria-hidden="true"></i>${body(P.alt)}</p>` : ""}
          <div class="kitchen">
            <div class="shelf">${P.items.map((it, i) => `
              <div class="product ${st.basket.includes(it.slot) ? "taken" : ""}" data-p="${i}" tabindex="0" role="button" aria-label="${it.slot}번 칸 ${it.name}">
                <img src="${it.img}" alt="${it.name}" loading="lazy">
                <span class="slotno">${it.slot}</span>
                <span class="tip">${it.name}</span>
              </div>`).join("")}</div>
            <div class="basket" data-basket="1" data-demo="basket">
              <div class="b-icon"><i class="ti ti-basket" aria-hidden="true"></i></div>
              <p class="b-title">장바구니</p>
              <ol class="b-list">${Array.from({ length: P.basketSize }, (_, k) => {
                const s = st.basket[k];
                const it = P.items.find((x) => x.slot === s);
                return s ? `<li class="b-item"><span class="b-no">${s}</span>${it.name}<button class="x" data-out="${k}" aria-label="${it.name} 빼기"><i class="ti ti-x" aria-hidden="true"></i></button></li>`
                  : `<li class="b-empty">${k + 1}번째 재료</li>`;
              }).join("")}</ol>
              <p class="b-code">칸 번호: <b>${st.basket.join(" ") || "—"}</b></p>
            </div>
          </div>`;
        dnd(el, {
          item: "[data-p]:not(.taken)", zone: "[data-basket]",
          drop: (item) => add(+item.dataset.p),
          tap: (item) => info(+item.dataset.p)
        });
        $$("[data-p].taken", el).forEach((p) => (p.onclick = () => info(+p.dataset.p)));
        $$("[data-p]", el).forEach((p) => p.addEventListener("keydown", (e) => { if (e.key === "Enter") info(+p.dataset.p); }));
        $$("[data-out]", el).forEach((b) => (b.onclick = () => { st.basket.splice(+b.dataset.out, 1); save(); draw(); }));
      };
      const add = (i) => {
        const it = P.items[i];
        if (st.basket.includes(it.slot)) return "none";
        if (st.basket.length >= P.basketSize) { toast("바구니가 가득 찼어요.\n빼고 싶은 재료의 ✕를 누르세요.", "bad"); return "bad"; }
        st.basket.push(it.slot); save(); draw(); pop($(".basket", el));
        return "ok";
      };
      const info = (i) => {
        const it = P.items[i];
        openModal(`${it.slot}번 칸 · ${it.name}`, `<img class="modal-img" src="${it.img}" alt="${it.name}"><p>${body(it.info)}</p>
          <div class="row"><button class="btn primary" id="to-basket" ${st.basket.includes(it.slot) ? "disabled" : ""}><i class="ti ti-basket" aria-hidden="true"></i> 바구니에 담기</button></div>`,
        (b) => { $("#to-basket", b).onclick = () => { closeModal(); add(i); }; });
      };
      draw();
    },

    /* 방 4: 탱크에 넣기 */
    tanks(room, el) {
      const P = room.puzzle;
      const st = pz(room.id, () => ({ order: shuffle(P.samples.map((_, i) => i)), placed: {}, sel: null }));
      const draw = () => {
        const all = P.samples.every((_, i) => st.placed[i]);
        el.innerHTML = `
          <h3><i class="ti ti-test-pipe" aria-hidden="true"></i> 발효 탱크</h3>
          <p class="help">${body(P.help)}</p>${P.alt ? `<p class="alt-hint"><i class="ti ti-hand-click" aria-hidden="true"></i>${body(P.alt)}</p>` : ""}
          <div class="tanks">${P.tanks.map((t) => {
            const inside = P.samples.filter((s, i) => st.placed[i] === t.id);
            const need = P.samples.filter((s) => s.tank === t.id).length;
            const full = inside.length === need;
            return `<div class="tank ${full ? "full" : ""}" data-tank="${t.id}" style="--c:${t.color}" role="button" tabindex="0" aria-label="${t.name} 탱크">
              <span class="liquid" style="height:${(inside.length / need) * 100}%"><i></i><i></i><i></i></span>
              <span class="tname">${t.name}</span>
              <span class="tin">${inside.map((s) => `<em>${s.name}</em>`).join("")}</span>
              ${full ? `<span class="tletter">${t.letter}</span>` : `<span class="tcount">${inside.length} / ${need}</span>`}
            </div>`;
          }).join("")}</div>
          <p class="sub-h">제품 샘플</p>
          <div class="samples" data-demo="tanks">${st.order.filter((i) => !st.placed[i]).map((i) => {
            const s = P.samples[i];
            return `<button class="sample ${st.sel === i ? "sel" : ""}" data-s="${i}">
              <img src="${s.img}" alt="${s.name}" loading="lazy"><b>${s.name}</b><small>${s.info}</small></button>`;
          }).join("")}</div>
          ${all ? `<p class="done-msg"><i class="ti ti-sparkles" aria-hidden="true"></i> ${body(P.doneText)}</p>` : ""}`;
        dnd(el, {
          item: "[data-s]", zone: "[data-tank]",
          drop: (item, z) => put(+item.dataset.s, z),
          tap: (item) => { st.sel = +item.dataset.s; draw(); $(".tanks", el).scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "nearest" }); },
          zoneTap: (z) => { if (st.sel === null) toast("먼저 제품 샘플을 고르세요."); else put(st.sel, z); }
        });
        $$("[data-tank]", el).forEach((z) => z.addEventListener("keydown", (e) => { if (e.key === "Enter") z.click(); }));
      };
      const put = (i, z) => {
        if (P.samples[i].tank === z.dataset.tank) {
          st.placed[i] = z.dataset.tank; st.sel = null; save(); draw();
          pop($(`[data-tank="${z.dataset.tank}"]`, el));
          return "ok";
        }
        z.classList.remove("reject"); void z.offsetWidth; z.classList.add("reject");
        toast("탱크에서 거품이 튀어요!\n연구실 게시판을 참고하세요.", "bad");
        return "bad";
      };
      draw();
    },

    /* 방 5: 호칭 고치기 + 용어 카드 뒤집기 */
    lounge(room, el) {
      const P = room.puzzle;
      const st = pz(room.id, () => ({ fixed: {}, flip: {}, quiz: {} }));
      const draw = () => {
        let ti = 0;
        const tokens = P.message.filter((m) => typeof m !== "string").length;
        const fixedAll = Object.keys(st.fixed).length === tokens;
        const quizAll = P.quiz.every((_, i) => st.quiz[i]);
        el.innerHTML = `
          <h3><i class="ti ti-message-circle" aria-hidden="true"></i> 메신저 초안</h3>
          <p class="help">${body(P.help)}</p>${P.alt ? `<p class="alt-hint"><i class="ti ti-hand-click" aria-hidden="true"></i>${body(P.alt)}</p>` : ""}
          <div class="chat"><div class="bubble">${P.message.map((m) => {
            if (typeof m === "string") return esc(m);
            const i = ti++;
            return st.fixed[i] ? `<span class="fixed nw">${m.right}</span>` : `<button class="wrongword nw" data-fix="${i}">${m.wrong}</button>`;
          }).join("")}</div>
          <p class="note">${fixedAll ? "✓ 호칭을 모두 고쳤어요!" : body(`어색한 호칭 ${tokens - Object.keys(st.fixed).length}개를\n눌러서 고쳐 보세요.`)}</p></div>
          <h3><i class="ti ti-cards" aria-hidden="true"></i> 신입 생존 용어 카드</h3>
          <div class="quiz cards4" data-demo="flip">${P.quiz.map((q, i) => st.flip[i] ? `
            <div class="qcard flipin ${st.quiz[i] ? "ok" : ""}">
              <p><b>Q${i + 1}.</b> ${body(q.q)}</p>
              <div class="opts">${st.quiz[i] ? `<span class="tag">✓ ${q.options[q.answer]}</span>` :
                q.options.map((o, j) => `<button class="btn small" data-q="${i}" data-a="${j}">${o}</button>`).join("")}</div>
            </div>` : `
            <button class="qcard back" data-flip="${i}"><span class="qb-no">Q${i + 1}</span><span>${fix("용어 카드\n눌러서 뒤집기")}</span></button>`).join("")}</div>
          ${fixedAll && quizAll ? `<p class="done-msg"><i class="ti ti-sparkles" aria-hidden="true"></i> ${body(P.doneText)}</p>` : ""}`;
        $$("[data-fix]", el).forEach((b) => (b.onclick = () => { st.fixed[+b.dataset.fix] = true; save(); draw(); }));
        $$("[data-flip]", el).forEach((b) => (b.onclick = () => { st.flip[+b.dataset.flip] = true; save(); draw(); }));
        $$("[data-q]", el).forEach((b) => (b.onclick = () => {
          const i = +b.dataset.q;
          if (P.quiz[i].answer === +b.dataset.a) { st.quiz[i] = true; save(); draw(); }
          else { shake(b.closest(".qcard")); toast("땡! 다시 골라 보세요.", "bad"); }
        }));
      };
      draw();
    }
  };

  function frameInner(c) {
    const pic = c.img ? `<img src="${c.img}" alt="" loading="lazy" draggable="false">` : `<span class="emoji">${ic(c.emoji || "ti-building-factory-2")}</span>`;
    return `<span class="pic">${pic}</span><span class="cap">${body(c.text)}</span>`;
  }

  /* ═════════ 2막: 손전등 + 길게 눌러 지목 ═════════ */
  function renderAct2() {
    const A = C.act2, st = S.act2;
    if (st.done) return renderTwist();
    const allQ = A.questions.every((_, i) => st.q[i]);
    main.innerHTML = `
      <section class="room">
        <header class="room-head">
          <p class="eyebrow">2막 · 증언 추리</p>
          <h2>${A.title}</h2>
          <p>${body(A.intro)}</p>
          ${A.introSay ? say(A.introSay.who, A.introSay.text) : ""}
        </header>
        <div class="objects"><button class="obj" id="evi"><span class="obj-ic">${ic(A.evidence.icon)}</span>${A.evidence.label}</button></div>
        <div class="suspects" ${allQ ? 'data-demo="accuse"' : ""}>${A.suspects.map((s, i) => `
          <article class="suspect">
            <div class="s-head"><span class="s-emoji">${ic(s.emoji)}</span><div><b>${s.name}</b><small>${s.dept}</small></div></div>
            <p>${body(s.testimony)}</p>
            ${allQ ? holdBtn('<i class="ti ti-hand-finger" aria-hidden="true"></i> 길게 눌러 지목', "small accuse").replace("<button", `<button data-accuse="${i}"`) : ""}
          </article>`).join("")}</div>
        <div class="card">
          <h3><i class="ti ti-search" aria-hidden="true"></i> 블라썸의 확인 질문</h3>
          <p class="help">${body(allQ ? "확인 질문을 모두 맞혔어요.\n이제 레시피북을 가져간 사람을 지목하세요!" : "질문 3개를 모두 맞혀야\n지목할 수 있어요.")}</p>
          <div class="quiz">${A.questions.map((q, i) => `
            <div class="qcard ${st.q[i] ? "ok" : ""}">
              <p><b>Q${i + 1}.</b> ${body(q.q)}</p>
              <div class="opts">${st.q[i] ? `<span class="tag">✓ ${q.options[q.answer]}</span>` :
                q.options.map((o, j) => `<button class="btn small" data-q="${i}" data-a="${j}">${o}</button>`).join("")}</div>
            </div>`).join("")}</div>
        </div>
      </section>`;
    $("#evi").onclick = () => openModal(`${ic(A.evidence.icon)} ${A.evidence.title}`, "", (body) =>
      flashlight(body, `<table class="tbl log"><tr><th>시각</th><th>기록</th><th>사원증</th></tr>${A.evidence.rows.map((r) =>
        `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table>`, A.evidence.note));
    $$("[data-q]").forEach((b) => (b.onclick = () => {
      const i = +b.dataset.q;
      if (A.questions[i].answer === +b.dataset.a) {
        st.q[i] = true; save(); renderAct2();
        if (A.questions.every((_, k) => st.q[k])) { toast("지목 버튼이 열렸어요!", "good"); setTimeout(() => runDemos(), 300); }
      } else { shake(b.closest(".qcard")); toast("증언과 출입 기록을 다시 확인해 보세요.", "bad"); }
    }));
    $$("[data-accuse]").forEach((b) => longPress(b, 2000, () => {
      const i = +b.dataset.accuse;
      if (i === A.culprit) {
        st.done = true; st.twist = 1; addItem(A.reward); S.solved.act2 = true; save();
        toast(`${ic(A.reward.icon)} <b>${A.reward.label}</b> 획득!`, "good");
        renderHeader(); renderTwist();
      } else {
        S.penalty += 60; save(); tick();
        b.classList.add("broken"); setTimeout(() => { b.classList.remove("broken"); b.style.setProperty("--p", 0); }, 700);
        shake(b.closest(".suspect")); toast(A.wrongText, "bad", 3500);
      }
    }));
  }

  function renderTwist() {
    const A = C.act2, st = S.act2;
    const n = Math.max(1, st.twist);
    main.innerHTML = `
      <section class="card story">
        <p class="eyebrow">2막 · 진실</p>
        <h2>레시피북을 꺼낸 사람은… 한햇님!</h2>
        <div id="lines">${A.twist.slice(0, n).map((l, i) => beat(l, i === n - 1 ? "fade" : "")).join("")}</div>
        <div class="row"><button class="btn primary big" id="b-next">${n < A.twist.length ? "다음" : "타임캡슐로 가기 →"}</button></div>
      </section>`;
    $("#b-next").onclick = () => {
      if (n < A.twist.length) { st.twist = n + 1; save(); renderTwist(); }
      else nextScene();
    };
  }

  /* ═════════ 3막 ═════════ */
  function renderAct3() {
    const T = C.act3;
    if (!S.role) return renderRoles();
    if (S.act3Step >= T.locks.length) return go("ending");
    const lock = T.locks[S.act3Step];
    const tab = S.role === "solo" ? (S.puzzle.act3tab || "A") : S.role;
    const r = T.roles;
    main.innerHTML = `
      <section class="room">
        <header class="room-head">
          <p class="eyebrow">3막 · 팀 협동 · 잠금장치 ${S.act3Step + 1} / ${T.locks.length}</p>
          <h2>${T.title}</h2>
          <div class="capsule-steps">${T.locks.map((l, i) => `<span class="${i < S.act3Step ? "done" : i === S.act3Step ? "now" : ""}">${i < S.act3Step ? '<i class="ti ti-lock-open" aria-hidden="true"></i>' : '<i class="ti ti-lock" aria-hidden="true"></i>'}</span>`).join("")}</div>
        </header>
        <div class="role-bar">
          ${S.role === "solo" ? `<span>${'<i class="ti ti-user" aria-hidden="true"></i> ' + body("혼자 하기: 세 역할의 단서를 모두 볼 수 있어요")}</span>` :
            `<span class="role-badge" style="--c:${r[S.role].color}">${ic(r[S.role].emoji)} 내 역할: ${r[S.role].name}</span>
             <span class="note">다른 단서는 조원에게 물어보세요!</span>`}
          <button class="btn small" id="b-role">역할 바꾸기</button>
        </div>
        <div class="card">
          <h3>${lock.title}</h3>
          ${S.role === "solo" ? `<div class="tabs">${["A", "B", "C"].map((k) =>
            `<button class="tab ${tab === k ? "on" : ""}" data-tab="${k}" style="--c:${r[k].color}">${ic(r[k].emoji)} ${r[k].name}</button>`).join("")}</div>` : ""}
          <div class="clue" style="--c:${r[tab].color}">${body(lock.clues[tab])}</div>
        </div>
        <div class="card lockbox" id="lockbox"></div>
      </section>`;
    $("#b-role").onclick = () => { S.role = null; save(); renderAct3(); };
    $$("[data-tab]").forEach((b) => (b.onclick = () => { S.puzzle.act3tab = b.dataset.tab; save(); renderAct3(); }));
    renderLock($("#lockbox"), "act3-" + S.act3Step, lock, () => {
      S.solved["act3-" + S.act3Step] = true;
      toast(lock.solvedText, "good");
      S.act3Step++;
      save();
      setTimeout(() => { if (S.act3Step >= T.locks.length) go("ending"); else { renderAct3(); renderHeader(); runDemos(); } }, 700);
    });
  }

  function renderRoles() {
    const T = C.act3, r = T.roles;
    main.innerHTML = `
      <section class="room">
        <header class="room-head">
          <p class="eyebrow">3막 · 팀 협동</p>
          <h2>${T.title}</h2>
          <p>${body(T.intro)}</p>
        </header>
        <div class="roles">${Object.keys(r).map((k) => `
          <button class="role" data-role="${k}" style="--c:${r[k].color}">
            <span class="r-emoji">${ic(r[k].emoji)}</span><b>${k}. ${r[k].name}</b><small>${fix("이 부문의 단서만\n볼 수 있어요")}</small>
          </button>`).join("")}
          <button class="role solo" data-role="solo"><span class="r-emoji"><i class="ti ti-user" aria-hidden="true"></i></span><b>혼자 하기</b><small>${fix("세 역할의 단서를 모두 봐요\n(자습·데모용)")}</small></button>
        </div>
        <p class="note center">${fix("조원 세 명이 각자 기기에서\n서로 다른 역할을 고르세요.\n정답은 누구의 기기에 입력해도 돼요.")}</p>
      </section>`;
    $$("[data-role]").forEach((b) => (b.onclick = async () => {
      S.role = b.dataset.role; save();
      if (S.role !== "solo") await guideOnce("roleRule", [G.roleRule], { warn: true, strict: true });
      renderAct3(); renderHeader(); runDemos();
    }));
  }

  /* ═════════ 엔딩: 밀어서 열기 → 책장 넘기기 → 편지 넣기 ═════════ */
  function renderEnding() {
    const E = C.ending;
    if (!S.end) { S.end = Date.now(); save(); }
    const stage = S.endingStage;
    const nextStage = () => { S.endingStage++; save(); renderEnding(); setTimeout(runDemos, 300); };

    if (stage === 0) {
      main.innerHTML = `<section class="card story ending">
        <div class="capsule"><i class="ti ti-lock-open" aria-hidden="true"></i></div>
        <p class="line fade">${fix(E.capsule)}</p>
        <div class="slide-wrap"></div></section>`;
      slideOpen($(".slide-wrap"), E.slideLabel, () => {
        $(".capsule").classList.add("open");
        setTimeout(nextStage, REDUCED ? 100 : 1100);
      });
    } else if (stage === 1) {
      let p = S.puzzle.page || 0;
      const draw = (dir) => {
        const pg = E.pages[p];
        main.innerHTML = `<section class="story ending">
          <p class="eyebrow center">ONLYONE RECIPE BOOK · 1953 – 2026</p>
          <div class="book">
            <article class="page ${dir ? "turn-" + dir : ""} ${pg.last ? "last" : ""}">
              <p class="p-year">${pg.year}</p>
              <h3>${fix(pg.title)}</h3>
              <p class="p-lines">${lines(pg.lines)}</p>
              <span class="p-no">${p + 1} / ${E.pages.length}</span>
              ${pg.last ? "" : `<span class="p-corner" aria-hidden="true"></span>`}
            </article>
          </div>
          <p class="note center">${fix(pg.last ? "" : "책장 모서리를 왼쪽으로 끌거나\n▶ 버튼을 눌러 넘기세요.")}</p>
          <div class="row">
            <button class="btn" id="pg-prev" ${p === 0 ? "disabled" : ""}>◀ 이전</button>
            ${pg.last ? `<button class="btn primary" id="pg-done">선배들의 메시지 보기</button>` : `<button class="btn primary" id="pg-next">다음 장 ▶</button>`}
          </div></section>`;
        const turn = (d) => { p = Math.max(0, Math.min(E.pages.length - 1, p + d)); S.puzzle.page = p; save(); draw(d > 0 ? "next" : "prev"); };
        $("#pg-prev").onclick = () => turn(-1);
        const nx = $("#pg-next"); if (nx) nx.onclick = () => turn(1);
        const dn = $("#pg-done"); if (dn) dn.onclick = nextStage;
        // 페이지 넘기기: 왼쪽으로 끌거나 스와이프
        const page = $(".page");
        page.addEventListener("pointerdown", (e) => {
          const x0 = e.clientX;
          capture(page, e);
          const mv = (ev) => { const dx = Math.min(0, ev.clientX - x0); page.style.transform = `perspective(900px) rotateY(${Math.max(-40, dx / 6)}deg)`; };
          const upf = (ev) => {
            page.removeEventListener("pointermove", mv); page.removeEventListener("pointerup", upf);
            const dx = ev.clientX - x0;
            page.style.transform = "";
            if (dx < -60 && !E.pages[p].last) turn(1);
            else if (dx > 60 && p > 0) turn(-1);
          };
          page.addEventListener("pointermove", mv);
          page.addEventListener("pointerup", upf);
        });
      };
      draw();
    } else if (stage === 2) {
      main.innerHTML = `<section class="room">
        <header class="room-head"><p class="eyebrow">타임캡슐 속 편지</p><h2>${fix("먼저 입사한 선배들이\n남긴 메시지")}</h2>
        <p class="note">※ 포트폴리오용으로 지어낸 가상 인물의 메시지예요.</p></header>
        <div class="letters">${E.seniors.map((s) => `
          <article class="letter"><div class="s-head"><span class="s-emoji">${s.emoji ? ic(s.emoji) : initial(s.name)}</span><div><b>${s.name}</b><small>${s.role}</small></div></div>
          <p>${body(s.msg)}</p></article>`).join("")}</div>
        <div class="row"><button class="btn primary big" id="b-next">나도 메시지 남기기</button></div></section>`;
      $("#b-next").onclick = nextStage;
    } else if (stage === 3) {
      main.innerHTML = `<section class="card story ending">
        <h2><i class="ti ti-pencil" aria-hidden="true"></i> 100주년에게 보내는 편지</h2>
        <p>${fix(E.letterPrompt)}</p>
        <textarea id="letter" maxlength="80" rows="3" placeholder="예: 세계 모든 식탁에서 K-Food를 만나고 있기를!">${esc(S.letter)}</textarea>
        <p class="note"><span id="cnt">${S.letter.length}</span> / 80자</p>
        <div class="post">
          <div class="envelope" data-env="1" tabindex="0" role="button" aria-label="편지를 캡슐에 넣기"><i class="ti ti-mail" aria-hidden="true"></i><small>내 편지</small></div>
          <span class="arrow">→</span>
          <div class="capsule-zone" data-capzone="1" data-demo="drop"><i class="ti ti-archive" aria-hidden="true"></i><small>타임캡슐</small></div>
        </div>
        <p class="note">${fix(E.letterDrop)}</p></section>`;
      const ta = $("#letter");
      ta.addEventListener("input", () => { $("#cnt").textContent = ta.value.length; S.letter = ta.value; save(); });
      const send = () => {
        const v = ta.value.trim();
        if (!v) { shake(ta); ta.focus(); toast("편지를 먼저 써 주세요."); return "bad"; }
        S.letter = v; save();
        $(".capsule-zone").classList.add("sealed");
        setTimeout(nextStage, REDUCED ? 100 : 900);
        return "ok";
      };
      dnd($(".post"), { item: "[data-env]", zone: "[data-capzone]", drop: () => send(), tap: () => send() });
      $(".envelope").addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
    } else renderCert();
  }

  function renderCert() {
    main.innerHTML = `
      <section class="card story ending">
        <h2><i class="ti ti-confetti" aria-hidden="true"></i> 탈출 성공!</h2>
        <div class="stats">
          <div><small>최종 기록</small><b>${fmt(elapsed())}</b></div>
          <div><small>힌트 사용</small><b>${S.hintsUsed}회</b></div>
          <div><small>벌점 시간</small><b>${fmt(S.penalty)}</b></div>
        </div>
        <canvas id="cert" width="1200" height="850" aria-label="수료증"></canvas>
        <div class="row">
          <button class="btn primary big" id="b-dl">수료증 이미지 저장</button>
          <button class="btn big" id="b-again">처음부터 다시</button>
        </div>
      </section>`;
    drawCert($("#cert"));
    $("#b-dl").onclick = () => {
      const a = document.createElement("a");
      a.download = `ONLYONE_수료증_${S.name}.png`;
      a.href = $("#cert").toDataURL("image/png");
      a.click();
    };
    $("#b-again").onclick = askRestart;
  }

  function drawCert(cv) {
    const x = cv.getContext("2d"), W = cv.width, H = cv.height;
    const font = getComputedStyle(document.body).fontFamily;
    const tfont = getComputedStyle(document.documentElement).getPropertyValue("--font-title").trim() || font; // 수료증 제목은 CJ 제목 서체
    x.fillStyle = "#FFFDF8"; x.fillRect(0, 0, W, H);
    x.strokeStyle = "#E8392B"; x.lineWidth = 10; x.strokeRect(30, 30, W - 60, H - 60);
    x.strokeStyle = "#F39200"; x.lineWidth = 3; x.strokeRect(52, 52, W - 104, H - 104);
    const petal = (cx, cy, r, color, rot) => {
      x.save(); x.translate(cx, cy); x.rotate(rot); x.fillStyle = color;
      x.beginPath(); x.ellipse(0, -r, r * 0.55, r, 0, 0, Math.PI * 2); x.fill(); x.restore();
    };
    petal(W / 2 - 22, 130, 26, "#E8392B", -0.6);
    petal(W / 2, 118, 26, "#F39200", 0);
    petal(W / 2 + 22, 130, 26, "#FFC20E", 0.6);
    x.textAlign = "center"; x.fillStyle = "#222";
    x.font = `700 22px ${font}`; x.fillText("CJ제일제당 신입 온보딩 방탈출", W / 2, 205);
    x.font = `800 60px ${tfont}`; x.fillText(C.ending.certTitle, W / 2, 285);
    x.font = `700 40px ${tfont}`; x.fillStyle = "#C8281C"; x.fillText(`${S.team} · ${S.name}님`, W / 2, 370);
    x.fillStyle = "#333"; x.font = `400 24px ${font}`;
    x.fillText("위 사람은 70년의 DNA를 탐험하고, 사라진 레시피북의 진실을 밝혀,", W / 2, 435);
    x.fillText("세 사업부문과 함께 햇반 30주년 타임캡슐을 열었기에 이 증서를 드립니다.", W / 2, 472);
    x.font = `700 26px ${font}`; x.fillStyle = "#222";
    x.fillText(`기록 ${fmt(elapsed())}  ·  힌트 ${S.hintsUsed}회`, W / 2, 540);
    x.fillStyle = "#FFF3E0"; x.fillRect(150, 580, W - 300, 130);
    x.fillStyle = "#F39200"; x.font = `700 20px ${font}`; x.fillText("To. 2053년 창립 100주년의 CJ제일제당", W / 2, 615);
    x.fillStyle = "#333"; x.font = `500 26px ${font}`;
    wrapText(x, `"${S.letter}"`, W / 2, 660, W - 360, 34);
    const d = new Date(S.end || Date.now());
    x.font = `400 18px ${font}`; x.fillStyle = "#777";
    x.fillText(`${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.${S.demo ? "  (데모 플레이)" : ""}`, W / 2, 765);
    x.font = `400 14px ${font}`; x.fillText("비공식 포트폴리오 · 지원자 제작", W / 2, 790);
  }
  // 수료증 편지: 띄어쓰기 단위로 줄바꿈
  function wrapText(x, text, cx, y, maxW, lh) {
    const words = text.split(" ");
    const out = []; let line = "";
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (x.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
    }
    out.push(line);
    out.slice(0, 2).forEach((l, i) => x.fillText(l, cx, y + i * lh));
  }

  /* ═════════ 시작 ═════════ */
  $("#disclaimer").innerHTML = fix(C.meta.disclaimer);
  document.title = `${C.meta.title} | ${C.meta.subtitle}`;
  render();
})();
