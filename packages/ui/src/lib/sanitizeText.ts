// 화면에는 보이지 않지만 문자열 길이(String.length)에는 포함되는 제어 문자들.
// 외부 문서나 웹에서 텍스트를 복사해 붙여넣으면 ZWNJ(200C), ZWSP(200B), BOM(FEFF)
// 등이 섞여 들어와 눈에 보이는 글자 수와 실제 저장되는 길이가 어긋난다.
// 정규식 리터럴에 직접 적어 두면 코드에서도 보이지 않아 유지보수가 어려우므로
// 코드 포인트로 명시한다.
const INVISIBLE_CODE_POINTS = new Set([
  0x00ad, // soft hyphen
  0x180e, // mongolian vowel separator
  0xfeff, // zero width no-break space (BOM)
]);

// 0x200d(ZWJ)는 이모지 결합(👨‍👩‍👧 등)에 쓰이므로 제거 대상에서 뺀다.
const INVISIBLE_CODE_RANGES: readonly [number, number][] = [
  [0x200b, 0x200c], // zero width space, zero width non-joiner
  [0x200e, 0x200f], // left-to-right mark, right-to-left mark
  [0x202a, 0x202e], // bidi embedding / override
  [0x2060, 0x2064], // word joiner ~ invisible plus
  [0x206a, 0x206f], // deprecated format characters
];

function isInvisibleChar(char: string) {
  const code = char.codePointAt(0);
  if (code === undefined) return false;
  if (INVISIBLE_CODE_POINTS.has(code)) return true;
  return INVISIBLE_CODE_RANGES.some(
    ([start, end]) => code >= start && code <= end,
  );
}

// 보이지 않는 제어 문자를 제거해 화면 글자 수와 실제 문자열 길이를 일치시킨다.
// Array.from 으로 코드 포인트 단위 순회 — 이모지 같은 서로게이트 쌍은 깨지지 않는다.
export function stripInvisibleChars(value: string) {
  return Array.from(value)
    .filter((char) => !isInvisibleChar(char))
    .join("");
}
