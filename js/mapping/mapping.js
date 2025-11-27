class Mapping {
  constructor() {
    this.outputs = [];
  }
  create(id, type, output) {
    if (id && type && output) {
      if (typeof id !== "string") {
        throw new Error("argument 'id' expected to be a string");
      }
      if (typeof type !== "string") {
        throw new Error("argument 'type' expected to be a string");
      }
      if (typeof output !== "function") {
        throw new Error("argument 'output' expected to be a function");
      }
      if(type !== "block" && type !== "inline" && type !== "atblock") {
        throw new Error("Invalid type: expected type: 'block' | 'inline' | 'atblock'");
      }
      this.outputs.push({
        id,
        type,
        output,
      });
    } else {
      throw new Error("Expected arguments are not defined");
    }
  }
}

export default Mapping;
