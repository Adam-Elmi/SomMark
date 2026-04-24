import TagBuilder from "../formatter/tag.js";
import MarkdownBuilder from "../formatter/mark.js";
import escapeHTML from "../helpers/escapeHTML.js";
import { sommarkError } from "../core/errors.js";
import { matchedValue, safeArg } from "../helpers/utils.js";


/**
 * The base class for all mappers. It manages how tags and blocks are turned into final text.
 * This is used to build HTML, MDX, and other output formats.
 */
class Mapper {
	/**
	 * Sets up a new mapper with empty lists for rules and tags.
	 */
	constructor() {
		/** @type {Array<Object>} List of rules for formatting tags. */
		this.outputs = [];
		/** @type {MarkdownBuilder} Specialized builder for Markdown-related formatting. */
		this.md = new MarkdownBuilder();
		/** @type {Set<string>} A list of extra property names this mapper understands. */
		this.customProps = new Set();
		/** @type {Function} Helper that makes text safe for HTML. */
		this.escapeHTML = escapeHTML;
		/** @type {Object} Settings that change how this mapper works. */
		this.options = {};
	}

	// -- Tag Registration ---------------------------------------------------- //

	/**
	 * Registers a new tag rule. It needs a name and a function that says how to format it.
	 * 
	 * @param {string|Array<string>} id - The name of the tag (like 'Person' or ['p', 'para']).
	 * @param {Function} renderOutput - The function that formats this tag.
	 * @param {Object} [options={ escape: true }] - Settings for this tag.
	 * @param {boolean} [options.escape=true] - If true, the content will be made safe for HTML automatically.
	 */
	register(id, renderOutput, options = { escape: true }) {
		if (!id || !renderOutput) {
			throw new Error("Expected arguments are not defined");
		}

		if (typeof id !== "string" && !Array.isArray(id)) {
			throw new TypeError("argument 'id' expected to be a string or array");
		}

		if (typeof renderOutput !== "function") {
			throw new TypeError("argument 'renderOutput' expected to be a function");
		}
		
		const render = renderOutput;

		// Prevent duplicate IDs by removing any existing overlap before registering
		const ids = Array.isArray(id) ? id : [id];
		for (const singleId of ids) {
			this.removeOutput(singleId);
		}

		this.outputs.push({ id, render, options });
	}

	/**
	 * Inherits all registered outputs from one or more other mappers.
	 * Last-match-wins logic: If an output exists in multiple mappers, the one from the last mapper in the list is used.
	 * 
	 * @param {...Mapper} mappers - The mapper instances to inherit from.
	 */
	inherit(...mappers) {
		for (const mapper of mappers) {
			if (mapper && Array.isArray(mapper.outputs)) {
				for (const output of mapper.outputs) {
					const ids = Array.isArray(output.id) ? output.id : [output.id];
					for (const singleId of ids) {
						this.removeOutput(singleId);
					}
					this.outputs.push(output);
				}
			}
		}
	}

	/**
	 * Removes a specific output registration by its ID.
	 * @param {string} id - The output identifier to remove.
	 */
	removeOutput(id) {
		this.outputs = this.outputs
			.map(output => {
				if (Array.isArray(output.id)) {
					// Only remove the specific ID from the array
					const newIds = output.id.filter(singleId => singleId !== id);
					if (newIds.length === 0) return null; // Remove entire entry if no IDs left
					if (newIds.length === output.id.length) return output; // No change
					return { ...output, id: newIds }; // Return updated entry
				} else {
					return output.id === id ? null : output;
				}
			})
			.filter(Boolean); // Clean up nulls
	}

	/**
	 * Retrieves a registered output entry (render function and options) by ID.
	 * @param {string} id - The output identifier.
	 * @returns {Object|null} - The output entry or null if not found.
	 */
	get(id) {
		return matchedValue(this.outputs, id) || null;
	}

	// -- Utility Helpers ------------------------------------------------------ //

	/**
	 * Placeholder for comment rendering. Should be overridden by specific mappers.
	 * @param {string} text - The raw comment text.
	 * @returns {string} - The formatted comment string.
	 */
	comment(text) {
		return "";
	}

	/**
	 * Formats a plain text node.
	 * @param {string} text - The raw text content.
	 * @param {Object} [options] - Target options like { escape: false }.
	 * @returns {string} - The formatted text string.
	 */
	text(text, options) {
		return text;
	}

	/**
	 * Formats the content of an inline statement.
	 * @param {string} text - The raw inline content.
	 * @param {Object} options - The target output options.
	 * @returns {string} - The formatted inline string.
	 */
	inlineText(text, options) {
		return text;
	}

	/**
	 * Formats the raw body of an At-Block.
	 * @param {string} text - The raw atblock body.
	 * @param {Object} options - The target output options.
	 * @returns {string} - The formatted atblock string.
	 */
	atBlockBody(text, options) {
		return text;
	}


	/**
	 * Handles unknown tags. Should be overridden by specific mappers to provide fallback behavior.
	 * @param {Object} node - The AST node for the unknown id.
	 * @returns {Object|null} - A tag-like entry for fallback rendering.
	 */
	getUnknownTag(node) {
		return null;
	}

	/**
	 * Creates a new TagBuilder instance for programmatic HTML-like tag creation.
	 * @param {string} tagName - The name of the tag (e.g., 'div', 'p').
	 * @returns {TagBuilder}
	 */
	tag(tagName) {
		return new TagBuilder(tagName);
	}

	/**
	 * Checks if this mapper has any of the specified IDs registered.
	 * @param {Array<string>} ids - List of IDs to check for.
	 * @returns {boolean} - True if at least one ID exists.
	 */
	includesId(ids) {
		try {
			if (!Array.isArray(ids) || ids.length === 0) {
				return false;
			}

			if (!this.outputs || !Array.isArray(this.outputs)) {
				return false;
			}

			const searchSet = new Set(ids);

			for (const output of this.outputs) {
				if (!output || !output.id) {
					continue;
				}

				if (Array.isArray(output.id)) {
					if (output.id.some(id => searchSet.has(id))) {
						return true;
					}
				} else if (typeof output.id === "string" || typeof output.id === "number") {
					if (searchSet.has(output.id)) {
						return true;
					}
				}
			}

			return false;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Safely retrieves an argument value, handling both named and positional access.
	 * 
	 * @param {Object} options - Resolution options.
	 * @returns {any} - The resolved argument value.
	 */
	safeArg(options) {
		return safeArg(options);
	}

	/**
	 * Creates a deep clone of the mapper instance, isolating output registrations.
	 * Inherits all properties and binds methods to the new instance.
	 * 
	 * @returns {Mapper} - The cloned mapper instance.
	 */
	clone() {
		const newMapper = new Mapper();
		for (const [key, val] of Object.entries(this)) {
			if (key === "outputs" || key === "customProps" || key === "md") continue;

			if (typeof val === "object" && val !== null && !Array.isArray(val)) {
				newMapper[key] = { ...val };
			} else {
				newMapper[key] = val;
			}
		}

		newMapper.options = { ...this.options };

		// Deep-clone specific structural properties
		newMapper.outputs = this.outputs.map(out => ({
			...out,
			options: out.options ? { ...out.options } : { escape: true }
		}));

		newMapper.customProps = new Set(this.customProps);
		
		return newMapper;
	}

	/**
	 * Clears all registered outputs from the mapper.
	 */
	clear() {
		this.outputs = [];
	}

	/**
	 * Static factory method to create a new Mapper instance with pre-defined properties.
	 * @param {Object} [options={}] - Properties and methods to add to the mapper.
	 * @returns {Mapper}
	 */
	static define(options = {}) {
		const mapper = new Mapper();
		for (const [key, val] of Object.entries(options)) {
			mapper[key] = val;
		}
		return mapper;
	}
}
export default Mapper;
