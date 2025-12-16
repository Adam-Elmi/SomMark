function peek(input, index, offset) {
  if (index + offset < input.length) {
    if (input[index + offset] !== undefined) {
      return input[index + offset];
    }
  }
  return null;
};

export default peek;
