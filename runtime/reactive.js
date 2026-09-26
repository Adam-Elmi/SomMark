// ###################
// arcmoon/reactive: signals for runtime code, built on alien-signals
// ###################

import { effect as baseEffect } from "alien-signals";

export { signal, computed } from "alien-signals";

// ###################
// Only a returned function is kept as cleanup
// ###################
export const effect = (fn) =>
	baseEffect(() => {
		const result = fn();
		return typeof result === "function" ? result : undefined;
	});
