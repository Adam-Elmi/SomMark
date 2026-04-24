/**
 * A safe parser that turns Javascript-like strings into real objects and arrays.
 * It is built to handle data structures without running any dangerous code or
 * accessing other parts of your project.
 * 
 * It supports: 
 * - Standard JSON: {"key": "val"}
 * - Javascript-style: { key: 'val' }
 * - Basic data: true, false, null, numbers, and strings
 */
export function safeDataParse(str) {
    if (typeof str !== "string") return str;
    const s = str.trim();
    if (!s) return null;

    let index = 0;

    function skipWhitespace() {
        while (index < s.length && /\s/.test(s[index])) {
            index++;
        }
    }

    function parseValue() {
        skipWhitespace();
        const char = s[index];

        if (char === '{') return parseObject();
        if (char === '[') return parseArray();
        if (char === '"' || char === "'") return parseString();
        
        // Primitives or Unquoted identifiers
        return parsePrimitiveOrIdentifier();
    }

    function parseString() {
        const quote = s[index++];
        let result = "";
        while (index < s.length && s[index] !== quote) {
            if (s[index] === '\\') index++; // Skip escape
            result += s[index++];
        }
        index++; // Skip closing quote
        return result;
    }

    function parseObject() {
        index++; // Skip {
        const obj = {};
        skipWhitespace();

        while (index < s.length && s[index] !== '}') {
            skipWhitespace();
            // Key can be unquoted, quoted "key", or quoted 'key'
            let key;
            if (s[index] === '"' || s[index] === "'") {
                key = parseString();
            } else {
                let keyMatch = s.slice(index).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
                if (!keyMatch) break;
                key = keyMatch[0];
                index += key.length;
            }

            skipWhitespace();
            if (s[index] !== ':') break;
            index++; // Skip :

            obj[key] = parseValue();

            skipWhitespace();
            if (s[index] === ',') index++; // Skip optional comma
            skipWhitespace();
        }
        index++; // Skip }
        return obj;
    }

    function parseArray() {
        index++; // Skip [
        const arr = [];
        skipWhitespace();

        while (index < s.length && s[index] !== ']') {
            arr.push(parseValue());
            skipWhitespace();
            if (s[index] === ',') index++; // Skip optional comma
            skipWhitespace();
        }
        index++; // Skip ]
        return arr;
    }

    function parsePrimitiveOrIdentifier() {
        const start = index;
        while (index < s.length && /[a-zA-Z0-9_$+\-.]/.test(s[index])) {
            index++;
        }
        const token = s.slice(start, index);
        
        if (token === "true") return true;
        if (token === "false") return false;
        if (token === "null") return null;
        if (!isNaN(Number(token))) return Number(token);
        
        return token; // Fallback to string if it looks like an identifier
    }

    try {
        return parseValue();
    } catch (e) {
        return str; // Fallback to raw string if parsing fails
    }
}
