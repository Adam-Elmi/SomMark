function concat(input, index, mode = "normal", stop_at_char = [], scope_state) {
  let str = "";
  for (let char_index = index; char_index < input.length; char_index++) {
    let char = input[char_index];
    if (mode === "normal") {
      if (char === "\n") {
        break;
      } else if (char === "[" && scope_state === false) {
        break;
      } else if (char === "(" && scope_state === false) {
        break;
      }
      str += char;
    } else if (mode === "active") {
      if (stop_at_char.includes(char)) {
        break;
      }
      str += char;
    } else if(mode === "skip") {
      
    }
  }

  return str;
}

export default concat;