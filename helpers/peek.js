/**
 * Looks at an item in a list or string without moving your current position.
 * You can look ahead or behind by using a positive or negative offset.
 * 
 * @param {Array|string} input - The list or string to check.
 * @param {number} index - Your current spot in the list.
 * @param {number} offset - How many spots to look ahead or behind.
 * @returns {any|null} - The item you found, or null if it is out of range.
 */
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
