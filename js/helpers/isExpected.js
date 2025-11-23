export default function isExpected(stack, expected_tokens) {
  let _is = false;
  let count_tokens = 0;

  if (stack.length === expected_tokens.length) {
    for (let i = 0; i < stack.length; i++) {
      if (stack[i] === expected_tokens[i]) {
        count_tokens++;
      } else {
        break;
      }
    }
  }
  if (expected_tokens.length === count_tokens) {
    _is = true;
  } else {
    _is = false;
  }
  return _is;
}
