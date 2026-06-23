/**
 * These labels identify different parts of the code (like blocks or text) 
 * so the system knows how to handle them.
 */
export const BLOCK = "Block",
	TEXT = "Text",
	COMMENT = "Comment",
	COMMENT_BLOCK = "CommentBlock",
	IMPORT = "Import",
	USE_MODULE = "$use-module",
	SLOT = "Slot",
	STATIC_LOGIC = "StaticLogic",
	RUNTIME_LOGIC = "RuntimeLogic",
	FOR_EACH = "ForEach";

/**
 * Names for symbols used to separate parts of the code (like commas and colons).
 */
export const BLOCKCOMMA = "Block-comma",
	BLOCKCOLON = "Block-colon";

/**
 * These names are used in error messages to tell you exactly which part 
 * of your code has a mistake.
 */
export const block_id = "Block Identifier",
	block_value = "Block Value",
	block_key = "Block Key",
	block_end = "Block end",
	/** Reserved keyword for closing blocks */
	end_keyword = "end",
	slot_keyword = "slot",
	for_each_keyword = "for-each";
