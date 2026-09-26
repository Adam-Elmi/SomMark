// ###################
// Print an error and stop
// ###################

export const cliError = (message) => {
	console.error(message.startsWith("⚠") ? message : `✗ ${message}`);
	process.exit(1);
};
