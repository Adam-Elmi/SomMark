// ###################
// EvaluatorError on its own, so the browser page can use it without the evaluator
// ###################

export class EvaluatorError extends Error {
	constructor(message, source, position, cause) {
		const where = position ? `${source}:${position.line + 1}:${position.character + 1}` : source;
		super(`${where}  ${message}`, { cause });
		this.name = "EvaluatorError";
		this.source = source;
		this.position = position;
	}
}
