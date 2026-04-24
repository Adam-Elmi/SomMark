/**
 * These labels identify different parts of the code (like blocks or text) 
 * so the system knows how to handle them.
 */
export const BLOCK = "Block",
	TEXT = "Text",
	INLINE = "Inline",
	ATBLOCK = "AtBlock",
	COMMENT = "Comment",
	IMPORT = "Import",
	USE_MODULE = "$use-module";

/**
 * Names for symbols used to separate parts of the code (like commas and colons).
 */
export const SEMICOLON = "Semicolon",
	BLOCKCOMMA = "Block-comma",
	ATBLOCKCOMMA = "Atblock-comma",
	INLINECOMMA = "Inline-comma",
	BLOCKCOLON = "Block-colon",
	ATBLOCKCOLON = "Atblock-colon",
	INLINECOLON = "Inline-colon";

/**
 * These names are used in error messages to tell you exactly which part 
 * of your code has a mistake.
 */
export const block_id = "Block Identifier",
	block_value = "Block Value",
	block_key = "Block Key",
	block_end = "Block end",
	inline_id = "Inline Identifier",
	inline_text = "Inline Text",
	at_id = "At Identifier",
	at_value = "At Value",
	atblock_key = "AtBlock Key",
	at_end = "Atblock End",
	/** Reserved keyword for closing blocks */
	end_keyword = "end";
