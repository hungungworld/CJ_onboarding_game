// 자물쇠 정답 해시 만들기: node tools/hash.js 정답1 정답2 ...
// 띄어쓰기는 무시하고 영문은 대문자로 바꿔서 계산합니다 (game.js와 같은 방식).
const norm = (s) => String(s).normalize("NFC").replace(/\s+/g, "").toUpperCase();
const hash = (s) => {
  let h = 0x811c9dc5;
  for (const ch of norm(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
};
for (const a of process.argv.slice(2)) console.log(`${a}\t${hash(a)}`);
