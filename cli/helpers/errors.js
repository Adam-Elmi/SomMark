// ###################
// Print an error and stop
// ###################

import { reportError } from "./report.js";

export const cliError = (error) => {
	reportError(typeof error === "string" ? { message: error } : error);
	process.exit(1);
};
