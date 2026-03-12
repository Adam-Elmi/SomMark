const kebabize = str => str.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
export default kebabize;
