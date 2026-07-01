export class AsyncLocalStorage {
  #store = undefined;
  run(store, fn) {
    const prev = this.#store;
    this.#store = store;
    try { return fn(); }
    finally { this.#store = prev; }
  }
  getStore() { return this.#store; }
  exit(fn) { return fn(); }
  enterWith(store) { this.#store = store; }
  disable() {}
}

export class AsyncResource {
  static bind(fn) { return fn; }
  bind(fn) { return fn; }
  runInAsyncScope(fn) { return fn(); }
}