function concat(input, index, exclude_stop_char = true, stop_at_char = [], scope_state) {
  let str = "";
  for (let char_index = index; char_index < input.length; char_index++) {
    let char = input[char_index];
    if (exclude_stop_char) {
      if (char === "\n") {
        break;
      } else if (char === "[" && scope_state === false) {
        break;
      } else if (char === "(" && scope_state === false) {
        break;
      }
      str += char;
    } else {
      if (stop_at_char.includes(char)) {
        break;
      }
      str += char;
    }
  }

  return str;
}

export default concat;