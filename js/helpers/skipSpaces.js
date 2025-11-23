export default function skipSpaces(input, index) {
  let str = "";
  for (let ch = index; ch < input.length; ch++) {
    const char = input[ch];
    if (char === " " || char === "\t") {
      str += char;
      continue;
    } else {
      break;
    }
  }
  return str;
}