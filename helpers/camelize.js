const camelize = str => str.replace(/-./g, x => x[1].toUpperCase());
export default camelize;
