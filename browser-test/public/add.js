// Used for testing
export function add(...numbers) { 
  if (Array.isArray(numbers)) {
    return numbers.reduce((intialValue, currentValue) => {
      return intialValue + currentValue;
    }, 0)
  }
}