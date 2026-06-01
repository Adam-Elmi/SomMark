// Premium, dependency-free interactive terminal spinner for compilation feedback
const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
let spinnerIndex = 0;
let activeSpinner = null;
let spinnerDepth = 0;

let originalStdoutWrite = null;
let originalStderrWrite = null;
let redrawTimeout = null;

export function startSpinner() {
	if (process.stdout.isTTY && !activeSpinner) {
		// Hide terminal cursor for a clean premium visual feel
		process.stdout.write("\x1b[?25l");

		// Print the first frame immediately
		const frame = spinnerFrames[spinnerIndex];
		process.stdout.write(`\r\x1b[38;5;39m${frame}\x1b[0m \x1b[1mSomMark:\x1b[0m \x1b[38;5;208mCompiling template...\x1b[0m`);
		spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;

		// Intercept stdout and stderr writes to keep the spinner on the very bottom line
		originalStdoutWrite = process.stdout.write;
		process.stdout.write = function(chunk, encoding, callback) {
			originalStdoutWrite.call(process.stdout, "\r\x1b[K");
			const res = originalStdoutWrite.call(process.stdout, chunk, encoding, callback);
			if (activeSpinner) {
				if (redrawTimeout) clearTimeout(redrawTimeout);
				redrawTimeout = setTimeout(() => {
					if (activeSpinner && originalStdoutWrite) {
						const f = spinnerFrames[spinnerIndex];
						originalStdoutWrite.call(process.stdout, `\r\x1b[38;5;39m${f}\x1b[0m \x1b[1mSomMark:\x1b[0m \x1b[38;5;208mCompiling template...\x1b[0m`);
					}
				}, 0);
			}
			return res;
		};

		originalStderrWrite = process.stderr.write;
		process.stderr.write = function(chunk, encoding, callback) {
			if (originalStdoutWrite) {
				originalStdoutWrite.call(process.stdout, "\r\x1b[K");
			}
			const res = originalStderrWrite.call(process.stderr, chunk, encoding, callback);
			if (activeSpinner) {
				if (redrawTimeout) clearTimeout(redrawTimeout);
				redrawTimeout = setTimeout(() => {
					if (activeSpinner && originalStdoutWrite) {
						const f = spinnerFrames[spinnerIndex];
						originalStdoutWrite.call(process.stdout, `\r\x1b[38;5;39m${f}\x1b[0m \x1b[1mSomMark:\x1b[0m \x1b[38;5;208mCompiling template...\x1b[0m`);
					}
				}, 0);
			}
			return res;
		};

		activeSpinner = setInterval(() => {
			const frame = spinnerFrames[spinnerIndex];
			if (originalStdoutWrite) {
				originalStdoutWrite.call(process.stdout, `\r\x1b[38;5;39m${frame}\x1b[0m \x1b[1mSomMark:\x1b[0m \x1b[38;5;208mCompiling template...\x1b[0m`);
			} else {
				process.stdout.write(`\r\x1b[38;5;39m${frame}\x1b[0m \x1b[1mSomMark:\x1b[0m \x1b[38;5;208mCompiling template...\x1b[0m`);
			}
			spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
		}, 80);
	}
	spinnerDepth++;
}

export function stopSpinner() {
	spinnerDepth--;
	if (spinnerDepth <= 0) {
		spinnerDepth = 0;
		if (activeSpinner) {
			clearInterval(activeSpinner);
			activeSpinner = null;

			// Restore original writes
			if (originalStdoutWrite) {
				process.stdout.write = originalStdoutWrite;
				originalStdoutWrite = null;
			}
			if (originalStderrWrite) {
				process.stderr.write = originalStderrWrite;
				originalStderrWrite = null;
			}

			// Clear the spinner line and restore the terminal cursor
			process.stdout.write("\r\x1b[K\x1b[?25h");
		}
	}
}
