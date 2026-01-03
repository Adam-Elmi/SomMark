function peek(input, index, offset) {
  if (input === null || index < 0 || offset < -index) {
    return null;
  }
  if (index + offset < input.length) {
    if (input[index + offset] !== undefined) {
      return input[index + offset];
    }
  }
  return null;
};

export default peek;
