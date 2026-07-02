let _lazyMatch = () => { var __lib__=(()=>{var m=Object.defineProperty,V=Object.getOwnPropertyDescriptor,G=Object.getOwnPropertyNames,T=Object.prototype.hasOwnProperty,q=(r,e)=>{for(var n in e)m(r,n,{get:e[n],enumerable:true});},H=(r,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of G(e))!T.call(r,t)&&t!==n&&m(r,t,{get:()=>e[t],enumerable:!(a=V(e,t))||a.enumerable});return r},J=r=>H(m({},"__esModule",{value:true}),r),w={};q(w,{default:()=>re});var A=r=>Array.isArray(r),d=r=>typeof r=="function",Q=r=>r.length===0,W=r=>typeof r=="number",K=r=>typeof r=="object"&&r!==null,X=r=>r instanceof RegExp,b=r=>typeof r=="string",h=r=>r===void 0,Y=r=>{const e=new Map;return n=>{const a=e.get(n);if(a)return a;const t=r(n);return e.set(n,t),t}},rr=(r,e,n={})=>{const a={cache:{},input:r,index:0,indexMax:0,options:n,output:[]};if(v(e)(a)&&a.index===r.length)return a.output;throw new Error(`Failed to parse at index ${a.indexMax}`)},i=(r,e)=>A(r)?er(r,e):b(r)?ar(r,e):nr(r,e),er=(r,e)=>{const n={};for(const a of r){if(a.length!==1)throw new Error(`Invalid character: "${a}"`);const t=a.charCodeAt(0);n[t]=true;}return a=>{const t=a.index,o=a.input;for(;a.index<o.length&&o.charCodeAt(a.index)in n;)a.index+=1;const u=a.index;if(u>t){if(!h(e)&&!a.options.silent){const s=a.input.slice(t,u),c=d(e)?e(s,o,String(t)):e;h(c)||a.output.push(c);}a.indexMax=Math.max(a.indexMax,a.index);}return  true}},nr=(r,e)=>{const n=r.source,a=r.flags.replace(/y|$/,"y"),t=new RegExp(n,a);return g(o=>{t.lastIndex=o.index;const u=t.exec(o.input);if(u){if(!h(e)&&!o.options.silent){const s=d(e)?e(...u,o.input,String(o.index)):e;h(s)||o.output.push(s);}return o.index+=u[0].length,o.indexMax=Math.max(o.indexMax,o.index),true}else return  false})},ar=(r,e)=>n=>{if(n.input.startsWith(r,n.index)){if(!h(e)&&!n.options.silent){const t=d(e)?e(r,n.input,String(n.index)):e;h(t)||n.output.push(t);}return n.index+=r.length,n.indexMax=Math.max(n.indexMax,n.index),true}else return  false},C=(r,e,n,a)=>{const t=v(r);return g(_(M(o=>{let u=0;for(;u<n;){const s=o.index;if(!t(o)||(u+=1,o.index===s))break}return u>=e})))},tr=(r,e)=>C(r,0,1),f=(r,e)=>C(r,0,1/0),x=(r,e)=>{const n=r.map(v);return g(_(M(a=>{for(let t=0,o=n.length;t<o;t++)if(!n[t](a))return  false;return  true})))},l=(r,e)=>{const n=r.map(v);return g(_(a=>{for(let t=0,o=n.length;t<o;t++)if(n[t](a))return  true;return  false}))},M=(r,e=false)=>{const n=v(r);return a=>{const t=a.index,o=a.output.length,u=n(a);return (!u||e)&&(a.index=t,a.output.length!==o&&(a.output.length=o)),u}},_=(r,e)=>{const n=v(r);return n},g=(()=>{let r=0;return e=>{const n=v(e),a=r+=1;return t=>{var o;if(t.options.memoization===false)return n(t);const u=t.index,s=(o=t.cache)[a]||(o[a]=new Map),c=s.get(u);if(c===false)return  false;if(W(c))return t.index=c,true;if(c)return t.index=c.index,c.output?.length&&t.output.push(...c.output),true;{const Z=t.output.length;if(n(t)){const D=t.index,U=t.output.length;if(U>Z){const ee=t.output.slice(Z,U);s.set(u,{index:D,output:ee});}else s.set(u,D);return  true}else return s.set(u,false),false}}}})(),E=r=>{let e;return n=>(e||(e=v(r())),e(n))},v=Y(r=>{if(d(r))return Q(r)?E(r):r;if(b(r)||X(r))return i(r);if(A(r))return x(r);if(K(r))return l(Object.values(r));throw new Error("Invalid rule")}),P="abcdefghijklmnopqrstuvwxyz",ir=r=>{let e="";for(;r>0;){const n=(r-1)%26;e=P[n]+e,r=Math.floor((r-1)/26);}return e},O=r=>{let e=0;for(let n=0,a=r.length;n<a;n++)e=e*26+P.indexOf(r[n])+1;return e},S=(r,e)=>{if(e<r)return S(e,r);const n=[];for(;r<=e;)n.push(r++);return n},or=(r,e,n)=>S(r,e).map(a=>String(a).padStart(n,"0")),R=(r,e)=>S(O(r),O(e)).map(ir),p=r=>r,z=r=>ur(e=>rr(e,r,{memoization:false}).join("")),ur=r=>{const e={};return n=>e[n]??(e[n]=r(n))},sr=i(/^\*\*\/\*$/,".*"),cr=i(/^\*\*\/(\*)?([ a-zA-Z0-9._-]+)$/,(r,e,n)=>`.*${e?"":"(?:^|/)"}${n.replaceAll(".","\\.")}`),lr=i(/^\*\*\/(\*)?([ a-zA-Z0-9._-]*)\{([ a-zA-Z0-9._-]+(?:,[ a-zA-Z0-9._-]+)*)\}$/,(r,e,n,a)=>`.*${e?"":"(?:^|/)"}${n.replaceAll(".","\\.")}(?:${a.replaceAll(",","|").replaceAll(".","\\.")})`),y=i(/\\./,p),pr=i(/[$.*+?^(){}[\]\|]/,r=>`\\${r}`),vr=i(/./,p),hr=i(/^(?:!!)*!(.*)$/,(r,e)=>`(?!^${L(e)}$).*?`),dr=i(/^(!!)+/,""),fr=l([hr,dr]),xr=i(/\/(\*\*\/)+/,"(?:/.+/|/)"),gr=i(/^(\*\*\/)+/,"(?:^|.*/)"),mr=i(/\/(\*\*)$/,"(?:/.*|$)"),_r=i(/\*\*/,".*"),j=l([xr,gr,mr,_r]),Sr=i(/\*\/(?!\*\*\/)/,"[^/]*/"),yr=i(/\*/,"[^/]*"),N=l([Sr,yr]),k=i("?","[^/]"),$r=i("[",p),wr=i("]",p),Ar=i(/[!^]/,"^/"),br=i(/[a-z]-[a-z]|[0-9]-[0-9]/i,p),Cr=i(/[$.*+?^(){}[\|]/,r=>`\\${r}`),Mr=i(/[^\]]/,p),Er=l([y,Cr,br,Mr]),B=x([$r,tr(Ar),f(Er),wr]),Pr=i("{","(?:"),Or=i("}",")"),Rr=i(/(\d+)\.\.(\d+)/,(r,e,n)=>or(+e,+n,Math.min(e.length,n.length)).join("|")),zr=i(/([a-z]+)\.\.([a-z]+)/,(r,e,n)=>R(e,n).join("|")),jr=i(/([A-Z]+)\.\.([A-Z]+)/,(r,e,n)=>R(e.toLowerCase(),n.toLowerCase()).join("|").toUpperCase()),Nr=l([Rr,zr,jr]),I=x([Pr,Nr,Or]),kr=i("{","(?:"),Br=i("}",")"),Ir=i(",","|"),Fr=i(/[$.*+?^(){[\]\|]/,r=>`\\${r}`),Lr=i(/[^}]/,p),Zr=E(()=>F),Dr=l([j,N,k,B,I,Zr,y,Fr,Ir,Lr]),F=x([kr,f(Dr),Br]),Ur=f(l([sr,cr,lr,fr,j,N,k,B,I,F,y,pr,vr])),Vr=Ur,Gr=z(Vr),L=Gr,Tr=i(/\\./,p),qr=i(/./,p),Hr=i(/\*\*\*+/,"*"),Jr=i(/([^/{[(!])\*\*/,(r,e)=>`${e}*`),Qr=i(/(^|.)\*\*(?=[^*/)\]}])/,(r,e)=>`${e}*`),Wr=f(l([Tr,Hr,Jr,Qr,qr])),Kr=Wr,Xr=z(Kr),Yr=Xr,$=(r,e)=>{const n=Array.isArray(r)?r:[r];if(!n.length)return  false;const a=n.map($.compile),t=n.every(s=>/(\/(?:\*\*)?|\[\/\])$/.test(s)),o=e.replace(/[\\\/]+/g,"/").replace(/\/$/,t?"/":"");return a.some(s=>s.test(o))};$.compile=r=>new RegExp(`^${L(Yr(r))}$`,"s");var re=$;return J(w)})();
 return __lib__.default || __lib__; };
let _match;
const zeptomatch = (path, pattern) => {
  if (!_match) {
    _match = _lazyMatch();
    _lazyMatch = null;
  }
  return _match(path, pattern);
};

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
  if (!input) {
    return input;
  }
  return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}

const _UNC_REGEX = /^[/\\]{2}/;
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
const _ROOT_FOLDER_RE = /^\/([A-Za-z]:)?$/;
const _EXTNAME_RE = /.(\.[^./]+|\.)$/;
const _PATH_ROOT_RE = /^[/\\]|^[a-zA-Z]:[/\\]/;
const sep = "/";
const normalize = function(path) {
  if (path.length === 0) {
    return ".";
  }
  path = normalizeWindowsPath(path);
  const isUNCPath = path.match(_UNC_REGEX);
  const isPathAbsolute = isAbsolute(path);
  const trailingSeparator = path[path.length - 1] === "/";
  path = normalizeString(path, !isPathAbsolute);
  if (path.length === 0) {
    if (isPathAbsolute) {
      return "/";
    }
    return trailingSeparator ? "./" : ".";
  }
  if (trailingSeparator) {
    path += "/";
  }
  if (_DRIVE_LETTER_RE.test(path)) {
    path += "/";
  }
  if (isUNCPath) {
    if (!isPathAbsolute) {
      return `//./${path}`;
    }
    return `//${path}`;
  }
  return isPathAbsolute && !isAbsolute(path) ? `/${path}` : path;
};
const join = function(...segments) {
  let path = "";
  for (const seg of segments) {
    if (!seg) {
      continue;
    }
    if (path.length > 0) {
      const pathTrailing = path[path.length - 1] === "/";
      const segLeading = seg[0] === "/";
      const both = pathTrailing && segLeading;
      if (both) {
        path += seg.slice(1);
      } else {
        path += pathTrailing || segLeading ? seg : `/${seg}`;
      }
    } else {
      path += seg;
    }
  }
  return normalize(path);
};
function cwd() {
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    return process.cwd().replace(/\\/g, "/");
  }
  return "/";
}
const resolve = function(...arguments_) {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
    const path = index >= 0 ? arguments_[index] : cwd();
    if (!path || path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === index - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const toNamespacedPath = function(p) {
  return normalizeWindowsPath(p);
};
const extname = function(p) {
  if (p === "..") return "";
  const match = _EXTNAME_RE.exec(normalizeWindowsPath(p));
  return match && match[1] || "";
};
const relative = function(from, to) {
  const _from = resolve(from).replace(_ROOT_FOLDER_RE, "$1").split("/");
  const _to = resolve(to).replace(_ROOT_FOLDER_RE, "$1").split("/");
  if (_to[0][1] === ":" && _from[0][1] === ":" && _from[0] !== _to[0]) {
    return _to.join("/");
  }
  const _fromCopy = [..._from];
  for (const segment of _fromCopy) {
    if (_to[0] !== segment) {
      break;
    }
    _from.shift();
    _to.shift();
  }
  return [..._from.map(() => ".."), ..._to].join("/");
};
const dirname = function(p) {
  const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += "/";
  }
  return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};
const format = function(p) {
  const ext = p.ext ? p.ext.startsWith(".") ? p.ext : `.${p.ext}` : "";
  const segments = [p.root, p.dir, p.base ?? (p.name ?? "") + ext].filter(
    Boolean
  );
  return normalizeWindowsPath(
    p.root ? resolve(...segments) : segments.join("/")
  );
};
const basename = function(p, extension) {
  const segments = normalizeWindowsPath(p).split("/");
  let lastSegment = "";
  for (let i = segments.length - 1; i >= 0; i--) {
    const val = segments[i];
    if (val) {
      lastSegment = val;
      break;
    }
  }
  return extension && lastSegment.endsWith(extension) ? lastSegment.slice(0, -extension.length) : lastSegment;
};
const parse$2 = function(p) {
  const root = _PATH_ROOT_RE.exec(p)?.[0]?.replace(/\\/g, "/") || "";
  const base = basename(p);
  const extension = extname(base);
  return {
    root,
    dir: dirname(p),
    base,
    ext: extension,
    name: base.slice(0, base.length - extension.length)
  };
};
const matchesGlob = (path, pattern) => {
  return zeptomatch(pattern, normalize(path));
};

const _path = {
  __proto__: null,
  basename: basename,
  dirname: dirname,
  extname: extname,
  format: format,
  isAbsolute: isAbsolute,
  join: join,
  matchesGlob: matchesGlob,
  normalize: normalize,
  normalizeString: normalizeString,
  parse: parse$2,
  relative: relative,
  resolve: resolve,
  sep: sep,
  toNamespacedPath: toNamespacedPath
};

const delimiter = /* @__PURE__ */ (() => globalThis.process?.platform === "win32" ? ";" : ":")();
const _platforms = { posix: void 0, win32: void 0 };
const mix = (del = delimiter) => {
  return new Proxy(_path, {
    get(_, prop) {
      if (prop === "delimiter") return del;
      if (prop === "posix") return posix;
      if (prop === "win32") return win32;
      return _platforms[prop] || _path[prop];
    }
  });
};
const posix = /* @__PURE__ */ mix(":");
const win32 = /* @__PURE__ */ mix(";");

/**
 * Avoids any dependency on Node.js built-in modules (like buffer, path, stream).
 */
class VirtualFS {
    constructor(files = {}) {
        this.files = {};
        for (const [key, value] of Object.entries(files)) {
            this.files[posix.normalize(key)] = value;
        }
    }

    existsSync(p) {
        const normalized = posix.normalize(p);
        return normalized in this.files;
    }

    readFileSync(p, encoding) {
        const normalized = posix.normalize(p);
        if (normalized in this.files) {
            return this.files[normalized];
        }
        throw new Error(`File not found: ${p}`);
    }

    async exists(p) { return this.existsSync(p); }
    async readFile(p, encoding) { return this.readFileSync(p, encoding); }
}

class FetchFS {
    constructor(baseURL) {
        this.baseURL = baseURL.endsWith("/") ? baseURL : baseURL + "/";
        this._cache = new Map();
    }

    _resolve(p) {
        if (p.startsWith("http://") || p.startsWith("https://")) return p;
        return this.baseURL + p.replace(/^\//, "");
    }

    async readFile(p, encoding) {
        const url = this._resolve(p);
        if (this._cache.has(url)) return this._cache.get(url);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`File not found: ${p} (${res.status})`);
        const text = await res.text();
        this._cache.set(url, text);
        return text;
    }

    async exists(p) {
        try { await this.readFile(p); return true; }
        catch { return false; }
    }

    // Sync versions — backed by cache, only valid after readFile has been called for that path
    existsSync(p) {
        return this._cache.has(this._resolve(p));
    }

    readFileSync(p, encoding) {
        const cached = this._cache.get(this._resolve(p));
        if (cached !== undefined) return cached;
        throw new Error(`Not in cache: ${p}. Call readFile first.`);
    }
}

/**
 * Token Types in SomMark.
 * These represent the basic lexical atoms identified by the lexer.
 * 
 * @constant {Object}
 * @property {string} OPEN_BRACKET - '[' char.
 * @property {string} CLOSE_BRACKET - ']' char.
 * @property {string} END_KEYWORD - 'end' value.
 * @property {string} IDENTIFIER - Block or inline name (e.g. 'Person', 'import', '$use-module').
 * @property {string} EQUAL - '=' char.
 * @property {string} VALUE - Data values. Encapsulates Quoted Strings ("...") and Prefix Layers (p{}, v{}).
 * @property {string} TEXT - Plain unformatted text content.
 * @property {string} COLON - ':' char.
 * @property {string} COMMA - ',' char.
 * @property {string} COMMENT - '#' comments.
 * @property {string} COMMENT_BLOCK - '###' comments.
 * @property {string} ESCAPE - '\' char. Used for literalizing structural chars like '\"' or '\['.
 * @property {string} QUOTE - '"' delimiter.
 * @property {string} EXCLAMATION_MARK - '!' char.
 * @property {string} IMPORT - 'import' keyword.
 * @property {string} USE_MODULE - '$use-module' keyword.
 * @property {string} PREFIX_P - 'p{}' placeholder layer.
 * @property {string} PREFIX_V - 'v{}' local variable layer.
 * @property {string} EOF - End of File indicator.
 */
const TOKEN_TYPES = {
  OPEN_BRACKET: "OPEN_BRACKET",
  CLOSE_BRACKET: "CLOSE_BRACKET",
  END_KEYWORD: "END_KEYWORD",
  IMPORT: "IMPORT",
  USE_MODULE: "USE_MODULE",
  IDENTIFIER: "IDENTIFIER",
  EQUAL: "EQUAL",
  VALUE: "VALUE",
  QUOTE: "QUOTE",
  PREFIX_P: "PREFIX_P",
  PREFIX_V: "PREFIX_V",
  TEXT: "TEXT",
  COLON: "COLON",
  COMMA: "COMMA",
  COMMENT: "COMMENT",
  COMMENT_BLOCK: "COMMENT_BLOCK",
  ESCAPE: "ESCAPE",
  EXCLAMATION_MARK: "EXCLAMATION_MARK",
  SLOT_KEYWORD: "SLOT_KEYWORD",
  KEY: "KEY",
  WHITESPACE: "WHITESPACE",
  STATIC_KEYWORD: "STATIC_KEYWORD",
  RUNTIME_KEYWORD: "RUNTIME_KEYWORD",
  LOGIC_OPEN: "LOGIC_OPEN",
  LOGIC: "LOGIC",
  LOGIC_CLOSE: "LOGIC_CLOSE",
  FOR_EACH: "FOR_EACH",
  PREFIX_OPEN: "PREFIX_OPEN",
  PREFIX_CLOSE: "PREFIX_CLOSE",
  PIPELINE: "PIPELINE",
  EOF: "EOF"
};

/**
 * Looks at an item in a list or string without moving your current position.
 * You can look ahead or behind by using a positive or negative offset.
 * 
 * @param {Array|string} input - The list or string to check.
 * @param {number} index - Your current spot in the list.
 * @param {number} offset - How many spots to look ahead or behind.
 * @returns {any|null} - The item you found, or null if it is out of range.
 */
function peek(input, index, offset) {
  if (input === null || index < 0 || offset < -index) {
    return null;
  }
  if (index + offset < input.length) {
    if (input[index + offset] !== undefined) {
      return input[index + offset];
    }
  }
  return null;
}

/**
 * These labels identify different parts of the code (like blocks or text) 
 * so the system knows how to handle them.
 */
const BLOCK = "Block",
	TEXT$1 = "Text",
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
const BLOCKCOMMA = "Block-comma",
	BLOCKCOLON = "Block-colon";

/**
 * These names are used in error messages to tell you exactly which part 
 * of your code has a mistake.
 */
const block_id = "Block Identifier",
	block_value = "Block Value",
	block_key = "Block Key",
	block_end = "Block end",
	/** Reserved keyword for closing blocks */
	end_keyword = "end",
	slot_keyword = "slot",
	for_each_keyword = "for-each";

var labels = /*#__PURE__*/Object.freeze({
  __proto__: null,
  BLOCK: BLOCK,
  BLOCKCOLON: BLOCKCOLON,
  BLOCKCOMMA: BLOCKCOMMA,
  COMMENT: COMMENT,
  COMMENT_BLOCK: COMMENT_BLOCK,
  FOR_EACH: FOR_EACH,
  IMPORT: IMPORT,
  RUNTIME_LOGIC: RUNTIME_LOGIC,
  SLOT: SLOT,
  STATIC_LOGIC: STATIC_LOGIC,
  TEXT: TEXT$1,
  USE_MODULE: USE_MODULE,
  block_end: block_end,
  block_id: block_id,
  block_key: block_key,
  block_value: block_value,
  end_keyword: end_keyword,
  for_each_keyword: for_each_keyword,
  slot_keyword: slot_keyword
});

/**
 * SomMark Lexer
 * 
 * Transforms a raw SomMark source string into a stream of tokens.
 * It uses a state-machine approach to handle complex contexts like At-Block bodies,
 * quoted values, and hierarchical headers.
 * 
 * @param {string} src - The raw SomMark source code.
 * @param {string} [filename="anonymous"] - Source filename for error reporting.
 * @returns {Array<Object>} Array of token objects.
 */
function lexer(src, filename = "anonymous") {
	if (!src || typeof src !== "string") return [];
	const tokens = [];
	let last_non_junk_type = ""; // Tracks the last real token for context guessing
	let i = 0;
	let line = 0, character = 0;

	// State Variables
	let isInQuote = false;
	let isInHeader = false;      // Tracks if we are in a structural header context
	let isInPVPrefix = false;    // Tracks if we are scanning inside a p{} or v{} prefix
	let pendingSmarkRaw = false; // Set when KEY "smark-raw" is seen — waiting for value
	let hasSmarkRaw = false;     // Set when smark-raw: true is confirmed in header
	let isRawContent = false;    // Set when inside a smark-raw block — content collected as-is, not parsed

	/**
	 * Adds a token to the stream and updates the scanner's position tracking.
	 * 
	 * @param {string} type - The type of token (from TOKEN_TYPES).
	 * @param {string} value - The literal text content of the token.
	 */
	function addToken(type, value) {
		const start = { line, character };

		// Update position
		const parts = value.split("\n");
		if (parts.length > 1) {
			line += parts.length - 1;
			character = parts[parts.length - 1].length;
		} else {
			character += value.length;
		}

		const end = { line, character };
		tokens.push({
			type,
			value,
			source: filename,
			range: { start, end }
		});
		if (type !== TOKEN_TYPES.WHITESPACE && type !== TOKEN_TYPES.COMMENT) {
			if (type !== TOKEN_TYPES.TEXT || value.trim() !== "") {
				last_non_junk_type = type;
			}
		}
	}

	/**
	 * Looks ahead to find the next structural character, skipping whitespace and comments.
	 * Used for context-guessing (e.g., distinguishing KEY from VALUE).
	 * 
	 * @param {number} start - Index to start peeking from.
	 * @returns {string|null} The next structural character or null if EOF.
	 */
	function peekStructural(start) {
		let j = start;
		while (j < src.length) {
			const c = src[j];
			if (c === " " || c === "\t" || c === "\n" || c === "\r") {
				j++;
				continue;
			}
			if (c === "#") {
				while (j < src.length && src[j] !== "\n") j++;
				continue;
			}
			if (c === "\\") {
				// Escape sequence: jump over the backslash and the escaped char
				j += 2;
				continue;
			}
			return c;
		}
		return null;
	}

	while (i < src.length) {
		const char = src[i];
		const next = src[i + 1];

		// --- RAW CONTENT MODE ---
		// Collect everything as-is until [end] or [end:name]. \[ escapes a literal [.
		if (isRawContent) {
			let raw = "";
			while (i < src.length) {
				if (src[i] === "\\" && src[i + 1] === "[") {
					raw += "[";
					i += 2;
					continue;
				}
				if (src[i] === "[") {
					if (src.startsWith(`[${end_keyword}]`, i) || src.startsWith(`[${end_keyword}:`, i)) break;
				}
				raw += src[i];
				i++;
			}
			if (raw) addToken(TOKEN_TYPES.TEXT, raw);
			isRawContent = false;
			continue;
		}

		// --- PHASE 1.5: PV PREFIX CONTENT MODE ---
		// Handles structured content inside p{} and v{} prefixes.
		if (isInPVPrefix && !isInQuote) {
			if (char === '"' || char === "'") {
				addToken(TOKEN_TYPES.QUOTE, char);
				i++;
				isInQuote = true;
				continue;
			}
			if (char === '|') {
				addToken(TOKEN_TYPES.PIPELINE, "|");
				i++;
				continue;
			}
			if (char === '}') {
				addToken(TOKEN_TYPES.PREFIX_CLOSE, "}");
				isInPVPrefix = false;
				i++;
				continue;
			}
			if (char !== ' ' && char !== '\t' && char !== '\n' && char !== '\r') {
				let word = '';
				while (i < src.length) {
					const c = src[i];
					if (c === '}' || c === '|' || c === '"' || c === "'" || c === ' ' || c === '\t' || c === '\n' || c === '\r') break;
					word += c;
					i++;
				}
				if (word) addToken(TOKEN_TYPES.KEY, word);
				continue;
			}
			// Whitespace: fall through to PHASE 3 whitespace handling
		}

		// --- PHASE 2: QUOTE MODE ---
		// Handles balanced strings and allows prefix layers (js{}, p{}) inside them.
		if (isInQuote) {
			let quoteValue = "";
			const quoteChar = tokens[tokens.length - 1].value;
			while (i < src.length) {
				if (src[i] === "\\" && i + 1 < src.length) {
					// Inside quotes, we split escapes if we want to match reliability tests
					if (quoteValue.length > 0) addToken(TOKEN_TYPES.VALUE, quoteValue);
					addToken(TOKEN_TYPES.ESCAPE, "\\" + src[i + 1]);
					quoteValue = "";
					i += 2;
					continue;
				}

				// Support Prefix Layers inside quotes!
				if ((src[i] === "p" && src[i + 1] === "{") || (src[i] === "v" && src[i + 1] === "{")) {
					const isV = (src[i] === "v");
					if (quoteValue.length > 0) {
						addToken(TOKEN_TYPES.VALUE, quoteValue);
						quoteValue = "";
					}

					{
						// p{} or v{}: keyword + PREFIX_OPEN + unquoted key + optional PIPELINE + fallback + PREFIX_CLOSE
						addToken(isV ? TOKEN_TYPES.PREFIX_V : TOKEN_TYPES.PREFIX_P, isV ? "v" : "p");
						addToken(TOKEN_TYPES.PREFIX_OPEN, "{");
						i += 2;
						// Scan unquoted key (cannot use same quote char as outer string)
						let key = "";
						while (i < src.length && src[i] !== "|" && src[i] !== "}" && src[i] !== quoteChar) {
							key += src[i];
							i++;
						}
						if (key.trim()) addToken(TOKEN_TYPES.KEY, key.trim());
						// Optional PIPELINE + fallback
						if (i < src.length && src[i] === "|") {
							addToken(TOKEN_TYPES.PIPELINE, "|");
							i++;
							let fallback = "";
							while (i < src.length && src[i] !== "}" && src[i] !== quoteChar) {
								fallback += src[i];
								i++;
							}
							if (fallback.trim()) addToken(TOKEN_TYPES.VALUE, fallback.trim());
						}
						// PREFIX_CLOSE
						if (i < src.length && src[i] === "}") {
							addToken(TOKEN_TYPES.PREFIX_CLOSE, "}");
							i++;
						}
					}
					continue;
				}

				if (src[i] === quoteChar) {
					// Guess role based on next structural character
					let nextStructural = peekStructural(i + 1);
					let tokenType = isInHeader && (nextStructural === ":" || nextStructural === "=")
						? TOKEN_TYPES.KEY
						: TOKEN_TYPES.VALUE;

					if (quoteValue.length > 0) addToken(tokenType, quoteValue);
					if (pendingSmarkRaw && tokenType === TOKEN_TYPES.VALUE && quoteValue === "true") {
						hasSmarkRaw = true;
						pendingSmarkRaw = false;
					}
					addToken(TOKEN_TYPES.QUOTE, quoteChar);
					isInQuote = false;
					i++;
					break;
				}
				quoteValue += src[i];
				i++;
			}
			if (!isInQuote) continue;
		}

		// --- PHASE 3: STRUCTURAL PARSING ---
		// Handles markers, whitespace, and structural symbols.

		// WHITESPACE
		if (char === "\n") {
			addToken(TOKEN_TYPES.WHITESPACE, char);
			i++;
			continue;
		}

		if (char === " " || char === "\t" || char === "\r") {
			let ws = "";
			while (i < src.length && (src[i] === " " || src[i] === "\t" || src[i] === "\r")) {
				ws += src[i];
				i++;
			}
			addToken(TOKEN_TYPES.WHITESPACE, ws);
			continue;
		}

		// COMMENTS
		if (char === "#") {
			let comm = "";
			// Check for Multiline Comment ### (must have no spaces)
			if (src[i + 1] === "#" && src[i + 2] === "#") {
				comm = "###";
				i += 3;
				while (i < src.length) {
					if (src[i] === "#" && src[i + 1] === "#" && src[i + 2] === "#") {
						comm += "###";
						i += 3;
						break;
					}
					comm += src[i];
					i++;
				}
				addToken(TOKEN_TYPES.COMMENT_BLOCK, comm);
			} else {
				// Single line comment
				while (i < src.length && src[i] !== "\n") {
					comm += src[i];
					i++;
				}
				addToken(TOKEN_TYPES.COMMENT, comm);
			}
			continue;
		}

		// ESCAPE CHARACTER (Sequence-based)
		if (char === "\\") {
			const seq = i + 1 < src.length ? "\\" + src[i + 1] : "\\";
			addToken(TOKEN_TYPES.ESCAPE, seq);
			i += seq.length;
			continue;
		}

		// PREFIX LAYERS (p{...} or v{...})
		if ((char === "p" && next === "{") || (char === "v" && next === "{")) {
			const isP = (char === "p");
			const isV = (char === "v");

			// Context Check
			const isBlockHeader = isInHeader;
			const isNormalText = !isInHeader;

			let allowed = false;
			if (isP && (isBlockHeader || isNormalText)) allowed = true;
			if (isV && (isBlockHeader || isNormalText)) allowed = true;

			if (allowed) {
				// p{} or v{}: emit keyword + PREFIX_OPEN, enter structured content mode
				addToken(isV ? TOKEN_TYPES.PREFIX_V : TOKEN_TYPES.PREFIX_P, isV ? "v" : "p");
				addToken(TOKEN_TYPES.PREFIX_OPEN, "{");
				i += 2; // skip "p{" or "v{"
				isInPVPrefix = true;
				continue;
			}
			// If not allowed, it will fall through to normal word scanning
		}

		// STATIC KEYWORD
		if (char === "s" && src.slice(i, i + 6) === "static") {
			const afterStatic = src.slice(i + 6);
			const hasSpace = afterStatic.startsWith(" ");
			const hasLogic = hasSpace ? afterStatic.slice(1).startsWith("${") : afterStatic.startsWith("${");

			const isMainIdentifier = last_non_junk_type === TOKEN_TYPES.OPEN_BRACKET;

			if ((hasLogic || isInHeader) && !isMainIdentifier) {
				addToken(TOKEN_TYPES.STATIC_KEYWORD, hasSpace ? "static " : "static");
				i += hasSpace ? 7 : 6;
				continue;
			}
		}

		// RUNTIME KEYWORD
		if (char === "r" && src.slice(i, i + 7) === "runtime") {
			const afterRuntime = src.slice(i + 7);
			const hasSpace = afterRuntime.startsWith(" ");
			const hasLogic = hasSpace ? afterRuntime.slice(1).startsWith("${") : afterRuntime.startsWith("${");

			const isMainIdentifier = last_non_junk_type === TOKEN_TYPES.OPEN_BRACKET;

			if ((hasLogic || isInHeader) && !isMainIdentifier) {
				addToken(TOKEN_TYPES.RUNTIME_KEYWORD, hasSpace ? "runtime " : "runtime");
				i += hasSpace ? 8 : 7;
				continue;
			}
		}

		// LOGIC BLOCKS (${ ... }$) — explicit: static/runtime ${ }$  shorthand: ${ }$ = static ${ }$
		if (char === "$" && next === "{") {
			{
				addToken(TOKEN_TYPES.LOGIC_OPEN, "${");
				i += 2;

				let logicCode = "";
				let depth = 0;
				let internalString = null;

				while (i < src.length) {
					const c = src[i];
					const n = src[i + 1];

					// Close condition: }$ at depth 0, not followed by { (}${ is a template expression boundary)
					if (c === "}" && n === "$" && !internalString && depth === 0 && src[i + 2] !== "{") {
						break;
					}

					if (internalString) {
						if (c === "\\" && (n === internalString || n === "\\")) {
							logicCode += c + n;
							i += 2;
							continue;
						}
						if (c === internalString) internalString = null;
					} else {
						if (c === "/" && n === "/") {
							logicCode += c + n;
							i += 2;
							while (i < src.length && src[i] !== "\n" && src[i] !== "\r") {
								logicCode += src[i];
								i++;
							}
							continue;
						}
						if (c === "/" && n === "*") {
							logicCode += c + n;
							i += 2;
							while (i < src.length) {
								if (src[i] === "*" && src[i + 1] === "/") {
									logicCode += "*/";
									i += 2;
									break;
								}
								logicCode += src[i];
								i++;
							}
							continue;
						}

						if (c === "\"" || c === "'" || c === "`") internalString = c;
						else if (c === "{") depth++;
						else if (c === "}") depth--;
					}

					logicCode += c;
					i++;
				}

				addToken(TOKEN_TYPES.LOGIC, logicCode);

				if (i < src.length && src[i] === "}" && src[i + 1] === "$") {
					addToken(TOKEN_TYPES.LOGIC_CLOSE, "}$");
					i += 2;
				}

				continue;
			}
		}

		// SINGLE-CHAR MARKERS
		if (char === "[") {
			addToken(TOKEN_TYPES.OPEN_BRACKET, "[");
			isInHeader = true;
			pendingSmarkRaw = false;
			hasSmarkRaw = false;
			i++;
			continue;
		}
		if (char === "]") {
			addToken(TOKEN_TYPES.CLOSE_BRACKET, "]");
			isInHeader = false;
			if (hasSmarkRaw) {
				isRawContent = true;
				hasSmarkRaw = false;
			}
			pendingSmarkRaw = false;
			i++;
			continue;
		}
		if (char === ":") {
			const colonAllowed = [TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.KEY, TOKEN_TYPES.VALUE, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.QUOTE, TOKEN_TYPES.PREFIX_V, TOKEN_TYPES.PREFIX_P, TOKEN_TYPES.PREFIX_CLOSE, TOKEN_TYPES.IMPORT, TOKEN_TYPES.USE_MODULE, TOKEN_TYPES.END_KEYWORD, TOKEN_TYPES.TEXT, TOKEN_TYPES.LOGIC, TOKEN_TYPES.LOGIC_CLOSE, TOKEN_TYPES.STATIC_KEYWORD, TOKEN_TYPES.RUNTIME_KEYWORD, TOKEN_TYPES.FOR_EACH];
			if (colonAllowed.includes(last_non_junk_type)) {
				addToken(TOKEN_TYPES.COLON, ":");
				isInHeader = true;
			} else {
				addToken(TOKEN_TYPES.TEXT, ":");
			}
			i++;
			continue;
		}
		if (char === "=") {
			const eqAllowed = [TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.KEY, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.QUOTE, TOKEN_TYPES.PREFIX_V, TOKEN_TYPES.PREFIX_P, TOKEN_TYPES.PREFIX_CLOSE, TOKEN_TYPES.IMPORT, TOKEN_TYPES.USE_MODULE, TOKEN_TYPES.END_KEYWORD, TOKEN_TYPES.TEXT, TOKEN_TYPES.LOGIC, TOKEN_TYPES.LOGIC_CLOSE, TOKEN_TYPES.STATIC_KEYWORD, TOKEN_TYPES.RUNTIME_KEYWORD, TOKEN_TYPES.FOR_EACH];
			if (eqAllowed.includes(last_non_junk_type)) {
				addToken(TOKEN_TYPES.EQUAL, "=");
			} else {
				addToken(TOKEN_TYPES.TEXT, "=");
			}
			i++;
			continue;
		}
		if (char === ",") {
			const commaAllowed = [TOKEN_TYPES.VALUE, TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.QUOTE, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.PREFIX_V, TOKEN_TYPES.PREFIX_P, TOKEN_TYPES.PREFIX_CLOSE, TOKEN_TYPES.IMPORT, TOKEN_TYPES.USE_MODULE, TOKEN_TYPES.END_KEYWORD, TOKEN_TYPES.TEXT, TOKEN_TYPES.LOGIC, TOKEN_TYPES.LOGIC_CLOSE, TOKEN_TYPES.STATIC_KEYWORD, TOKEN_TYPES.RUNTIME_KEYWORD, TOKEN_TYPES.FOR_EACH];
			if (commaAllowed.includes(last_non_junk_type)) {
				addToken(TOKEN_TYPES.COMMA, ",");
			} else {
				addToken(TOKEN_TYPES.TEXT, ",");
			}
			i++;
			continue;
		}
		if (char === "!") {
			if (isInHeader) {
				addToken(TOKEN_TYPES.EXCLAMATION_MARK, "!");
				i++;
				continue;
			}
		}
		if (char === "\"" || char === "'") {
			const valTriggers = [TOKEN_TYPES.COLON, TOKEN_TYPES.EQUAL, TOKEN_TYPES.COMMA, TOKEN_TYPES.ESCAPE, TOKEN_TYPES.OPEN_BRACKET];
			const wasValueTrigger = valTriggers.includes(last_non_junk_type);
			addToken(TOKEN_TYPES.QUOTE, char);
			i++;
			// Enable quote mode
			// NOTE: We allow quotes basically anywhere in headers as values/keys
			if (isInHeader || wasValueTrigger) {
				isInQuote = true;
			}
			continue;
		}

		// --- PHASE 4: WORD / TEXT SCANNING ---
		// This is the "Fallback" mode where we scan for identifiers, keys, or values.
		// It uses lookahead and context variables to guess the role of a word.
		let word = "";
		const isStartOfBlockId = (last_non_junk_type === TOKEN_TYPES.OPEN_BRACKET);
		const isInNormalText = !isInHeader;

		let stopChars = "[]{}:=,\"'#\\ \t\n\r!";
		if (isStartOfBlockId) {
			stopChars = stopChars.replace(":", "");
		}
		if (isInNormalText) {
			stopChars = "[]\\#\n\r"; // In normal text, stop only at block markers, escapes, comments and newlines
		}

		while (i < src.length && !stopChars.includes(src[i])) {
			// Stop ONLY if $ is followed by { (Logic block start)
			if (src[i] === "$" && src[i + 1] === "{") break;

			// Lookahead for 'static ${' or 'runtime ${' mid-word
			if (word.length > 0) {
				if (src[i] === "s" && src.slice(i, i + 7) === "static " && src[i + 7] === "$" && src[i + 8] === "{") break;
				if (src[i] === "s" && src.slice(i, i + 6) === "static" && src[i + 6] === "$" && src[i + 7] === "{") break;
				if (src[i] === "r" && src.slice(i, i + 8) === "runtime " && src[i + 8] === "$" && src[i + 9] === "{") break;
				if (src[i] === "r" && src.slice(i, i + 7) === "runtime" && src[i + 7] === "$" && src[i + 8] === "{") break;
			}

			// Stop if we hit an ALLOWED prefix trigger
			if ((src[i] === "p" && src[i + 1] === "{") || (src[i] === "v" && src[i + 1] === "{")) {
				if (isInHeader || isInNormalText) break;
			}
			word += src[i];
			i++;
		}

		if (word.length > 0) {
			// Guess role based on context
			if (isInHeader) {
				// Inside a structural header context
				const isMainIdentifier = last_non_junk_type === TOKEN_TYPES.OPEN_BRACKET;

				if (isMainIdentifier) {
					if (word === end_keyword || word.startsWith(end_keyword + ":")) {
						addToken(TOKEN_TYPES.END_KEYWORD, word);
					}
					else if (word === "import") addToken(TOKEN_TYPES.IMPORT, word);
					else if (word === "$use-module") addToken(TOKEN_TYPES.USE_MODULE, word);
					else if (word === "slot") addToken(TOKEN_TYPES.SLOT_KEYWORD, word);
					else if (word === "for-each") addToken(TOKEN_TYPES.FOR_EACH, word);
					else {
						addToken(TOKEN_TYPES.IDENTIFIER, word);
					}
				} else {
					// Use lookahead to distinguish KEY from VALUE
					const p = peekStructural(i);
					if (p === ":") {
						addToken(TOKEN_TYPES.KEY, word);
						if (word === "smark-raw") pendingSmarkRaw = true;
					} else if (word === "static") {
						addToken(TOKEN_TYPES.STATIC_KEYWORD, word);
					} else if (word === "runtime") {
						addToken(TOKEN_TYPES.RUNTIME_KEYWORD, word);
					} else {
						addToken(TOKEN_TYPES.VALUE, word);
						if (pendingSmarkRaw) {
							if (word === "true") hasSmarkRaw = true;
							pendingSmarkRaw = false;
						}
					}
				}
			} else {
				// Normal text
				if (word.trim() === "static") {
					addToken(TOKEN_TYPES.STATIC_KEYWORD, word);
				} else if (word.trim() === "runtime") {
					addToken(TOKEN_TYPES.RUNTIME_KEYWORD, word);
				} else {
					addToken(TOKEN_TYPES.TEXT, word);
				}
			}
		} else {
			// Fallback for any unhandled characters
			if (i < src.length) {
				addToken(TOKEN_TYPES.TEXT, src[i]);
				i++;
			}
		}
	}

	addToken(TOKEN_TYPES.EOF, "");
	return tokens;
}

const colors = {
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        reset: "\x1b[0m"
};

/** @type {boolean} If true, the CLI will show colors. */
let useColor = false;

/**
 * Turns colors on or off globally.
 * @param {boolean} [enabled=true] - Set to true to see colors, false to hide them.
 */
function enableColor(enabled = true) {
        useColor = enabled;
}

/**
 * Wraps your text in a color if colors are turned on.
 * 
 * @param {string} color - The color to use (red, green, yellow, blue, magenta, or cyan).
 * @param {string} text - The text you want to color.
 * @returns {string} - The colored text, or plain text if colors are off.
 * @throws {Error} - Fails if you forget to provide the text.
 */
function colorize(color, text) {
        if (!text) throw new Error("argument 'text' is not defined.");
        if (useColor && color && colors[color]) {
                return colors[color] + text + colors["reset"];
        }
        return text;
}

/**
 * SomMark Errors
 * Handles formatting and throwing errors with beautiful CLI coloring and pointers.
 */

// ========================================================================== //
//  Message Formatting                                                       //
// ========================================================================== //

/**
 * Processes a message by applying colors and formatting.
 * Supports:
 * - {line} : Adds a horizontal line
 * - {N} : Adds a new line
 * - <$color: Text$> : Adds color (red, yellow, green, blue, magenta, cyan)
 * 
 * @param {string|string[]} text - The message or list of message parts to format.
 * @returns {string} - The final formatted and colored string.
 */
function formatMessage(text) {
	const horizontal_rule = "\n" + colorize("blue", "-".repeat(90)) + "\n";
	const pattern = /<\$([^:]+):([\s\S]*?)\$>/g;

	if (Array.isArray(text)) {
		text = text.join("");
	}

	// Apply {line} before color tags so the rule is never nested inside a color wrapper.
	text = text.replaceAll("{line}", horizontal_rule);
	text = text.replace(pattern, (match, color, content) => {
		return colorize(color, content.trim());
	});
	text = text.replaceAll("{N}", "\n");

	text = text
		.split("\n")
		.filter(value => value !== "")
		.join("\n")
		.trim();

	return text;
}

/**
 * Creates a detailed error message showing where the error happened in the code.
 * It adds a line number, a snippet of the code, and a pointer (^) to the exact spot.
 * 
 * @param {string} src - The original code being parsed.
 * @param {Object} range - The location of the error (line and character).
 * @param {string|null} filename - The name of the file (optional).
 * @param {string|string[]} message - The error message to show.
 * @param {string} typeName - The type of error (e.g., "Lexer" or "Parser").
 * @returns {string[]} - A list of message parts that make up the final error report.
 */
function formatErrorWithContext(src, range, filename, message, typeName) {
	if (!src || !range || !range.start) return message;

	const lines = src.split("\n");
	const lineIndex = range.start.line;
	const lineContent = lines[lineIndex] || "";
	const pointerPadding = " ".repeat(range.start.character);
	const sourceLabel = filename ? ` [${filename}]` : "";

	const rangeInfo =
		range.start.line === range.end.line
			? `from column <$yellow:${range.start.character}$> to <$yellow:${range.end.character}$>`
			: `from line <$yellow:${range.start.line + 1}$>, column <$yellow:${range.start.character}$> to line <$yellow:${range.end.line + 1}$>, column <$yellow:${range.end.character}$>`;

	const formattedMessage = [
		`{line}<$red:Here where error occurred${sourceLabel}:$>{N}${lineContent}{N}${pointerPadding}<$yellow:^$>{N}`,
		`<$red:${typeName} Error:$> `,
		...(Array.isArray(message) ? message : [message]),
		`{N}at line <$yellow:${range.start.line + 1}$>, ${rangeInfo}{N}`,
		`{line}`
	];

	return formattedMessage;
}

// ========================================================================== //
//  Error Classes                                                            //
// ========================================================================== //

/** Base class for all SomMark errors that automatically formats messages for the terminal. */
class CustomError extends Error {
	/**
	 * Creates a new error.
	 * 
	 * @param {string|string[]} message - The text describing what went wrong.
	 * @param {string} name - The name of the error type.
	 */
	constructor(message, name) {
		super(message);
		this.name = name;
		this.message = formatMessage(`<$cyan:[${this.name}]$>:`) + "\n" + formatMessage(message);
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

class ParserError extends CustomError {
	constructor(message) { super(message, "Parser Error"); }
}

class LexerError extends CustomError {
	constructor(message) { super(message, "Lexer Error"); }
}

class TranspilerError extends CustomError {
	constructor(message) { super(message, "Transpiler Error"); }
}

class CLIError extends CustomError {
	constructor(message) { super(message, "CLI Error"); }
}

class RuntimeError extends CustomError {
	constructor(message) { super(message, "Runtime Error"); }
}

class SommarkError extends CustomError {
	constructor(message) { super(message, "SomMark Error"); }
}

// ========================================================================== //
//  Error Dispatcher (Helper)                                               //
// ========================================================================== //

/**
 * A helper that creates an error "dispatcher" for a specific category.
 * 
 * @param {string} type - The category of error (e.g., 'lexer', 'parser').
 * @returns {Function} - A function that throws the formatted error.
 */
function getError(type) {
	const validate_msg = msg => (Array.isArray(msg) && msg.length > 0) || typeof msg === "string";
	const typeNames = {
		parser: "Parser",
		transpiler: "Transpiler",
		lexer: "Lexer",
		cli: "CLI",
		runtime: "Runtime",
		sommark: "SomMark"
	};
	const ErrorClasses = {
		parser: ParserError,
		transpiler: TranspilerError,
		lexer: LexerError,
		cli: CLIError,
		runtime: RuntimeError,
		sommark: SommarkError
	};

	return (errorMessage, context = null) => {
		if (validate_msg(errorMessage)) {
			let finalMessage = errorMessage;
			if (context && context.src && context.range) {
				finalMessage = formatErrorWithContext(
					context.src,
					context.range,
					context.filename,
					errorMessage,
					typeNames[type]
				);
			}
			throw new ErrorClasses[type](finalMessage).message;
		}
	};
}

/** Helper to throw Parser errors. */
const parserError = getError("parser");

/** Helper to throw Transpiler errors. */
const transpilerError = getError("transpiler");

/** Helper to throw Runtime or Module errors. */
const runtimeError = getError("runtime");

/** Helper to throw general internal SomMark errors. */
const sommarkError = getError("sommark");

/**
 * Finds a matching output definition for a tag ID from a list of registered outputs.
 * Uses case-insensitive matching. Handles both string and array-based ID definitions.
 * 
 * @param {Array<Object>} outputs - List of registered tag outputs.
 * @param {string} targetId - The tag identifier to look for.
 * @returns {Object|undefined} - The matched output entry or undefined.
 */
function matchedValue(outputs, targetId) {
        if (!outputs || !targetId) return undefined;
        for (let i = outputs.length - 1; i >= 0; i--) {
                const outputValue = outputs[i];
                const lowerTarget = targetId.toLowerCase();

                if (typeof outputValue.id === "string") {
                        if (outputValue.id.toLowerCase() === lowerTarget) {
                                return outputValue;
                        }
                } else if (Array.isArray(outputValue.id)) {
                        if (outputValue.id.some(id => id.toLowerCase() === lowerTarget)) {
                                return outputValue;
                        }
                }
        }
        return undefined;
}

/**
 * Safely retrieves an argument value, supporting both positional (number) and named (string) keys.
 * Includes validation against a specific type and optional type casting.
 * 
 * @param {Object} options - Resolution options.
 * @param {Object} options.args - The argument object from an AST node.
 * @param {number} [options.index] - The positional index (for V4 Global Indexing).
 * @param {string} [options.key] - The named key.
 * @param {string|null} [options.type=null] - Expected typeof result (e.g., 'string', 'boolean').
 * @param {Function|null} [options.setType=null] - Optional function to cast the value before validation.
 * @param {any} [options.fallBack=null] - Value to return if resolution or validation fails.
 * @returns {any} - The resolved argument value or the fallback.
 */
function safeArg$1({ props, index, key, type = null, setType = null, fallBack = null }) {
        if (typeof props !== 'object' || props === null) {
                sommarkError([`{line}<$red:TypeError:$> <$yellow:props must be an object$>{line}`]);
        }

        if (index === undefined && key === undefined) {
                sommarkError([`{line}<$red:ReferenceError:> <$yellow:At least one of 'index' or 'key' must be provided$>{line}`]);
        }

        const validate = value => {
                if (value === undefined) return false;

                if (typeof type === 'function') {
                        return type(value);
                }

                if (!type) return true;
                const evaluated = setType ? setType(value) : value;
                return typeof evaluated === type;
        };

        if (index !== undefined && validate(props[index])) {
                return props[index];
        }

        if (key !== undefined && validate(props[key])) {
                return props[key];
        }

        return fallBack;
}

/**
 * Extracts positional props from a block node's props object.
 *
 * @param {Object} props - The block node's props object.
 * @returns {Array<any>} - An ordered array of positional prop values.
 */
function getPositionalArgs(props) {
        if (!props) return [];
        const keys = Object.keys(props);
        const result = keys
                .filter(k => !isNaN(parseInt(k)))
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map(k => props[k]);

        return result;
}

/**
 * Calculates the Levenshtein distance between two strings.
 * Used for "Did you mean?" suggestions and fuzzy matching in validation.
 * 
 * @param {string} a - First string.
 * @param {string} b - Second string.
 * @returns {number} - The edit distance between the two strings.
 */
function levenshtein(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                        if (b.charAt(i - 1) === a.charAt(j - 1)) {
                                matrix[i][j] = matrix[i - 1][j - 1];
                        } else {
                                matrix[i][j] = Math.min(
                                        matrix[i - 1][j - 1] + 1,
                                        matrix[i][j - 1] + 1,
                                        matrix[i - 1][j] + 1
                                );
                        }
                }
        }
        return matrix[b.length][a.length];
}

// -- Unresolved Placeholder Helpers ---------------------------------------- //

const UNRESOLVED_PREFIX = "SOMMARK_UNRESOLVED";
const UNRESOLVED_SUFFIX = "SOMMARK";

/**
 * Official method to get the unique envelope for an unresolved prefix value.
 * @param {string} prefix - The layer ('p' or 'v').
 * @param {string} expectedValue - The placeholder key.
 * @returns {string} - The unique envelope string.
 */
function getPrefixValue(prefix, expectedValue) {
	if (!prefix || (prefix !== "p" && prefix !== "v")) {
		sommarkError([
			`<$red:getPrefixValue Error:$> {N}`,
			`<$yellow:prefix must be 'p' or 'v'. Received:$> <$cyan:'${prefix}'$>`
		]);
	}

	if (!expectedValue || typeof expectedValue !== "string" || expectedValue.trim() === "") {
		sommarkError([
			`<$red:getPrefixValue Error:$> {N}`,
			`<$yellow:expectedValue must be a non-empty string. Received:$> <$cyan:'${expectedValue}'$>`
		]);
	}

	return `${UNRESOLVED_PREFIX}_${prefix}_${expectedValue}_${UNRESOLVED_SUFFIX}`;
}

/**
 * SomMark Parser
 */


// ========================================================================== //
//  Helper Functions                                                         //
// ========================================================================== //

/**
 * Returns the token at the current position.
 * 
 * @param {Object[]} tokens - The list of tokens.
 * @param {number} i - The current index.
 * @returns {Object|null} - The token or null if at the end.
 */
function current_token(tokens, i) {
	return tokens[i] || null;
}

/**
 * Skip whitespaces and comments in structural contexts.
 * 
 * @param {Object[]} tokens - The list of tokens.
 * @param {number} i - The current index.
 * @returns {number} - The new index.
 */
function skipJunk(tokens, i) {
	while (i < tokens.length) {
		const t = tokens[i];
		const type = t.type;
		if (type === TOKEN_TYPES.WHITESPACE || type === TOKEN_TYPES.COMMENT || type === TOKEN_TYPES.COMMENT_BLOCK) {
			i++;
		} else if (type === TOKEN_TYPES.TEXT && t.value.trim() === "") {
			i++;
		} else {
			break;
		}
	}
	return i;
}

/**
 * Checks if a name is valid (using letters, numbers, and certain symbols).
 * 
 * @param {string} id - The name to check.
 * @param {RegExp} [keyRegex] - The rule to follow.
 * @param {string} [name] - The type of thing we are checking.
 * @param {string} [rule] - A human-readable version of the rule.
 * @param {string} [ruleMessage] - The error message to show.
 */
function validateName(
	id,
	allowColon = false,
	name = "Identifier"
) {
	const keyRegex = allowColon ? /^[a-zA-Z0-9\-_$:]+$/ : /^[a-zA-Z0-9\-_$]+$/;
	const rule = allowColon ? "(A–Z, a–z, 0–9, -, _, $, :)" : "(A–Z, a–z, 0–9, -, _, $)";
	const ruleMessage = allowColon
		? "must contain only letters, numbers, hyphens, underscores, dollar signs ($), or colons (:)"
		: "must contain only letters, numbers, hyphens, underscores, or dollar signs ($)";

	if (!keyRegex.test(id)) {
		parserError([`{line}<$red:Invalid ${name}:$><$blue: '${id}'$>{N}<$yellow:${name} ${ruleMessage}$> <$cyan: ${rule}.$>`]);
	}
}

/** Creates a new empty Block node. */
function makeBlockNode() {
	return {
		type: BLOCK,
		structure: "Block",
		id: "",
		props: {},
		directives: {},
		body: [],
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}
/** Creates a new empty Text node. */
function makeTextNode() {
	return {
		type: TEXT$1,
		structure: "Text",
		text: "",
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}
/** Creates a new empty Comment node. */
function makeCommentNode() {
	return {
		type: COMMENT,
		structure: "Comment",
		text: "",
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}
/** Creates a new empty Logic node. */
function makeLogicNode(type = RUNTIME_LOGIC) {
	return {
		type: type,
		structure: "Block",
		code: "",
		depth: 0,
		range: {
			start: { line: 0, character: 0 },
			end: { line: 0, character: 0 }
		}
	};
}
let end_stack = [];
let tokens_stack = [];

const fallback = {
	value: "Unknown",
	range: {
		start: { line: 0, character: 0 },
		end: { line: 0, character: 0 }
	}};
const updateData = (tokens, i) => {
	if (tokens[i]) {
		tokens_stack.push(tokens[i].value);
		tokens[i].range;
		tokens[i].value;
	}
};

const errorMessage = (tokens, i, expectedValue, behindValue, frontText, filename = null) => {
	const current = tokens[i] || fallback;
	const errorLine = current.range.start.line;
	const errorColStart = current.range.start.character;
	const errorColEnd = current.range.end.character;
	const source = current.source || filename;

	// Collect all tokens on the error line for the source snippet
	let lineStartIndex = i;
	while (
		lineStartIndex > 0 &&
		tokens[lineStartIndex - 1] &&
		tokens[lineStartIndex - 1].range.start.line === errorLine &&
		(tokens[lineStartIndex - 1].source || filename) === source
	) {
		lineStartIndex--;
	}
	let lineEndIndex = i;
	while (
		lineEndIndex < tokens.length - 1 &&
		tokens[lineEndIndex + 1] &&
		tokens[lineEndIndex + 1].range.start.line === errorLine &&
		(tokens[lineEndIndex + 1].source || filename) === source
	) {
		lineEndIndex++;
	}

	const lineContent = tokens.slice(lineStartIndex, lineEndIndex + 1).map(t => t.value).join('');
	const contentBefore = tokens.slice(lineStartIndex, i).map(t => t.value).join('');
	const pointerPadding = " ".repeat(contentBefore.length);

	// Location header — file, line, column
	const lineNum = errorLine + 1;
	const isMultiLine = current.range.start.line !== current.range.end.line;
	const colDisplay = isMultiLine
		? `${errorColStart} → line ${current.range.end.line + 1} col ${errorColEnd}`
		: errorColStart === errorColEnd ? `${errorColStart}` : `${errorColStart}–${errorColEnd}`;

	// Error description — avoid nested <$color:...$> tags (breaks the non-greedy regex)
	let errorDesc;
	if (frontText) {
		errorDesc = `<$red:${frontText}$>`;
	} else {
		errorDesc = `<$red:Expected$> <$blue:'${expectedValue}'$>`;
		if (behindValue) errorDesc += ` <$red:after$> <$blue:'${behindValue}'$>`;
	}

	const tokenDisplay = current.value === ""   ? "end of input"
		: current.value === "\n" ? "newline (\\n)"
		: `'${current.value}'`;

	const parts = [`{line}`];
	if (source) parts.push(`<$cyan:File:$> ${source}{N}`);
	parts.push(`<$cyan:Line:$> <$yellow:${lineNum}$> <$cyan:Col:$> <$yellow:${colDisplay}$>{N}`);
	parts.push(`{line}`);
	parts.push(`<$red:Here where error occurred:$>{N}`);
	parts.push(`  ${lineContent}{N}`);
	parts.push(`  ${pointerPadding}<$yellow:^$>{N}`);
	parts.push(`${errorDesc}{N}`);
	parts.push(`<$yellow:Received:$> <$blue:${tokenDisplay}$>{N}`);
	parts.push(`{line}`);
	return parts;
};
// ========================================================================== //
//  Parse Key                                                                 //
// ========================================================================== //
function parseKey(tokens, i) {
	let key = "";
	if (current_token(tokens, i).type === TOKEN_TYPES.QUOTE) {
		i++; // consume opening QUOTE
		key = current_token(tokens, i).value;
		i++; // consume Key
		if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.QUOTE) {
			i++; // consume closing QUOTE
		}
	} else {
		key = current_token(tokens, i).value.trim();
		i++;
	}
	updateData(tokens, i);
	return [key, i];
}
// ========================================================================== //
//  Read Prefix Key/Fallback from structured p{}/v{} tokens                  //
// ========================================================================== //
function readPrefixKeyFallback(tokens, i, prefixType = "p") {
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.PREFIX_OPEN) i++;
	i = skipJunk(tokens, i);

	let key = "";
	let fallback = undefined;

	// Read key — must be quoted or unquoted identifier
	const keyToken = current_token(tokens, i);
	if (!keyToken || keyToken.type === TOKEN_TYPES.PREFIX_CLOSE) {
		parserError(errorMessage(tokens, i, "key", "{", 'Prefix requires a key — write p{key} or p{key | "fallback"}'));
	}
	if (keyToken.type === TOKEN_TYPES.QUOTE) {
		i++; // skip opening QUOTE
		while (current_token(tokens, i) &&
			current_token(tokens, i).type !== TOKEN_TYPES.QUOTE &&
			current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_CLOSE &&
			current_token(tokens, i).type !== TOKEN_TYPES.PIPELINE) {
			key += current_token(tokens, i).value;
			i++;
		}
		if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.QUOTE) i++;
	} else if (keyToken.type === TOKEN_TYPES.KEY) {
		key = keyToken.value.trim();
		const isValidIdent = /^[a-zA-Z_$][a-zA-Z0-9_$-]*$/.test(key);
		const isNumeric = /^\d+$/.test(key);
		// p{} keys must be identifiers; v{} keys may also be positional integers
		if (!isValidIdent && !(prefixType === "v" && isNumeric)) {
			parserError(errorMessage(tokens, i, "key", "{", `Invalid prefix key '${key}' — must start with a letter, _ or $`));
		}
		i++;
	} else {
		parserError(errorMessage(tokens, i, "key", "{", "Invalid prefix key — must be a quoted string or identifier"));
	}

	i = skipJunk(tokens, i);

	// After key: only | or } is valid
	const afterKey = current_token(tokens, i);
	if (!afterKey || (afterKey.type !== TOKEN_TYPES.PIPELINE && afterKey.type !== TOKEN_TYPES.PREFIX_CLOSE)) {
		parserError(errorMessage(tokens, i, "| or }", key, "Expected '|' or '}' after prefix key"));
	}

	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.PIPELINE) {
		i++; // skip PIPELINE
		i = skipJunk(tokens, i);

		// Fallback must be a quoted string — any content allowed inside quotes
		const fallbackToken = current_token(tokens, i);
		if (!fallbackToken || fallbackToken.type === TOKEN_TYPES.PREFIX_CLOSE) {
			parserError(errorMessage(tokens, i, '"fallback"', "|", 'Expected a quoted fallback after \'|\' — write p{key | "default"}'));
		}
		if (fallbackToken.type === TOKEN_TYPES.QUOTE) {
			fallback = "";
			i++; // skip opening QUOTE
			while (current_token(tokens, i) &&
				current_token(tokens, i).type !== TOKEN_TYPES.QUOTE &&
				current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_CLOSE) {
				fallback += current_token(tokens, i).value;
				i++;
			}
			if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.QUOTE) i++;
		} else {
			parserError(errorMessage(tokens, i, '"fallback"', "|", 'Fallback must be a quoted string — write p{key | "default"}'));
		}
	}

	i = skipJunk(tokens, i);

	// After key (or fallback): only } is valid
	const afterFallback = current_token(tokens, i);
	if (!afterFallback || afterFallback.type !== TOKEN_TYPES.PREFIX_CLOSE) {
		parserError(errorMessage(tokens, i, "}", key, "Unexpected content inside prefix — only one key and one optional fallback are allowed"));
	}

	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.PREFIX_CLOSE) i++;

	return [key, fallback, i];
}
// ========================================================================== //
//  Parse Value                                                               //
// ========================================================================== //
function parseValue(tokens, i, placeholders = {}, variables = {}, allowLogic = true) {
	let val = current_token(tokens, i).value;
	// consume Value
	if (current_token(tokens, i).type === TOKEN_TYPES.QUOTE) {
		i++; // consume opening QUOTE
		val = "";
		while (i < tokens.length && current_token(tokens, i).type !== TOKEN_TYPES.QUOTE) {
			const token = current_token(tokens, i);
			if (token.type === TOKEN_TYPES.PREFIX_P || token.type === TOKEN_TYPES.PREFIX_V) {
				const [resolvedVal, nextI] = parseValue(tokens, i, placeholders, variables, allowLogic);
				val += resolvedVal;
				i = nextI;
			} else {
				val += token.value;
				i++;
			}
		}

		if (i >= tokens.length) {
			parserError(errorMessage(tokens, i - 1, "\"", "unclosed string", "Unclosed quote"));
		}

		i++; // consume closing QUOTE
		return [val, i, true];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.STATIC_KEYWORD || current_token(tokens, i).type === TOKEN_TYPES.RUNTIME_KEYWORD) {
		if (!allowLogic) {
			parserError(errorMessage(tokens, i, "literal value", "", "Logic blocks are not allowed in this context."));
		}
		let isStatic = current_token(tokens, i).type === TOKEN_TYPES.STATIC_KEYWORD;
		let nextI = skipJunk(tokens, i + 1);

		if (!current_token(tokens, nextI) || current_token(tokens, nextI).type !== TOKEN_TYPES.LOGIC_OPEN) {
			// Keyword not followed by ${ — treat as literal text
			return [current_token(tokens, i).value, i + 1, false];
		}

		// Skip LOGIC_OPEN, read LOGIC body
		nextI++;
		const logicToken = current_token(tokens, nextI);
		const node = makeLogicNode(isStatic ? STATIC_LOGIC : RUNTIME_LOGIC);
		node.code = logicToken ? logicToken.value : "";
		node.range = logicToken ? logicToken.range : current_token(tokens, i).range;
		nextI++;

		// Consume LOGIC_CLOSE if present
		if (current_token(tokens, nextI) && current_token(tokens, nextI).type === TOKEN_TYPES.LOGIC_CLOSE) {
			nextI++;
		}

		return [node, nextI, false];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.LOGIC_OPEN) {
		if (!allowLogic) {
			parserError(errorMessage(tokens, i, "literal value", "", "Logic blocks are not allowed in this context."));
		}
		let nextI = i + 1;
		const logicToken = current_token(tokens, nextI);
		const node = makeLogicNode(STATIC_LOGIC);
		node.code = logicToken ? logicToken.value : "";
		node.range = logicToken ? logicToken.range : current_token(tokens, i).range;
		nextI++;

		if (current_token(tokens, nextI) && current_token(tokens, nextI).type === TOKEN_TYPES.LOGIC_CLOSE) {
			nextI++;
		}

		return [node, nextI, false];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.PREFIX_V) {
		i++; // consume PREFIX_V keyword
		const [vKey, vFallback, vNextI] = readPrefixKeyFallback(tokens, i, "v");
		i = vNextI;
		if (variables[vKey] !== undefined) {
			val = variables[vKey];
			if (!variables.__consumed__) {
				Object.defineProperty(variables, "__consumed__", {
					value: new Set(),
					enumerable: false,
					configurable: true
				});
			}
			variables.__consumed__.add(vKey);
		} else {
			// Encode fallback in the envelope key so resolveAstVariables can apply it
			// at instantiation time instead of baking it in now.
			val = getPrefixValue('v', vFallback !== undefined ? `${vKey}|${vFallback}` : vKey);
		}
		return [val, i, false];
	} else if (current_token(tokens, i).type === TOKEN_TYPES.PREFIX_P) {
		i++; // consume PREFIX_P keyword
		const [pKey, pFallback, pNextI] = readPrefixKeyFallback(tokens, i);
		i = pNextI;
		val = placeholders[pKey] !== undefined ? placeholders[pKey] : (pFallback !== undefined ? pFallback : getPrefixValue('p', pKey));
		return [val, i, false];
	} else {
		val = "";
		while (i < tokens.length) {
			const token = current_token(tokens, i);
			if (!token) break;

			// Stop at any structural marker or whitespace
			if (token.type === TOKEN_TYPES.WHITESPACE ||
				token.type === TOKEN_TYPES.COMMA ||
				token.type === TOKEN_TYPES.CLOSE_BRACKET ||
				token.type === TOKEN_TYPES.COLON ||
				token.type === TOKEN_TYPES.EXCLAMATION_MARK) break;

			if (token.type === TOKEN_TYPES.ESCAPE) {
				// Remove backslash
				val += token.value.slice(1);
			} else {
				val += token.value;
			}
			i++;
		}
	}

	updateData(tokens, i);
	return [val, i, false];
}
// ========================================================================== //
//  Parse ':'                                                                 //
// ========================================================================== //
function parseColon(tokens, i, afterChar = "") {
	i = skipJunk(tokens, i);
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.COLON)) {
		parserError(errorMessage(tokens, i, ":", afterChar));
	}
	i++;
	i = skipJunk(tokens, i);
	updateData(tokens, i);
	return i;
}
/**
 * Parses a standard SomMark Block ([id] ... [end]).
 * Blocks are structural elements that can contain nested content.
 * 
 * @param {Object[]} tokens - Token stream.
 * @param {number} i - Initial index.
 * @param {string|null} filename - Source filename.
 * @param {Object} placeholders - Dynamic public API data.
 * @returns {[Object, number]} The parsed Block node and new index.
 */
function parseBlock(tokens, i, filename = null, placeholders = {}, variables = {}, depth = 0) {
	const blockNode = makeBlockNode();
	blockNode.depth = depth;
	const openBracketToken = current_token(tokens, i);
	// ========================================================================== //
	//  consume '['                                                               //
	// ========================================================================== //
	i++;
	i = skipJunk(tokens, i);
	updateData(tokens, i);

	const idToken = current_token(tokens, i);
	if (!idToken || idToken.type === TOKEN_TYPES.EOF || idToken.type === TOKEN_TYPES.CLOSE_BRACKET) {
		parserError(errorMessage(tokens, i, "Block ID", "[", "Missing Block Identifier"));
	}
	const id = idToken.value;
	if (id.trim() === end_keyword) {
		parserError(errorMessage(tokens, i, id, "", `'${id.trim()}' is a reserved keyword and cannot be used as an identifier.`));
	}
	blockNode.id = id.trim();
	if (!blockNode.id) {
		parserError(errorMessage(tokens, i, "Block ID", "[", "Block identifier cannot be empty"));
	}
	if (blockNode.id === "import") {
		blockNode.type = IMPORT;
	} else if (blockNode.id === "$use-module") {
		blockNode.type = USE_MODULE;
	} else if (idToken.type === TOKEN_TYPES.SLOT_KEYWORD) {
		blockNode.type = SLOT;
		// Prevent nested slots
		if (end_stack.some(e => e.id === "slot")) {
			parserError(errorMessage(tokens, i, "slot", "", "Nested slots are not allowed. A [slot] cannot be placed inside another [slot]."));
		}
	} else if (idToken.type === TOKEN_TYPES.FOR_EACH || blockNode.id === "for-each") {
		blockNode.type = FOR_EACH;
	}
	validateName(blockNode.id, true);
	blockNode.range.start = openBracketToken.range.start;
	end_stack.push({ id, line: openBracketToken.range.start.line + 1, col: openBracketToken.range.start.character });
	// ========================================================================== //
	//  consume Block Identifier                                                  //
	// ========================================================================== //
	i++;
	i = skipJunk(tokens, i);
	updateData(tokens, i);
	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.EQUAL) {
		// ========================================================================== //
		//  consume '='                                                               //
		// ========================================================================== //
		i++;
		i = skipJunk(tokens, i);
		updateData(tokens, i);

		if (
			!current_token(tokens, i) ||
			(current_token(tokens, i) &&
				current_token(tokens, i).type !== TOKEN_TYPES.VALUE &&
				current_token(tokens, i).type !== TOKEN_TYPES.ESCAPE &&
				current_token(tokens, i).type !== TOKEN_TYPES.IDENTIFIER &&
				current_token(tokens, i).type !== TOKEN_TYPES.IMPORT &&
				current_token(tokens, i).type !== TOKEN_TYPES.USE_MODULE &&
				current_token(tokens, i).type !== TOKEN_TYPES.END_KEYWORD &&
				current_token(tokens, i).type !== TOKEN_TYPES.KEY &&
				current_token(tokens, i).type !== TOKEN_TYPES.QUOTE &&
				current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_V &&
				current_token(tokens, i).type !== TOKEN_TYPES.PREFIX_P &&
				current_token(tokens, i).type !== TOKEN_TYPES.LOGIC_OPEN &&
				current_token(tokens, i).type !== TOKEN_TYPES.STATIC_KEYWORD &&
				current_token(tokens, i).type !== TOKEN_TYPES.RUNTIME_KEYWORD)
		) {
			parserError(errorMessage(tokens, i, block_value, "="));
		}
		// ========================================================================== //
		//  consume key-Value                                                         //
		// ========================================================================== //
		let k = "";
		let v = "";
		let vIsQuoted = false;
		let argIndex = 0;
		while (i < tokens.length) {
			i = skipJunk(tokens, i);
			const token = current_token(tokens, i);
			if (!token || token.type === TOKEN_TYPES.CLOSE_BRACKET) break;

			const isQuotedKey = token.type === TOKEN_TYPES.QUOTE && peek(tokens, i, 1) && (peek(tokens, i, 1).type === TOKEN_TYPES.KEY);

			if (token.type === TOKEN_TYPES.KEY || isQuotedKey) {
				let [key, keyIndex] = parseKey(tokens, i);
				k = key;
				i = keyIndex;
				i = skipJunk(tokens, i);
				i = parseColon(tokens, i, block_key);
				i = skipJunk(tokens, i);

				// Ensure there is a value after the colon
				const nextToken = current_token(tokens, i);
				if (!nextToken || nextToken.type === TOKEN_TYPES.CLOSE_BRACKET || nextToken.type === TOKEN_TYPES.COMMA) {
					parserError(errorMessage(tokens, i, block_value, ":", "Missing value after colon"));
				}

				// Validate only if it was a plain KEY token (not from a quote)
				if (token.type === TOKEN_TYPES.KEY) {
					validateName(k, true);
				}
			}

			// Parse Value (handles both quoted, unquoted, and prefixes)
			let [value, valueIndex, isQuoted] = parseValue(tokens, i, placeholders, variables);
			v = value;
			vIsQuoted = isQuoted;
			i = valueIndex;

			// Store Argument
			if (k && k.startsWith("smark-")) {
				blockNode.directives[k.slice(6)] = v; // strip "smark-" prefix
			} else {
				blockNode.props[String(argIndex++)] = v;
				if (k) blockNode.props[k] = v;
			}
			k = "";
			v = "";

			i = skipJunk(tokens, i);
			const separatorToken = current_token(tokens, i);
			if (separatorToken && (separatorToken.type === TOKEN_TYPES.COMMA || separatorToken.type === TOKEN_TYPES.COLON)) {
				i++; // consume , or :
				i = skipJunk(tokens, i);
				updateData(tokens, i);

				// Ensure next token is NOT the closing bracket (trailing separator)
				const afterSeparator = current_token(tokens, i);
				if (!afterSeparator || afterSeparator.type === TOKEN_TYPES.CLOSE_BRACKET) {
					parserError(errorMessage(tokens, i, "value", "", "Unexpected trailing separator"));
				}
			} else {
				// No separator, must be end of arguments or ]
				break;
			}
		}
		if (v !== "") {
			if (typeof v === "string") {
				if (!vIsQuoted) v = v.trim();
				if (v.startsWith('"') && v.endsWith('"')) {
					v = v.slice(1, -1);
				}
			}
		}
	}

	i = skipJunk(tokens, i);

	if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.EXCLAMATION_MARK) {
		blockNode.isSelfClosing = true;
		i++;
		i = skipJunk(tokens, i);
	}

	// ========================================================================== //
	//  Close Bracket                                                             //
	// ========================================================================== //
	if (!current_token(tokens, i) || (current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_BRACKET)) {
		parserError(errorMessage(tokens, i, "]", block_id));
	}
	// ========================================================================== //
	//  consume ']'                                                               //
	// ========================================================================== //
	i++;
	updateData(tokens, i);

	if (blockNode.isSelfClosing) {
		end_stack.pop();
		blockNode.range.end = current_token(tokens, i - 1).range.end;
		return [blockNode, i];
	}

	tokens_stack.length = 0;
	while (i < tokens.length) {
		const nextIdx = skipJunk(tokens, i + 1);
		const nextToken = tokens[nextIdx];
		if (
			current_token(tokens, i) &&
			current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET &&
			nextToken &&
			nextToken.type !== TOKEN_TYPES.END_KEYWORD &&
			nextToken.value.trim() !== end_keyword
		) {
			const [childNode, nextIndex] = parseBlock(tokens, i, filename, placeholders, variables, depth + 1);

			blockNode.body.push(childNode);
			i = nextIndex;
		} else if (
			current_token(tokens, i) &&
			current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET &&
			nextToken &&
			(nextToken.type === TOKEN_TYPES.END_KEYWORD || nextToken.value.trim() === end_keyword)
		) {
			// ========================================================================== //
			//  consume '['                                                               //
			// ========================================================================== //
			i++;
			i = skipJunk(tokens, i);
			const current = current_token(tokens, i);
			if (!current || (current.type !== TOKEN_TYPES.END_KEYWORD && current.value.trim() !== end_keyword)) {
				let extraInfo = "";
				if (current && current.value) {
					const dist = levenshtein(current.value.trim().toLowerCase(), "end");
					if (dist <= 2) {
						extraInfo = ` (Did you mean <$cyan:'[end]'$>?)`;
					}
				}
				parserError(errorMessage(tokens, i, "end", "[", extraInfo));
			}
			// ========================================================================== //
			//  consume End Keyword                                                       //
			// ========================================================================== //
			i++;
			i = skipJunk(tokens, i);
			updateData(tokens, i);

			// Named closing: [end:blockname] — the lexer emits END_KEYWORD "end:name" as one
			// token because ':' is stripped from stop chars at block-start (XML namespace support).
			const endValue = current.value.trim();
			if (endValue.includes(":")) {
				const closingName = endValue.slice(endValue.indexOf(":") + 1);
				if (!closingName) {
					parserError(errorMessage(tokens, i - 1, "block name", "", "Missing block name — write [end:blockname] to name the closing tag"));
				}
				const expected = end_stack[end_stack.length - 1];
				if (expected && closingName !== expected.id) {
					parserError(errorMessage(tokens, i - 1, closingName, "",
						`Mismatched closing tag: [end:${closingName}] cannot close '${closingName}' — '${expected.id}' is still open (opened at line ${expected.line}, col ${expected.col})`
					));
				}
			}

			if (
				!current_token(tokens, i) ||
				(current_token(tokens, i) && current_token(tokens, i).type !== TOKEN_TYPES.CLOSE_BRACKET)
			) {
				parserError(errorMessage(tokens, i, "]", "end"));
			}
			end_stack.pop();
			// ========================================================================== //
			//  consume ']'                                                               //
			// ========================================================================== //
			const closeBracketToken = current_token(tokens, i);
			i++;
			updateData(tokens, i);
			blockNode.range.end = closeBracketToken.range.end;
			break;
		} else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.WHITESPACE) {
			blockNode.body.push({
				type: TEXT$1,
				text: current_token(tokens, i).value,
				range: current_token(tokens, i).range
			});
			i++;
		} else {
			const [childNode, nextIndex] = parseNode(tokens, i, filename, placeholders, variables, depth + 1);
			if (childNode) {
				blockNode.body.push(childNode);
				i = nextIndex;
			} else {
				i++; // Should not happen with current parseNode fallback but good for safety
			}
		}
	}
	return [blockNode, i];
}
/**
 * Parses a stream of text tokens into a single Text node.
 * Handles unescaping and placeholder resolution.
 * 
 * @param {Object[]} tokens - Token stream.
 * @param {number} i - Initial index.
 * @param {Object} [placeholders={}] - Global data for p{keyword} resolution.
 * @param {Object} [variables={}] - Local data for v{keyword} resolution.
 * @param {Object} [options={}] - Formatting options.
 * @returns {[Object, number]} The Text node and new index.
 */
function parseText(tokens, i, placeholders = {}, variables = {}, depth = 0, options = {}) {
	const textNode = makeTextNode();
	textNode.depth = depth;
	const startToken = current_token(tokens, i);
	textNode.range.start = startToken.range.start;
	const { selectiveUnescape = false } = options;

	while (i < tokens.length) {
		const token = current_token(tokens, i);
		if (!token) break;

		if (token.type === TOKEN_TYPES.TEXT || token.type === TOKEN_TYPES.WHITESPACE || token.type === TOKEN_TYPES.VALUE) {
			textNode.text += token.value;
			i++;
		} else if (token.type === TOKEN_TYPES.STATIC_KEYWORD || token.type === TOKEN_TYPES.RUNTIME_KEYWORD) {
			const nextIdx = skipJunk(tokens, i + 1);
			if (tokens[nextIdx] && tokens[nextIdx].type === TOKEN_TYPES.LOGIC_OPEN) {
				// Stop consuming text; this is the start of a logic block
				break;
			}
			textNode.text += token.value;
			i++;
		} else if (token.type === TOKEN_TYPES.ESCAPE) {
			if (selectiveUnescape) {
				const char = token.value.slice(1);
				if (char === "@" || char === "_") {
					textNode.text += char;
				} else {
					textNode.text += token.value;
				}
			} else {
				textNode.text += token.value.slice(1); // Standard behavior: unescape all
			}
			i++;
		} else if (token.type === TOKEN_TYPES.PREFIX_P) {
			i++; // consume PREFIX_P keyword
			const [tpKey, tpFallback, tpNextI] = readPrefixKeyFallback(tokens, i);
			i = tpNextI;
			if (placeholders[tpKey] !== undefined) {
				textNode.text += String(placeholders[tpKey]);
			} else {
				textNode.text += tpFallback !== undefined ? tpFallback : getPrefixValue('p', tpKey);
			}
		} else if (token.type === TOKEN_TYPES.PREFIX_V) {
			i++; // consume PREFIX_V keyword
			const [tvKey, tvFallback, tvNextI] = readPrefixKeyFallback(tokens, i, "v");
			i = tvNextI;
			if (variables[tvKey] !== undefined) {
				textNode.text += String(variables[tvKey]);
				if (!variables.__consumed__) {
					Object.defineProperty(variables, "__consumed__", {
						value: new Set(),
						enumerable: false,
						configurable: true
					});
				}
				variables.__consumed__.add(tvKey);
			} else {
				// Encode fallback in envelope so resolveAstVariables can apply it later.
				textNode.text += getPrefixValue('v', tvFallback !== undefined ? `${tvKey}|${tvFallback}` : tvKey);
			}
		} else {
			break;
		}

		updateData(tokens, i);
		textNode.range.end = tokens[i - 1].range.end;
	}
	return [textNode, i];
}
// ========================================================================== //
//  Parse Comments                                                            //
// ========================================================================== //
function parseCommentNode(tokens, i, depth = 0) {
	const commentNode = makeCommentNode();
	const token = current_token(tokens, i);
	if (token && (token.type === TOKEN_TYPES.COMMENT || token.type === TOKEN_TYPES.COMMENT_BLOCK)) {
		commentNode.type = token.type === TOKEN_TYPES.COMMENT ? COMMENT : COMMENT_BLOCK;
		// Clean the text here instead of the transpiler
		const raw = token.value;
		commentNode.text = token.type === TOKEN_TYPES.COMMENT
			? raw.replace(/^#/, "").trim()
			: raw.replace(/^###[\r\n]*/, "").replace(/[\r\n]*###$/, "").trim();

		commentNode.depth = depth;
		commentNode.range = token.range;
	}
	// ========================================================================== //
	//  consume Comment '#'                                                       //
	// ========================================================================== //
	i++;
	updateData(tokens, i);
	return [commentNode, i];
}

// ========================================================================== //
//  Main Node Dispatcher                                                     //
// ========================================================================== //

/**
 * Dispatches the current token to the appropriate specialized parser function.
 * 
 * @param {Object[]} tokens - Token stream.
 * @param {number} i - Initial index.
 * @param {string|null} filename - Source filename.
 * @param {Object} placeholders - Dynamic public API data.
 * @returns {[Object, number]} The parsed node and new index.
 */
function parseNode(tokens, i, filename = null, placeholders = {}, variables = {}, depth = 0) {
	if (!current_token(tokens, i) || (current_token(tokens, i) && !current_token(tokens, i).value)) {
		return [null, i];
	}
	// ========================================================================== //
	//  Comment                                                                   //
	// ========================================================================== //
	if (current_token(tokens, i) && (current_token(tokens, i).type === TOKEN_TYPES.COMMENT || current_token(tokens, i).type === TOKEN_TYPES.COMMENT_BLOCK)) {
		return parseCommentNode(tokens, i, depth);
	}
	// ========================================================================== //
	//  Block or Reserved Keyword                                                 //
	// ========================================================================== //
	else if (current_token(tokens, i) && (current_token(tokens, i).type === TOKEN_TYPES.OPEN_BRACKET)) {
		return parseBlock(tokens, i, filename, placeholders, variables, depth);
	}
	// ========================================================================== //
	//  Logic Block                                                               //
	// ========================================================================== //
	else if (current_token(tokens, i) && (current_token(tokens, i).type === TOKEN_TYPES.STATIC_KEYWORD || current_token(tokens, i).type === TOKEN_TYPES.RUNTIME_KEYWORD)) {
		let isStatic = current_token(tokens, i).type === TOKEN_TYPES.STATIC_KEYWORD;
		let startRange = current_token(tokens, i).range;
		let nextI = skipJunk(tokens, i + 1);

		if (!current_token(tokens, nextI) || current_token(tokens, nextI).type !== TOKEN_TYPES.LOGIC_OPEN) {
			// Keyword not followed by ${ — treat as normal text
			return parseText(tokens, i, placeholders, variables, depth);
		}

		// Skip LOGIC_OPEN, read LOGIC body
		nextI++;
		const logicToken = current_token(tokens, nextI);
		const node = makeLogicNode(isStatic ? STATIC_LOGIC : RUNTIME_LOGIC);
		node.code = logicToken ? logicToken.value : "";
		node.depth = depth;
		node.range = {
			start: startRange.start,
			end: logicToken ? logicToken.range.end : startRange.end
		};
		nextI++;

		// Consume LOGIC_CLOSE if present
		if (current_token(tokens, nextI) && current_token(tokens, nextI).type === TOKEN_TYPES.LOGIC_CLOSE) {
			nextI++;
		}

		return [node, nextI];
	}
	// ========================================================================== //
	//  Bare Logic Block (${ }$ without explicit static/runtime — defaults to static)
	// ========================================================================== //
	else if (current_token(tokens, i) && current_token(tokens, i).type === TOKEN_TYPES.LOGIC_OPEN) {
		let nextI = i + 1;
		const logicToken = current_token(tokens, nextI);
		const node = makeLogicNode(STATIC_LOGIC);
		node.code = logicToken ? logicToken.value : "";
		node.depth = depth;
		node.range = {
			start: current_token(tokens, i).range.start,
			end: logicToken ? logicToken.range.end : current_token(tokens, i).range.end
		};
		nextI++;

		if (current_token(tokens, nextI) && current_token(tokens, nextI).type === TOKEN_TYPES.LOGIC_CLOSE) {
			nextI++;
		}

		return [node, nextI];
	}
	// ========================================================================== //
	//  Text or Placeholder                                                       //
	// ========================================================================== //
	else if (
		current_token(tokens, i) &&
		(current_token(tokens, i).type === TOKEN_TYPES.TEXT ||
			current_token(tokens, i).type === TOKEN_TYPES.WHITESPACE ||
			current_token(tokens, i).type === TOKEN_TYPES.ESCAPE ||
			current_token(tokens, i).type === TOKEN_TYPES.VALUE ||
			current_token(tokens, i).type === TOKEN_TYPES.PREFIX_V ||
			current_token(tokens, i).type === TOKEN_TYPES.PREFIX_P)
	) {
		return parseText(tokens, i, placeholders, variables, depth);
	} else {
		// FALLBACK: Treat any other token as TEXT to avoid infinite loops and allow literal content
		const textNode = makeTextNode();
		textNode.text = current_token(tokens, i).value;
		textNode.depth = depth;
		textNode.range = current_token(tokens, i).range;
		return [textNode, i + 1];
	}
}

// ========================================================================== //
//  Main Parser Entry Point                                                  //
// ========================================================================== //

/**
 * SomMark Parser Entry Point.
 * 
 * Orchestrates the recursive descent parsing of the token stream into a 
 * hierarchical Abstract Syntax Tree (AST).
 * 
 * @param {Object[]} tokens - The stream of tokens from the Lexer.
 * @param {string|null} [filename=null] - Source filename for error context.
 * @param {Object} [placeholders={}] - Global data for p{keyword} resolution.
 * @param {Object} [variables={}] - Local data for v{keyword} resolution.
 * @returns {Array<Object>} The final Abstract Syntax Tree.
 */
function parser(tokens, filename = null, placeholders = {}, variables = {}) {
	end_stack = [];
	let ast = [];
	let i = 0;
	while (i < tokens.length) {
		let [node, nextIndex] = parseNode(tokens, i, filename, placeholders, variables, 1);
		if (node) {
			ast.push(node);
			i = nextIndex;
		} else {
			i++;
		}
	}
	if (end_stack.length !== 0) {
		let extraInfo = "";

		const checkTypo = (token) => {
			if (token && token.value) {
				const val = token.value.trim().toLowerCase();
				if (val === "") return "";
				const dist = levenshtein(val, "end");
				if (dist > 0 && dist <= 2) return ` Did you mean '[end]'?`;
			}
			return "";
		};

		// Check last few tokens for a typo
		for (let j = 1; j <= 5; j++) {
			const token = tokens[tokens.length - j];
			if (!token) break;
			extraInfo = checkTypo(token);
			if (extraInfo) break;
		}

		const lastOpen = end_stack[end_stack.length - 1];
		parserError(errorMessage(tokens, tokens.length - 1, "[end]", "", extraInfo ? `Missing '[end]' for block '${lastOpen.id}' (opened at line ${lastOpen.line}, col ${lastOpen.col})${extraInfo}` : `Missing '[end]' for block '${lastOpen.id}' (opened at line ${lastOpen.line}, col ${lastOpen.col})`, filename));
	}
	return ast;
}

async function newQuickJSWASMModuleFromVariant(variantOrPromise){let variant=smartUnwrap(await variantOrPromise),[wasmModuleLoader,QuickJSFFI,{QuickJSWASMModule:QuickJSWASMModule2}]=await Promise.all([variant.importModuleLoader().then(smartUnwrap),variant.importFFI(),import('./module-ES6BEMUI-SZ556_bi.js').then(smartUnwrap)]),wasmModule=await wasmModuleLoader();wasmModule.type="sync";let ffi=new QuickJSFFI(wasmModule);return new QuickJSWASMModule2(wasmModule,ffi)}function smartUnwrap(val){return val&&"default"in val&&val.default?val.default&&"default"in val.default&&val.default.default?val.default.default:val.default:val}

var variant={type:"sync",importFFI:()=>import('./ffi-7DRR-T-4.js').then(mod=>mod.QuickJSFFI),importModuleLoader:()=>import('./emscripten-module.browser-LGpDp2J2.js').then(mod=>mod.default)},src_default=variant;

async function newQuickJSWASMModule(variantOrPromise=src_default){return newQuickJSWASMModuleFromVariant(variantOrPromise)}

var singletonPromise;async function getQuickJS(){return singletonPromise??(singletonPromise=newQuickJSWASMModule().then(instance=>(instance))),await singletonPromise}

// This file was generated. Do not modify manually!
var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 7, 9, 32, 4, 318, 1, 80, 3, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 68, 8, 2, 0, 3, 0, 2, 3, 2, 4, 2, 0, 15, 1, 83, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 7, 19, 58, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 343, 9, 54, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 330, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 10, 5350, 0, 7, 14, 11465, 27, 2343, 9, 87, 9, 39, 4, 60, 6, 26, 9, 535, 9, 470, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4178, 9, 519, 45, 3, 22, 543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 245, 1, 2, 9, 726, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];

// This file was generated. Do not modify manually!
var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 4, 51, 13, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 39, 27, 10, 22, 251, 41, 7, 1, 17, 2, 60, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 31, 9, 2, 0, 3, 0, 2, 37, 2, 0, 26, 0, 2, 0, 45, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 200, 32, 32, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 328, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16, 1071, 18, 5, 26, 3994, 6, 582, 6842, 29, 1763, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 433, 44, 212, 63, 129, 74, 6, 0, 67, 12, 65, 1, 2, 0, 29, 6135, 9, 1237, 42, 9, 8936, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 229, 29, 3, 0, 496, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4153, 7, 221, 3, 5761, 15, 7472, 16, 621, 2467, 541, 1507, 4938, 6, 4191];

// This file was generated. Do not modify manually!
var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u0897-\u089f\u08ca-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b55-\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3c\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0cf3\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d81-\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0ebc\u0ec8-\u0ece\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u180f-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1abf-\u1ace\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf4\u1cf7-\u1cf9\u1dc0-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\u30fb\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua82c\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f\uff65";

// This file was generated. Do not modify manually!
var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u0870-\u0887\u0889-\u088e\u08a0-\u08c9\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c5d\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cdd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d04-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e86-\u0e8a\u0e8c-\u0ea3\u0ea5\u0ea7-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u1711\u171f-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4c\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c8a\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf3\u1cf5\u1cf6\u1cfa\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31bf\u31f0-\u31ff\u3400-\u4dbf\u4e00-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7cd\ua7d0\ua7d1\ua7d3\ua7d5-\ua7dc\ua7f2-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab69\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";

// These are a run-length and offset encoded representation of the
// >0xffff code points that are a valid part of identifiers. The
// offset starts at 0x10000, and each pair of numbers represents an
// offset to the next range, and then a size of the range.

// Reserved word lists for various dialects of the language

var reservedWords = {
  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  5: "class enum extends super const export import",
  6: "enum",
  strict: "implements interface let package private protected public static yield",
  strictBind: "eval arguments"
};

// And the keywords

var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

var keywords$1 = {
  5: ecma5AndLessKeywords,
  "5module": ecma5AndLessKeywords + " export import",
  6: ecma5AndLessKeywords + " const class extends export import super"
};

var keywordRelationalOperator = /^in(stanceof)?$/;

// ## Character categories

var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

// This has a complexity linear to the value of the code. The
// assumption is that looking up astral identifier characters is
// rare.
function isInAstralSet(code, set) {
  var pos = 0x10000;
  for (var i = 0; i < set.length; i += 2) {
    pos += set[i];
    if (pos > code) { return false }
    pos += set[i + 1];
    if (pos >= code) { return true }
  }
  return false
}

// Test whether a given character code starts an identifier.

function isIdentifierStart(code, astral) {
  if (code < 65) { return code === 36 }
  if (code < 91) { return true }
  if (code < 97) { return code === 95 }
  if (code < 123) { return true }
  if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code)) }
  if (astral === false) { return false }
  return isInAstralSet(code, astralIdentifierStartCodes)
}

// Test whether a given character is part of an identifier.

function isIdentifierChar(code, astral) {
  if (code < 48) { return code === 36 }
  if (code < 58) { return true }
  if (code < 65) { return false }
  if (code < 91) { return true }
  if (code < 97) { return code === 95 }
  if (code < 123) { return true }
  if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code)) }
  if (astral === false) { return false }
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
}

// ## Token types

// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// The `startsExpr` property is used to check if the token ends a
// `yield` expression. It is set on all token types that either can
// directly start an expression (like a quotation mark) or can
// continue an expression (like the body of a string).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.

var TokenType = function TokenType(label, conf) {
  if ( conf === void 0 ) conf = {};

  this.label = label;
  this.keyword = conf.keyword;
  this.beforeExpr = !!conf.beforeExpr;
  this.startsExpr = !!conf.startsExpr;
  this.isLoop = !!conf.isLoop;
  this.isAssign = !!conf.isAssign;
  this.prefix = !!conf.prefix;
  this.postfix = !!conf.postfix;
  this.binop = conf.binop || null;
  this.updateContext = null;
};

function binop(name, prec) {
  return new TokenType(name, {beforeExpr: true, binop: prec})
}
var beforeExpr = {beforeExpr: true}, startsExpr = {startsExpr: true};

// Map keyword names to token types.

var keywords = {};

// Succinct definitions of keyword token types
function kw(name, options) {
  if ( options === void 0 ) options = {};

  options.keyword = name;
  return keywords[name] = new TokenType(name, options)
}

var types$1 = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  privateId: new TokenType("privateId", startsExpr),
  eof: new TokenType("eof"),

  // Punctuation token types.
  bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  questionDot: new TokenType("?."),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  invalidTemplate: new TokenType("invalidTemplate"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator.
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.

  eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
  assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
  incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
  prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=/===/!==", 6),
  relational: binop("</>/<=/>=", 7),
  bitShift: binop("<</>>/>>>", 8),
  plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", {beforeExpr: true}),
  coalesce: binop("??", 1),

  // Keyword token types.
  _break: kw("break"),
  _case: kw("case", beforeExpr),
  _catch: kw("catch"),
  _continue: kw("continue"),
  _debugger: kw("debugger"),
  _default: kw("default", beforeExpr),
  _do: kw("do", {isLoop: true, beforeExpr: true}),
  _else: kw("else", beforeExpr),
  _finally: kw("finally"),
  _for: kw("for", {isLoop: true}),
  _function: kw("function", startsExpr),
  _if: kw("if"),
  _return: kw("return", beforeExpr),
  _switch: kw("switch"),
  _throw: kw("throw", beforeExpr),
  _try: kw("try"),
  _var: kw("var"),
  _const: kw("const"),
  _while: kw("while", {isLoop: true}),
  _with: kw("with"),
  _new: kw("new", {beforeExpr: true, startsExpr: true}),
  _this: kw("this", startsExpr),
  _super: kw("super", startsExpr),
  _class: kw("class", startsExpr),
  _extends: kw("extends", beforeExpr),
  _export: kw("export"),
  _import: kw("import", startsExpr),
  _null: kw("null", startsExpr),
  _true: kw("true", startsExpr),
  _false: kw("false", startsExpr),
  _in: kw("in", {beforeExpr: true, binop: 7}),
  _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
  _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
  _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
  _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
};

// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.

var lineBreak = /\r\n?|\n|\u2028|\u2029/;
var lineBreakG = new RegExp(lineBreak.source, "g");

function isNewLine(code) {
  return code === 10 || code === 13 || code === 0x2028 || code === 0x2029
}

function nextLineBreak(code, from, end) {
  if ( end === void 0 ) end = code.length;

  for (var i = from; i < end; i++) {
    var next = code.charCodeAt(i);
    if (isNewLine(next))
      { return i < end - 1 && next === 13 && code.charCodeAt(i + 1) === 10 ? i + 2 : i + 1 }
  }
  return -1
}

var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

var ref = Object.prototype;
var hasOwnProperty = ref.hasOwnProperty;
var toString = ref.toString;

var hasOwn = Object.hasOwn || (function (obj, propName) { return (
  hasOwnProperty.call(obj, propName)
); });

var isArray = Array.isArray || (function (obj) { return (
  toString.call(obj) === "[object Array]"
); });

var regexpCache = Object.create(null);

function wordsRegexp(words) {
  return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"))
}

function codePointToString(code) {
  // UTF-16 Decoding
  if (code <= 0xFFFF) { return String.fromCharCode(code) }
  code -= 0x10000;
  return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
}

var loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;

// These are used when `options.locations` is on, for the
// `startLoc` and `endLoc` properties.

var Position = function Position(line, col) {
  this.line = line;
  this.column = col;
};

Position.prototype.offset = function offset (n) {
  return new Position(this.line, this.column + n)
};

var SourceLocation = function SourceLocation(p, start, end) {
  this.start = start;
  this.end = end;
  if (p.sourceFile !== null) { this.source = p.sourceFile; }
};

// The `getLineInfo` function is mostly useful when the
// `locations` option is off (for performance reasons) and you
// want to find the line/column position for a given character
// offset. `input` should be the code string that the offset refers
// into.

function getLineInfo(input, offset) {
  for (var line = 1, cur = 0;;) {
    var nextBreak = nextLineBreak(input, cur, offset);
    if (nextBreak < 0) { return new Position(line, offset - cur) }
    ++line;
    cur = nextBreak;
  }
}

// A second argument must be given to configure the parser process.
// These options are recognized (only `ecmaVersion` is required):

var defaultOptions = {
  // `ecmaVersion` indicates the ECMAScript version to parse. Must be
  // either 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10
  // (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`
  // (the latest version the library supports). This influences
  // support for strict mode, the set of reserved words, and support
  // for new syntax features.
  ecmaVersion: null,
  // `sourceType` indicates the mode the code should be parsed in.
  // Can be either `"script"` or `"module"`. This influences global
  // strict mode and parsing of `import` and `export` declarations.
  sourceType: "script",
  // `onInsertedSemicolon` can be a callback that will be called when
  // a semicolon is automatically inserted. It will be passed the
  // position of the inserted semicolon as an offset, and if
  // `locations` is enabled, it is given the location as a `{line,
  // column}` object as second argument.
  onInsertedSemicolon: null,
  // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
  // trailing commas.
  onTrailingComma: null,
  // By default, reserved words are only enforced if ecmaVersion >= 5.
  // Set `allowReserved` to a boolean value to explicitly turn this on
  // an off. When this option has the value "never", reserved words
  // and keywords can also not be used as property names.
  allowReserved: null,
  // When enabled, a return at the top level is not considered an
  // error.
  allowReturnOutsideFunction: false,
  // When enabled, import/export statements are not constrained to
  // appearing at the top of the program, and an import.meta expression
  // in a script isn't considered an error.
  allowImportExportEverywhere: false,
  // By default, await identifiers are allowed to appear at the top-level scope only if ecmaVersion >= 2022.
  // When enabled, await identifiers are allowed to appear at the top-level scope,
  // but they are still not allowed in non-async functions.
  allowAwaitOutsideFunction: null,
  // When enabled, super identifiers are not constrained to
  // appearing in methods and do not raise an error when they appear elsewhere.
  allowSuperOutsideMethod: null,
  // When enabled, hashbang directive in the beginning of file is
  // allowed and treated as a line comment. Enabled by default when
  // `ecmaVersion` >= 2023.
  allowHashBang: false,
  // By default, the parser will verify that private properties are
  // only used in places where they are valid and have been declared.
  // Set this to false to turn such checks off.
  checkPrivateFields: true,
  // When `locations` is on, `loc` properties holding objects with
  // `start` and `end` properties in `{line, column}` form (with
  // line being 1-based and column 0-based) will be attached to the
  // nodes.
  locations: false,
  // A function can be passed as `onToken` option, which will
  // cause Acorn to call that function with object in the same
  // format as tokens returned from `tokenizer().getToken()`. Note
  // that you are not allowed to call the parser from the
  // callback—that will corrupt its internal state.
  onToken: null,
  // A function can be passed as `onComment` option, which will
  // cause Acorn to call that function with `(block, text, start,
  // end)` parameters whenever a comment is skipped. `block` is a
  // boolean indicating whether this is a block (`/* */`) comment,
  // `text` is the content of the comment, and `start` and `end` are
  // character offsets that denote the start and end of the comment.
  // When the `locations` option is on, two more parameters are
  // passed, the full `{line, column}` locations of the start and
  // end of the comments. Note that you are not allowed to call the
  // parser from the callback—that will corrupt its internal state.
  // When this option has an array as value, objects representing the
  // comments are pushed to it.
  onComment: null,
  // Nodes have their start and end characters offsets recorded in
  // `start` and `end` properties (directly on the node, rather than
  // the `loc` object, which holds line/column data. To also add a
  // [semi-standardized][range] `range` property holding a `[start,
  // end]` array with the same numbers, set the `ranges` option to
  // `true`.
  //
  // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  ranges: false,
  // It is possible to parse multiple files into a single AST by
  // passing the tree produced by parsing the first file as
  // `program` option in subsequent parses. This will add the
  // toplevel forms of the parsed file to the `Program` (top) node
  // of an existing parse tree.
  program: null,
  // When `locations` is on, you can pass this to record the source
  // file in every node's `loc` object.
  sourceFile: null,
  // This value, if given, is stored in every node, whether
  // `locations` is on or off.
  directSourceFile: null,
  // When enabled, parenthesized expressions are represented by
  // (non-standard) ParenthesizedExpression nodes
  preserveParens: false
};

// Interpret and default an options object

var warnedAboutEcmaVersion = false;

function getOptions(opts) {
  var options = {};

  for (var opt in defaultOptions)
    { options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt]; }

  if (options.ecmaVersion === "latest") {
    options.ecmaVersion = 1e8;
  } else if (options.ecmaVersion == null) {
    if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
      warnedAboutEcmaVersion = true;
      console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
    }
    options.ecmaVersion = 11;
  } else if (options.ecmaVersion >= 2015) {
    options.ecmaVersion -= 2009;
  }

  if (options.allowReserved == null)
    { options.allowReserved = options.ecmaVersion < 5; }

  if (!opts || opts.allowHashBang == null)
    { options.allowHashBang = options.ecmaVersion >= 14; }

  if (isArray(options.onToken)) {
    var tokens = options.onToken;
    options.onToken = function (token) { return tokens.push(token); };
  }
  if (isArray(options.onComment))
    { options.onComment = pushComment(options, options.onComment); }

  return options
}

function pushComment(options, array) {
  return function(block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? "Block" : "Line",
      value: text,
      start: start,
      end: end
    };
    if (options.locations)
      { comment.loc = new SourceLocation(this, startLoc, endLoc); }
    if (options.ranges)
      { comment.range = [start, end]; }
    array.push(comment);
  }
}

// Each scope gets a bitset that may contain these flags
var
    SCOPE_TOP = 1,
    SCOPE_FUNCTION = 2,
    SCOPE_ASYNC = 4,
    SCOPE_GENERATOR = 8,
    SCOPE_ARROW = 16,
    SCOPE_SIMPLE_CATCH = 32,
    SCOPE_SUPER = 64,
    SCOPE_DIRECT_SUPER = 128,
    SCOPE_CLASS_STATIC_BLOCK = 256,
    SCOPE_CLASS_FIELD_INIT = 512,
    SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;

function functionFlags(async, generator) {
  return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0)
}

// Used in checkLVal* and declareName to determine the type of a binding
var
    BIND_NONE = 0, // Not a binding
    BIND_VAR = 1, // Var-style binding
    BIND_LEXICAL = 2, // Let- or const-style binding
    BIND_FUNCTION = 3, // Function declaration
    BIND_SIMPLE_CATCH = 4, // Simple (identifier pattern) catch binding
    BIND_OUTSIDE = 5; // Special case for function names as bound inside the function

var Parser = function Parser(options, input, startPos) {
  this.options = options = getOptions(options);
  this.sourceFile = options.sourceFile;
  this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
  var reserved = "";
  if (options.allowReserved !== true) {
    reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
    if (options.sourceType === "module") { reserved += " await"; }
  }
  this.reservedWords = wordsRegexp(reserved);
  var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
  this.reservedWordsStrict = wordsRegexp(reservedStrict);
  this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
  this.input = String(input);

  // Used to signal to callers of `readWord1` whether the word
  // contained any escape sequences. This is needed because words with
  // escape sequences must not be interpreted as keywords.
  this.containsEsc = false;

  // Set up token state

  // The current position of the tokenizer in the input.
  if (startPos) {
    this.pos = startPos;
    this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
    this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
  } else {
    this.pos = this.lineStart = 0;
    this.curLine = 1;
  }

  // Properties of the current token:
  // Its type
  this.type = types$1.eof;
  // For tokens that include more information than their type, the value
  this.value = null;
  // Its start and end offset
  this.start = this.end = this.pos;
  // And, if locations are used, the {line, column} object
  // corresponding to those offsets
  this.startLoc = this.endLoc = this.curPosition();

  // Position information for the previous token
  this.lastTokEndLoc = this.lastTokStartLoc = null;
  this.lastTokStart = this.lastTokEnd = this.pos;

  // The context stack is used to superficially track syntactic
  // context to predict whether a regular expression is allowed in a
  // given position.
  this.context = this.initialContext();
  this.exprAllowed = true;

  // Figure out if it's a module code.
  this.inModule = options.sourceType === "module";
  this.strict = this.inModule || this.strictDirective(this.pos);

  // Used to signify the start of a potential arrow function
  this.potentialArrowAt = -1;
  this.potentialArrowInForAwait = false;

  // Positions to delayed-check that yield/await does not exist in default parameters.
  this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
  // Labels in scope.
  this.labels = [];
  // Thus-far undefined exports.
  this.undefinedExports = Object.create(null);

  // If enabled, skip leading hashbang line.
  if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!")
    { this.skipLineComment(2); }

  // Scope tracking for duplicate variable names (see scope.js)
  this.scopeStack = [];
  this.enterScope(SCOPE_TOP);

  // For RegExp validation
  this.regexpState = null;

  // The stack of private names.
  // Each element has two properties: 'declared' and 'used'.
  // When it exited from the outermost class definition, all used private names must be declared.
  this.privateNameStack = [];
};

var prototypeAccessors = { inFunction: { configurable: true },inGenerator: { configurable: true },inAsync: { configurable: true },canAwait: { configurable: true },allowSuper: { configurable: true },allowDirectSuper: { configurable: true },treatFunctionsAsVar: { configurable: true },allowNewDotTarget: { configurable: true },inClassStaticBlock: { configurable: true } };

Parser.prototype.parse = function parse () {
  var node = this.options.program || this.startNode();
  this.nextToken();
  return this.parseTopLevel(node)
};

prototypeAccessors.inFunction.get = function () { return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0 };

prototypeAccessors.inGenerator.get = function () { return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0 };

prototypeAccessors.inAsync.get = function () { return (this.currentVarScope().flags & SCOPE_ASYNC) > 0 };

prototypeAccessors.canAwait.get = function () {
  for (var i = this.scopeStack.length - 1; i >= 0; i--) {
    var ref = this.scopeStack[i];
      var flags = ref.flags;
    if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT)) { return false }
    if (flags & SCOPE_FUNCTION) { return (flags & SCOPE_ASYNC) > 0 }
  }
  return (this.inModule && this.options.ecmaVersion >= 13) || this.options.allowAwaitOutsideFunction
};

prototypeAccessors.allowSuper.get = function () {
  var ref = this.currentThisScope();
    var flags = ref.flags;
  return (flags & SCOPE_SUPER) > 0 || this.options.allowSuperOutsideMethod
};

prototypeAccessors.allowDirectSuper.get = function () { return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0 };

prototypeAccessors.treatFunctionsAsVar.get = function () { return this.treatFunctionsAsVarInScope(this.currentScope()) };

prototypeAccessors.allowNewDotTarget.get = function () {
  for (var i = this.scopeStack.length - 1; i >= 0; i--) {
    var ref = this.scopeStack[i];
      var flags = ref.flags;
    if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT) ||
        ((flags & SCOPE_FUNCTION) && !(flags & SCOPE_ARROW))) { return true }
  }
  return false
};

prototypeAccessors.inClassStaticBlock.get = function () {
  return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0
};

Parser.extend = function extend () {
    var plugins = [], len = arguments.length;
    while ( len-- ) plugins[ len ] = arguments[ len ];

  var cls = this;
  for (var i = 0; i < plugins.length; i++) { cls = plugins[i](cls); }
  return cls
};

Parser.parse = function parse (input, options) {
  return new this(options, input).parse()
};

Parser.parseExpressionAt = function parseExpressionAt (input, pos, options) {
  var parser = new this(options, input, pos);
  parser.nextToken();
  return parser.parseExpression()
};

Parser.tokenizer = function tokenizer (input, options) {
  return new this(options, input)
};

Object.defineProperties( Parser.prototype, prototypeAccessors );

var pp$9 = Parser.prototype;

// ## Parser utilities

var literal = /^(?:'((?:\\[^]|[^'\\])*?)'|"((?:\\[^]|[^"\\])*?)")/;
pp$9.strictDirective = function(start) {
  if (this.options.ecmaVersion < 5) { return false }
  for (;;) {
    // Try to find string literal.
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this.input)[0].length;
    var match = literal.exec(this.input.slice(start));
    if (!match) { return false }
    if ((match[1] || match[2]) === "use strict") {
      skipWhiteSpace.lastIndex = start + match[0].length;
      var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
      var next = this.input.charAt(end);
      return next === ";" || next === "}" ||
        (lineBreak.test(spaceAfter[0]) &&
         !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "="))
    }
    start += match[0].length;

    // Skip semicolon, if any.
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this.input)[0].length;
    if (this.input[start] === ";")
      { start++; }
  }
};

// Predicate that tests whether the next token is of the given
// type, and if yes, consumes it as a side effect.

pp$9.eat = function(type) {
  if (this.type === type) {
    this.next();
    return true
  } else {
    return false
  }
};

// Tests whether parsed token is a contextual keyword.

pp$9.isContextual = function(name) {
  return this.type === types$1.name && this.value === name && !this.containsEsc
};

// Consumes contextual keyword if possible.

pp$9.eatContextual = function(name) {
  if (!this.isContextual(name)) { return false }
  this.next();
  return true
};

// Asserts that following token is given contextual keyword.

pp$9.expectContextual = function(name) {
  if (!this.eatContextual(name)) { this.unexpected(); }
};

// Test whether a semicolon can be inserted at the current position.

pp$9.canInsertSemicolon = function() {
  return this.type === types$1.eof ||
    this.type === types$1.braceR ||
    lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
};

pp$9.insertSemicolon = function() {
  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon)
      { this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc); }
    return true
  }
};

// Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.

pp$9.semicolon = function() {
  if (!this.eat(types$1.semi) && !this.insertSemicolon()) { this.unexpected(); }
};

pp$9.afterTrailingComma = function(tokType, notNext) {
  if (this.type === tokType) {
    if (this.options.onTrailingComma)
      { this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc); }
    if (!notNext)
      { this.next(); }
    return true
  }
};

// Expect a token of a given type. If found, consume it, otherwise,
// raise an unexpected token error.

pp$9.expect = function(type) {
  this.eat(type) || this.unexpected();
};

// Raise an unexpected token error.

pp$9.unexpected = function(pos) {
  this.raise(pos != null ? pos : this.start, "Unexpected token");
};

var DestructuringErrors = function DestructuringErrors() {
  this.shorthandAssign =
  this.trailingComma =
  this.parenthesizedAssign =
  this.parenthesizedBind =
  this.doubleProto =
    -1;
};

pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
  if (!refDestructuringErrors) { return }
  if (refDestructuringErrors.trailingComma > -1)
    { this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element"); }
  var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
  if (parens > -1) { this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern"); }
};

pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
  if (!refDestructuringErrors) { return false }
  var shorthandAssign = refDestructuringErrors.shorthandAssign;
  var doubleProto = refDestructuringErrors.doubleProto;
  if (!andThrow) { return shorthandAssign >= 0 || doubleProto >= 0 }
  if (shorthandAssign >= 0)
    { this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns"); }
  if (doubleProto >= 0)
    { this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property"); }
};

pp$9.checkYieldAwaitInDefaultParams = function() {
  if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
    { this.raise(this.yieldPos, "Yield expression cannot be a default value"); }
  if (this.awaitPos)
    { this.raise(this.awaitPos, "Await expression cannot be a default value"); }
};

pp$9.isSimpleAssignTarget = function(expr) {
  if (expr.type === "ParenthesizedExpression")
    { return this.isSimpleAssignTarget(expr.expression) }
  return expr.type === "Identifier" || expr.type === "MemberExpression"
};

var pp$8 = Parser.prototype;

// ### Statement parsing

// Parse a program. Initializes the parser, reads any number of
// statements, and wraps them in a Program node.  Optionally takes a
// `program` argument.  If present, the statements will be appended
// to its body instead of creating a new node.

pp$8.parseTopLevel = function(node) {
  var exports = Object.create(null);
  if (!node.body) { node.body = []; }
  while (this.type !== types$1.eof) {
    var stmt = this.parseStatement(null, true, exports);
    node.body.push(stmt);
  }
  if (this.inModule)
    { for (var i = 0, list = Object.keys(this.undefinedExports); i < list.length; i += 1)
      {
        var name = list[i];

        this.raiseRecoverable(this.undefinedExports[name].start, ("Export '" + name + "' is not defined"));
      } }
  this.adaptDirectivePrologue(node.body);
  this.next();
  node.sourceType = this.options.sourceType;
  return this.finishNode(node, "Program")
};

var loopLabel = {kind: "loop"}, switchLabel = {kind: "switch"};

pp$8.isLet = function(context) {
  if (this.options.ecmaVersion < 6 || !this.isContextual("let")) { return false }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
  // For ambiguous cases, determine if a LexicalDeclaration (or only a
  // Statement) is allowed here. If context is not empty then only a Statement
  // is allowed. However, `let [` is an explicit negative lookahead for
  // ExpressionStatement, so special-case it first.
  if (nextCh === 91 || nextCh === 92) { return true } // '[', '\'
  if (context) { return false }

  if (nextCh === 123 || nextCh > 0xd7ff && nextCh < 0xdc00) { return true } // '{', astral
  if (isIdentifierStart(nextCh, true)) {
    var pos = next + 1;
    while (isIdentifierChar(nextCh = this.input.charCodeAt(pos), true)) { ++pos; }
    if (nextCh === 92 || nextCh > 0xd7ff && nextCh < 0xdc00) { return true }
    var ident = this.input.slice(next, pos);
    if (!keywordRelationalOperator.test(ident)) { return true }
  }
  return false
};

// check 'async [no LineTerminator here] function'
// - 'async /*foo*/ function' is OK.
// - 'async /*\n*/ function' is invalid.
pp$8.isAsyncFunction = function() {
  if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
    { return false }

  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, after;
  return !lineBreak.test(this.input.slice(this.pos, next)) &&
    this.input.slice(next, next + 8) === "function" &&
    (next + 8 === this.input.length ||
     !(isIdentifierChar(after = this.input.charCodeAt(next + 8)) || after > 0xd7ff && after < 0xdc00))
};

pp$8.isUsingKeyword = function(isAwaitUsing, isFor) {
  if (this.options.ecmaVersion < 17 || !this.isContextual(isAwaitUsing ? "await" : "using"))
    { return false }

  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length;

  if (lineBreak.test(this.input.slice(this.pos, next))) { return false }

  if (isAwaitUsing) {
    var awaitEndPos = next + 5 /* await */, after;
    if (this.input.slice(next, awaitEndPos) !== "using" ||
      awaitEndPos === this.input.length ||
      isIdentifierChar(after = this.input.charCodeAt(awaitEndPos)) ||
      (after > 0xd7ff && after < 0xdc00)
    ) { return false }

    skipWhiteSpace.lastIndex = awaitEndPos;
    var skipAfterUsing = skipWhiteSpace.exec(this.input);
    if (skipAfterUsing && lineBreak.test(this.input.slice(awaitEndPos, awaitEndPos + skipAfterUsing[0].length))) { return false }
  }

  if (isFor) {
    var ofEndPos = next + 2 /* of */, after$1;
    if (this.input.slice(next, ofEndPos) === "of") {
      if (ofEndPos === this.input.length ||
        (!isIdentifierChar(after$1 = this.input.charCodeAt(ofEndPos)) && !(after$1 > 0xd7ff && after$1 < 0xdc00))) { return false }
    }
  }

  var ch = this.input.charCodeAt(next);
  return isIdentifierStart(ch, true) || ch === 92 // '\'
};

pp$8.isAwaitUsing = function(isFor) {
  return this.isUsingKeyword(true, isFor)
};

pp$8.isUsing = function(isFor) {
  return this.isUsingKeyword(false, isFor)
};

// Parse a single statement.
//
// If expecting a statement and finding a slash operator, parse a
// regular expression literal. This is to handle cases like
// `if (foo) /blah/.exec(foo)`, where looking at the previous token
// does not help.

pp$8.parseStatement = function(context, topLevel, exports) {
  var starttype = this.type, node = this.startNode(), kind;

  if (this.isLet(context)) {
    starttype = types$1._var;
    kind = "let";
  }

  // Most types of statements are recognized by the keyword they
  // start with. Many are trivial to parse, some require a bit of
  // complexity.

  switch (starttype) {
  case types$1._break: case types$1._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
  case types$1._debugger: return this.parseDebuggerStatement(node)
  case types$1._do: return this.parseDoStatement(node)
  case types$1._for: return this.parseForStatement(node)
  case types$1._function:
    // Function as sole body of either an if statement or a labeled statement
    // works, but not when it is part of a labeled statement that is the sole
    // body of an if statement.
    if ((context && (this.strict || context !== "if" && context !== "label")) && this.options.ecmaVersion >= 6) { this.unexpected(); }
    return this.parseFunctionStatement(node, false, !context)
  case types$1._class:
    if (context) { this.unexpected(); }
    return this.parseClass(node, true)
  case types$1._if: return this.parseIfStatement(node)
  case types$1._return: return this.parseReturnStatement(node)
  case types$1._switch: return this.parseSwitchStatement(node)
  case types$1._throw: return this.parseThrowStatement(node)
  case types$1._try: return this.parseTryStatement(node)
  case types$1._const: case types$1._var:
    kind = kind || this.value;
    if (context && kind !== "var") { this.unexpected(); }
    return this.parseVarStatement(node, kind)
  case types$1._while: return this.parseWhileStatement(node)
  case types$1._with: return this.parseWithStatement(node)
  case types$1.braceL: return this.parseBlock(true, node)
  case types$1.semi: return this.parseEmptyStatement(node)
  case types$1._export:
  case types$1._import:
    if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
      skipWhiteSpace.lastIndex = this.pos;
      var skip = skipWhiteSpace.exec(this.input);
      var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
      if (nextCh === 40 || nextCh === 46) // '(' or '.'
        { return this.parseExpressionStatement(node, this.parseExpression()) }
    }

    if (!this.options.allowImportExportEverywhere) {
      if (!topLevel)
        { this.raise(this.start, "'import' and 'export' may only appear at the top level"); }
      if (!this.inModule)
        { this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'"); }
    }
    return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports)

    // If the statement does not start with a statement keyword or a
    // brace, it's an ExpressionStatement or LabeledStatement. We
    // simply start parsing an expression, and afterwards, if the
    // next token is a colon and the expression was a simple
    // Identifier node, we switch to interpreting it as a label.
  default:
    if (this.isAsyncFunction()) {
      if (context) { this.unexpected(); }
      this.next();
      return this.parseFunctionStatement(node, true, !context)
    }

    var usingKind = this.isAwaitUsing(false) ? "await using" : this.isUsing(false) ? "using" : null;
    if (usingKind) {
      if (topLevel && this.options.sourceType === "script") {
        this.raise(this.start, "Using declaration cannot appear in the top level when source type is `script`");
      }
      if (usingKind === "await using") {
        if (!this.canAwait) {
          this.raise(this.start, "Await using cannot appear outside of async function");
        }
        this.next();
      }
      this.next();
      this.parseVar(node, false, usingKind);
      this.semicolon();
      return this.finishNode(node, "VariableDeclaration")
    }

    var maybeName = this.value, expr = this.parseExpression();
    if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon))
      { return this.parseLabeledStatement(node, maybeName, expr, context) }
    else { return this.parseExpressionStatement(node, expr) }
  }
};

pp$8.parseBreakContinueStatement = function(node, keyword) {
  var isBreak = keyword === "break";
  this.next();
  if (this.eat(types$1.semi) || this.insertSemicolon()) { node.label = null; }
  else if (this.type !== types$1.name) { this.unexpected(); }
  else {
    node.label = this.parseIdent();
    this.semicolon();
  }

  // Verify that there is an actual destination to break or
  // continue to.
  var i = 0;
  for (; i < this.labels.length; ++i) {
    var lab = this.labels[i];
    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) { break }
      if (node.label && isBreak) { break }
    }
  }
  if (i === this.labels.length) { this.raise(node.start, "Unsyntactic " + keyword); }
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
};

pp$8.parseDebuggerStatement = function(node) {
  this.next();
  this.semicolon();
  return this.finishNode(node, "DebuggerStatement")
};

pp$8.parseDoStatement = function(node) {
  this.next();
  this.labels.push(loopLabel);
  node.body = this.parseStatement("do");
  this.labels.pop();
  this.expect(types$1._while);
  node.test = this.parseParenExpression();
  if (this.options.ecmaVersion >= 6)
    { this.eat(types$1.semi); }
  else
    { this.semicolon(); }
  return this.finishNode(node, "DoWhileStatement")
};

// Disambiguating between a `for` and a `for`/`in` or `for`/`of`
// loop is non-trivial. Basically, we have to parse the init `var`
// statement or expression, disallowing the `in` operator (see
// the second parameter to `parseExpression`), and then check
// whether the next token is `in` or `of`. When there is no init
// part (semicolon immediately after the opening parenthesis), it
// is a regular `for` loop.

pp$8.parseForStatement = function(node) {
  this.next();
  var awaitAt = (this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await")) ? this.lastTokStart : -1;
  this.labels.push(loopLabel);
  this.enterScope(0);
  this.expect(types$1.parenL);
  if (this.type === types$1.semi) {
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, null)
  }
  var isLet = this.isLet();
  if (this.type === types$1._var || this.type === types$1._const || isLet) {
    var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
    this.next();
    this.parseVar(init$1, true, kind);
    this.finishNode(init$1, "VariableDeclaration");
    return this.parseForAfterInit(node, init$1, awaitAt)
  }
  var startsWithLet = this.isContextual("let"), isForOf = false;

  var usingKind = this.isUsing(true) ? "using" : this.isAwaitUsing(true) ? "await using" : null;
  if (usingKind) {
    var init$2 = this.startNode();
    this.next();
    if (usingKind === "await using") { this.next(); }
    this.parseVar(init$2, true, usingKind);
    this.finishNode(init$2, "VariableDeclaration");
    return this.parseForAfterInit(node, init$2, awaitAt)
  }
  var containsEsc = this.containsEsc;
  var refDestructuringErrors = new DestructuringErrors;
  var initPos = this.start;
  var init = awaitAt > -1
    ? this.parseExprSubscripts(refDestructuringErrors, "await")
    : this.parseExpression(true, refDestructuringErrors);
  if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
    if (awaitAt > -1) { // implies `ecmaVersion >= 9` (see declaration of awaitAt)
      if (this.type === types$1._in) { this.unexpected(awaitAt); }
      node.await = true;
    } else if (isForOf && this.options.ecmaVersion >= 8) {
      if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") { this.unexpected(); }
      else if (this.options.ecmaVersion >= 9) { node.await = false; }
    }
    if (startsWithLet && isForOf) { this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'."); }
    this.toAssignable(init, false, refDestructuringErrors);
    this.checkLValPattern(init);
    return this.parseForIn(node, init)
  } else {
    this.checkExpressionErrors(refDestructuringErrors, true);
  }
  if (awaitAt > -1) { this.unexpected(awaitAt); }
  return this.parseFor(node, init)
};

// Helper method to parse for loop after variable initialization
pp$8.parseForAfterInit = function(node, init, awaitAt) {
  if ((this.type === types$1._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init.declarations.length === 1) {
    if (this.options.ecmaVersion >= 9) {
      if (this.type === types$1._in) {
        if (awaitAt > -1) { this.unexpected(awaitAt); }
      } else { node.await = awaitAt > -1; }
    }
    return this.parseForIn(node, init)
  }
  if (awaitAt > -1) { this.unexpected(awaitAt); }
  return this.parseFor(node, init)
};

pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
  this.next();
  return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync)
};

pp$8.parseIfStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  // allow function declarations in branches, but only in non-strict mode
  node.consequent = this.parseStatement("if");
  node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
  return this.finishNode(node, "IfStatement")
};

pp$8.parseReturnStatement = function(node) {
  if (!this.inFunction && !this.options.allowReturnOutsideFunction)
    { this.raise(this.start, "'return' outside of function"); }
  this.next();

  // In `return` (and `break`/`continue`), the keywords with
  // optional arguments, we eagerly look for a semicolon or the
  // possibility to insert one.

  if (this.eat(types$1.semi) || this.insertSemicolon()) { node.argument = null; }
  else { node.argument = this.parseExpression(); this.semicolon(); }
  return this.finishNode(node, "ReturnStatement")
};

pp$8.parseSwitchStatement = function(node) {
  this.next();
  node.discriminant = this.parseParenExpression();
  node.cases = [];
  this.expect(types$1.braceL);
  this.labels.push(switchLabel);
  this.enterScope(0);

  // Statements under must be grouped (by label) in SwitchCase
  // nodes. `cur` is used to keep the node that we are currently
  // adding statements to.

  var cur;
  for (var sawDefault = false; this.type !== types$1.braceR;) {
    if (this.type === types$1._case || this.type === types$1._default) {
      var isCase = this.type === types$1._case;
      if (cur) { this.finishNode(cur, "SwitchCase"); }
      node.cases.push(cur = this.startNode());
      cur.consequent = [];
      this.next();
      if (isCase) {
        cur.test = this.parseExpression();
      } else {
        if (sawDefault) { this.raiseRecoverable(this.lastTokStart, "Multiple default clauses"); }
        sawDefault = true;
        cur.test = null;
      }
      this.expect(types$1.colon);
    } else {
      if (!cur) { this.unexpected(); }
      cur.consequent.push(this.parseStatement(null));
    }
  }
  this.exitScope();
  if (cur) { this.finishNode(cur, "SwitchCase"); }
  this.next(); // Closing brace
  this.labels.pop();
  return this.finishNode(node, "SwitchStatement")
};

pp$8.parseThrowStatement = function(node) {
  this.next();
  if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
    { this.raise(this.lastTokEnd, "Illegal newline after throw"); }
  node.argument = this.parseExpression();
  this.semicolon();
  return this.finishNode(node, "ThrowStatement")
};

// Reused empty array added for node fields that are always empty.

var empty$1 = [];

pp$8.parseCatchClauseParam = function() {
  var param = this.parseBindingAtom();
  var simple = param.type === "Identifier";
  this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
  this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
  this.expect(types$1.parenR);

  return param
};

pp$8.parseTryStatement = function(node) {
  this.next();
  node.block = this.parseBlock();
  node.handler = null;
  if (this.type === types$1._catch) {
    var clause = this.startNode();
    this.next();
    if (this.eat(types$1.parenL)) {
      clause.param = this.parseCatchClauseParam();
    } else {
      if (this.options.ecmaVersion < 10) { this.unexpected(); }
      clause.param = null;
      this.enterScope(0);
    }
    clause.body = this.parseBlock(false);
    this.exitScope();
    node.handler = this.finishNode(clause, "CatchClause");
  }
  node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
  if (!node.handler && !node.finalizer)
    { this.raise(node.start, "Missing catch or finally clause"); }
  return this.finishNode(node, "TryStatement")
};

pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
  this.next();
  this.parseVar(node, false, kind, allowMissingInitializer);
  this.semicolon();
  return this.finishNode(node, "VariableDeclaration")
};

pp$8.parseWhileStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  this.labels.push(loopLabel);
  node.body = this.parseStatement("while");
  this.labels.pop();
  return this.finishNode(node, "WhileStatement")
};

pp$8.parseWithStatement = function(node) {
  if (this.strict) { this.raise(this.start, "'with' in strict mode"); }
  this.next();
  node.object = this.parseParenExpression();
  node.body = this.parseStatement("with");
  return this.finishNode(node, "WithStatement")
};

pp$8.parseEmptyStatement = function(node) {
  this.next();
  return this.finishNode(node, "EmptyStatement")
};

pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
  for (var i$1 = 0, list = this.labels; i$1 < list.length; i$1 += 1)
    {
    var label = list[i$1];

    if (label.name === maybeName)
      { this.raise(expr.start, "Label '" + maybeName + "' is already declared");
  } }
  var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
  for (var i = this.labels.length - 1; i >= 0; i--) {
    var label$1 = this.labels[i];
    if (label$1.statementStart === node.start) {
      // Update information about previous labels on this node
      label$1.statementStart = this.start;
      label$1.kind = kind;
    } else { break }
  }
  this.labels.push({name: maybeName, kind: kind, statementStart: this.start});
  node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
  this.labels.pop();
  node.label = expr;
  return this.finishNode(node, "LabeledStatement")
};

pp$8.parseExpressionStatement = function(node, expr) {
  node.expression = expr;
  this.semicolon();
  return this.finishNode(node, "ExpressionStatement")
};

// Parse a semicolon-enclosed block of statements, handling `"use
// strict"` declarations when `allowStrict` is true (used for
// function bodies).

pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
  if ( createNewLexicalScope === void 0 ) createNewLexicalScope = true;
  if ( node === void 0 ) node = this.startNode();

  node.body = [];
  this.expect(types$1.braceL);
  if (createNewLexicalScope) { this.enterScope(0); }
  while (this.type !== types$1.braceR) {
    var stmt = this.parseStatement(null);
    node.body.push(stmt);
  }
  if (exitStrict) { this.strict = false; }
  this.next();
  if (createNewLexicalScope) { this.exitScope(); }
  return this.finishNode(node, "BlockStatement")
};

// Parse a regular `for` loop. The disambiguation code in
// `parseStatement` will already have parsed the init statement or
// expression.

pp$8.parseFor = function(node, init) {
  node.init = init;
  this.expect(types$1.semi);
  node.test = this.type === types$1.semi ? null : this.parseExpression();
  this.expect(types$1.semi);
  node.update = this.type === types$1.parenR ? null : this.parseExpression();
  this.expect(types$1.parenR);
  node.body = this.parseStatement("for");
  this.exitScope();
  this.labels.pop();
  return this.finishNode(node, "ForStatement")
};

// Parse a `for`/`in` and `for`/`of` loop, which are almost
// same from parser's perspective.

pp$8.parseForIn = function(node, init) {
  var isForIn = this.type === types$1._in;
  this.next();

  if (
    init.type === "VariableDeclaration" &&
    init.declarations[0].init != null &&
    (
      !isForIn ||
      this.options.ecmaVersion < 8 ||
      this.strict ||
      init.kind !== "var" ||
      init.declarations[0].id.type !== "Identifier"
    )
  ) {
    this.raise(
      init.start,
      ((isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer")
    );
  }
  node.left = init;
  node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
  this.expect(types$1.parenR);
  node.body = this.parseStatement("for");
  this.exitScope();
  this.labels.pop();
  return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement")
};

// Parse a list of variable declarations.

pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
  node.declarations = [];
  node.kind = kind;
  for (;;) {
    var decl = this.startNode();
    this.parseVarId(decl, kind);
    if (this.eat(types$1.eq)) {
      decl.init = this.parseMaybeAssign(isFor);
    } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || (this.options.ecmaVersion >= 6 && this.isContextual("of")))) {
      this.unexpected();
    } else if (!allowMissingInitializer && (kind === "using" || kind === "await using") && this.options.ecmaVersion >= 17 && this.type !== types$1._in && !this.isContextual("of")) {
      this.raise(this.lastTokEnd, ("Missing initializer in " + kind + " declaration"));
    } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
      this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
    } else {
      decl.init = null;
    }
    node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
    if (!this.eat(types$1.comma)) { break }
  }
  return node
};

pp$8.parseVarId = function(decl, kind) {
  decl.id = kind === "using" || kind === "await using"
    ? this.parseIdent()
    : this.parseBindingAtom();

  this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
};

var FUNC_STATEMENT = 1, FUNC_HANGING_STATEMENT = 2, FUNC_NULLABLE_ID = 4;

// Parse a function declaration or literal (depending on the
// `statement & FUNC_STATEMENT`).

// Remove `allowExpressionBody` for 7.0.0, as it is only called with false
pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
  this.initFunction(node);
  if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
    if (this.type === types$1.star && (statement & FUNC_HANGING_STATEMENT))
      { this.unexpected(); }
    node.generator = this.eat(types$1.star);
  }
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }

  if (statement & FUNC_STATEMENT) {
    node.id = (statement & FUNC_NULLABLE_ID) && this.type !== types$1.name ? null : this.parseIdent();
    if (node.id && !(statement & FUNC_HANGING_STATEMENT))
      // If it is a regular function declaration in sloppy mode, then it is
      // subject to Annex B semantics (BIND_FUNCTION). Otherwise, the binding
      // mode depends on properties of the current scope (see
      // treatFunctionsAsVar).
      { this.checkLValSimple(node.id, (this.strict || node.generator || node.async) ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION); }
  }

  var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  this.enterScope(functionFlags(node.async, node.generator));

  if (!(statement & FUNC_STATEMENT))
    { node.id = this.type === types$1.name ? this.parseIdent() : null; }

  this.parseFunctionParams(node);
  this.parseFunctionBody(node, allowExpressionBody, false, forInit);

  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, (statement & FUNC_STATEMENT) ? "FunctionDeclaration" : "FunctionExpression")
};

pp$8.parseFunctionParams = function(node) {
  this.expect(types$1.parenL);
  node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
};

// Parse a class declaration or literal (depending on the
// `isStatement` parameter).

pp$8.parseClass = function(node, isStatement) {
  this.next();

  // ecma-262 14.6 Class Definitions
  // A class definition is always strict mode code.
  var oldStrict = this.strict;
  this.strict = true;

  this.parseClassId(node, isStatement);
  this.parseClassSuper(node);
  var privateNameMap = this.enterClassBody();
  var classBody = this.startNode();
  var hadConstructor = false;
  classBody.body = [];
  this.expect(types$1.braceL);
  while (this.type !== types$1.braceR) {
    var element = this.parseClassElement(node.superClass !== null);
    if (element) {
      classBody.body.push(element);
      if (element.type === "MethodDefinition" && element.kind === "constructor") {
        if (hadConstructor) { this.raiseRecoverable(element.start, "Duplicate constructor in the same class"); }
        hadConstructor = true;
      } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
        this.raiseRecoverable(element.key.start, ("Identifier '#" + (element.key.name) + "' has already been declared"));
      }
    }
  }
  this.strict = oldStrict;
  this.next();
  node.body = this.finishNode(classBody, "ClassBody");
  this.exitClassBody();
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
};

pp$8.parseClassElement = function(constructorAllowsSuper) {
  if (this.eat(types$1.semi)) { return null }

  var ecmaVersion = this.options.ecmaVersion;
  var node = this.startNode();
  var keyName = "";
  var isGenerator = false;
  var isAsync = false;
  var kind = "method";
  var isStatic = false;

  if (this.eatContextual("static")) {
    // Parse static init block
    if (ecmaVersion >= 13 && this.eat(types$1.braceL)) {
      this.parseClassStaticBlock(node);
      return node
    }
    if (this.isClassElementNameStart() || this.type === types$1.star) {
      isStatic = true;
    } else {
      keyName = "static";
    }
  }
  node.static = isStatic;
  if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
    if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
      isAsync = true;
    } else {
      keyName = "async";
    }
  }
  if (!keyName && (ecmaVersion >= 9 || !isAsync) && this.eat(types$1.star)) {
    isGenerator = true;
  }
  if (!keyName && !isAsync && !isGenerator) {
    var lastValue = this.value;
    if (this.eatContextual("get") || this.eatContextual("set")) {
      if (this.isClassElementNameStart()) {
        kind = lastValue;
      } else {
        keyName = lastValue;
      }
    }
  }

  // Parse element name
  if (keyName) {
    // 'async', 'get', 'set', or 'static' were not a keyword contextually.
    // The last token is any of those. Make it the element name.
    node.computed = false;
    node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
    node.key.name = keyName;
    this.finishNode(node.key, "Identifier");
  } else {
    this.parseClassElementName(node);
  }

  // Parse element value
  if (ecmaVersion < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
    var isConstructor = !node.static && checkKeyName(node, "constructor");
    var allowsDirectSuper = isConstructor && constructorAllowsSuper;
    // Couldn't move this check into the 'parseClassMethod' method for backward compatibility.
    if (isConstructor && kind !== "method") { this.raise(node.key.start, "Constructor can't have get/set modifier"); }
    node.kind = isConstructor ? "constructor" : kind;
    this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
  } else {
    this.parseClassField(node);
  }

  return node
};

pp$8.isClassElementNameStart = function() {
  return (
    this.type === types$1.name ||
    this.type === types$1.privateId ||
    this.type === types$1.num ||
    this.type === types$1.string ||
    this.type === types$1.bracketL ||
    this.type.keyword
  )
};

pp$8.parseClassElementName = function(element) {
  if (this.type === types$1.privateId) {
    if (this.value === "constructor") {
      this.raise(this.start, "Classes can't have an element named '#constructor'");
    }
    element.computed = false;
    element.key = this.parsePrivateIdent();
  } else {
    this.parsePropertyName(element);
  }
};

pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
  // Check key and flags
  var key = method.key;
  if (method.kind === "constructor") {
    if (isGenerator) { this.raise(key.start, "Constructor can't be a generator"); }
    if (isAsync) { this.raise(key.start, "Constructor can't be an async method"); }
  } else if (method.static && checkKeyName(method, "prototype")) {
    this.raise(key.start, "Classes may not have a static property named prototype");
  }

  // Parse value
  var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);

  // Check value
  if (method.kind === "get" && value.params.length !== 0)
    { this.raiseRecoverable(value.start, "getter should have no params"); }
  if (method.kind === "set" && value.params.length !== 1)
    { this.raiseRecoverable(value.start, "setter should have exactly one param"); }
  if (method.kind === "set" && value.params[0].type === "RestElement")
    { this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params"); }

  return this.finishNode(method, "MethodDefinition")
};

pp$8.parseClassField = function(field) {
  if (checkKeyName(field, "constructor")) {
    this.raise(field.key.start, "Classes can't have a field named 'constructor'");
  } else if (field.static && checkKeyName(field, "prototype")) {
    this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
  }

  if (this.eat(types$1.eq)) {
    // To raise SyntaxError if 'arguments' exists in the initializer.
    this.enterScope(SCOPE_CLASS_FIELD_INIT | SCOPE_SUPER);
    field.value = this.parseMaybeAssign();
    this.exitScope();
  } else {
    field.value = null;
  }
  this.semicolon();

  return this.finishNode(field, "PropertyDefinition")
};

pp$8.parseClassStaticBlock = function(node) {
  node.body = [];

  var oldLabels = this.labels;
  this.labels = [];
  this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
  while (this.type !== types$1.braceR) {
    var stmt = this.parseStatement(null);
    node.body.push(stmt);
  }
  this.next();
  this.exitScope();
  this.labels = oldLabels;

  return this.finishNode(node, "StaticBlock")
};

pp$8.parseClassId = function(node, isStatement) {
  if (this.type === types$1.name) {
    node.id = this.parseIdent();
    if (isStatement)
      { this.checkLValSimple(node.id, BIND_LEXICAL, false); }
  } else {
    if (isStatement === true)
      { this.unexpected(); }
    node.id = null;
  }
};

pp$8.parseClassSuper = function(node) {
  node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
};

pp$8.enterClassBody = function() {
  var element = {declared: Object.create(null), used: []};
  this.privateNameStack.push(element);
  return element.declared
};

pp$8.exitClassBody = function() {
  var ref = this.privateNameStack.pop();
  var declared = ref.declared;
  var used = ref.used;
  if (!this.options.checkPrivateFields) { return }
  var len = this.privateNameStack.length;
  var parent = len === 0 ? null : this.privateNameStack[len - 1];
  for (var i = 0; i < used.length; ++i) {
    var id = used[i];
    if (!hasOwn(declared, id.name)) {
      if (parent) {
        parent.used.push(id);
      } else {
        this.raiseRecoverable(id.start, ("Private field '#" + (id.name) + "' must be declared in an enclosing class"));
      }
    }
  }
};

function isPrivateNameConflicted(privateNameMap, element) {
  var name = element.key.name;
  var curr = privateNameMap[name];

  var next = "true";
  if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
    next = (element.static ? "s" : "i") + element.kind;
  }

  // `class { get #a(){}; static set #a(_){} }` is also conflict.
  if (
    curr === "iget" && next === "iset" ||
    curr === "iset" && next === "iget" ||
    curr === "sget" && next === "sset" ||
    curr === "sset" && next === "sget"
  ) {
    privateNameMap[name] = "true";
    return false
  } else if (!curr) {
    privateNameMap[name] = next;
    return false
  } else {
    return true
  }
}

function checkKeyName(node, name) {
  var computed = node.computed;
  var key = node.key;
  return !computed && (
    key.type === "Identifier" && key.name === name ||
    key.type === "Literal" && key.value === name
  )
}

// Parses module export declaration.

pp$8.parseExportAllDeclaration = function(node, exports) {
  if (this.options.ecmaVersion >= 11) {
    if (this.eatContextual("as")) {
      node.exported = this.parseModuleExportName();
      this.checkExport(exports, node.exported, this.lastTokStart);
    } else {
      node.exported = null;
    }
  }
  this.expectContextual("from");
  if (this.type !== types$1.string) { this.unexpected(); }
  node.source = this.parseExprAtom();
  if (this.options.ecmaVersion >= 16)
    { node.attributes = this.parseWithClause(); }
  this.semicolon();
  return this.finishNode(node, "ExportAllDeclaration")
};

pp$8.parseExport = function(node, exports) {
  this.next();
  // export * from '...'
  if (this.eat(types$1.star)) {
    return this.parseExportAllDeclaration(node, exports)
  }
  if (this.eat(types$1._default)) { // export default ...
    this.checkExport(exports, "default", this.lastTokStart);
    node.declaration = this.parseExportDefaultDeclaration();
    return this.finishNode(node, "ExportDefaultDeclaration")
  }
  // export var|const|let|function|class ...
  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseExportDeclaration(node);
    if (node.declaration.type === "VariableDeclaration")
      { this.checkVariableExport(exports, node.declaration.declarations); }
    else
      { this.checkExport(exports, node.declaration.id, node.declaration.id.start); }
    node.specifiers = [];
    node.source = null;
    if (this.options.ecmaVersion >= 16)
      { node.attributes = []; }
  } else { // export { x, y as z } [from '...']
    node.declaration = null;
    node.specifiers = this.parseExportSpecifiers(exports);
    if (this.eatContextual("from")) {
      if (this.type !== types$1.string) { this.unexpected(); }
      node.source = this.parseExprAtom();
      if (this.options.ecmaVersion >= 16)
        { node.attributes = this.parseWithClause(); }
    } else {
      for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
        // check for keywords used as local names
        var spec = list[i];

        this.checkUnreserved(spec.local);
        // check if export is defined
        this.checkLocalExport(spec.local);

        if (spec.local.type === "Literal") {
          this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
        }
      }

      node.source = null;
      if (this.options.ecmaVersion >= 16)
        { node.attributes = []; }
    }
    this.semicolon();
  }
  return this.finishNode(node, "ExportNamedDeclaration")
};

pp$8.parseExportDeclaration = function(node) {
  return this.parseStatement(null)
};

pp$8.parseExportDefaultDeclaration = function() {
  var isAsync;
  if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
    var fNode = this.startNode();
    this.next();
    if (isAsync) { this.next(); }
    return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync)
  } else if (this.type === types$1._class) {
    var cNode = this.startNode();
    return this.parseClass(cNode, "nullableID")
  } else {
    var declaration = this.parseMaybeAssign();
    this.semicolon();
    return declaration
  }
};

pp$8.checkExport = function(exports, name, pos) {
  if (!exports) { return }
  if (typeof name !== "string")
    { name = name.type === "Identifier" ? name.name : name.value; }
  if (hasOwn(exports, name))
    { this.raiseRecoverable(pos, "Duplicate export '" + name + "'"); }
  exports[name] = true;
};

pp$8.checkPatternExport = function(exports, pat) {
  var type = pat.type;
  if (type === "Identifier")
    { this.checkExport(exports, pat, pat.start); }
  else if (type === "ObjectPattern")
    { for (var i = 0, list = pat.properties; i < list.length; i += 1)
      {
        var prop = list[i];

        this.checkPatternExport(exports, prop);
      } }
  else if (type === "ArrayPattern")
    { for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
      var elt = list$1[i$1];

        if (elt) { this.checkPatternExport(exports, elt); }
    } }
  else if (type === "Property")
    { this.checkPatternExport(exports, pat.value); }
  else if (type === "AssignmentPattern")
    { this.checkPatternExport(exports, pat.left); }
  else if (type === "RestElement")
    { this.checkPatternExport(exports, pat.argument); }
};

pp$8.checkVariableExport = function(exports, decls) {
  if (!exports) { return }
  for (var i = 0, list = decls; i < list.length; i += 1)
    {
    var decl = list[i];

    this.checkPatternExport(exports, decl.id);
  }
};

pp$8.shouldParseExportStatement = function() {
  return this.type.keyword === "var" ||
    this.type.keyword === "const" ||
    this.type.keyword === "class" ||
    this.type.keyword === "function" ||
    this.isLet() ||
    this.isAsyncFunction()
};

// Parses a comma-separated list of module exports.

pp$8.parseExportSpecifier = function(exports) {
  var node = this.startNode();
  node.local = this.parseModuleExportName();

  node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
  this.checkExport(
    exports,
    node.exported,
    node.exported.start
  );

  return this.finishNode(node, "ExportSpecifier")
};

pp$8.parseExportSpecifiers = function(exports) {
  var nodes = [], first = true;
  // export { x, y as z } [from '...']
  this.expect(types$1.braceL);
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) { break }
    } else { first = false; }

    nodes.push(this.parseExportSpecifier(exports));
  }
  return nodes
};

// Parses import declaration.

pp$8.parseImport = function(node) {
  this.next();

  // import '...'
  if (this.type === types$1.string) {
    node.specifiers = empty$1;
    node.source = this.parseExprAtom();
  } else {
    node.specifiers = this.parseImportSpecifiers();
    this.expectContextual("from");
    node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
  }
  if (this.options.ecmaVersion >= 16)
    { node.attributes = this.parseWithClause(); }
  this.semicolon();
  return this.finishNode(node, "ImportDeclaration")
};

// Parses a comma-separated list of module imports.

pp$8.parseImportSpecifier = function() {
  var node = this.startNode();
  node.imported = this.parseModuleExportName();

  if (this.eatContextual("as")) {
    node.local = this.parseIdent();
  } else {
    this.checkUnreserved(node.imported);
    node.local = node.imported;
  }
  this.checkLValSimple(node.local, BIND_LEXICAL);

  return this.finishNode(node, "ImportSpecifier")
};

pp$8.parseImportDefaultSpecifier = function() {
  // import defaultObj, { x, y as z } from '...'
  var node = this.startNode();
  node.local = this.parseIdent();
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportDefaultSpecifier")
};

pp$8.parseImportNamespaceSpecifier = function() {
  var node = this.startNode();
  this.next();
  this.expectContextual("as");
  node.local = this.parseIdent();
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportNamespaceSpecifier")
};

pp$8.parseImportSpecifiers = function() {
  var nodes = [], first = true;
  if (this.type === types$1.name) {
    nodes.push(this.parseImportDefaultSpecifier());
    if (!this.eat(types$1.comma)) { return nodes }
  }
  if (this.type === types$1.star) {
    nodes.push(this.parseImportNamespaceSpecifier());
    return nodes
  }
  this.expect(types$1.braceL);
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) { break }
    } else { first = false; }

    nodes.push(this.parseImportSpecifier());
  }
  return nodes
};

pp$8.parseWithClause = function() {
  var nodes = [];
  if (!this.eat(types$1._with)) {
    return nodes
  }
  this.expect(types$1.braceL);
  var attributeKeys = {};
  var first = true;
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) { break }
    } else { first = false; }

    var attr = this.parseImportAttribute();
    var keyName = attr.key.type === "Identifier" ? attr.key.name : attr.key.value;
    if (hasOwn(attributeKeys, keyName))
      { this.raiseRecoverable(attr.key.start, "Duplicate attribute key '" + keyName + "'"); }
    attributeKeys[keyName] = true;
    nodes.push(attr);
  }
  return nodes
};

pp$8.parseImportAttribute = function() {
  var node = this.startNode();
  node.key = this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
  this.expect(types$1.colon);
  if (this.type !== types$1.string) {
    this.unexpected();
  }
  node.value = this.parseExprAtom();
  return this.finishNode(node, "ImportAttribute")
};

pp$8.parseModuleExportName = function() {
  if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
    var stringLiteral = this.parseLiteral(this.value);
    if (loneSurrogate.test(stringLiteral.value)) {
      this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
    }
    return stringLiteral
  }
  return this.parseIdent(true)
};

// Set `ExpressionStatement#directive` property for directive prologues.
pp$8.adaptDirectivePrologue = function(statements) {
  for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
    statements[i].directive = statements[i].expression.raw.slice(1, -1);
  }
};
pp$8.isDirectiveCandidate = function(statement) {
  return (
    this.options.ecmaVersion >= 5 &&
    statement.type === "ExpressionStatement" &&
    statement.expression.type === "Literal" &&
    typeof statement.expression.value === "string" &&
    // Reject parenthesized strings.
    (this.input[statement.start] === "\"" || this.input[statement.start] === "'")
  )
};

var pp$7 = Parser.prototype;

// Convert existing expression atom to assignable pattern
// if possible.

pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 6 && node) {
    switch (node.type) {
    case "Identifier":
      if (this.inAsync && node.name === "await")
        { this.raise(node.start, "Cannot use 'await' as identifier inside an async function"); }
      break

    case "ObjectPattern":
    case "ArrayPattern":
    case "AssignmentPattern":
    case "RestElement":
      break

    case "ObjectExpression":
      node.type = "ObjectPattern";
      if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
      for (var i = 0, list = node.properties; i < list.length; i += 1) {
        var prop = list[i];

      this.toAssignable(prop, isBinding);
        // Early error:
        //   AssignmentRestProperty[Yield, Await] :
        //     `...` DestructuringAssignmentTarget[Yield, Await]
        //
        //   It is a Syntax Error if |DestructuringAssignmentTarget| is an |ArrayLiteral| or an |ObjectLiteral|.
        if (
          prop.type === "RestElement" &&
          (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")
        ) {
          this.raise(prop.argument.start, "Unexpected token");
        }
      }
      break

    case "Property":
      // AssignmentProperty has type === "Property"
      if (node.kind !== "init") { this.raise(node.key.start, "Object pattern can't contain getter or setter"); }
      this.toAssignable(node.value, isBinding);
      break

    case "ArrayExpression":
      node.type = "ArrayPattern";
      if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
      this.toAssignableList(node.elements, isBinding);
      break

    case "SpreadElement":
      node.type = "RestElement";
      this.toAssignable(node.argument, isBinding);
      if (node.argument.type === "AssignmentPattern")
        { this.raise(node.argument.start, "Rest elements cannot have a default value"); }
      break

    case "AssignmentExpression":
      if (node.operator !== "=") { this.raise(node.left.end, "Only '=' operator can be used for specifying default value."); }
      node.type = "AssignmentPattern";
      delete node.operator;
      this.toAssignable(node.left, isBinding);
      break

    case "ParenthesizedExpression":
      this.toAssignable(node.expression, isBinding, refDestructuringErrors);
      break

    case "ChainExpression":
      this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
      break

    case "MemberExpression":
      if (!isBinding) { break }

    default:
      this.raise(node.start, "Assigning to rvalue");
    }
  } else if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
  return node
};

// Convert list of expression atoms to binding list.

pp$7.toAssignableList = function(exprList, isBinding) {
  var end = exprList.length;
  for (var i = 0; i < end; i++) {
    var elt = exprList[i];
    if (elt) { this.toAssignable(elt, isBinding); }
  }
  if (end) {
    var last = exprList[end - 1];
    if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
      { this.unexpected(last.argument.start); }
  }
  return exprList
};

// Parses spread element.

pp$7.parseSpread = function(refDestructuringErrors) {
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
  return this.finishNode(node, "SpreadElement")
};

pp$7.parseRestBinding = function() {
  var node = this.startNode();
  this.next();

  // RestElement inside of a function parameter must be an identifier
  if (this.options.ecmaVersion === 6 && this.type !== types$1.name)
    { this.unexpected(); }

  node.argument = this.parseBindingAtom();

  return this.finishNode(node, "RestElement")
};

// Parses lvalue (assignable) atom.

pp$7.parseBindingAtom = function() {
  if (this.options.ecmaVersion >= 6) {
    switch (this.type) {
    case types$1.bracketL:
      var node = this.startNode();
      this.next();
      node.elements = this.parseBindingList(types$1.bracketR, true, true);
      return this.finishNode(node, "ArrayPattern")

    case types$1.braceL:
      return this.parseObj(true)
    }
  }
  return this.parseIdent()
};

pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
  var elts = [], first = true;
  while (!this.eat(close)) {
    if (first) { first = false; }
    else { this.expect(types$1.comma); }
    if (allowEmpty && this.type === types$1.comma) {
      elts.push(null);
    } else if (allowTrailingComma && this.afterTrailingComma(close)) {
      break
    } else if (this.type === types$1.ellipsis) {
      var rest = this.parseRestBinding();
      this.parseBindingListItem(rest);
      elts.push(rest);
      if (this.type === types$1.comma) { this.raiseRecoverable(this.start, "Comma is not permitted after the rest element"); }
      this.expect(close);
      break
    } else {
      elts.push(this.parseAssignableListItem(allowModifiers));
    }
  }
  return elts
};

pp$7.parseAssignableListItem = function(allowModifiers) {
  var elem = this.parseMaybeDefault(this.start, this.startLoc);
  this.parseBindingListItem(elem);
  return elem
};

pp$7.parseBindingListItem = function(param) {
  return param
};

// Parses assignment pattern around given atom if possible.

pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
  left = left || this.parseBindingAtom();
  if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) { return left }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.right = this.parseMaybeAssign();
  return this.finishNode(node, "AssignmentPattern")
};

// The following three functions all verify that a node is an lvalue —
// something that can be bound, or assigned to. In order to do so, they perform
// a variety of checks:
//
// - Check that none of the bound/assigned-to identifiers are reserved words.
// - Record name declarations for bindings in the appropriate scope.
// - Check duplicate argument names, if checkClashes is set.
//
// If a complex binding pattern is encountered (e.g., object and array
// destructuring), the entire pattern is recursively checked.
//
// There are three versions of checkLVal*() appropriate for different
// circumstances:
//
// - checkLValSimple() shall be used if the syntactic construct supports
//   nothing other than identifiers and member expressions. Parenthesized
//   expressions are also correctly handled. This is generally appropriate for
//   constructs for which the spec says
//
//   > It is a Syntax Error if AssignmentTargetType of [the production] is not
//   > simple.
//
//   It is also appropriate for checking if an identifier is valid and not
//   defined elsewhere, like import declarations or function/class identifiers.
//
//   Examples where this is used include:
//     a += …;
//     import a from '…';
//   where a is the node to be checked.
//
// - checkLValPattern() shall be used if the syntactic construct supports
//   anything checkLValSimple() supports, as well as object and array
//   destructuring patterns. This is generally appropriate for constructs for
//   which the spec says
//
//   > It is a Syntax Error if [the production] is neither an ObjectLiteral nor
//   > an ArrayLiteral and AssignmentTargetType of [the production] is not
//   > simple.
//
//   Examples where this is used include:
//     (a = …);
//     const a = …;
//     try { … } catch (a) { … }
//   where a is the node to be checked.
//
// - checkLValInnerPattern() shall be used if the syntactic construct supports
//   anything checkLValPattern() supports, as well as default assignment
//   patterns, rest elements, and other constructs that may appear within an
//   object or array destructuring pattern.
//
//   As a special case, function parameters also use checkLValInnerPattern(),
//   as they also support defaults and rest constructs.
//
// These functions deliberately support both assignment and binding constructs,
// as the logic for both is exceedingly similar. If the node is the target of
// an assignment, then bindingType should be set to BIND_NONE. Otherwise, it
// should be set to the appropriate BIND_* constant, like BIND_VAR or
// BIND_LEXICAL.
//
// If the function is called with a non-BIND_NONE bindingType, then
// additionally a checkClashes object may be specified to allow checking for
// duplicate argument names. checkClashes is ignored if the provided construct
// is an assignment (i.e., bindingType is BIND_NONE).

pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
  if ( bindingType === void 0 ) bindingType = BIND_NONE;

  var isBind = bindingType !== BIND_NONE;

  switch (expr.type) {
  case "Identifier":
    if (this.strict && this.reservedWordsStrictBind.test(expr.name))
      { this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode"); }
    if (isBind) {
      if (bindingType === BIND_LEXICAL && expr.name === "let")
        { this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name"); }
      if (checkClashes) {
        if (hasOwn(checkClashes, expr.name))
          { this.raiseRecoverable(expr.start, "Argument name clash"); }
        checkClashes[expr.name] = true;
      }
      if (bindingType !== BIND_OUTSIDE) { this.declareName(expr.name, bindingType, expr.start); }
    }
    break

  case "ChainExpression":
    this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
    break

  case "MemberExpression":
    if (isBind) { this.raiseRecoverable(expr.start, "Binding member expression"); }
    break

  case "ParenthesizedExpression":
    if (isBind) { this.raiseRecoverable(expr.start, "Binding parenthesized expression"); }
    return this.checkLValSimple(expr.expression, bindingType, checkClashes)

  default:
    this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
  }
};

pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
  if ( bindingType === void 0 ) bindingType = BIND_NONE;

  switch (expr.type) {
  case "ObjectPattern":
    for (var i = 0, list = expr.properties; i < list.length; i += 1) {
      var prop = list[i];

    this.checkLValInnerPattern(prop, bindingType, checkClashes);
    }
    break

  case "ArrayPattern":
    for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
      var elem = list$1[i$1];

    if (elem) { this.checkLValInnerPattern(elem, bindingType, checkClashes); }
    }
    break

  default:
    this.checkLValSimple(expr, bindingType, checkClashes);
  }
};

pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
  if ( bindingType === void 0 ) bindingType = BIND_NONE;

  switch (expr.type) {
  case "Property":
    // AssignmentProperty has type === "Property"
    this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
    break

  case "AssignmentPattern":
    this.checkLValPattern(expr.left, bindingType, checkClashes);
    break

  case "RestElement":
    this.checkLValPattern(expr.argument, bindingType, checkClashes);
    break

  default:
    this.checkLValPattern(expr, bindingType, checkClashes);
  }
};

// The algorithm used to determine whether a regexp can appear at a
// given point in the program is loosely based on sweet.js' approach.
// See https://github.com/mozilla/sweet.js/wiki/design


var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
  this.token = token;
  this.isExpr = !!isExpr;
  this.preserveSpace = !!preserveSpace;
  this.override = override;
  this.generator = !!generator;
};

var types = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", false),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, function (p) { return p.tryReadTemplateToken(); }),
  f_stat: new TokContext("function", false),
  f_expr: new TokContext("function", true),
  f_expr_gen: new TokContext("function", true, false, null, true),
  f_gen: new TokContext("function", false, false, null, true)
};

var pp$6 = Parser.prototype;

pp$6.initialContext = function() {
  return [types.b_stat]
};

pp$6.curContext = function() {
  return this.context[this.context.length - 1]
};

pp$6.braceIsBlock = function(prevType) {
  var parent = this.curContext();
  if (parent === types.f_expr || parent === types.f_stat)
    { return true }
  if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr))
    { return !parent.isExpr }

  // The check for `tt.name && exprAllowed` detects whether we are
  // after a `yield` or `of` construct. See the `updateContext` for
  // `tt.name`.
  if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed)
    { return lineBreak.test(this.input.slice(this.lastTokEnd, this.start)) }
  if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow)
    { return true }
  if (prevType === types$1.braceL)
    { return parent === types.b_stat }
  if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name)
    { return false }
  return !this.exprAllowed
};

pp$6.inGeneratorContext = function() {
  for (var i = this.context.length - 1; i >= 1; i--) {
    var context = this.context[i];
    if (context.token === "function")
      { return context.generator }
  }
  return false
};

pp$6.updateContext = function(prevType) {
  var update, type = this.type;
  if (type.keyword && prevType === types$1.dot)
    { this.exprAllowed = false; }
  else if (update = type.updateContext)
    { update.call(this, prevType); }
  else
    { this.exprAllowed = type.beforeExpr; }
};

// Used to handle edge cases when token context could not be inferred correctly during tokenization phase

pp$6.overrideContext = function(tokenCtx) {
  if (this.curContext() !== tokenCtx) {
    this.context[this.context.length - 1] = tokenCtx;
  }
};

// Token-specific context update code

types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
  if (this.context.length === 1) {
    this.exprAllowed = true;
    return
  }
  var out = this.context.pop();
  if (out === types.b_stat && this.curContext().token === "function") {
    out = this.context.pop();
  }
  this.exprAllowed = !out.isExpr;
};

types$1.braceL.updateContext = function(prevType) {
  this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
  this.exprAllowed = true;
};

types$1.dollarBraceL.updateContext = function() {
  this.context.push(types.b_tmpl);
  this.exprAllowed = true;
};

types$1.parenL.updateContext = function(prevType) {
  var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
  this.context.push(statementParens ? types.p_stat : types.p_expr);
  this.exprAllowed = true;
};

types$1.incDec.updateContext = function() {
  // tokExprAllowed stays unchanged
};

types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
  if (prevType.beforeExpr && prevType !== types$1._else &&
      !(prevType === types$1.semi && this.curContext() !== types.p_stat) &&
      !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) &&
      !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat))
    { this.context.push(types.f_expr); }
  else
    { this.context.push(types.f_stat); }
  this.exprAllowed = false;
};

types$1.colon.updateContext = function() {
  if (this.curContext().token === "function") { this.context.pop(); }
  this.exprAllowed = true;
};

types$1.backQuote.updateContext = function() {
  if (this.curContext() === types.q_tmpl)
    { this.context.pop(); }
  else
    { this.context.push(types.q_tmpl); }
  this.exprAllowed = false;
};

types$1.star.updateContext = function(prevType) {
  if (prevType === types$1._function) {
    var index = this.context.length - 1;
    if (this.context[index] === types.f_expr)
      { this.context[index] = types.f_expr_gen; }
    else
      { this.context[index] = types.f_gen; }
  }
  this.exprAllowed = true;
};

types$1.name.updateContext = function(prevType) {
  var allowed = false;
  if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
    if (this.value === "of" && !this.exprAllowed ||
        this.value === "yield" && this.inGeneratorContext())
      { allowed = true; }
  }
  this.exprAllowed = allowed;
};

// A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts — that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser


var pp$5 = Parser.prototype;

// Check if property name clashes with already added.
// Object/class getters and setters are not allowed to clash —
// either with each other or with an init property — and in
// strict mode, init properties are also not allowed to be repeated.

pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement")
    { return }
  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
    { return }
  var key = prop.key;
  var name;
  switch (key.type) {
  case "Identifier": name = key.name; break
  case "Literal": name = String(key.value); break
  default: return
  }
  var kind = prop.kind;
  if (this.options.ecmaVersion >= 6) {
    if (name === "__proto__" && kind === "init") {
      if (propHash.proto) {
        if (refDestructuringErrors) {
          if (refDestructuringErrors.doubleProto < 0) {
            refDestructuringErrors.doubleProto = key.start;
          }
        } else {
          this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
        }
      }
      propHash.proto = true;
    }
    return
  }
  name = "$" + name;
  var other = propHash[name];
  if (other) {
    var redefinition;
    if (kind === "init") {
      redefinition = this.strict && other.init || other.get || other.set;
    } else {
      redefinition = other.init || other[kind];
    }
    if (redefinition)
      { this.raiseRecoverable(key.start, "Redefinition of property"); }
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    };
  }
  other[kind] = true;
};

// ### Expression parsing

// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function(s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.

// Parse a full expression. The optional arguments are used to
// forbid the `in` operator (in for loops initalization expressions)
// and provide reference for storing '=' operator inside shorthand
// property assignment in contexts where both object expression
// and object pattern might appear (so it's possible to raise
// delayed syntax error at correct position).

pp$5.parseExpression = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeAssign(forInit, refDestructuringErrors);
  if (this.type === types$1.comma) {
    var node = this.startNodeAt(startPos, startLoc);
    node.expressions = [expr];
    while (this.eat(types$1.comma)) { node.expressions.push(this.parseMaybeAssign(forInit, refDestructuringErrors)); }
    return this.finishNode(node, "SequenceExpression")
  }
  return expr
};

// Parse an assignment expression. This includes applications of
// operators like `+=`.

pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
  if (this.isContextual("yield")) {
    if (this.inGenerator) { return this.parseYield(forInit) }
    // The tokenizer will assume an expression is allowed after
    // `yield`, but this isn't that kind of yield
    else { this.exprAllowed = false; }
  }

  var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
  if (refDestructuringErrors) {
    oldParenAssign = refDestructuringErrors.parenthesizedAssign;
    oldTrailingComma = refDestructuringErrors.trailingComma;
    oldDoubleProto = refDestructuringErrors.doubleProto;
    refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
  } else {
    refDestructuringErrors = new DestructuringErrors;
    ownDestructuringErrors = true;
  }

  var startPos = this.start, startLoc = this.startLoc;
  if (this.type === types$1.parenL || this.type === types$1.name) {
    this.potentialArrowAt = this.start;
    this.potentialArrowInForAwait = forInit === "await";
  }
  var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
  if (afterLeftParse) { left = afterLeftParse.call(this, left, startPos, startLoc); }
  if (this.type.isAssign) {
    var node = this.startNodeAt(startPos, startLoc);
    node.operator = this.value;
    if (this.type === types$1.eq)
      { left = this.toAssignable(left, false, refDestructuringErrors); }
    if (!ownDestructuringErrors) {
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
    }
    if (refDestructuringErrors.shorthandAssign >= left.start)
      { refDestructuringErrors.shorthandAssign = -1; } // reset because shorthand default was used correctly
    if (this.type === types$1.eq)
      { this.checkLValPattern(left); }
    else
      { this.checkLValSimple(left); }
    node.left = left;
    this.next();
    node.right = this.parseMaybeAssign(forInit);
    if (oldDoubleProto > -1) { refDestructuringErrors.doubleProto = oldDoubleProto; }
    return this.finishNode(node, "AssignmentExpression")
  } else {
    if (ownDestructuringErrors) { this.checkExpressionErrors(refDestructuringErrors, true); }
  }
  if (oldParenAssign > -1) { refDestructuringErrors.parenthesizedAssign = oldParenAssign; }
  if (oldTrailingComma > -1) { refDestructuringErrors.trailingComma = oldTrailingComma; }
  return left
};

// Parse a ternary conditional (`?:`) operator.

pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprOps(forInit, refDestructuringErrors);
  if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
  if (this.eat(types$1.question)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    this.expect(types$1.colon);
    node.alternate = this.parseMaybeAssign(forInit);
    return this.finishNode(node, "ConditionalExpression")
  }
  return expr
};

// Start the precedence parser.

pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
  if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
  return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit)
};

// Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.

pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
  var prec = this.type.binop;
  if (prec != null && (!forInit || this.type !== types$1._in)) {
    if (prec > minPrec) {
      var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
      var coalesce = this.type === types$1.coalesce;
      if (coalesce) {
        // Handle the precedence of `tt.coalesce` as equal to the range of logical expressions.
        // In other words, `node.right` shouldn't contain logical expressions in order to check the mixed error.
        prec = types$1.logicalAND.binop;
      }
      var op = this.value;
      this.next();
      var startPos = this.start, startLoc = this.startLoc;
      var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
      var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
      if ((logical && this.type === types$1.coalesce) || (coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND))) {
        this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
      }
      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit)
    }
  }
  return left
};

pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
  if (right.type === "PrivateIdentifier") { this.raise(right.start, "Private identifier can only be left side of binary expression"); }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.operator = op;
  node.right = right;
  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
};

// Parse unary operators, both prefix and postfix.

pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
  var startPos = this.start, startLoc = this.startLoc, expr;
  if (this.isContextual("await") && this.canAwait) {
    expr = this.parseAwait(forInit);
    sawUnary = true;
  } else if (this.type.prefix) {
    var node = this.startNode(), update = this.type === types$1.incDec;
    node.operator = this.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary(null, true, update, forInit);
    this.checkExpressionErrors(refDestructuringErrors, true);
    if (update) { this.checkLValSimple(node.argument); }
    else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument))
      { this.raiseRecoverable(node.start, "Deleting local variable in strict mode"); }
    else if (node.operator === "delete" && isPrivateFieldAccess(node.argument))
      { this.raiseRecoverable(node.start, "Private fields can not be deleted"); }
    else { sawUnary = true; }
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  } else if (!sawUnary && this.type === types$1.privateId) {
    if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) { this.unexpected(); }
    expr = this.parsePrivateIdent();
    // only could be private fields in 'in', such as #x in obj
    if (this.type !== types$1._in) { this.unexpected(); }
  } else {
    expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
    while (this.type.postfix && !this.canInsertSemicolon()) {
      var node$1 = this.startNodeAt(startPos, startLoc);
      node$1.operator = this.value;
      node$1.prefix = false;
      node$1.argument = expr;
      this.checkLValSimple(expr);
      this.next();
      expr = this.finishNode(node$1, "UpdateExpression");
    }
  }

  if (!incDec && this.eat(types$1.starstar)) {
    if (sawUnary)
      { this.unexpected(this.lastTokStart); }
    else
      { return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false) }
  } else {
    return expr
  }
};

function isLocalVariableAccess(node) {
  return (
    node.type === "Identifier" ||
    node.type === "ParenthesizedExpression" && isLocalVariableAccess(node.expression)
  )
}

function isPrivateFieldAccess(node) {
  return (
    node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" ||
    node.type === "ChainExpression" && isPrivateFieldAccess(node.expression) ||
    node.type === "ParenthesizedExpression" && isPrivateFieldAccess(node.expression)
  )
}

// Parse call, dot, and `[]`-subscript expressions.

pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprAtom(refDestructuringErrors, forInit);
  if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")")
    { return expr }
  var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
  if (refDestructuringErrors && result.type === "MemberExpression") {
    if (refDestructuringErrors.parenthesizedAssign >= result.start) { refDestructuringErrors.parenthesizedAssign = -1; }
    if (refDestructuringErrors.parenthesizedBind >= result.start) { refDestructuringErrors.parenthesizedBind = -1; }
    if (refDestructuringErrors.trailingComma >= result.start) { refDestructuringErrors.trailingComma = -1; }
  }
  return result
};

pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
  var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
      this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 &&
      this.potentialArrowAt === base.start;
  var optionalChained = false;

  while (true) {
    var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);

    if (element.optional) { optionalChained = true; }
    if (element === base || element.type === "ArrowFunctionExpression") {
      if (optionalChained) {
        var chainNode = this.startNodeAt(startPos, startLoc);
        chainNode.expression = element;
        element = this.finishNode(chainNode, "ChainExpression");
      }
      return element
    }

    base = element;
  }
};

pp$5.shouldParseAsyncArrow = function() {
  return !this.canInsertSemicolon() && this.eat(types$1.arrow)
};

pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit)
};

pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
  var optionalSupported = this.options.ecmaVersion >= 11;
  var optional = optionalSupported && this.eat(types$1.questionDot);
  if (noCalls && optional) { this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions"); }

  var computed = this.eat(types$1.bracketL);
  if (computed || (optional && this.type !== types$1.parenL && this.type !== types$1.backQuote) || this.eat(types$1.dot)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.object = base;
    if (computed) {
      node.property = this.parseExpression();
      this.expect(types$1.bracketR);
    } else if (this.type === types$1.privateId && base.type !== "Super") {
      node.property = this.parsePrivateIdent();
    } else {
      node.property = this.parseIdent(this.options.allowReserved !== "never");
    }
    node.computed = !!computed;
    if (optionalSupported) {
      node.optional = optional;
    }
    base = this.finishNode(node, "MemberExpression");
  } else if (!noCalls && this.eat(types$1.parenL)) {
    var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
    if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      if (this.awaitIdentPos > 0)
        { this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function"); }
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      this.awaitIdentPos = oldAwaitIdentPos;
      return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit)
    }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;
    this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
    var node$1 = this.startNodeAt(startPos, startLoc);
    node$1.callee = base;
    node$1.arguments = exprList;
    if (optionalSupported) {
      node$1.optional = optional;
    }
    base = this.finishNode(node$1, "CallExpression");
  } else if (this.type === types$1.backQuote) {
    if (optional || optionalChained) {
      this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
    }
    var node$2 = this.startNodeAt(startPos, startLoc);
    node$2.tag = base;
    node$2.quasi = this.parseTemplate({isTagged: true});
    base = this.finishNode(node$2, "TaggedTemplateExpression");
  }
  return base
};

// Parse an atomic expression — either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.

pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
  // If a division operator appears in an expression position, the
  // tokenizer got confused, and we force it to read a regexp instead.
  if (this.type === types$1.slash) { this.readRegexp(); }

  var node, canBeArrow = this.potentialArrowAt === this.start;
  switch (this.type) {
  case types$1._super:
    if (!this.allowSuper)
      { this.raise(this.start, "'super' keyword outside a method"); }
    node = this.startNode();
    this.next();
    if (this.type === types$1.parenL && !this.allowDirectSuper)
      { this.raise(node.start, "super() call outside constructor of a subclass"); }
    // The `super` keyword can appear at below:
    // SuperProperty:
    //     super [ Expression ]
    //     super . IdentifierName
    // SuperCall:
    //     super ( Arguments )
    if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL)
      { this.unexpected(); }
    return this.finishNode(node, "Super")

  case types$1._this:
    node = this.startNode();
    this.next();
    return this.finishNode(node, "ThisExpression")

  case types$1.name:
    var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
    var id = this.parseIdent(false);
    if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
      this.overrideContext(types.f_expr);
      return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit)
    }
    if (canBeArrow && !this.canInsertSemicolon()) {
      if (this.eat(types$1.arrow))
        { return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit) }
      if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc &&
          (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
        id = this.parseIdent(false);
        if (this.canInsertSemicolon() || !this.eat(types$1.arrow))
          { this.unexpected(); }
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit)
      }
    }
    return id

  case types$1.regexp:
    var value = this.value;
    node = this.parseLiteral(value.value);
    node.regex = {pattern: value.pattern, flags: value.flags};
    return node

  case types$1.num: case types$1.string:
    return this.parseLiteral(this.value)

  case types$1._null: case types$1._true: case types$1._false:
    node = this.startNode();
    node.value = this.type === types$1._null ? null : this.type === types$1._true;
    node.raw = this.type.keyword;
    this.next();
    return this.finishNode(node, "Literal")

  case types$1.parenL:
    var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
    if (refDestructuringErrors) {
      if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
        { refDestructuringErrors.parenthesizedAssign = start; }
      if (refDestructuringErrors.parenthesizedBind < 0)
        { refDestructuringErrors.parenthesizedBind = start; }
    }
    return expr

  case types$1.bracketL:
    node = this.startNode();
    this.next();
    node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
    return this.finishNode(node, "ArrayExpression")

  case types$1.braceL:
    this.overrideContext(types.b_expr);
    return this.parseObj(false, refDestructuringErrors)

  case types$1._function:
    node = this.startNode();
    this.next();
    return this.parseFunction(node, 0)

  case types$1._class:
    return this.parseClass(this.startNode(), false)

  case types$1._new:
    return this.parseNew()

  case types$1.backQuote:
    return this.parseTemplate()

  case types$1._import:
    if (this.options.ecmaVersion >= 11) {
      return this.parseExprImport(forNew)
    } else {
      return this.unexpected()
    }

  default:
    return this.parseExprAtomDefault()
  }
};

pp$5.parseExprAtomDefault = function() {
  this.unexpected();
};

pp$5.parseExprImport = function(forNew) {
  var node = this.startNode();

  // Consume `import` as an identifier for `import.meta`.
  // Because `this.parseIdent(true)` doesn't check escape sequences, it needs the check of `this.containsEsc`.
  if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword import"); }
  this.next();

  if (this.type === types$1.parenL && !forNew) {
    return this.parseDynamicImport(node)
  } else if (this.type === types$1.dot) {
    var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
    meta.name = "import";
    node.meta = this.finishNode(meta, "Identifier");
    return this.parseImportMeta(node)
  } else {
    this.unexpected();
  }
};

pp$5.parseDynamicImport = function(node) {
  this.next(); // skip `(`

  // Parse node.source.
  node.source = this.parseMaybeAssign();

  if (this.options.ecmaVersion >= 16) {
    if (!this.eat(types$1.parenR)) {
      this.expect(types$1.comma);
      if (!this.afterTrailingComma(types$1.parenR)) {
        node.options = this.parseMaybeAssign();
        if (!this.eat(types$1.parenR)) {
          this.expect(types$1.comma);
          if (!this.afterTrailingComma(types$1.parenR)) {
            this.unexpected();
          }
        }
      } else {
        node.options = null;
      }
    } else {
      node.options = null;
    }
  } else {
    // Verify ending.
    if (!this.eat(types$1.parenR)) {
      var errorPos = this.start;
      if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
        this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
      } else {
        this.unexpected(errorPos);
      }
    }
  }

  return this.finishNode(node, "ImportExpression")
};

pp$5.parseImportMeta = function(node) {
  this.next(); // skip `.`

  var containsEsc = this.containsEsc;
  node.property = this.parseIdent(true);

  if (node.property.name !== "meta")
    { this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'"); }
  if (containsEsc)
    { this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters"); }
  if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere)
    { this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module"); }

  return this.finishNode(node, "MetaProperty")
};

pp$5.parseLiteral = function(value) {
  var node = this.startNode();
  node.value = value;
  node.raw = this.input.slice(this.start, this.end);
  if (node.raw.charCodeAt(node.raw.length - 1) === 110)
    { node.bigint = node.value != null ? node.value.toString() : node.raw.slice(0, -1).replace(/_/g, ""); }
  this.next();
  return this.finishNode(node, "Literal")
};

pp$5.parseParenExpression = function() {
  this.expect(types$1.parenL);
  var val = this.parseExpression();
  this.expect(types$1.parenR);
  return val
};

pp$5.shouldParseArrow = function(exprList) {
  return !this.canInsertSemicolon()
};

pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
  var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
  if (this.options.ecmaVersion >= 6) {
    this.next();

    var innerStartPos = this.start, innerStartLoc = this.startLoc;
    var exprList = [], first = true, lastIsComma = false;
    var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
    this.yieldPos = 0;
    this.awaitPos = 0;
    // Do not save awaitIdentPos to allow checking awaits nested in parameters
    while (this.type !== types$1.parenR) {
      first ? first = false : this.expect(types$1.comma);
      if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
        lastIsComma = true;
        break
      } else if (this.type === types$1.ellipsis) {
        spreadStart = this.start;
        exprList.push(this.parseParenItem(this.parseRestBinding()));
        if (this.type === types$1.comma) {
          this.raiseRecoverable(
            this.start,
            "Comma is not permitted after the rest element"
          );
        }
        break
      } else {
        exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
      }
    }
    var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
    this.expect(types$1.parenR);

    if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      return this.parseParenArrowList(startPos, startLoc, exprList, forInit)
    }

    if (!exprList.length || lastIsComma) { this.unexpected(this.lastTokStart); }
    if (spreadStart) { this.unexpected(spreadStart); }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;

    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc);
      val.expressions = exprList;
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
    } else {
      val = exprList[0];
    }
  } else {
    val = this.parseParenExpression();
  }

  if (this.options.preserveParens) {
    var par = this.startNodeAt(startPos, startLoc);
    par.expression = val;
    return this.finishNode(par, "ParenthesizedExpression")
  } else {
    return val
  }
};

pp$5.parseParenItem = function(item) {
  return item
};

pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit)
};

// New's precedence is slightly tricky. It must allow its argument to
// be a `[]` or dot subscript expression, but not a call — at least,
// not without wrapping it in parentheses. Thus, it uses the noCalls
// argument to parseSubscripts to prevent it from consuming the
// argument list.

var empty = [];

pp$5.parseNew = function() {
  if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword new"); }
  var node = this.startNode();
  this.next();
  if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
    var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
    meta.name = "new";
    node.meta = this.finishNode(meta, "Identifier");
    this.next();
    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);
    if (node.property.name !== "target")
      { this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'"); }
    if (containsEsc)
      { this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters"); }
    if (!this.allowNewDotTarget)
      { this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block"); }
    return this.finishNode(node, "MetaProperty")
  }
  var startPos = this.start, startLoc = this.startLoc;
  node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
  if (this.eat(types$1.parenL)) { node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false); }
  else { node.arguments = empty; }
  return this.finishNode(node, "NewExpression")
};

// Parse template expression.

pp$5.parseTemplateElement = function(ref) {
  var isTagged = ref.isTagged;

  var elem = this.startNode();
  if (this.type === types$1.invalidTemplate) {
    if (!isTagged) {
      this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
    }
    elem.value = {
      raw: this.value.replace(/\r\n?/g, "\n"),
      cooked: null
    };
  } else {
    elem.value = {
      raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
      cooked: this.value
    };
  }
  this.next();
  elem.tail = this.type === types$1.backQuote;
  return this.finishNode(elem, "TemplateElement")
};

pp$5.parseTemplate = function(ref) {
  if ( ref === void 0 ) ref = {};
  var isTagged = ref.isTagged; if ( isTagged === void 0 ) isTagged = false;

  var node = this.startNode();
  this.next();
  node.expressions = [];
  var curElt = this.parseTemplateElement({isTagged: isTagged});
  node.quasis = [curElt];
  while (!curElt.tail) {
    if (this.type === types$1.eof) { this.raise(this.pos, "Unterminated template literal"); }
    this.expect(types$1.dollarBraceL);
    node.expressions.push(this.parseExpression());
    this.expect(types$1.braceR);
    node.quasis.push(curElt = this.parseTemplateElement({isTagged: isTagged}));
  }
  this.next();
  return this.finishNode(node, "TemplateLiteral")
};

pp$5.isAsyncProp = function(prop) {
  return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" &&
    (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || (this.options.ecmaVersion >= 9 && this.type === types$1.star)) &&
    !lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
};

// Parse an object literal or binding pattern.

pp$5.parseObj = function(isPattern, refDestructuringErrors) {
  var node = this.startNode(), first = true, propHash = {};
  node.properties = [];
  this.next();
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) { break }
    } else { first = false; }

    var prop = this.parseProperty(isPattern, refDestructuringErrors);
    if (!isPattern) { this.checkPropClash(prop, propHash, refDestructuringErrors); }
    node.properties.push(prop);
  }
  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
};

pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
  var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
  if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
    if (isPattern) {
      prop.argument = this.parseIdent(false);
      if (this.type === types$1.comma) {
        this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
      }
      return this.finishNode(prop, "RestElement")
    }
    // Parse argument.
    prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    // To disallow trailing comma via `this.toAssignable()`.
    if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
      refDestructuringErrors.trailingComma = this.start;
    }
    // Finish
    return this.finishNode(prop, "SpreadElement")
  }
  if (this.options.ecmaVersion >= 6) {
    prop.method = false;
    prop.shorthand = false;
    if (isPattern || refDestructuringErrors) {
      startPos = this.start;
      startLoc = this.startLoc;
    }
    if (!isPattern)
      { isGenerator = this.eat(types$1.star); }
  }
  var containsEsc = this.containsEsc;
  this.parsePropertyName(prop);
  if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
    isAsync = true;
    isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
    this.parsePropertyName(prop);
  } else {
    isAsync = false;
  }
  this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
  return this.finishNode(prop, "Property")
};

pp$5.parseGetterSetter = function(prop) {
  var kind = prop.key.name;
  this.parsePropertyName(prop);
  prop.value = this.parseMethod(false);
  prop.kind = kind;
  var paramCount = prop.kind === "get" ? 0 : 1;
  if (prop.value.params.length !== paramCount) {
    var start = prop.value.start;
    if (prop.kind === "get")
      { this.raiseRecoverable(start, "getter should have no params"); }
    else
      { this.raiseRecoverable(start, "setter should have exactly one param"); }
  } else {
    if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
      { this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params"); }
  }
};

pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
  if ((isGenerator || isAsync) && this.type === types$1.colon)
    { this.unexpected(); }

  if (this.eat(types$1.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
    prop.kind = "init";
  } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
    if (isPattern) { this.unexpected(); }
    prop.method = true;
    prop.value = this.parseMethod(isGenerator, isAsync);
    prop.kind = "init";
  } else if (!isPattern && !containsEsc &&
             this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
             (prop.key.name === "get" || prop.key.name === "set") &&
             (this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq)) {
    if (isGenerator || isAsync) { this.unexpected(); }
    this.parseGetterSetter(prop);
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    if (isGenerator || isAsync) { this.unexpected(); }
    this.checkUnreserved(prop.key);
    if (prop.key.name === "await" && !this.awaitIdentPos)
      { this.awaitIdentPos = startPos; }
    if (isPattern) {
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
    } else if (this.type === types$1.eq && refDestructuringErrors) {
      if (refDestructuringErrors.shorthandAssign < 0)
        { refDestructuringErrors.shorthandAssign = this.start; }
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
    } else {
      prop.value = this.copyNode(prop.key);
    }
    prop.kind = "init";
    prop.shorthand = true;
  } else { this.unexpected(); }
};

pp$5.parsePropertyName = function(prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(types$1.bracketL)) {
      prop.computed = true;
      prop.key = this.parseMaybeAssign();
      this.expect(types$1.bracketR);
      return prop.key
    } else {
      prop.computed = false;
    }
  }
  return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never")
};

// Initialize empty function node.

pp$5.initFunction = function(node) {
  node.id = null;
  if (this.options.ecmaVersion >= 6) { node.generator = node.expression = false; }
  if (this.options.ecmaVersion >= 8) { node.async = false; }
};

// Parse object or class method.

pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
  var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

  this.initFunction(node);
  if (this.options.ecmaVersion >= 6)
    { node.generator = isGenerator; }
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }

  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));

  this.expect(types$1.parenL);
  node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
  this.parseFunctionBody(node, false, true, false);

  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, "FunctionExpression")
};

// Parse arrow function expression with given parameters.

pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
  var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

  this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
  this.initFunction(node);
  if (this.options.ecmaVersion >= 8) { node.async = !!isAsync; }

  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;

  node.params = this.toAssignableList(params, true);
  this.parseFunctionBody(node, true, false, forInit);

  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, "ArrowFunctionExpression")
};

// Parse function body and check parameters.

pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
  var isExpression = isArrowFunction && this.type !== types$1.braceL;
  var oldStrict = this.strict, useStrict = false;

  if (isExpression) {
    node.body = this.parseMaybeAssign(forInit);
    node.expression = true;
    this.checkParams(node, false);
  } else {
    var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
    if (!oldStrict || nonSimple) {
      useStrict = this.strictDirective(this.end);
      // If this is a strict mode function, verify that argument names
      // are not repeated, and it does not try to bind the words `eval`
      // or `arguments`.
      if (useStrict && nonSimple)
        { this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list"); }
    }
    // Start a new scope with regard to labels and the `inFunction`
    // flag (restore them to their old value afterwards).
    var oldLabels = this.labels;
    this.labels = [];
    if (useStrict) { this.strict = true; }

    // Add the params to varDeclaredNames to ensure that an error is thrown
    // if a let/const declaration in the function clashes with one of the params.
    this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
    // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
    if (this.strict && node.id) { this.checkLValSimple(node.id, BIND_OUTSIDE); }
    node.body = this.parseBlock(false, undefined, useStrict && !oldStrict);
    node.expression = false;
    this.adaptDirectivePrologue(node.body.body);
    this.labels = oldLabels;
  }
  this.exitScope();
};

pp$5.isSimpleParamList = function(params) {
  for (var i = 0, list = params; i < list.length; i += 1)
    {
    var param = list[i];

    if (param.type !== "Identifier") { return false
  } }
  return true
};

// Checks function params for various disallowed patterns such as using "eval"
// or "arguments" and duplicate parameters.

pp$5.checkParams = function(node, allowDuplicates) {
  var nameHash = Object.create(null);
  for (var i = 0, list = node.params; i < list.length; i += 1)
    {
    var param = list[i];

    this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
  }
};

// Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).

pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  var elts = [], first = true;
  while (!this.eat(close)) {
    if (!first) {
      this.expect(types$1.comma);
      if (allowTrailingComma && this.afterTrailingComma(close)) { break }
    } else { first = false; }

    var elt = (void 0);
    if (allowEmpty && this.type === types$1.comma)
      { elt = null; }
    else if (this.type === types$1.ellipsis) {
      elt = this.parseSpread(refDestructuringErrors);
      if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0)
        { refDestructuringErrors.trailingComma = this.start; }
    } else {
      elt = this.parseMaybeAssign(false, refDestructuringErrors);
    }
    elts.push(elt);
  }
  return elts
};

pp$5.checkUnreserved = function(ref) {
  var start = ref.start;
  var end = ref.end;
  var name = ref.name;

  if (this.inGenerator && name === "yield")
    { this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator"); }
  if (this.inAsync && name === "await")
    { this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function"); }
  if (!(this.currentThisScope().flags & SCOPE_VAR) && name === "arguments")
    { this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer"); }
  if (this.inClassStaticBlock && (name === "arguments" || name === "await"))
    { this.raise(start, ("Cannot use " + name + " in class static initialization block")); }
  if (this.keywords.test(name))
    { this.raise(start, ("Unexpected keyword '" + name + "'")); }
  if (this.options.ecmaVersion < 6 &&
    this.input.slice(start, end).indexOf("\\") !== -1) { return }
  var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
  if (re.test(name)) {
    if (!this.inAsync && name === "await")
      { this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function"); }
    this.raiseRecoverable(start, ("The keyword '" + name + "' is reserved"));
  }
};

// Parse the next token as an identifier. If `liberal` is true (used
// when parsing properties), it will also convert keywords into
// identifiers.

pp$5.parseIdent = function(liberal) {
  var node = this.parseIdentNode();
  this.next(!!liberal);
  this.finishNode(node, "Identifier");
  if (!liberal) {
    this.checkUnreserved(node);
    if (node.name === "await" && !this.awaitIdentPos)
      { this.awaitIdentPos = node.start; }
  }
  return node
};

pp$5.parseIdentNode = function() {
  var node = this.startNode();
  if (this.type === types$1.name) {
    node.name = this.value;
  } else if (this.type.keyword) {
    node.name = this.type.keyword;

    // To fix https://github.com/acornjs/acorn/issues/575
    // `class` and `function` keywords push new context into this.context.
    // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
    // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
    if ((node.name === "class" || node.name === "function") &&
      (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
      this.context.pop();
    }
    this.type = types$1.name;
  } else {
    this.unexpected();
  }
  return node
};

pp$5.parsePrivateIdent = function() {
  var node = this.startNode();
  if (this.type === types$1.privateId) {
    node.name = this.value;
  } else {
    this.unexpected();
  }
  this.next();
  this.finishNode(node, "PrivateIdentifier");

  // For validating existence
  if (this.options.checkPrivateFields) {
    if (this.privateNameStack.length === 0) {
      this.raise(node.start, ("Private field '#" + (node.name) + "' must be declared in an enclosing class"));
    } else {
      this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
    }
  }

  return node
};

// Parses yield expression inside generator.

pp$5.parseYield = function(forInit) {
  if (!this.yieldPos) { this.yieldPos = this.start; }

  var node = this.startNode();
  this.next();
  if (this.type === types$1.semi || this.canInsertSemicolon() || (this.type !== types$1.star && !this.type.startsExpr)) {
    node.delegate = false;
    node.argument = null;
  } else {
    node.delegate = this.eat(types$1.star);
    node.argument = this.parseMaybeAssign(forInit);
  }
  return this.finishNode(node, "YieldExpression")
};

pp$5.parseAwait = function(forInit) {
  if (!this.awaitPos) { this.awaitPos = this.start; }

  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeUnary(null, true, false, forInit);
  return this.finishNode(node, "AwaitExpression")
};

var pp$4 = Parser.prototype;

// This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.

pp$4.raise = function(pos, message) {
  var loc = getLineInfo(this.input, pos);
  message += " (" + loc.line + ":" + loc.column + ")";
  if (this.sourceFile) {
    message += " in " + this.sourceFile;
  }
  var err = new SyntaxError(message);
  err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
  throw err
};

pp$4.raiseRecoverable = pp$4.raise;

pp$4.curPosition = function() {
  if (this.options.locations) {
    return new Position(this.curLine, this.pos - this.lineStart)
  }
};

var pp$3 = Parser.prototype;

var Scope = function Scope(flags) {
  this.flags = flags;
  // A list of var-declared names in the current lexical scope
  this.var = [];
  // A list of lexically-declared names in the current lexical scope
  this.lexical = [];
  // A list of lexically-declared FunctionDeclaration names in the current lexical scope
  this.functions = [];
};

// The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

pp$3.enterScope = function(flags) {
  this.scopeStack.push(new Scope(flags));
};

pp$3.exitScope = function() {
  this.scopeStack.pop();
};

// The spec says:
// > At the top level of a function, or script, function declarations are
// > treated like var declarations rather than like lexical declarations.
pp$3.treatFunctionsAsVarInScope = function(scope) {
  return (scope.flags & SCOPE_FUNCTION) || !this.inModule && (scope.flags & SCOPE_TOP)
};

pp$3.declareName = function(name, bindingType, pos) {
  var redeclared = false;
  if (bindingType === BIND_LEXICAL) {
    var scope = this.currentScope();
    redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
    scope.lexical.push(name);
    if (this.inModule && (scope.flags & SCOPE_TOP))
      { delete this.undefinedExports[name]; }
  } else if (bindingType === BIND_SIMPLE_CATCH) {
    var scope$1 = this.currentScope();
    scope$1.lexical.push(name);
  } else if (bindingType === BIND_FUNCTION) {
    var scope$2 = this.currentScope();
    if (this.treatFunctionsAsVar)
      { redeclared = scope$2.lexical.indexOf(name) > -1; }
    else
      { redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1; }
    scope$2.functions.push(name);
  } else {
    for (var i = this.scopeStack.length - 1; i >= 0; --i) {
      var scope$3 = this.scopeStack[i];
      if (scope$3.lexical.indexOf(name) > -1 && !((scope$3.flags & SCOPE_SIMPLE_CATCH) && scope$3.lexical[0] === name) ||
          !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
        redeclared = true;
        break
      }
      scope$3.var.push(name);
      if (this.inModule && (scope$3.flags & SCOPE_TOP))
        { delete this.undefinedExports[name]; }
      if (scope$3.flags & SCOPE_VAR) { break }
    }
  }
  if (redeclared) { this.raiseRecoverable(pos, ("Identifier '" + name + "' has already been declared")); }
};

pp$3.checkLocalExport = function(id) {
  // scope.functions must be empty as Module code is always strict.
  if (this.scopeStack[0].lexical.indexOf(id.name) === -1 &&
      this.scopeStack[0].var.indexOf(id.name) === -1) {
    this.undefinedExports[id.name] = id;
  }
};

pp$3.currentScope = function() {
  return this.scopeStack[this.scopeStack.length - 1]
};

pp$3.currentVarScope = function() {
  for (var i = this.scopeStack.length - 1;; i--) {
    var scope = this.scopeStack[i];
    if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK)) { return scope }
  }
};

// Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
pp$3.currentThisScope = function() {
  for (var i = this.scopeStack.length - 1;; i--) {
    var scope = this.scopeStack[i];
    if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK) &&
        !(scope.flags & SCOPE_ARROW)) { return scope }
  }
};

var Node = function Node(parser, pos, loc) {
  this.type = "";
  this.start = pos;
  this.end = 0;
  if (parser.options.locations)
    { this.loc = new SourceLocation(parser, loc); }
  if (parser.options.directSourceFile)
    { this.sourceFile = parser.options.directSourceFile; }
  if (parser.options.ranges)
    { this.range = [pos, 0]; }
};

// Start an AST node, attaching a start offset.

var pp$2 = Parser.prototype;

pp$2.startNode = function() {
  return new Node(this, this.start, this.startLoc)
};

pp$2.startNodeAt = function(pos, loc) {
  return new Node(this, pos, loc)
};

// Finish an AST node, adding `type` and `end` properties.

function finishNodeAt(node, type, pos, loc) {
  node.type = type;
  node.end = pos;
  if (this.options.locations)
    { node.loc.end = loc; }
  if (this.options.ranges)
    { node.range[1] = pos; }
  return node
}

pp$2.finishNode = function(node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
};

// Finish node at given position

pp$2.finishNodeAt = function(node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc)
};

pp$2.copyNode = function(node) {
  var newNode = new Node(this, node.start, this.startLoc);
  for (var prop in node) { newNode[prop] = node[prop]; }
  return newNode
};

// This file was generated by "bin/generate-unicode-script-values.js". Do not modify manually!
var scriptValuesAddedInUnicode = "Gara Garay Gukh Gurung_Khema Hrkt Katakana_Or_Hiragana Kawi Kirat_Rai Krai Nag_Mundari Nagm Ol_Onal Onao Sunu Sunuwar Todhri Todr Tulu_Tigalari Tutg Unknown Zzzz";

// This file contains Unicode properties extracted from the ECMAScript specification.
// The lists are extracted like so:
// $$('#table-binary-unicode-properties > figure > table > tbody > tr > td:nth-child(1) code').map(el => el.innerText)

// #table-binary-unicode-properties
var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
var ecma11BinaryProperties = ecma10BinaryProperties;
var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
var ecma13BinaryProperties = ecma12BinaryProperties;
var ecma14BinaryProperties = ecma13BinaryProperties;

var unicodeBinaryProperties = {
  9: ecma9BinaryProperties,
  10: ecma10BinaryProperties,
  11: ecma11BinaryProperties,
  12: ecma12BinaryProperties,
  13: ecma13BinaryProperties,
  14: ecma14BinaryProperties
};

// #table-binary-unicode-properties-of-strings
var ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji";

var unicodeBinaryPropertiesOfStrings = {
  9: "",
  10: "",
  11: "",
  12: "",
  13: "",
  14: ecma14BinaryPropertiesOfStrings
};

// #table-unicode-general-category-values
var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";

// #table-unicode-script-values
var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
var ecma14ScriptValues = ecma13ScriptValues + " " + scriptValuesAddedInUnicode;

var unicodeScriptValues = {
  9: ecma9ScriptValues,
  10: ecma10ScriptValues,
  11: ecma11ScriptValues,
  12: ecma12ScriptValues,
  13: ecma13ScriptValues,
  14: ecma14ScriptValues
};

var data = {};
function buildUnicodeData(ecmaVersion) {
  var d = data[ecmaVersion] = {
    binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
    binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion]),
    nonBinary: {
      General_Category: wordsRegexp(unicodeGeneralCategoryValues),
      Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
    }
  };
  d.nonBinary.Script_Extensions = d.nonBinary.Script;

  d.nonBinary.gc = d.nonBinary.General_Category;
  d.nonBinary.sc = d.nonBinary.Script;
  d.nonBinary.scx = d.nonBinary.Script_Extensions;
}

for (var i = 0, list = [9, 10, 11, 12, 13, 14]; i < list.length; i += 1) {
  var ecmaVersion = list[i];

  buildUnicodeData(ecmaVersion);
}

var pp$1 = Parser.prototype;

// Track disjunction structure to determine whether a duplicate
// capture group name is allowed because it is in a separate branch.
var BranchID = function BranchID(parent, base) {
  // Parent disjunction branch
  this.parent = parent;
  // Identifies this set of sibling branches
  this.base = base || this;
};

BranchID.prototype.separatedFrom = function separatedFrom (alt) {
  // A branch is separate from another branch if they or any of
  // their parents are siblings in a given disjunction
  for (var self = this; self; self = self.parent) {
    for (var other = alt; other; other = other.parent) {
      if (self.base === other.base && self !== other) { return true }
    }
  }
  return false
};

BranchID.prototype.sibling = function sibling () {
  return new BranchID(this.parent, this.base)
};

var RegExpValidationState = function RegExpValidationState(parser) {
  this.parser = parser;
  this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
  this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
  this.source = "";
  this.flags = "";
  this.start = 0;
  this.switchU = false;
  this.switchV = false;
  this.switchN = false;
  this.pos = 0;
  this.lastIntValue = 0;
  this.lastStringValue = "";
  this.lastAssertionIsQuantifiable = false;
  this.numCapturingParens = 0;
  this.maxBackReference = 0;
  this.groupNames = Object.create(null);
  this.backReferenceNames = [];
  this.branchID = null;
};

RegExpValidationState.prototype.reset = function reset (start, pattern, flags) {
  var unicodeSets = flags.indexOf("v") !== -1;
  var unicode = flags.indexOf("u") !== -1;
  this.start = start | 0;
  this.source = pattern + "";
  this.flags = flags;
  if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
    this.switchU = true;
    this.switchV = true;
    this.switchN = true;
  } else {
    this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
    this.switchV = false;
    this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
  }
};

RegExpValidationState.prototype.raise = function raise (message) {
  this.parser.raiseRecoverable(this.start, ("Invalid regular expression: /" + (this.source) + "/: " + message));
};

// If u flag is given, this returns the code point at the index (it combines a surrogate pair).
// Otherwise, this returns the code unit of the index (can be a part of a surrogate pair).
RegExpValidationState.prototype.at = function at (i, forceU) {
    if ( forceU === void 0 ) forceU = false;

  var s = this.source;
  var l = s.length;
  if (i >= l) {
    return -1
  }
  var c = s.charCodeAt(i);
  if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
    return c
  }
  var next = s.charCodeAt(i + 1);
  return next >= 0xDC00 && next <= 0xDFFF ? (c << 10) + next - 0x35FDC00 : c
};

RegExpValidationState.prototype.nextIndex = function nextIndex (i, forceU) {
    if ( forceU === void 0 ) forceU = false;

  var s = this.source;
  var l = s.length;
  if (i >= l) {
    return l
  }
  var c = s.charCodeAt(i), next;
  if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l ||
      (next = s.charCodeAt(i + 1)) < 0xDC00 || next > 0xDFFF) {
    return i + 1
  }
  return i + 2
};

RegExpValidationState.prototype.current = function current (forceU) {
    if ( forceU === void 0 ) forceU = false;

  return this.at(this.pos, forceU)
};

RegExpValidationState.prototype.lookahead = function lookahead (forceU) {
    if ( forceU === void 0 ) forceU = false;

  return this.at(this.nextIndex(this.pos, forceU), forceU)
};

RegExpValidationState.prototype.advance = function advance (forceU) {
    if ( forceU === void 0 ) forceU = false;

  this.pos = this.nextIndex(this.pos, forceU);
};

RegExpValidationState.prototype.eat = function eat (ch, forceU) {
    if ( forceU === void 0 ) forceU = false;

  if (this.current(forceU) === ch) {
    this.advance(forceU);
    return true
  }
  return false
};

RegExpValidationState.prototype.eatChars = function eatChars (chs, forceU) {
    if ( forceU === void 0 ) forceU = false;

  var pos = this.pos;
  for (var i = 0, list = chs; i < list.length; i += 1) {
    var ch = list[i];

      var current = this.at(pos, forceU);
    if (current === -1 || current !== ch) {
      return false
    }
    pos = this.nextIndex(pos, forceU);
  }
  this.pos = pos;
  return true
};

/**
 * Validate the flags part of a given RegExpLiteral.
 *
 * @param {RegExpValidationState} state The state to validate RegExp.
 * @returns {void}
 */
pp$1.validateRegExpFlags = function(state) {
  var validFlags = state.validFlags;
  var flags = state.flags;

  var u = false;
  var v = false;

  for (var i = 0; i < flags.length; i++) {
    var flag = flags.charAt(i);
    if (validFlags.indexOf(flag) === -1) {
      this.raise(state.start, "Invalid regular expression flag");
    }
    if (flags.indexOf(flag, i + 1) > -1) {
      this.raise(state.start, "Duplicate regular expression flag");
    }
    if (flag === "u") { u = true; }
    if (flag === "v") { v = true; }
  }
  if (this.options.ecmaVersion >= 15 && u && v) {
    this.raise(state.start, "Invalid regular expression flag");
  }
};

function hasProp(obj) {
  for (var _ in obj) { return true }
  return false
}

/**
 * Validate the pattern part of a given RegExpLiteral.
 *
 * @param {RegExpValidationState} state The state to validate RegExp.
 * @returns {void}
 */
pp$1.validateRegExpPattern = function(state) {
  this.regexp_pattern(state);

  // The goal symbol for the parse is |Pattern[~U, ~N]|. If the result of
  // parsing contains a |GroupName|, reparse with the goal symbol
  // |Pattern[~U, +N]| and use this result instead. Throw a *SyntaxError*
  // exception if _P_ did not conform to the grammar, if any elements of _P_
  // were not matched by the parse, or if any Early Error conditions exist.
  if (!state.switchN && this.options.ecmaVersion >= 9 && hasProp(state.groupNames)) {
    state.switchN = true;
    this.regexp_pattern(state);
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Pattern
pp$1.regexp_pattern = function(state) {
  state.pos = 0;
  state.lastIntValue = 0;
  state.lastStringValue = "";
  state.lastAssertionIsQuantifiable = false;
  state.numCapturingParens = 0;
  state.maxBackReference = 0;
  state.groupNames = Object.create(null);
  state.backReferenceNames.length = 0;
  state.branchID = null;

  this.regexp_disjunction(state);

  if (state.pos !== state.source.length) {
    // Make the same messages as V8.
    if (state.eat(0x29 /* ) */)) {
      state.raise("Unmatched ')'");
    }
    if (state.eat(0x5D /* ] */) || state.eat(0x7D /* } */)) {
      state.raise("Lone quantifier brackets");
    }
  }
  if (state.maxBackReference > state.numCapturingParens) {
    state.raise("Invalid escape");
  }
  for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
    var name = list[i];

    if (!state.groupNames[name]) {
      state.raise("Invalid named capture referenced");
    }
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Disjunction
pp$1.regexp_disjunction = function(state) {
  var trackDisjunction = this.options.ecmaVersion >= 16;
  if (trackDisjunction) { state.branchID = new BranchID(state.branchID, null); }
  this.regexp_alternative(state);
  while (state.eat(0x7C /* | */)) {
    if (trackDisjunction) { state.branchID = state.branchID.sibling(); }
    this.regexp_alternative(state);
  }
  if (trackDisjunction) { state.branchID = state.branchID.parent; }

  // Make the same message as V8.
  if (this.regexp_eatQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  if (state.eat(0x7B /* { */)) {
    state.raise("Lone quantifier brackets");
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Alternative
pp$1.regexp_alternative = function(state) {
  while (state.pos < state.source.length && this.regexp_eatTerm(state)) {}
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Term
pp$1.regexp_eatTerm = function(state) {
  if (this.regexp_eatAssertion(state)) {
    // Handle `QuantifiableAssertion Quantifier` alternative.
    // `state.lastAssertionIsQuantifiable` is true if the last eaten Assertion
    // is a QuantifiableAssertion.
    if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
      // Make the same message as V8.
      if (state.switchU) {
        state.raise("Invalid quantifier");
      }
    }
    return true
  }

  if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
    this.regexp_eatQuantifier(state);
    return true
  }

  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Assertion
pp$1.regexp_eatAssertion = function(state) {
  var start = state.pos;
  state.lastAssertionIsQuantifiable = false;

  // ^, $
  if (state.eat(0x5E /* ^ */) || state.eat(0x24 /* $ */)) {
    return true
  }

  // \b \B
  if (state.eat(0x5C /* \ */)) {
    if (state.eat(0x42 /* B */) || state.eat(0x62 /* b */)) {
      return true
    }
    state.pos = start;
  }

  // Lookahead / Lookbehind
  if (state.eat(0x28 /* ( */) && state.eat(0x3F /* ? */)) {
    var lookbehind = false;
    if (this.options.ecmaVersion >= 9) {
      lookbehind = state.eat(0x3C /* < */);
    }
    if (state.eat(0x3D /* = */) || state.eat(0x21 /* ! */)) {
      this.regexp_disjunction(state);
      if (!state.eat(0x29 /* ) */)) {
        state.raise("Unterminated group");
      }
      state.lastAssertionIsQuantifiable = !lookbehind;
      return true
    }
  }

  state.pos = start;
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Quantifier
pp$1.regexp_eatQuantifier = function(state, noError) {
  if ( noError === void 0 ) noError = false;

  if (this.regexp_eatQuantifierPrefix(state, noError)) {
    state.eat(0x3F /* ? */);
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-QuantifierPrefix
pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
  return (
    state.eat(0x2A /* * */) ||
    state.eat(0x2B /* + */) ||
    state.eat(0x3F /* ? */) ||
    this.regexp_eatBracedQuantifier(state, noError)
  )
};
pp$1.regexp_eatBracedQuantifier = function(state, noError) {
  var start = state.pos;
  if (state.eat(0x7B /* { */)) {
    var min = 0, max = -1;
    if (this.regexp_eatDecimalDigits(state)) {
      min = state.lastIntValue;
      if (state.eat(0x2C /* , */) && this.regexp_eatDecimalDigits(state)) {
        max = state.lastIntValue;
      }
      if (state.eat(0x7D /* } */)) {
        // SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-term
        if (max !== -1 && max < min && !noError) {
          state.raise("numbers out of order in {} quantifier");
        }
        return true
      }
    }
    if (state.switchU && !noError) {
      state.raise("Incomplete quantifier");
    }
    state.pos = start;
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Atom
pp$1.regexp_eatAtom = function(state) {
  return (
    this.regexp_eatPatternCharacters(state) ||
    state.eat(0x2E /* . */) ||
    this.regexp_eatReverseSolidusAtomEscape(state) ||
    this.regexp_eatCharacterClass(state) ||
    this.regexp_eatUncapturingGroup(state) ||
    this.regexp_eatCapturingGroup(state)
  )
};
pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
  var start = state.pos;
  if (state.eat(0x5C /* \ */)) {
    if (this.regexp_eatAtomEscape(state)) {
      return true
    }
    state.pos = start;
  }
  return false
};
pp$1.regexp_eatUncapturingGroup = function(state) {
  var start = state.pos;
  if (state.eat(0x28 /* ( */)) {
    if (state.eat(0x3F /* ? */)) {
      if (this.options.ecmaVersion >= 16) {
        var addModifiers = this.regexp_eatModifiers(state);
        var hasHyphen = state.eat(0x2D /* - */);
        if (addModifiers || hasHyphen) {
          for (var i = 0; i < addModifiers.length; i++) {
            var modifier = addModifiers.charAt(i);
            if (addModifiers.indexOf(modifier, i + 1) > -1) {
              state.raise("Duplicate regular expression modifiers");
            }
          }
          if (hasHyphen) {
            var removeModifiers = this.regexp_eatModifiers(state);
            if (!addModifiers && !removeModifiers && state.current() === 0x3A /* : */) {
              state.raise("Invalid regular expression modifiers");
            }
            for (var i$1 = 0; i$1 < removeModifiers.length; i$1++) {
              var modifier$1 = removeModifiers.charAt(i$1);
              if (
                removeModifiers.indexOf(modifier$1, i$1 + 1) > -1 ||
                addModifiers.indexOf(modifier$1) > -1
              ) {
                state.raise("Duplicate regular expression modifiers");
              }
            }
          }
        }
      }
      if (state.eat(0x3A /* : */)) {
        this.regexp_disjunction(state);
        if (state.eat(0x29 /* ) */)) {
          return true
        }
        state.raise("Unterminated group");
      }
    }
    state.pos = start;
  }
  return false
};
pp$1.regexp_eatCapturingGroup = function(state) {
  if (state.eat(0x28 /* ( */)) {
    if (this.options.ecmaVersion >= 9) {
      this.regexp_groupSpecifier(state);
    } else if (state.current() === 0x3F /* ? */) {
      state.raise("Invalid group");
    }
    this.regexp_disjunction(state);
    if (state.eat(0x29 /* ) */)) {
      state.numCapturingParens += 1;
      return true
    }
    state.raise("Unterminated group");
  }
  return false
};
// RegularExpressionModifiers ::
//   [empty]
//   RegularExpressionModifiers RegularExpressionModifier
pp$1.regexp_eatModifiers = function(state) {
  var modifiers = "";
  var ch = 0;
  while ((ch = state.current()) !== -1 && isRegularExpressionModifier(ch)) {
    modifiers += codePointToString(ch);
    state.advance();
  }
  return modifiers
};
// RegularExpressionModifier :: one of
//   `i` `m` `s`
function isRegularExpressionModifier(ch) {
  return ch === 0x69 /* i */ || ch === 0x6d /* m */ || ch === 0x73 /* s */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedAtom
pp$1.regexp_eatExtendedAtom = function(state) {
  return (
    state.eat(0x2E /* . */) ||
    this.regexp_eatReverseSolidusAtomEscape(state) ||
    this.regexp_eatCharacterClass(state) ||
    this.regexp_eatUncapturingGroup(state) ||
    this.regexp_eatCapturingGroup(state) ||
    this.regexp_eatInvalidBracedQuantifier(state) ||
    this.regexp_eatExtendedPatternCharacter(state)
  )
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-InvalidBracedQuantifier
pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
  if (this.regexp_eatBracedQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-SyntaxCharacter
pp$1.regexp_eatSyntaxCharacter = function(state) {
  var ch = state.current();
  if (isSyntaxCharacter(ch)) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }
  return false
};
function isSyntaxCharacter(ch) {
  return (
    ch === 0x24 /* $ */ ||
    ch >= 0x28 /* ( */ && ch <= 0x2B /* + */ ||
    ch === 0x2E /* . */ ||
    ch === 0x3F /* ? */ ||
    ch >= 0x5B /* [ */ && ch <= 0x5E /* ^ */ ||
    ch >= 0x7B /* { */ && ch <= 0x7D /* } */
  )
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-PatternCharacter
// But eat eager.
pp$1.regexp_eatPatternCharacters = function(state) {
  var start = state.pos;
  var ch = 0;
  while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
    state.advance();
  }
  return state.pos !== start
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedPatternCharacter
pp$1.regexp_eatExtendedPatternCharacter = function(state) {
  var ch = state.current();
  if (
    ch !== -1 &&
    ch !== 0x24 /* $ */ &&
    !(ch >= 0x28 /* ( */ && ch <= 0x2B /* + */) &&
    ch !== 0x2E /* . */ &&
    ch !== 0x3F /* ? */ &&
    ch !== 0x5B /* [ */ &&
    ch !== 0x5E /* ^ */ &&
    ch !== 0x7C /* | */
  ) {
    state.advance();
    return true
  }
  return false
};

// GroupSpecifier ::
//   [empty]
//   `?` GroupName
pp$1.regexp_groupSpecifier = function(state) {
  if (state.eat(0x3F /* ? */)) {
    if (!this.regexp_eatGroupName(state)) { state.raise("Invalid group"); }
    var trackDisjunction = this.options.ecmaVersion >= 16;
    var known = state.groupNames[state.lastStringValue];
    if (known) {
      if (trackDisjunction) {
        for (var i = 0, list = known; i < list.length; i += 1) {
          var altID = list[i];

          if (!altID.separatedFrom(state.branchID))
            { state.raise("Duplicate capture group name"); }
        }
      } else {
        state.raise("Duplicate capture group name");
      }
    }
    if (trackDisjunction) {
      (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
    } else {
      state.groupNames[state.lastStringValue] = true;
    }
  }
};

// GroupName ::
//   `<` RegExpIdentifierName `>`
// Note: this updates `state.lastStringValue` property with the eaten name.
pp$1.regexp_eatGroupName = function(state) {
  state.lastStringValue = "";
  if (state.eat(0x3C /* < */)) {
    if (this.regexp_eatRegExpIdentifierName(state) && state.eat(0x3E /* > */)) {
      return true
    }
    state.raise("Invalid capture group name");
  }
  return false
};

// RegExpIdentifierName ::
//   RegExpIdentifierStart
//   RegExpIdentifierName RegExpIdentifierPart
// Note: this updates `state.lastStringValue` property with the eaten name.
pp$1.regexp_eatRegExpIdentifierName = function(state) {
  state.lastStringValue = "";
  if (this.regexp_eatRegExpIdentifierStart(state)) {
    state.lastStringValue += codePointToString(state.lastIntValue);
    while (this.regexp_eatRegExpIdentifierPart(state)) {
      state.lastStringValue += codePointToString(state.lastIntValue);
    }
    return true
  }
  return false
};

// RegExpIdentifierStart ::
//   UnicodeIDStart
//   `$`
//   `_`
//   `\` RegExpUnicodeEscapeSequence[+U]
pp$1.regexp_eatRegExpIdentifierStart = function(state) {
  var start = state.pos;
  var forceU = this.options.ecmaVersion >= 11;
  var ch = state.current(forceU);
  state.advance(forceU);

  if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierStart(ch)) {
    state.lastIntValue = ch;
    return true
  }

  state.pos = start;
  return false
};
function isRegExpIdentifierStart(ch) {
  return isIdentifierStart(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */
}

// RegExpIdentifierPart ::
//   UnicodeIDContinue
//   `$`
//   `_`
//   `\` RegExpUnicodeEscapeSequence[+U]
//   <ZWNJ>
//   <ZWJ>
pp$1.regexp_eatRegExpIdentifierPart = function(state) {
  var start = state.pos;
  var forceU = this.options.ecmaVersion >= 11;
  var ch = state.current(forceU);
  state.advance(forceU);

  if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierPart(ch)) {
    state.lastIntValue = ch;
    return true
  }

  state.pos = start;
  return false
};
function isRegExpIdentifierPart(ch) {
  return isIdentifierChar(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */ || ch === 0x200C /* <ZWNJ> */ || ch === 0x200D /* <ZWJ> */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-AtomEscape
pp$1.regexp_eatAtomEscape = function(state) {
  if (
    this.regexp_eatBackReference(state) ||
    this.regexp_eatCharacterClassEscape(state) ||
    this.regexp_eatCharacterEscape(state) ||
    (state.switchN && this.regexp_eatKGroupName(state))
  ) {
    return true
  }
  if (state.switchU) {
    // Make the same message as V8.
    if (state.current() === 0x63 /* c */) {
      state.raise("Invalid unicode escape");
    }
    state.raise("Invalid escape");
  }
  return false
};
pp$1.regexp_eatBackReference = function(state) {
  var start = state.pos;
  if (this.regexp_eatDecimalEscape(state)) {
    var n = state.lastIntValue;
    if (state.switchU) {
      // For SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-atomescape
      if (n > state.maxBackReference) {
        state.maxBackReference = n;
      }
      return true
    }
    if (n <= state.numCapturingParens) {
      return true
    }
    state.pos = start;
  }
  return false
};
pp$1.regexp_eatKGroupName = function(state) {
  if (state.eat(0x6B /* k */)) {
    if (this.regexp_eatGroupName(state)) {
      state.backReferenceNames.push(state.lastStringValue);
      return true
    }
    state.raise("Invalid named reference");
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-CharacterEscape
pp$1.regexp_eatCharacterEscape = function(state) {
  return (
    this.regexp_eatControlEscape(state) ||
    this.regexp_eatCControlLetter(state) ||
    this.regexp_eatZero(state) ||
    this.regexp_eatHexEscapeSequence(state) ||
    this.regexp_eatRegExpUnicodeEscapeSequence(state, false) ||
    (!state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state)) ||
    this.regexp_eatIdentityEscape(state)
  )
};
pp$1.regexp_eatCControlLetter = function(state) {
  var start = state.pos;
  if (state.eat(0x63 /* c */)) {
    if (this.regexp_eatControlLetter(state)) {
      return true
    }
    state.pos = start;
  }
  return false
};
pp$1.regexp_eatZero = function(state) {
  if (state.current() === 0x30 /* 0 */ && !isDecimalDigit(state.lookahead())) {
    state.lastIntValue = 0;
    state.advance();
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ControlEscape
pp$1.regexp_eatControlEscape = function(state) {
  var ch = state.current();
  if (ch === 0x74 /* t */) {
    state.lastIntValue = 0x09; /* \t */
    state.advance();
    return true
  }
  if (ch === 0x6E /* n */) {
    state.lastIntValue = 0x0A; /* \n */
    state.advance();
    return true
  }
  if (ch === 0x76 /* v */) {
    state.lastIntValue = 0x0B; /* \v */
    state.advance();
    return true
  }
  if (ch === 0x66 /* f */) {
    state.lastIntValue = 0x0C; /* \f */
    state.advance();
    return true
  }
  if (ch === 0x72 /* r */) {
    state.lastIntValue = 0x0D; /* \r */
    state.advance();
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ControlLetter
pp$1.regexp_eatControlLetter = function(state) {
  var ch = state.current();
  if (isControlLetter(ch)) {
    state.lastIntValue = ch % 0x20;
    state.advance();
    return true
  }
  return false
};
function isControlLetter(ch) {
  return (
    (ch >= 0x41 /* A */ && ch <= 0x5A /* Z */) ||
    (ch >= 0x61 /* a */ && ch <= 0x7A /* z */)
  )
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-RegExpUnicodeEscapeSequence
pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
  if ( forceU === void 0 ) forceU = false;

  var start = state.pos;
  var switchU = forceU || state.switchU;

  if (state.eat(0x75 /* u */)) {
    if (this.regexp_eatFixedHexDigits(state, 4)) {
      var lead = state.lastIntValue;
      if (switchU && lead >= 0xD800 && lead <= 0xDBFF) {
        var leadSurrogateEnd = state.pos;
        if (state.eat(0x5C /* \ */) && state.eat(0x75 /* u */) && this.regexp_eatFixedHexDigits(state, 4)) {
          var trail = state.lastIntValue;
          if (trail >= 0xDC00 && trail <= 0xDFFF) {
            state.lastIntValue = (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
            return true
          }
        }
        state.pos = leadSurrogateEnd;
        state.lastIntValue = lead;
      }
      return true
    }
    if (
      switchU &&
      state.eat(0x7B /* { */) &&
      this.regexp_eatHexDigits(state) &&
      state.eat(0x7D /* } */) &&
      isValidUnicode(state.lastIntValue)
    ) {
      return true
    }
    if (switchU) {
      state.raise("Invalid unicode escape");
    }
    state.pos = start;
  }

  return false
};
function isValidUnicode(ch) {
  return ch >= 0 && ch <= 0x10FFFF
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-IdentityEscape
pp$1.regexp_eatIdentityEscape = function(state) {
  if (state.switchU) {
    if (this.regexp_eatSyntaxCharacter(state)) {
      return true
    }
    if (state.eat(0x2F /* / */)) {
      state.lastIntValue = 0x2F; /* / */
      return true
    }
    return false
  }

  var ch = state.current();
  if (ch !== 0x63 /* c */ && (!state.switchN || ch !== 0x6B /* k */)) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }

  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalEscape
pp$1.regexp_eatDecimalEscape = function(state) {
  state.lastIntValue = 0;
  var ch = state.current();
  if (ch >= 0x31 /* 1 */ && ch <= 0x39 /* 9 */) {
    do {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
      state.advance();
    } while ((ch = state.current()) >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */)
    return true
  }
  return false
};

// Return values used by character set parsing methods, needed to
// forbid negation of sets that can match strings.
var CharSetNone = 0; // Nothing parsed
var CharSetOk = 1; // Construct parsed, cannot contain strings
var CharSetString = 2; // Construct parsed, can contain strings

// https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClassEscape
pp$1.regexp_eatCharacterClassEscape = function(state) {
  var ch = state.current();

  if (isCharacterClassEscape(ch)) {
    state.lastIntValue = -1;
    state.advance();
    return CharSetOk
  }

  var negate = false;
  if (
    state.switchU &&
    this.options.ecmaVersion >= 9 &&
    ((negate = ch === 0x50 /* P */) || ch === 0x70 /* p */)
  ) {
    state.lastIntValue = -1;
    state.advance();
    var result;
    if (
      state.eat(0x7B /* { */) &&
      (result = this.regexp_eatUnicodePropertyValueExpression(state)) &&
      state.eat(0x7D /* } */)
    ) {
      if (negate && result === CharSetString) { state.raise("Invalid property name"); }
      return result
    }
    state.raise("Invalid property name");
  }

  return CharSetNone
};

function isCharacterClassEscape(ch) {
  return (
    ch === 0x64 /* d */ ||
    ch === 0x44 /* D */ ||
    ch === 0x73 /* s */ ||
    ch === 0x53 /* S */ ||
    ch === 0x77 /* w */ ||
    ch === 0x57 /* W */
  )
}

// UnicodePropertyValueExpression ::
//   UnicodePropertyName `=` UnicodePropertyValue
//   LoneUnicodePropertyNameOrValue
pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
  var start = state.pos;

  // UnicodePropertyName `=` UnicodePropertyValue
  if (this.regexp_eatUnicodePropertyName(state) && state.eat(0x3D /* = */)) {
    var name = state.lastStringValue;
    if (this.regexp_eatUnicodePropertyValue(state)) {
      var value = state.lastStringValue;
      this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
      return CharSetOk
    }
  }
  state.pos = start;

  // LoneUnicodePropertyNameOrValue
  if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
    var nameOrValue = state.lastStringValue;
    return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue)
  }
  return CharSetNone
};

pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
  if (!hasOwn(state.unicodeProperties.nonBinary, name))
    { state.raise("Invalid property name"); }
  if (!state.unicodeProperties.nonBinary[name].test(value))
    { state.raise("Invalid property value"); }
};

pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
  if (state.unicodeProperties.binary.test(nameOrValue)) { return CharSetOk }
  if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) { return CharSetString }
  state.raise("Invalid property name");
};

// UnicodePropertyName ::
//   UnicodePropertyNameCharacters
pp$1.regexp_eatUnicodePropertyName = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyNameCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString(ch);
    state.advance();
  }
  return state.lastStringValue !== ""
};

function isUnicodePropertyNameCharacter(ch) {
  return isControlLetter(ch) || ch === 0x5F /* _ */
}

// UnicodePropertyValue ::
//   UnicodePropertyValueCharacters
pp$1.regexp_eatUnicodePropertyValue = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyValueCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString(ch);
    state.advance();
  }
  return state.lastStringValue !== ""
};
function isUnicodePropertyValueCharacter(ch) {
  return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch)
}

// LoneUnicodePropertyNameOrValue ::
//   UnicodePropertyValueCharacters
pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
  return this.regexp_eatUnicodePropertyValue(state)
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClass
pp$1.regexp_eatCharacterClass = function(state) {
  if (state.eat(0x5B /* [ */)) {
    var negate = state.eat(0x5E /* ^ */);
    var result = this.regexp_classContents(state);
    if (!state.eat(0x5D /* ] */))
      { state.raise("Unterminated character class"); }
    if (negate && result === CharSetString)
      { state.raise("Negated character class may contain strings"); }
    return true
  }
  return false
};

// https://tc39.es/ecma262/#prod-ClassContents
// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassRanges
pp$1.regexp_classContents = function(state) {
  if (state.current() === 0x5D /* ] */) { return CharSetOk }
  if (state.switchV) { return this.regexp_classSetExpression(state) }
  this.regexp_nonEmptyClassRanges(state);
  return CharSetOk
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRanges
// https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRangesNoDash
pp$1.regexp_nonEmptyClassRanges = function(state) {
  while (this.regexp_eatClassAtom(state)) {
    var left = state.lastIntValue;
    if (state.eat(0x2D /* - */) && this.regexp_eatClassAtom(state)) {
      var right = state.lastIntValue;
      if (state.switchU && (left === -1 || right === -1)) {
        state.raise("Invalid character class");
      }
      if (left !== -1 && right !== -1 && left > right) {
        state.raise("Range out of order in character class");
      }
    }
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtom
// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtomNoDash
pp$1.regexp_eatClassAtom = function(state) {
  var start = state.pos;

  if (state.eat(0x5C /* \ */)) {
    if (this.regexp_eatClassEscape(state)) {
      return true
    }
    if (state.switchU) {
      // Make the same message as V8.
      var ch$1 = state.current();
      if (ch$1 === 0x63 /* c */ || isOctalDigit(ch$1)) {
        state.raise("Invalid class escape");
      }
      state.raise("Invalid escape");
    }
    state.pos = start;
  }

  var ch = state.current();
  if (ch !== 0x5D /* ] */) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }

  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassEscape
pp$1.regexp_eatClassEscape = function(state) {
  var start = state.pos;

  if (state.eat(0x62 /* b */)) {
    state.lastIntValue = 0x08; /* <BS> */
    return true
  }

  if (state.switchU && state.eat(0x2D /* - */)) {
    state.lastIntValue = 0x2D; /* - */
    return true
  }

  if (!state.switchU && state.eat(0x63 /* c */)) {
    if (this.regexp_eatClassControlLetter(state)) {
      return true
    }
    state.pos = start;
  }

  return (
    this.regexp_eatCharacterClassEscape(state) ||
    this.regexp_eatCharacterEscape(state)
  )
};

// https://tc39.es/ecma262/#prod-ClassSetExpression
// https://tc39.es/ecma262/#prod-ClassUnion
// https://tc39.es/ecma262/#prod-ClassIntersection
// https://tc39.es/ecma262/#prod-ClassSubtraction
pp$1.regexp_classSetExpression = function(state) {
  var result = CharSetOk, subResult;
  if (this.regexp_eatClassSetRange(state)) ; else if (subResult = this.regexp_eatClassSetOperand(state)) {
    if (subResult === CharSetString) { result = CharSetString; }
    // https://tc39.es/ecma262/#prod-ClassIntersection
    var start = state.pos;
    while (state.eatChars([0x26, 0x26] /* && */)) {
      if (
        state.current() !== 0x26 /* & */ &&
        (subResult = this.regexp_eatClassSetOperand(state))
      ) {
        if (subResult !== CharSetString) { result = CharSetOk; }
        continue
      }
      state.raise("Invalid character in character class");
    }
    if (start !== state.pos) { return result }
    // https://tc39.es/ecma262/#prod-ClassSubtraction
    while (state.eatChars([0x2D, 0x2D] /* -- */)) {
      if (this.regexp_eatClassSetOperand(state)) { continue }
      state.raise("Invalid character in character class");
    }
    if (start !== state.pos) { return result }
  } else {
    state.raise("Invalid character in character class");
  }
  // https://tc39.es/ecma262/#prod-ClassUnion
  for (;;) {
    if (this.regexp_eatClassSetRange(state)) { continue }
    subResult = this.regexp_eatClassSetOperand(state);
    if (!subResult) { return result }
    if (subResult === CharSetString) { result = CharSetString; }
  }
};

// https://tc39.es/ecma262/#prod-ClassSetRange
pp$1.regexp_eatClassSetRange = function(state) {
  var start = state.pos;
  if (this.regexp_eatClassSetCharacter(state)) {
    var left = state.lastIntValue;
    if (state.eat(0x2D /* - */) && this.regexp_eatClassSetCharacter(state)) {
      var right = state.lastIntValue;
      if (left !== -1 && right !== -1 && left > right) {
        state.raise("Range out of order in character class");
      }
      return true
    }
    state.pos = start;
  }
  return false
};

// https://tc39.es/ecma262/#prod-ClassSetOperand
pp$1.regexp_eatClassSetOperand = function(state) {
  if (this.regexp_eatClassSetCharacter(state)) { return CharSetOk }
  return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state)
};

// https://tc39.es/ecma262/#prod-NestedClass
pp$1.regexp_eatNestedClass = function(state) {
  var start = state.pos;
  if (state.eat(0x5B /* [ */)) {
    var negate = state.eat(0x5E /* ^ */);
    var result = this.regexp_classContents(state);
    if (state.eat(0x5D /* ] */)) {
      if (negate && result === CharSetString) {
        state.raise("Negated character class may contain strings");
      }
      return result
    }
    state.pos = start;
  }
  if (state.eat(0x5C /* \ */)) {
    var result$1 = this.regexp_eatCharacterClassEscape(state);
    if (result$1) {
      return result$1
    }
    state.pos = start;
  }
  return null
};

// https://tc39.es/ecma262/#prod-ClassStringDisjunction
pp$1.regexp_eatClassStringDisjunction = function(state) {
  var start = state.pos;
  if (state.eatChars([0x5C, 0x71] /* \q */)) {
    if (state.eat(0x7B /* { */)) {
      var result = this.regexp_classStringDisjunctionContents(state);
      if (state.eat(0x7D /* } */)) {
        return result
      }
    } else {
      // Make the same message as V8.
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  return null
};

// https://tc39.es/ecma262/#prod-ClassStringDisjunctionContents
pp$1.regexp_classStringDisjunctionContents = function(state) {
  var result = this.regexp_classString(state);
  while (state.eat(0x7C /* | */)) {
    if (this.regexp_classString(state) === CharSetString) { result = CharSetString; }
  }
  return result
};

// https://tc39.es/ecma262/#prod-ClassString
// https://tc39.es/ecma262/#prod-NonEmptyClassString
pp$1.regexp_classString = function(state) {
  var count = 0;
  while (this.regexp_eatClassSetCharacter(state)) { count++; }
  return count === 1 ? CharSetOk : CharSetString
};

// https://tc39.es/ecma262/#prod-ClassSetCharacter
pp$1.regexp_eatClassSetCharacter = function(state) {
  var start = state.pos;
  if (state.eat(0x5C /* \ */)) {
    if (
      this.regexp_eatCharacterEscape(state) ||
      this.regexp_eatClassSetReservedPunctuator(state)
    ) {
      return true
    }
    if (state.eat(0x62 /* b */)) {
      state.lastIntValue = 0x08; /* <BS> */
      return true
    }
    state.pos = start;
    return false
  }
  var ch = state.current();
  if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) { return false }
  if (isClassSetSyntaxCharacter(ch)) { return false }
  state.advance();
  state.lastIntValue = ch;
  return true
};

// https://tc39.es/ecma262/#prod-ClassSetReservedDoublePunctuator
function isClassSetReservedDoublePunctuatorCharacter(ch) {
  return (
    ch === 0x21 /* ! */ ||
    ch >= 0x23 /* # */ && ch <= 0x26 /* & */ ||
    ch >= 0x2A /* * */ && ch <= 0x2C /* , */ ||
    ch === 0x2E /* . */ ||
    ch >= 0x3A /* : */ && ch <= 0x40 /* @ */ ||
    ch === 0x5E /* ^ */ ||
    ch === 0x60 /* ` */ ||
    ch === 0x7E /* ~ */
  )
}

// https://tc39.es/ecma262/#prod-ClassSetSyntaxCharacter
function isClassSetSyntaxCharacter(ch) {
  return (
    ch === 0x28 /* ( */ ||
    ch === 0x29 /* ) */ ||
    ch === 0x2D /* - */ ||
    ch === 0x2F /* / */ ||
    ch >= 0x5B /* [ */ && ch <= 0x5D /* ] */ ||
    ch >= 0x7B /* { */ && ch <= 0x7D /* } */
  )
}

// https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
  var ch = state.current();
  if (isClassSetReservedPunctuator(ch)) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }
  return false
};

// https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
function isClassSetReservedPunctuator(ch) {
  return (
    ch === 0x21 /* ! */ ||
    ch === 0x23 /* # */ ||
    ch === 0x25 /* % */ ||
    ch === 0x26 /* & */ ||
    ch === 0x2C /* , */ ||
    ch === 0x2D /* - */ ||
    ch >= 0x3A /* : */ && ch <= 0x3E /* > */ ||
    ch === 0x40 /* @ */ ||
    ch === 0x60 /* ` */ ||
    ch === 0x7E /* ~ */
  )
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassControlLetter
pp$1.regexp_eatClassControlLetter = function(state) {
  var ch = state.current();
  if (isDecimalDigit(ch) || ch === 0x5F /* _ */) {
    state.lastIntValue = ch % 0x20;
    state.advance();
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
pp$1.regexp_eatHexEscapeSequence = function(state) {
  var start = state.pos;
  if (state.eat(0x78 /* x */)) {
    if (this.regexp_eatFixedHexDigits(state, 2)) {
      return true
    }
    if (state.switchU) {
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalDigits
pp$1.regexp_eatDecimalDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isDecimalDigit(ch = state.current())) {
    state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
    state.advance();
  }
  return state.pos !== start
};
function isDecimalDigit(ch) {
  return ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigits
pp$1.regexp_eatHexDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isHexDigit(ch = state.current())) {
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return state.pos !== start
};
function isHexDigit(ch) {
  return (
    (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) ||
    (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) ||
    (ch >= 0x61 /* a */ && ch <= 0x66 /* f */)
  )
}
function hexToInt(ch) {
  if (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) {
    return 10 + (ch - 0x41 /* A */)
  }
  if (ch >= 0x61 /* a */ && ch <= 0x66 /* f */) {
    return 10 + (ch - 0x61 /* a */)
  }
  return ch - 0x30 /* 0 */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-LegacyOctalEscapeSequence
// Allows only 0-377(octal) i.e. 0-255(decimal).
pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
  if (this.regexp_eatOctalDigit(state)) {
    var n1 = state.lastIntValue;
    if (this.regexp_eatOctalDigit(state)) {
      var n2 = state.lastIntValue;
      if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
        state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
      } else {
        state.lastIntValue = n1 * 8 + n2;
      }
    } else {
      state.lastIntValue = n1;
    }
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-OctalDigit
pp$1.regexp_eatOctalDigit = function(state) {
  var ch = state.current();
  if (isOctalDigit(ch)) {
    state.lastIntValue = ch - 0x30; /* 0 */
    state.advance();
    return true
  }
  state.lastIntValue = 0;
  return false
};
function isOctalDigit(ch) {
  return ch >= 0x30 /* 0 */ && ch <= 0x37 /* 7 */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-Hex4Digits
// https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigit
// And HexDigit HexDigit in https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
pp$1.regexp_eatFixedHexDigits = function(state, length) {
  var start = state.pos;
  state.lastIntValue = 0;
  for (var i = 0; i < length; ++i) {
    var ch = state.current();
    if (!isHexDigit(ch)) {
      state.pos = start;
      return false
    }
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return true
};

// Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.

var Token = function Token(p) {
  this.type = p.type;
  this.value = p.value;
  this.start = p.start;
  this.end = p.end;
  if (p.options.locations)
    { this.loc = new SourceLocation(p, p.startLoc, p.endLoc); }
  if (p.options.ranges)
    { this.range = [p.start, p.end]; }
};

// ## Tokenizer

var pp = Parser.prototype;

// Move to the next token

pp.next = function(ignoreEscapeSequenceInKeyword) {
  if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc)
    { this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword); }
  if (this.options.onToken)
    { this.options.onToken(new Token(this)); }

  this.lastTokEnd = this.end;
  this.lastTokStart = this.start;
  this.lastTokEndLoc = this.endLoc;
  this.lastTokStartLoc = this.startLoc;
  this.nextToken();
};

pp.getToken = function() {
  this.next();
  return new Token(this)
};

// If we're in an ES6 environment, make parsers iterable
if (typeof Symbol !== "undefined")
  { pp[Symbol.iterator] = function() {
    var this$1$1 = this;

    return {
      next: function () {
        var token = this$1$1.getToken();
        return {
          done: token.type === types$1.eof,
          value: token
        }
      }
    }
  }; }

// Toggle strict mode. Re-reads the next number or string to please
// pedantic tests (`"use strict"; 010;` should fail).

// Read a single token, updating the parser object's token-related
// properties.

pp.nextToken = function() {
  var curContext = this.curContext();
  if (!curContext || !curContext.preserveSpace) { this.skipSpace(); }

  this.start = this.pos;
  if (this.options.locations) { this.startLoc = this.curPosition(); }
  if (this.pos >= this.input.length) { return this.finishToken(types$1.eof) }

  if (curContext.override) { return curContext.override(this) }
  else { this.readToken(this.fullCharCodeAtPos()); }
};

pp.readToken = function(code) {
  // Identifier or keyword. '\uXXXX' sequences are allowed in
  // identifiers, so '\' also dispatches to that.
  if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
    { return this.readWord() }

  return this.getTokenFromCode(code)
};

pp.fullCharCodeAtPos = function() {
  var code = this.input.charCodeAt(this.pos);
  if (code <= 0xd7ff || code >= 0xdc00) { return code }
  var next = this.input.charCodeAt(this.pos + 1);
  return next <= 0xdbff || next >= 0xe000 ? code : (code << 10) + next - 0x35fdc00
};

pp.skipBlockComment = function() {
  var startLoc = this.options.onComment && this.curPosition();
  var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
  if (end === -1) { this.raise(this.pos - 2, "Unterminated comment"); }
  this.pos = end + 2;
  if (this.options.locations) {
    for (var nextBreak = (void 0), pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1;) {
      ++this.curLine;
      pos = this.lineStart = nextBreak;
    }
  }
  if (this.options.onComment)
    { this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                           startLoc, this.curPosition()); }
};

pp.skipLineComment = function(startSkip) {
  var start = this.pos;
  var startLoc = this.options.onComment && this.curPosition();
  var ch = this.input.charCodeAt(this.pos += startSkip);
  while (this.pos < this.input.length && !isNewLine(ch)) {
    ch = this.input.charCodeAt(++this.pos);
  }
  if (this.options.onComment)
    { this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                           startLoc, this.curPosition()); }
};

// Called at the start of the parse and after every token. Skips
// whitespace and comments, and.

pp.skipSpace = function() {
  loop: while (this.pos < this.input.length) {
    var ch = this.input.charCodeAt(this.pos);
    switch (ch) {
    case 32: case 160: // ' '
      ++this.pos;
      break
    case 13:
      if (this.input.charCodeAt(this.pos + 1) === 10) {
        ++this.pos;
      }
    case 10: case 8232: case 8233:
      ++this.pos;
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }
      break
    case 47: // '/'
      switch (this.input.charCodeAt(this.pos + 1)) {
      case 42: // '*'
        this.skipBlockComment();
        break
      case 47:
        this.skipLineComment(2);
        break
      default:
        break loop
      }
      break
    default:
      if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
        ++this.pos;
      } else {
        break loop
      }
    }
  }
};

// Called at the end of every token. Sets `end`, `val`, and
// maintains `context` and `exprAllowed`, and skips the space after
// the token, so that the next one's `start` will point at the
// right position.

pp.finishToken = function(type, val) {
  this.end = this.pos;
  if (this.options.locations) { this.endLoc = this.curPosition(); }
  var prevType = this.type;
  this.type = type;
  this.value = val;

  this.updateContext(prevType);
};

// ### Token reading

// This is the function that is called to fetch the next token. It
// is somewhat obscure, because it works in character codes rather
// than characters, and because operator parsing has been inlined
// into it.
//
// All in the name of speed.
//
pp.readToken_dot = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next >= 48 && next <= 57) { return this.readNumber(true) }
  var next2 = this.input.charCodeAt(this.pos + 2);
  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
    this.pos += 3;
    return this.finishToken(types$1.ellipsis)
  } else {
    ++this.pos;
    return this.finishToken(types$1.dot)
  }
};

pp.readToken_slash = function() { // '/'
  var next = this.input.charCodeAt(this.pos + 1);
  if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
  if (next === 61) { return this.finishOp(types$1.assign, 2) }
  return this.finishOp(types$1.slash, 1)
};

pp.readToken_mult_modulo_exp = function(code) { // '%*'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  var tokentype = code === 42 ? types$1.star : types$1.modulo;

  // exponentiation operator ** and **=
  if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
    ++size;
    tokentype = types$1.starstar;
    next = this.input.charCodeAt(this.pos + 2);
  }

  if (next === 61) { return this.finishOp(types$1.assign, size + 1) }
  return this.finishOp(tokentype, size)
};

pp.readToken_pipe_amp = function(code) { // '|&'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (this.options.ecmaVersion >= 12) {
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (next2 === 61) { return this.finishOp(types$1.assign, 3) }
    }
    return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2)
  }
  if (next === 61) { return this.finishOp(types$1.assign, 2) }
  return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1)
};

pp.readToken_caret = function() { // '^'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) { return this.finishOp(types$1.assign, 2) }
  return this.finishOp(types$1.bitwiseXOR, 1)
};

pp.readToken_plus_min = function(code) { // '+-'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 &&
        (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
      // A `-->` line comment
      this.skipLineComment(3);
      this.skipSpace();
      return this.nextToken()
    }
    return this.finishOp(types$1.incDec, 2)
  }
  if (next === 61) { return this.finishOp(types$1.assign, 2) }
  return this.finishOp(types$1.plusMin, 1)
};

pp.readToken_lt_gt = function(code) { // '<>'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
    if (this.input.charCodeAt(this.pos + size) === 61) { return this.finishOp(types$1.assign, size + 1) }
    return this.finishOp(types$1.bitShift, size)
  }
  if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 &&
      this.input.charCodeAt(this.pos + 3) === 45) {
    // `<!--`, an XML-style comment that should be interpreted as a line comment
    this.skipLineComment(4);
    this.skipSpace();
    return this.nextToken()
  }
  if (next === 61) { size = 2; }
  return this.finishOp(types$1.relational, size)
};

pp.readToken_eq_excl = function(code) { // '=!'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) { return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2) }
  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
    this.pos += 2;
    return this.finishToken(types$1.arrow)
  }
  return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1)
};

pp.readToken_question = function() { // '?'
  var ecmaVersion = this.options.ecmaVersion;
  if (ecmaVersion >= 11) {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 46) {
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (next2 < 48 || next2 > 57) { return this.finishOp(types$1.questionDot, 2) }
    }
    if (next === 63) {
      if (ecmaVersion >= 12) {
        var next2$1 = this.input.charCodeAt(this.pos + 2);
        if (next2$1 === 61) { return this.finishOp(types$1.assign, 3) }
      }
      return this.finishOp(types$1.coalesce, 2)
    }
  }
  return this.finishOp(types$1.question, 1)
};

pp.readToken_numberSign = function() { // '#'
  var ecmaVersion = this.options.ecmaVersion;
  var code = 35; // '#'
  if (ecmaVersion >= 13) {
    ++this.pos;
    code = this.fullCharCodeAtPos();
    if (isIdentifierStart(code, true) || code === 92 /* '\' */) {
      return this.finishToken(types$1.privateId, this.readWord1())
    }
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};

pp.getTokenFromCode = function(code) {
  switch (code) {
  // The interpretation of a dot depends on whether it is followed
  // by a digit or another two dots.
  case 46: // '.'
    return this.readToken_dot()

  // Punctuation tokens.
  case 40: ++this.pos; return this.finishToken(types$1.parenL)
  case 41: ++this.pos; return this.finishToken(types$1.parenR)
  case 59: ++this.pos; return this.finishToken(types$1.semi)
  case 44: ++this.pos; return this.finishToken(types$1.comma)
  case 91: ++this.pos; return this.finishToken(types$1.bracketL)
  case 93: ++this.pos; return this.finishToken(types$1.bracketR)
  case 123: ++this.pos; return this.finishToken(types$1.braceL)
  case 125: ++this.pos; return this.finishToken(types$1.braceR)
  case 58: ++this.pos; return this.finishToken(types$1.colon)

  case 96: // '`'
    if (this.options.ecmaVersion < 6) { break }
    ++this.pos;
    return this.finishToken(types$1.backQuote)

  case 48: // '0'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 120 || next === 88) { return this.readRadixNumber(16) } // '0x', '0X' - hex number
    if (this.options.ecmaVersion >= 6) {
      if (next === 111 || next === 79) { return this.readRadixNumber(8) } // '0o', '0O' - octal number
      if (next === 98 || next === 66) { return this.readRadixNumber(2) } // '0b', '0B' - binary number
    }

  // Anything else beginning with a digit is an integer, octal
  // number, or float.
  case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
    return this.readNumber(false)

  // Quotes produce strings.
  case 34: case 39: // '"', "'"
    return this.readString(code)

  // Operators are parsed inline in tiny state machines. '=' (61) is
  // often referred to. `finishOp` simply skips the amount of
  // characters it is given as second argument, and returns a token
  // of the type given by its first argument.
  case 47: // '/'
    return this.readToken_slash()

  case 37: case 42: // '%*'
    return this.readToken_mult_modulo_exp(code)

  case 124: case 38: // '|&'
    return this.readToken_pipe_amp(code)

  case 94: // '^'
    return this.readToken_caret()

  case 43: case 45: // '+-'
    return this.readToken_plus_min(code)

  case 60: case 62: // '<>'
    return this.readToken_lt_gt(code)

  case 61: case 33: // '=!'
    return this.readToken_eq_excl(code)

  case 63: // '?'
    return this.readToken_question()

  case 126: // '~'
    return this.finishOp(types$1.prefix, 1)

  case 35: // '#'
    return this.readToken_numberSign()
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};

pp.finishOp = function(type, size) {
  var str = this.input.slice(this.pos, this.pos + size);
  this.pos += size;
  return this.finishToken(type, str)
};

pp.readRegexp = function() {
  var escaped, inClass, start = this.pos;
  for (;;) {
    if (this.pos >= this.input.length) { this.raise(start, "Unterminated regular expression"); }
    var ch = this.input.charAt(this.pos);
    if (lineBreak.test(ch)) { this.raise(start, "Unterminated regular expression"); }
    if (!escaped) {
      if (ch === "[") { inClass = true; }
      else if (ch === "]" && inClass) { inClass = false; }
      else if (ch === "/" && !inClass) { break }
      escaped = ch === "\\";
    } else { escaped = false; }
    ++this.pos;
  }
  var pattern = this.input.slice(start, this.pos);
  ++this.pos;
  var flagsStart = this.pos;
  var flags = this.readWord1();
  if (this.containsEsc) { this.unexpected(flagsStart); }

  // Validate pattern
  var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
  state.reset(start, pattern, flags);
  this.validateRegExpFlags(state);
  this.validateRegExpPattern(state);

  // Create Literal#value property value.
  var value = null;
  try {
    value = new RegExp(pattern, flags);
  } catch (e) {
    // ESTree requires null if it failed to instantiate RegExp object.
    // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
  }

  return this.finishToken(types$1.regexp, {pattern: pattern, flags: flags, value: value})
};

// Read an integer in the given radix. Return null if zero digits
// were read, the integer value otherwise. When `len` is given, this
// will return `null` unless the integer has exactly `len` digits.

pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
  // `len` is used for character escape sequences. In that case, disallow separators.
  var allowSeparators = this.options.ecmaVersion >= 12 && len === undefined;

  // `maybeLegacyOctalNumericLiteral` is true if it doesn't have prefix (0x,0o,0b)
  // and isn't fraction part nor exponent part. In that case, if the first digit
  // is zero then disallow separators.
  var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;

  var start = this.pos, total = 0, lastCode = 0;
  for (var i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos) {
    var code = this.input.charCodeAt(this.pos), val = (void 0);

    if (allowSeparators && code === 95) {
      if (isLegacyOctalNumericLiteral) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals"); }
      if (lastCode === 95) { this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore"); }
      if (i === 0) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits"); }
      lastCode = code;
      continue
    }

    if (code >= 97) { val = code - 97 + 10; } // a
    else if (code >= 65) { val = code - 65 + 10; } // A
    else if (code >= 48 && code <= 57) { val = code - 48; } // 0-9
    else { val = Infinity; }
    if (val >= radix) { break }
    lastCode = code;
    total = total * radix + val;
  }

  if (allowSeparators && lastCode === 95) { this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits"); }
  if (this.pos === start || len != null && this.pos - start !== len) { return null }

  return total
};

function stringToNumber(str, isLegacyOctalNumericLiteral) {
  if (isLegacyOctalNumericLiteral) {
    return parseInt(str, 8)
  }

  // `parseFloat(value)` stops parsing at the first numeric separator then returns a wrong value.
  return parseFloat(str.replace(/_/g, ""))
}

function stringToBigInt(str) {
  if (typeof BigInt !== "function") {
    return null
  }

  // `BigInt(value)` throws syntax error if the string contains numeric separators.
  return BigInt(str.replace(/_/g, ""))
}

pp.readRadixNumber = function(radix) {
  var start = this.pos;
  this.pos += 2; // 0x
  var val = this.readInt(radix);
  if (val == null) { this.raise(this.start + 2, "Expected number in radix " + radix); }
  if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
    val = stringToBigInt(this.input.slice(start, this.pos));
    ++this.pos;
  } else if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
  return this.finishToken(types$1.num, val)
};

// Read an integer, octal integer, or floating-point number.

pp.readNumber = function(startsWithDot) {
  var start = this.pos;
  if (!startsWithDot && this.readInt(10, undefined, true) === null) { this.raise(start, "Invalid number"); }
  var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
  if (octal && this.strict) { this.raise(start, "Invalid number"); }
  var next = this.input.charCodeAt(this.pos);
  if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
    var val$1 = stringToBigInt(this.input.slice(start, this.pos));
    ++this.pos;
    if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
    return this.finishToken(types$1.num, val$1)
  }
  if (octal && /[89]/.test(this.input.slice(start, this.pos))) { octal = false; }
  if (next === 46 && !octal) { // '.'
    ++this.pos;
    this.readInt(10);
    next = this.input.charCodeAt(this.pos);
  }
  if ((next === 69 || next === 101) && !octal) { // 'eE'
    next = this.input.charCodeAt(++this.pos);
    if (next === 43 || next === 45) { ++this.pos; } // '+-'
    if (this.readInt(10) === null) { this.raise(start, "Invalid number"); }
  }
  if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }

  var val = stringToNumber(this.input.slice(start, this.pos), octal);
  return this.finishToken(types$1.num, val)
};

// Read a string value, interpreting backslash-escapes.

pp.readCodePoint = function() {
  var ch = this.input.charCodeAt(this.pos), code;

  if (ch === 123) { // '{'
    if (this.options.ecmaVersion < 6) { this.unexpected(); }
    var codePos = ++this.pos;
    code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
    ++this.pos;
    if (code > 0x10FFFF) { this.invalidStringToken(codePos, "Code point out of bounds"); }
  } else {
    code = this.readHexChar(4);
  }
  return code
};

pp.readString = function(quote) {
  var out = "", chunkStart = ++this.pos;
  for (;;) {
    if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated string constant"); }
    var ch = this.input.charCodeAt(this.pos);
    if (ch === quote) { break }
    if (ch === 92) { // '\'
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(false);
      chunkStart = this.pos;
    } else if (ch === 0x2028 || ch === 0x2029) {
      if (this.options.ecmaVersion < 10) { this.raise(this.start, "Unterminated string constant"); }
      ++this.pos;
      if (this.options.locations) {
        this.curLine++;
        this.lineStart = this.pos;
      }
    } else {
      if (isNewLine(ch)) { this.raise(this.start, "Unterminated string constant"); }
      ++this.pos;
    }
  }
  out += this.input.slice(chunkStart, this.pos++);
  return this.finishToken(types$1.string, out)
};

// Reads template string tokens.

var INVALID_TEMPLATE_ESCAPE_ERROR = {};

pp.tryReadTemplateToken = function() {
  this.inTemplateElement = true;
  try {
    this.readTmplToken();
  } catch (err) {
    if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
      this.readInvalidTemplateToken();
    } else {
      throw err
    }
  }

  this.inTemplateElement = false;
};

pp.invalidStringToken = function(position, message) {
  if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
    throw INVALID_TEMPLATE_ESCAPE_ERROR
  } else {
    this.raise(position, message);
  }
};

pp.readTmplToken = function() {
  var out = "", chunkStart = this.pos;
  for (;;) {
    if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated template"); }
    var ch = this.input.charCodeAt(this.pos);
    if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) { // '`', '${'
      if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
        if (ch === 36) {
          this.pos += 2;
          return this.finishToken(types$1.dollarBraceL)
        } else {
          ++this.pos;
          return this.finishToken(types$1.backQuote)
        }
      }
      out += this.input.slice(chunkStart, this.pos);
      return this.finishToken(types$1.template, out)
    }
    if (ch === 92) { // '\'
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(true);
      chunkStart = this.pos;
    } else if (isNewLine(ch)) {
      out += this.input.slice(chunkStart, this.pos);
      ++this.pos;
      switch (ch) {
      case 13:
        if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; }
      case 10:
        out += "\n";
        break
      default:
        out += String.fromCharCode(ch);
        break
      }
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }
      chunkStart = this.pos;
    } else {
      ++this.pos;
    }
  }
};

// Reads a template token to search for the end, without validating any escape sequences
pp.readInvalidTemplateToken = function() {
  for (; this.pos < this.input.length; this.pos++) {
    switch (this.input[this.pos]) {
    case "\\":
      ++this.pos;
      break

    case "$":
      if (this.input[this.pos + 1] !== "{") { break }
      // fall through
    case "`":
      return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos))

    case "\r":
      if (this.input[this.pos + 1] === "\n") { ++this.pos; }
      // fall through
    case "\n": case "\u2028": case "\u2029":
      ++this.curLine;
      this.lineStart = this.pos + 1;
      break
    }
  }
  this.raise(this.start, "Unterminated template");
};

// Used to read escaped characters

pp.readEscapedChar = function(inTemplate) {
  var ch = this.input.charCodeAt(++this.pos);
  ++this.pos;
  switch (ch) {
  case 110: return "\n" // 'n' -> '\n'
  case 114: return "\r" // 'r' -> '\r'
  case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
  case 117: return codePointToString(this.readCodePoint()) // 'u'
  case 116: return "\t" // 't' -> '\t'
  case 98: return "\b" // 'b' -> '\b'
  case 118: return "\u000b" // 'v' -> '\u000b'
  case 102: return "\f" // 'f' -> '\f'
  case 13: if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; } // '\r\n'
  case 10: // ' \n'
    if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
    return ""
  case 56:
  case 57:
    if (this.strict) {
      this.invalidStringToken(
        this.pos - 1,
        "Invalid escape sequence"
      );
    }
    if (inTemplate) {
      var codePos = this.pos - 1;

      this.invalidStringToken(
        codePos,
        "Invalid escape sequence in template string"
      );
    }
  default:
    if (ch >= 48 && ch <= 55) {
      var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
      var octal = parseInt(octalStr, 8);
      if (octal > 255) {
        octalStr = octalStr.slice(0, -1);
        octal = parseInt(octalStr, 8);
      }
      this.pos += octalStr.length - 1;
      ch = this.input.charCodeAt(this.pos);
      if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
        this.invalidStringToken(
          this.pos - 1 - octalStr.length,
          inTemplate
            ? "Octal literal in template string"
            : "Octal literal in strict mode"
        );
      }
      return String.fromCharCode(octal)
    }
    if (isNewLine(ch)) {
      // Unicode new line characters after \ get removed from output in both
      // template literals and strings
      if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
      return ""
    }
    return String.fromCharCode(ch)
  }
};

// Used to read character escape sequences ('\x', '\u', '\U').

pp.readHexChar = function(len) {
  var codePos = this.pos;
  var n = this.readInt(16, len);
  if (n === null) { this.invalidStringToken(codePos, "Bad character escape sequence"); }
  return n
};

// Read an identifier, and return it as a string. Sets `this.containsEsc`
// to whether the word contained a '\u' escape.
//
// Incrementally adds only escaped chars, adding other chunks as-is
// as a micro-optimization.

pp.readWord1 = function() {
  this.containsEsc = false;
  var word = "", first = true, chunkStart = this.pos;
  var astral = this.options.ecmaVersion >= 6;
  while (this.pos < this.input.length) {
    var ch = this.fullCharCodeAtPos();
    if (isIdentifierChar(ch, astral)) {
      this.pos += ch <= 0xffff ? 1 : 2;
    } else if (ch === 92) { // "\"
      this.containsEsc = true;
      word += this.input.slice(chunkStart, this.pos);
      var escStart = this.pos;
      if (this.input.charCodeAt(++this.pos) !== 117) // "u"
        { this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX"); }
      ++this.pos;
      var esc = this.readCodePoint();
      if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
        { this.invalidStringToken(escStart, "Invalid Unicode escape"); }
      word += codePointToString(esc);
      chunkStart = this.pos;
    } else {
      break
    }
    first = false;
  }
  return word + this.input.slice(chunkStart, this.pos)
};

// Read an identifier or keyword token. Will check for reserved
// words when necessary.

pp.readWord = function() {
  var word = this.readWord1();
  var type = types$1.name;
  if (this.keywords.test(word)) {
    type = keywords[word];
  }
  return this.finishToken(type, word)
};

// Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
// various contributors and released under an MIT license.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/acornjs/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/acornjs/acorn/issues


var version$1 = "8.15.0";

Parser.acorn = {
  Parser: Parser,
  version: version$1,
  defaultOptions: defaultOptions,
  Position: Position,
  SourceLocation: SourceLocation,
  getLineInfo: getLineInfo,
  Node: Node,
  TokenType: TokenType,
  tokTypes: types$1,
  keywordTypes: keywords,
  TokContext: TokContext,
  tokContexts: types,
  isIdentifierChar: isIdentifierChar,
  isIdentifierStart: isIdentifierStart,
  Token: Token,
  isNewLine: isNewLine,
  lineBreak: lineBreak,
  lineBreakG: lineBreakG,
  nonASCIIwhitespace: nonASCIIwhitespace
};

// The main exported interface (under `self.acorn` when in the
// browser) is a `parse` function that takes a code string and returns
// an abstract syntax tree as specified by the [ESTree spec][estree].
//
// [estree]: https://github.com/estree/estree

function parse$1(input, options) {
  return Parser.parse(input, options)
}

/**
 * SomMark Evaluator APIs
 * 
 * Provides built-in utility methods safely bound to the sandbox VM.
 */

// Host-defined compile that will be injected securely
let hostCompile = null;

function registerHostCompile(fn) {
    hostCompile = fn;
}

// Host-defined settings that will be injected securely
let hostSettings = {};

function registerHostSettings(settings) {
    hostSettings = settings || {};
}

const version = "5.1.0";

const SomMark$1 = {
    version,
    
    get settings() {
        return hostSettings;
    },
    
    // Secure recursive compile implementation
    compile: async (src, options = {}) => {
        if (!hostCompile) {
            throw new Error("Compilation capability is not initialized.");
        }
        return hostCompile(src, options);
    },

    // Wrap string as safe raw HTML to skip automatic escaping
    raw: (html) => {
        return { __raw: String(html) };
    },

    // Register custom tag handlers programmatically within sandboxed environments
    register: (id, render, options = {}) => {
        throw new Error("SomMark.register can only be invoked within the sandboxed template logic environment.");
    },

    // Retrieve active tags by ID
    get: (id) => {
        throw new Error("SomMark.get can only be invoked within the sandboxed template logic environment.");
    },

    // Remove registered output handlers
    removeOutput: (id) => {
        throw new Error("SomMark.removeOutput can only be invoked within the sandboxed template logic environment.");
    },

    // Check if tag IDs are registered
    includesId: (ids) => {
        throw new Error("SomMark.includesId can only be invoked within the sandboxed template logic environment.");
    },

    // Programmatic HTML/XML tag generation utility
    tag: (tagName) => {
        throw new Error("SomMark.tag can only be invoked within the sandboxed template logic environment.");
    }
};

// Freeze the entire Standard Library to make it completely immutable and tamper-proof
Object.freeze(SomMark$1);

// Set by index.js (Node.js) or index.browser.js (shim) — never imported directly.
let evaluatorStorage = null;

function setDefaultAsyncLocalStorage$1(cls) {
    evaluatorStorage = cls ? new cls() : null;
}

/**
 * Runs fn inside an isolated evaluator context.
 * Concurrent transpile() calls each get their own stack — no cross-contamination.
 */
function withEvaluator(fn) {
    if (!evaluatorStorage) return fn();
    return evaluatorStorage.run([], fn);
}

// Global tracker to ensure deep recursive Smark compilation never exceeds safe boundaries
let globalCompilationDepth = 0;

async function prefetchImports(code, baseDir, fsImpl) {
    if (!fsImpl?.readFile) return;
    let ast;
    try { ast = parse$1(code, { ecmaVersion: "latest", sourceType: "module" }); }
    catch { return; }

    for (const node of ast.body) {
        if (node.type !== "ImportDeclaration") continue;
        const importPath = node.source.value;
        const resolved = /^https?:\/\//.test(baseDir)
            ? new URL(importPath, baseDir.endsWith("/") ? baseDir : baseDir + "/").href
            : posix.resolve(baseDir, importPath);

        if (fsImpl.existsSync(resolved)) continue; // already cached

        try {
            const content = await fsImpl.readFile(resolved);
            if (resolved.endsWith(".js")) {
                const nextBase = /^https?:\/\//.test(resolved)
                    ? resolved.slice(0, resolved.lastIndexOf("/") + 1)
                    : posix.dirname(resolved);
                await prefetchImports(content, nextBase, fsImpl);
            }
        } catch { /* let QuickJS surface the error */ }
    }
}

let compilerClass = null;

function setCompilerClass(cls) {
    compilerClass = cls;
}

// Pure, top-level stateless adapters to avoid circular references and closures over EvaluatorState
const customFetchAdapter = async (input, init, security = {}) => {
    const allowFetch = security?.allowFetch !== false;
    if (!allowFetch) {
        throw new Error("Fetch Error: fetch is disabled in this environment.");
    }

    const url = input.toString();
    try {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol.toLowerCase();
        const hostname = parsedUrl.hostname.toLowerCase();

        // 1. Enforce HTTPS (HTTP Blocked by default unless allowHttp is true)
        const allowHttp = security?.allowHttp === true;
        if (protocol === "http:" && !allowHttp) {
            throw new Error("Fetch Security Error: HTTP requests are disabled. Use HTTPS instead.");
        }
        if (protocol !== "http:" && protocol !== "https:") {
            throw new Error(`Fetch Security Error: Unsupported protocol '${protocol}'. Only HTTP/HTTPS is allowed.`);
        }

        // 2. SSRF Protection: Block localhost, loopbacks, link-local, and RFC 1918 private network IP ranges
        const isLocal = hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "0.0.0.0" ||
            hostname === "[::1]" ||
            hostname === "::" ||
            hostname.startsWith("127.") ||
            hostname.startsWith("10.") ||
            hostname.startsWith("192.168.") ||
            hostname.startsWith("169.254.") ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

        if (isLocal) {
            throw new Error("SSRF Protection: Requests to local or private IP addresses are forbidden.");
        }

        // 3. Whitelisted Origins Check
        const allowedOrigins = security?.allowedOrigins;
        if (allowedOrigins && allowedOrigins.length > 0) {
            const origin = parsedUrl.origin.toLowerCase();
            const isOriginAllowed = allowedOrigins.some(allowed => {
                try {
                    const allowedUrl = new URL(allowed);
                    return origin === allowedUrl.origin.toLowerCase();
                } catch {
                    return hostname === allowed.toLowerCase() || hostname.endsWith("." + allowed.toLowerCase());
                }
            });
            if (!isOriginAllowed) {
                throw new Error(`Fetch Security Error: Origin '${origin}' is not whitelisted.`);
            }
        }

        // 4. Whitelisted Extensions Check
        const allowedExtensions = security?.allowedExtensions;
        if (allowedExtensions && allowedExtensions.length > 0) {
            const ext = posix.extname(parsedUrl.pathname).toLowerCase();
            if (!allowedExtensions.includes(ext)) {
                throw new Error(`Fetch Security Error: Extension '${ext || "(none)"}' is not whitelisted.`);
            }
        }
    } catch (e) {
        throw new Error(e.message.startsWith("Fetch Security Error:") || e.message.startsWith("SSRF Protection:")
            ? e.message
            : "Fetch Security Error: " + e.message);
    }

    const res = await fetch(url, init);
    const bodyText = await res.text();

    const headers = {};
    res.headers.forEach((val, key) => {
        headers[key.toLowerCase()] = val;
    });

    return {
        status: res.status,
        ok: res.ok,
        statusText: res.statusText,
        url: res.url,
        type: res.type,
        redirected: res.redirected,
        bodyText,
        headers
    };
};

const customCompileAdapter = async (src, options, parentSecurity = {}) => {
    const maxDepth = parentSecurity?.maxDepth ?? 5;
    if (globalCompilationDepth >= maxDepth) {
        throw new Error(`Recursion Guard: Maximum Smark compilation depth exceeded (limit is ${maxDepth}).`);
    }

    globalCompilationDepth++;
    try {
        const cleanOptions = JSON.parse(JSON.stringify(options || {}));
        if (!compilerClass) {
            throw new Error("Compiler class is not registered in the evaluator.");
        }
        const compilerOptions = {
            ...cleanOptions,
            src,
            format: cleanOptions.format || "html",
            security: parentSecurity
        };
        const sm = new compilerClass(compilerOptions);
        return await sm.transpile();
    } finally {
        globalCompilationDepth--;
    }
};

// Register statically once at module loading
registerHostCompile(customCompileAdapter);

let defaultFs$1 = null;
let defaultEnv = null;
let quickJSInstance = null;
async function getQuickJSModule() {
    if (!quickJSInstance) {
        quickJSInstance = await getQuickJS();
    }
    return quickJSInstance;
}

function objectToHandle(context, obj) {
    if (obj === undefined) {
        return context.undefined;
    }
    const jsonStr = JSON.stringify(obj);
    const stringHandle = context.newString(jsonStr);
    const jsonHandle = context.getProp(context.global, "JSON");
    const parseHandle = context.getProp(jsonHandle, "parse");
    const result = context.callFunction(parseHandle, jsonHandle, stringHandle);
    stringHandle.dispose();
    parseHandle.dispose();
    jsonHandle.dispose();
    return result.unwrap();
}

function isPlainData(value, seen = new Set()) {
    if (value === null || value === undefined) return true;
    if (typeof value === "function") return false;
    if (typeof value !== "object") return true;
    if (seen.has(value)) return false;
    seen.add(value);
    if (Array.isArray(value)) return value.every(v => isPlainData(v, seen));
    return Object.values(value).every(v => isPlainData(v, seen));
}

function expose(context, vars, pendingDeferreds) {
    for (const [key, value] of Object.entries(vars)) {
        let handle;
        if (typeof value === "function") {
            handle = context.newFunction(key, (...args) => {
                try {
                    const jsArgs = args.map(arg => context.dump(arg));
                    const res = value(...jsArgs);
                    if (res instanceof Promise || (res && typeof res === "object" && typeof res.then === "function")) {
                        const deferred = context.newPromise();
                        if (pendingDeferreds) {
                            pendingDeferreds.add(deferred);
                        }
                        res.then(
                            (resolvedVal) => {
                                try {
                                    if (!context.alive) return;
                                    if (resolvedVal === undefined) {
                                        deferred.resolve();
                                    } else {
                                        const valHandle = objectToHandle(context, resolvedVal);
                                        deferred.resolve(valHandle);
                                        valHandle.dispose();
                                    }
                                } catch (e) {
                                    if (context.alive) {
                                        const errHandle = context.newError(e.message || String(e));
                                        deferred.reject(errHandle);
                                        errHandle.dispose();
                                    }
                                } finally {
                                    if (pendingDeferreds) {
                                        pendingDeferreds.delete(deferred);
                                    }
                                    if (context.alive) {
                                        deferred.dispose();
                                    }
                                }
                            },
                            (rejectedErr) => {
                                try {
                                    if (!context.alive) return;
                                    const errHandle = context.newError(rejectedErr.message || String(rejectedErr));
                                    deferred.reject(errHandle);
                                    errHandle.dispose();
                                } catch (e) {
                                    // ignore
                                } finally {
                                    if (pendingDeferreds) {
                                        pendingDeferreds.delete(deferred);
                                    }
                                    if (context.alive) {
                                        deferred.dispose();
                                    }
                                }
                            }
                        );
                        return deferred.handle.dup();
                    } else if (res === undefined) {
                        return;
                    } else {
                        return objectToHandle(context, res);
                    }
                } catch (err) {
                    throw context.newError(err.message || String(err));
                }
            });
        } else {
            handle = objectToHandle(context, value);
        }
        context.setProp(context.global, key, handle);
        handle.dispose();
    }
}

class EvaluatorState {
    constructor() {
        this.runtime = null;
        this.context = null;
        this.baseDir = "/";
        this.scopes = [{}];
        this.dynamicTagsStack = [new Map()];
        this.deadline = 0;
        this.pendingDeferreds = new Set();
    }

    async init(baseDir = null, security = {}, settings = {}, mapperFile = null) {
        if (baseDir) {
            this.baseDir = baseDir;
        } else if (settings?.instance?.cwd) {
            this.baseDir = settings.instance.cwd;
        } else {
            this.baseDir = "/";
        }
        this.scopes = [{}];
        this.dynamicTagsStack = [new Map()];
        this.security = security;
        this.settings = settings;
        this.mapperFile = mapperFile;
        registerHostSettings(settings);

        this.nodeFs = defaultFs$1;

        if (this.context) {
            this.expose({
                __allowRaw: this.security.allowRaw !== false
            });
            return;
        }

        const QuickJS = await getQuickJSModule();
        this.runtime = QuickJS.newRuntime();
        this.context = this.runtime.newContext();

        this.deadline = 0;
        this.runtime.setInterruptHandler(() => {
            return this.deadline > 0 && Date.now() > this.deadline;
        });

        this.expose({
            __hostEnv: (key) => {
                if (defaultEnv === null) {
                    throw new Error(
                        "[SomMark] SomMark.env() is not available in browser mode.\n" +
                        "Environment variables are a server-side concept.\n" +
                        "Read env values at build time and pass them as placeholders instead."
                    );
                }
                const allowlist = this.security?.env;
                if (!Array.isArray(allowlist) || !allowlist.includes(key)) return undefined;
                return defaultEnv[key] ?? undefined;
            },
            __hostSomMarkVersion: SomMark$1.version,
            __hostSomMarkSettings: () => {
                const clean = { ...SomMark$1.settings };
                delete clean.instance;
                delete clean.fs;
                return JSON.stringify(clean);
            }, 
            __hostCompile: async (src, options) => {
                return await customCompileAdapter(src, options, this.security);
            },
            __hostFetch: async (input, initStr) => {
                const init = initStr ? JSON.parse(initStr) : undefined;
                return await customFetchAdapter(input, init, this.security);
            },
            __hostRegisterDynamicTag: (id, options) => {
                this.registerDynamicTag(id, options);
            },
            __hostRemoveDynamicTag: (id) => {
                const activeMap = this.dynamicTagsStack[this.dynamicTagsStack.length - 1];
                activeMap.delete(id);
            },
            __hostGetTagInfo: (id) => {
                if (!this.mapperFile) return null;
                const target = this.mapperFile.get(id);
                if (!target) return null;
                return JSON.stringify({
                    options: target.options || {}
                });
            },
            __hostCallTagRender: async (id, payloadStr) => {
                if (!this.mapperFile) return "";
                const target = this.mapperFile.get(id);
                if (!target) return "";
                const payload = JSON.parse(payloadStr);
                return await target.render.call(this.mapperFile, payload);
            },
            __allowRaw: this.security.allowRaw !== false
        });

        // Setup standard library and namespace
        const setupRes = this.context.evalCode(`
            const __nativeFetch = globalThis.fetch;
            class TagBuilder {
                constructor(tagName) {
                    this.tagName = tagName;
                    this._children = "";
                    this._attr = [];
                    this._is_self_close = false;
                }
                attributes(obj) {
                    if (obj && typeof obj === "object") {
                        Object.entries(obj).forEach(([key, value]) => {
                            if (value === true) this._attr.push(key);
                            else if (value !== false && value !== null && value !== undefined) {
                                const esc = String(value)
                                    .replace(/&/g, "&amp;")
                                    .replace(/</g, "&lt;")
                                    .replace(/>/g, "&gt;")
                                    .replace(/"/g, "&quot;")
                                    .replace(/'/g, "&#39;");
                                this._attr.push(\`\${key}="\${esc}"\`);
                            }
                        });
                    }
                    return this;
                }
                body(nodes) {
                    if (nodes) {
                        this._children += (this._children ? " " : "") + nodes;
                    }
                    return this.builder();
                }
                selfClose() {
                    this._is_self_close = true;
                    return this.builder();
                }
                builder() {
                    const props = this._attr.length > 0 ? " " + this._attr.join(" ") : "";
                    if (this._is_self_close) {
                        return \`<\${this.tagName}\${props} />\`;
                    }
                    return \`<\${this.tagName}\${props}>\${this._children}</\${this.tagName}>\`;
                }
            }

            const SomMark = {
                version: __hostSomMarkVersion,
                __dynamicTags: new Map(),
                register: function(id, render, options = {}) {
                    if (typeof id !== "string") {
                        throw new Error("SomMark.register Error: Tag ID must be a string.");
                    }
                    if (typeof render !== "function") {
                        throw new Error("SomMark.register Error: Render function must be a function.");
                    }
                    this.__dynamicTags.set(id, { render, options });
                    __hostRegisterDynamicTag(id, options);
                },
                get: function(id) {
                    if (typeof id !== "string") {
                        throw new Error("SomMark.get Error: Tag ID must be a string.");
                    }
                    const local = this.__dynamicTags.get(id);
                    if (local) {
                        return {
                            options: local.options || {},
                            render: local.render
                        };
                    }
                    const hostInfoStr = __hostGetTagInfo(id);
                    if (hostInfoStr) {
                        const hostInfo = JSON.parse(hostInfoStr);
                        return {
                            options: hostInfo.options || {},
                            render: async function(payload) {
                                return await __hostCallTagRender(id, JSON.stringify(payload));
                            }
                        };
                    }
                    return null;
                },
                removeOutput: function(id) {
                    if (typeof id !== "string") {
                        throw new Error("SomMark.removeOutput Error: Tag ID must be a string.");
                    }
                    this.__dynamicTags.delete(id);
                    __hostRemoveDynamicTag(id);
                },
                includesId: function(ids) {
                    if (!Array.isArray(ids)) {
                        throw new Error("SomMark.includesId Error: Expected an array of IDs.");
                    }
                    if (ids.some(id => this.__dynamicTags.has(id))) {
                        return true;
                    }
                    return ids.some(id => __hostGetTagInfo(id) !== null);
                },
                tag: function(tagName) {
                    if (typeof tagName !== "string") {
                        throw new Error("SomMark.tag Error: Tag name must be a string.");
                    }
                    return new TagBuilder(tagName);
                },
                get settings() {
                    const parsed = JSON.parse(__hostSomMarkSettings() || "{}");
                    Object.defineProperty(parsed, "__raw", {
                        value: JSON.stringify(parsed),
                        enumerable: false,
                        writable: false,
                        configurable: false
                    });
                    return Object.freeze(parsed);
                },
                fetch: async (input, init) => {
                    const plainRes = await __hostFetch(input.toString(), init ? JSON.stringify(init) : "");
                    return {
                        status: plainRes.status,
                        ok: plainRes.ok,
                        statusText: plainRes.statusText,
                        url: plainRes.url,
                        type: plainRes.type,
                        redirected: plainRes.redirected,
                        headers: {
                            get: (name) => plainRes.headers[name.toLowerCase()] || null,
                            forEach: (cb) => {
                                Object.keys(plainRes.headers).forEach(key => cb(plainRes.headers[key], key));
                            }
                        },
                        text: async () => plainRes.bodyText,
                        json: async () => JSON.parse(plainRes.bodyText),
                        clone: function() { return { ...this }; }
                    };
                },
                compile: async (src, options) => {
                    if (src === null || src === undefined) {
                        throw new Error("SomMark.compile Error: Template source cannot be null or undefined.");
                    }
                    if (typeof src === "function") {
                        throw new Error("SomMark.compile Error: Cannot pass a function as the template source. Did you forget to invoke/call it?");
                    }
                    if (src instanceof Promise || (typeof src === "object" && typeof src.then === "function")) {
                        throw new Error("SomMark.compile Error: Cannot pass a Promise as the template source. Did you forget to use 'await'?");
                    }
                    if (typeof src !== "string") {
                        throw new Error("SomMark.compile Error: Template source must be a string.");
                    }
                    return await __hostCompile(src, options);
                },
                raw: (html) => {
                    if (typeof __allowRaw !== "undefined" && !__allowRaw) {
                        throw new Error("Security Error: SomMark.raw is disabled in this environment.");
                    }
                    if (html === null || html === undefined) {
                        return { __raw: "" };
                    }
                    if (typeof html === "function") {
                        throw new Error("SomMark.raw Error: Cannot pass a function directly to SomMark.raw. Did you forget to invoke/call it?");
                    }
                    if (html instanceof Promise || (typeof html === "object" && typeof html.then === "function")) {
                        throw new Error("SomMark.raw Error: Cannot pass a Promise directly to SomMark.raw. Did you forget to use 'await'?");
                    }
                    if (typeof html === "object" && !html.__raw) {
                        throw new Error("SomMark.raw Error: Cannot render an object directly.");
                    }
                    return { __raw: String(html.__raw !== undefined ? html.__raw : html) };
                },
                static: (expr) => {
                    if (typeof expr !== "string") {
                        throw new Error("SomMark.static Error: Argument must be a string.");
                    }
                    return globalThis.eval(expr);
                },
                env: (key) => {
                    if (typeof key !== "string" || !key) {
                        throw new Error("SomMark.env Error: Key must be a non-empty string.");
                    }
                    return __hostEnv(key);
                }
            };

            Object.freeze(SomMark);

            Object.defineProperty(globalThis, "SomMark", {
                value: SomMark,
                writable: false,
                configurable: false
            });

            delete globalThis.fetch;
            delete globalThis.process;
        `);

        if (setupRes.error) {
            const err = this.context.dump(setupRes.error);
            setupRes.error.dispose();
            throw new Error("VM initialization failed: " + JSON.stringify(err));
        }
        setupRes.value.dispose();

        // Configure module loader using virtual FS implementation.
        // The normalizer resolves every import to an absolute path so the module
        // cache key is always absolute — <smark> (the eval module name) can never
        // be reached by any user import regardless of what the file is named.
        this.runtime.setModuleLoader((moduleName) => {
            try {
                const isRaw = moduleName.endsWith("?raw");
                const cleanModuleName = isRaw ? moduleName.slice(0, -4) : moduleName;
                // moduleName is already an absolute path (supplied by the normalizer below),
                // so resolve() is a no-op for absolute paths and a safe fallback for URLs.
                const resolvedPath = /^https?:\/\//.test(cleanModuleName)
                    ? cleanModuleName
                    : posix.resolve(this.baseDir, cleanModuleName);

                const fsImpl = this.settings?.fs || this.settings?.instance?.fs || this.nodeFs;
                if (!fsImpl) {
                    throw new Error("No filesystem implementation available.");
                }

                if (fsImpl.existsSync(resolvedPath)) {
                    let source = fsImpl.readFileSync(resolvedPath, "utf8");

                    if (isRaw) {
                        const escapedSource = source.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\${/g, "\\${");
                        return `export default \`${escapedSource}\`;`;
                    }

                    if (resolvedPath.endsWith(".json")) {
                        source = `export default ${source};`;
                    }

                    if (resolvedPath.endsWith(".smark")) {
                        const escapedSource = source.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\${/g, "\\${");
                        source = `
                            export default async (variables = {}) => {
                                return await SomMark.compile(\`${escapedSource}\`, { variables });
                            };
                        `;
                    }

                    return source;
                }
                throw new Error(`Module not found: ${moduleName}`);
            } catch (err) {
                throw err;
            }
        }, (baseName, moduleName) => {
            // Resolve every import to an absolute path so no user import can ever
            // normalize to <smark> (or any other virtual eval module name).
            const isRaw = moduleName.endsWith("?raw");
            const clean = isRaw ? moduleName.slice(0, -4) : moduleName;
            if (/^https?:\/\//.test(clean)) return moduleName;
            const baseDir = (baseName === "<smark>" || !posix.isAbsolute(baseName))
                ? this.baseDir
                : (/^https?:\/\//.test(baseName) ? baseName : posix.dirname(baseName));
            let resolved;
            if (/^https?:\/\//.test(baseDir)) {
                resolved = new URL(clean, baseDir).href;
            } else {
                resolved = posix.resolve(baseDir, clean);
            }
            return isRaw ? resolved + "?raw" : resolved;
        });
    }

    expose(vars) {
        if (!this.context) return;
        expose(this.context, vars, this.pendingDeferreds);
    }

    pushScope() {
        this.scopes.push({});
        this.dynamicTagsStack.push(new Map());
    }

    async popScope() {
        if (this.scopes.length > 1) {
            const popped = this.scopes.pop();
            this.dynamicTagsStack.pop();
            const keysToDelete = Object.keys(popped);
            if (keysToDelete.length > 0 && this.context) {
                try {
                    const deleteCode = keysToDelete.map(k => `delete globalThis['${k}'];`).join(" ");
                    const deleteRes = this.context.evalCode(deleteCode, "cleanup.js");
                    if (deleteRes.value) deleteRes.value.dispose();
                    if (deleteRes.error) deleteRes.error.dispose();
                } catch (e) {
                    // ignore
                }
            }
            if (this.context) {
                const merged = {};
                for (const scope of this.scopes) {
                    Object.assign(merged, scope);
                }
                this.expose(merged);
            }
        }
    }

    hasDynamicTag(id) {
        for (let i = this.dynamicTagsStack.length - 1; i >= 0; i--) {
            if (this.dynamicTagsStack[i].has(id)) return true;
        }
        return false;
    }

    getDynamicTagOptions(id) {
        for (let i = this.dynamicTagsStack.length - 1; i >= 0; i--) {
            const entry = this.dynamicTagsStack[i].get(id);
            if (entry) return entry.options;
        }
        return {};
    }

    registerDynamicTag(id, options = {}) {
        const activeMap = this.dynamicTagsStack[this.dynamicTagsStack.length - 1];
        activeMap.set(id, { options });
    }

    async executeDynamicTag(id, payload) {
        if (!this.context) throw new Error("EvaluatorState not initialized");
        this.expose({
            __activeTagPayload: () => JSON.stringify(payload)
        });
        const code = `
            (() => {
                const payload = JSON.parse(__activeTagPayload());
                const tag = SomMark.__dynamicTags.get(${JSON.stringify(id)});
                if (!tag) throw new Error("Tag not found inside VM: " + ${JSON.stringify(id)});
                const res = tag.render({
                    props: payload.props,
                    content: payload.content,
                    textContent: payload.textContent,
                    isSelfClosing: payload.isSelfClosing
                });
                return res;
            })()
        `;
        const evalRes = this.context.evalCode(code, "render_tag.js");
        if (evalRes.error) {
            const err = this.context.dump(evalRes.error);
            evalRes.error.dispose();
            throw err;
        }

        let resultHandle = evalRes.unwrap();
        const state = this.context.getPromiseState(resultHandle);
        if (state && state.type === "pending") {
            while (true) {
                this.runtime.executePendingJobs();
                const curState = this.context.getPromiseState(resultHandle);
                if (curState.type !== "pending") {
                    if (curState.type === "fulfilled") {
                        resultHandle.dispose();
                        resultHandle = curState.value;
                    } else {
                        const errHandle = curState.error;
                        const err = this.context.dump(errHandle);
                        errHandle.dispose();
                        resultHandle.dispose();
                        throw err;
                    }
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        const result = this.context.dump(resultHandle);
        resultHandle.dispose();
        return result;
    }

    _syncScopes() {
        if (!this.context) return;
        const allKeysSet = new Set();
        for (const scope of this.scopes) {
            for (const key of Object.keys(scope)) {
                allKeysSet.add(key);
            }
        }
        const allKeys = Array.from(allKeysSet);
        if (allKeys.length > 0) {
            try {
                const getValuesCode = `export default { ${allKeys.map(k => `${JSON.stringify(k)}: globalThis['${k}']`).join(", ")} };`;
                const valuesRes = this.context.evalCode(getValuesCode, "sync.js", { type: 'module' });
                if (valuesRes.value) {
                    const syncedValuesObj = this.context.dump(valuesRes.value);
                    valuesRes.value.dispose();
                    if (syncedValuesObj && typeof syncedValuesObj === 'object' && 'default' in syncedValuesObj) {
                        const syncedValues = syncedValuesObj.default;
                        for (const [key, val] of Object.entries(syncedValues)) {
                            for (let s = this.scopes.length - 1; s >= 0; s--) {
                                if (key in this.scopes[s]) {
                                    this.scopes[s][key] = val;
                                    break;
                                }
                            }
                        }
                    }
                } else if (valuesRes.error) {
                    valuesRes.error.dispose();
                }
            } catch (err) {
                // ignore
            }
        }
    }

    inject(vars) {
        if (!this.context) return;
        const safe = {};
        for (const [key, value] of Object.entries(vars)) {
            if (!isPlainData(value)) {
                console.warn(`[SomMark] Security: "${key}" contains functions and was blocked. Only plain data can be injected. Use SomMark built-ins for host capabilities.`);
                continue;
            }
            safe[key] = value;
        }
        const currentScope = this.scopes[this.scopes.length - 1];
        Object.assign(currentScope, safe);
        this.expose(safe);
    }

    async execute(code, baseDir = null) {
        if (!this.context) throw new Error("Evaluator not initialized");
        const prevBaseDir = this.baseDir;
        if (baseDir) this.baseDir = baseDir;

        const timeout = this.security?.timeout ?? 5000;
        this.deadline = Date.now() + timeout;

        const interval = setInterval(() => {
            try {
                this.runtime.executePendingJobs();
            } catch (err) {
                // ignore
            }
        }, 1);

        try {
            let autoExportedNames = [];
            let hasExplicitExports = false;
            try {
                const ast = parse$1(code, { ecmaVersion: 'latest', sourceType: 'module', allowReturnOutsideFunction: true });
                for (const node of ast.body) {
                    if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration' || node.type === 'ExportAllDeclaration') {
                        hasExplicitExports = true;
                    }
                    if (node.type === 'VariableDeclaration') {
                        for (const decl of node.declarations) {
                            if (decl.id.type === 'Identifier') autoExportedNames.push(decl.id.name);
                            else if (decl.id.type === 'ObjectPattern') {
                                for (const prop of decl.id.properties) {
                                    if (prop.value.type === 'Identifier') autoExportedNames.push(prop.value.name);
                                }
                            }
                        }
                    } else if (node.type === 'FunctionDeclaration') {
                        if (node.id) autoExportedNames.push(node.id.name);
                    } else if (node.type === 'ImportDeclaration') {
                        for (const spec of node.specifiers) {
                            autoExportedNames.push(spec.local.name);
                        }
                    }
                }
            } catch (e) {
                // Ignore parsing errors for simple expression fragments
            }

            const hasImportExport = hasExplicitExports || /\bimport\b/.test(code);
            const hasAwait = /\bawait\b/.test(code);

            let finalCode = code;

            try {
                const ast = parse$1(code, { ecmaVersion: 'latest', sourceType: 'module', allowReturnOutsideFunction: true });
                const lastNode = ast.body[ast.body.length - 1];
                if (lastNode && lastNode.type === 'ExpressionStatement') {
                    const start = lastNode.start;
                    finalCode = code.slice(0, start) + "export default " + code.slice(start);
                } else if (lastNode && lastNode.type === 'ReturnStatement') {
                    const start = lastNode.start;
                    if (lastNode.argument) {
                        const argumentCode = code.slice(lastNode.argument.start, lastNode.argument.end);
                        finalCode = code.slice(0, start) + `export default (${argumentCode});` + code.slice(lastNode.end);
                    } else {
                        finalCode = code.slice(0, start) + "export default undefined;" + code.slice(lastNode.end);
                    }
                }
            } catch (err) {
                // Ignore parsing errors and fallback to raw code
            }

            if (autoExportedNames.length > 0 && !hasExplicitExports) {
                finalCode += `\nexport { ${autoExportedNames.join(', ')} };`;
            }

            const isModule = hasImportExport || hasAwait || autoExportedNames.length > 0 || finalCode.includes("export default");

            const fsImpl = this.settings?.fs || this.settings?.instance?.fs || this.nodeFs;
            if (isModule) await prefetchImports(finalCode, this.baseDir, fsImpl);

            let result;
            if (isModule) {
                const evalRes = this.context.evalCode(finalCode, "<smark>", { type: 'module' });
                if (evalRes.error) {
                    const err = this.context.dump(evalRes.error);
                    evalRes.error.dispose();
                    throw err;
                }

                let resultHandle = evalRes.unwrap();
                const state = this.context.getPromiseState(resultHandle);
                if (state && state.type === "pending") {
                    while (true) {
                        this.runtime.executePendingJobs();
                        const curState = this.context.getPromiseState(resultHandle);
                        if (curState.type !== "pending") {
                            if (curState.type === "fulfilled") {
                                resultHandle.dispose();
                                resultHandle = curState.value;
                            } else {
                                const errHandle = curState.error;
                                const err = this.context.dump(errHandle);
                                errHandle.dispose();
                                resultHandle.dispose();
                                throw err;
                            }
                            break;
                        }
                        await new Promise(resolve => setTimeout(resolve, 1));
                    }
                }

                let defaultHandle = this.context.getProp(resultHandle, "default");
                let resolvedDefaultHandle = defaultHandle;
                let isPromise = false;

                const defaultState = this.context.getPromiseState(defaultHandle);
                if (defaultState && !defaultState.notAPromise) {
                    isPromise = true;
                    if (defaultState.type === "pending") {
                        while (true) {
                            this.runtime.executePendingJobs();
                            const curState = this.context.getPromiseState(defaultHandle);
                            if (curState.type !== "pending") {
                                if (curState.type === "fulfilled") {
                                    resolvedDefaultHandle = curState.value;
                                } else {
                                    const errHandle = curState.error;
                                    const err = this.context.dump(errHandle);
                                    errHandle.dispose();
                                    defaultHandle.dispose();
                                    resultHandle.dispose();
                                    throw err;
                                }
                                break;
                            }
                            await new Promise(resolve => setTimeout(resolve, 1));
                        }
                    } else if (defaultState.type === "fulfilled") {
                        resolvedDefaultHandle = defaultState.value;
                    } else if (defaultState.type === "rejected") {
                        const errHandle = defaultState.error;
                        const err = this.context.dump(errHandle);
                        errHandle.dispose();
                        defaultHandle.dispose();
                        resultHandle.dispose();
                        throw err;
                    }
                }

                const defaultValue = this.context.dump(resolvedDefaultHandle);

                if (isPromise) {
                    resolvedDefaultHandle.dispose();
                }
                defaultHandle.dispose();

                const res = this.context.dump(resultHandle);

                this.context.setProp(this.context.global, "__tempModule", resultHandle);
                const copyRes = this.context.evalCode(`
                    for (const key of Object.keys(__tempModule)) {
                        if (key !== "default") {
                            globalThis[key] = __tempModule[key];
                        }
                    }
                    delete globalThis.__tempModule;
                `);
                if (copyRes.error) {
                    copyRes.error.dispose();
                } else {
                    copyRes.value.dispose();
                }
                resultHandle.dispose();

                if (res && typeof res === 'object') {
                    const currentScope = this.scopes[this.scopes.length - 1];
                    for (const [key, val] of Object.entries(res)) {
                        if (key !== 'default') {
                            currentScope[key] = val;
                        }
                    }
                    if ('default' in res) {
                        result = defaultValue;
                    } else {
                        result = undefined;
                    }
                } else {
                    result = res;
                }
            } else {
                const evalRes = this.context.evalCode(code, "<smark>");
                if (evalRes.error) {
                    const err = this.context.dump(evalRes.error);
                    evalRes.error.dispose();
                    throw err;
                }
                let resultHandle = evalRes.unwrap();
                const state = this.context.getPromiseState(resultHandle);
                if (state && state.type === "pending") {
                    while (true) {
                        this.runtime.executePendingJobs();
                        const curState = this.context.getPromiseState(resultHandle);
                        if (curState.type !== "pending") {
                            if (curState.type === "fulfilled") {
                                resultHandle.dispose();
                                resultHandle = curState.value;
                            } else {
                                const errHandle = curState.error;
                                const err = this.context.dump(errHandle);
                                errHandle.dispose();
                                resultHandle.dispose();
                                throw err;
                            }
                            break;
                        }
                        await new Promise(resolve => setTimeout(resolve, 1));
                    }
                }
                result = this.context.dump(resultHandle);
                resultHandle.dispose();
            }

            await this._syncScopes();
            return result;
        } catch (error) {
            const stack = error.stack || "";
            const match = stack.match(/__smark__\.js:(\d+):(\d+)/) || stack.match(/:(\d+):(\d+)/);

            const err = new Error(error.message || error);
            if (match) {
                err.line = parseInt(match[1]);
                err.column = parseInt(match[2]);
            }
            throw err;
        } finally {
            this.deadline = 0;
            clearInterval(interval);
            if (baseDir) this.baseDir = prevBaseDir;
        }
    }

    destroy() {
        if (this.runtime) {
            if (this.pendingDeferreds) {
                for (const deferred of this.pendingDeferreds) {
                    try {
                        if (deferred.alive) {
                            deferred.dispose();
                        }
                    } catch (e) {}
                }
                this.pendingDeferreds.clear();
            }

            try {
                this.runtime.executePendingJobs();
            } catch (e) {}

            try {
                if (this.context) {
                    this.context.dispose();
                }
                this.runtime.dispose();
            } catch (e) {
                console.warn(formatMessage("<$yellow:Warning:$> Safe context disposal warning: " + e.message));
            }
            this.runtime = null;
            this.context = null;
        }
    }
}

class Evaluator {
    constructor() {
        // Fallback stack for callers that use init() outside withEvaluator() (e.g. tests).
        this._fallbackStack = [];
    }

    _getStack() {
        return evaluatorStorage.getStore() ?? this._fallbackStack;
    }

    // Expose the active stack so tests can check .instances.length
    get instances() { return this._getStack(); }

    setDefaultFs(fs) {
        defaultFs$1 = fs;
    }

    setDefaultEnv(env) {
        defaultEnv = env;
    }

    setDefaultAsyncLocalStorage(cls) {
        setDefaultAsyncLocalStorage$1(cls);
    }

    get active() {
        const stack = this._getStack();
        if (stack.length === 0) {
            throw new Error("No active EvaluatorState instance. Did you call init()?");
        }
        return stack[stack.length - 1];
    }

    // Forward .runtime to the active state so tests can assert on it
    get runtime() { return this.active?.runtime ?? null; }

    async init(baseDir = null, security = {}, settings = {}, mapperFile = null) {
        const state = new EvaluatorState();
        await state.init(baseDir, security, settings, mapperFile);
        this._getStack().push(state);
    }

    destroy() {
        const stack = this._getStack();
        if (stack.length > 0) {
            stack.pop().destroy();
        }
    }

    pushScope() {
        this.active.pushScope();
    }

    async popScope() {
        await this.active.popScope();
    }

    inject(vars) {
        this.active.inject(vars);
    }

    async execute(code, baseDir = null) {
        return await this.active.execute(code, baseDir);
    }

    hasDynamicTag(id) {
        return this.active.hasDynamicTag(id);
    }

    getDynamicTagOptions(id) {
        return this.active.getDynamicTagOptions(id);
    }

    async executeDynamicTag(id, payload) {
        return await this.active.executeDynamicTag(id, payload);
    }
}

var Evaluator$1 = new Evaluator();

/**
 * Dedents a string by a given amount of characters.
 * 
 * @param {string} str - The string to dedent.
 * @param {number} amount - The number of characters to remove from the start of each line.
 * @returns {string} - The dedented string.
 */
function dedentBy(str, amount) {
	if (!str || amount <= 0) return str;
	const lines = str.split("\n");
	const dedentedLines = lines.map((line) => {
		let count = 0;
		while (count < amount && (line[count] === " " || line[count] === "\t")) {
			count++;
		}
		return line.slice(count);
	});
	return dedentedLines.join("\n");
}

let _nodeFsCache;
async function getNodeFs() {
	if (_nodeFsCache !== undefined) return _nodeFsCache;
	try {
		const m = await import('node:fs');
		const raw = m.default || m;
		_nodeFsCache = {
			exists: (p) => raw.promises.access(p).then(() => true).catch(() => false),
			readFile: (p, enc) => raw.promises.readFile(p, enc),
		};
	} catch {
		_nodeFsCache = null;
	}
	return _nodeFsCache;
}

/**
 * Preprocesses a runtime JS block, parsing it with Acorn to locate
 * SomMark.static("...") and SomMark.import("...") calls, evaluating/loading them,
 * and replacing them inline with LSP/runtime safety.
 * 
 * @param {string} code - The raw javascript runtime code.
 * @param {string|null} filename - Active template filename for relative imports.
 * @param {Object} security - Security restrictions from the engine configuration.
 * @returns {Promise<string>} - The preprocessed code.
 */
async function preprocessRuntimeLogic(code, filename = null, security = {}, instance = null) {
	let ast;
	try {
		ast = parse$1(code, { ecmaVersion: "latest", sourceType: "module" });
	} catch (err) {
		// Fallback: If code is not a fully valid JS block (e.g. an expression fragment),
		// let it pass through to the standard renderer untouched.
		return code;
	}

	const matches = [];

	// Recursive AST Traversal to find SomMark.static and SomMark.import calls
	function traverse(node) {
		if (!node || typeof node !== "object") return;

		if (
			node.type === "CallExpression" &&
			node.callee.type === "MemberExpression" &&
			node.callee.object.name === "SomMark" &&
			node.arguments.length > 0
		) {
			const propName = node.callee.property.name;
			if (propName === "static" || propName === "import") {
				matches.push(node);
			}
		}

		for (const key of Object.keys(node)) {
			const child = node[key];
			if (Array.isArray(child)) {
				for (const item of child) traverse(item);
			} else {
				traverse(child);
			}
		}
	}

	traverse(ast);

	let preprocessedCode = code;

	if (matches.length > 0) {
		// Sort matches right-to-left to prevent character offset drifting
		matches.sort((a, b) => b.start - a.start);

		// Execute/Import and replace inline
		for (const match of matches) {
			const propName = match.callee.property.name;
			const argNode = match.arguments[0];
			let argValue = "";

			if (argNode.type === "Literal") {
				argValue = String(argNode.value);
			} else if (argNode.type === "TemplateLiteral") {
				argValue = argNode.quasis.map((q) => q.value.cooked).join("");
			}

			if (propName === "static") {
				if (!argValue) {
					transpilerError([
						`<$red:SomMark.static Argument Error:$> The argument to SomMark.static must be a string.{line}`
					]);
				}

				// If the code contains a top-level return statement, wrap it in an async IIFE
				let finalStaticCode = argValue.trim();
					if (finalStaticCode.includes("return")) {
						finalStaticCode = `(async () => {\n${argValue}\n})()`;
					}

					// Run securely inside the active QuickJS VM sandbox
					let result;
					try {
						result = await Evaluator$1.execute(finalStaticCode);
					} catch (err) {
						transpilerError([
							`<$red:SomMark.static Execution Error:$> ${err.message}{line}`,
							`<$yellow:Static Code:$> <$blue:${argValue}$>{line}`
						]);
					}

					// Serialize the return value safely
					let serialized = "";
					if (result === undefined) {
						serialized = "undefined";
					} else if (typeof result === "object") {
						serialized = JSON.stringify(result);
					} else if (typeof result === "string") {
						serialized = JSON.stringify(result); // Automatically escapes quotes and special chars
					} else {
						serialized = String(result);
					}

					// Slice out SomMark.static(...) and splice in the serialized value
					preprocessedCode =
						preprocessedCode.slice(0, match.start) +
						serialized +
						preprocessedCode.slice(match.end);
			} else if (propName === "import") {
				if (!argValue) {
					transpilerError([
						`<$red:SomMark.import Argument Error:$> The argument to SomMark.import must be a static, non-empty string literal.{line}`
					]);
				}

				// Resolve the file path relative to the template's base directory
				let baseDir = instance?.cwd || "/";
				if (filename && filename !== "anonymous") {
					baseDir = posix.dirname(posix.resolve(filename));
				}

				// Block absolute paths — path.resolve would ignore baseDir entirely
				if (posix.isAbsolute(argValue)) {
					transpilerError([
						`<$red:Security Error:$> Absolute import paths are not allowed: <$magenta:${argValue}$>{line}`,
						`<$yellow:Use a path relative to the template file, e.g.$> <$green:SomMark.import("./data.json")$> <$yellow:or$> <$green:SomMark.import("../shared/data.json")$><$yellow:.$>{line}`,
						`<$yellow:Base directory:$> <$blue:${baseDir}$>{line}`
					]);
				}

				const resolvedPath = posix.resolve(baseDir, argValue);

				// Block path traversal — resolved path must stay inside baseDir
				const safeBases = baseDir.endsWith(posix.sep) ? baseDir : baseDir + posix.sep;
				if (!resolvedPath.startsWith(safeBases) && resolvedPath !== baseDir) {
					transpilerError([
						`<$red:Security Error:$> Import path escapes the project directory: <$magenta:${argValue}$>{line}`,
						`<$yellow:Resolved Path:$> <$blue:${resolvedPath}$>{line}`
					]);
				}

				const fsImpl = instance?.fs || await getNodeFs();

				// File presence validation
				if (!fsImpl || !await fsImpl.exists(resolvedPath)) {
					transpilerError([
						`<$red:SomMark.import File Error:$> File not found: <$magenta:${argValue}$>{line}`,
						`<$yellow:Resolved Path:$> <$blue:${resolvedPath}$>{line}`
					]);
				}

				// Security Extension restriction validation
				const ext = posix.extname(resolvedPath).toLowerCase();
				if (security?.allowedExtensions && !security.allowedExtensions.includes(ext)) {
					transpilerError([
						`<$red:Security Error:$> File extension <$yellow:${ext}$> is not allowed by security policy.{line}`,
						`<$yellow:Import path:$> <$blue:${argValue}$>{line}`
					]);
				}

				let serialized = "";
				const content = await fsImpl.readFile(resolvedPath, "utf-8");

				if (ext === ".json") {
					// Validate JSON structure
					let parsed;
					try {
						parsed = JSON.parse(content);
					} catch (err) {
						transpilerError([
							`<$red:JSON Parse Error:$> Failed to parse JSON file <$magenta:${argValue}$>:{line}`,
							`<$yellow:Error:$> ${err.message}{line}`
						]);
					}
					serialized = JSON.stringify(parsed);
				} else {
					// Fallback for plain text, .smark, and other extensions: Serialize as JSON-escaped string
					serialized = JSON.stringify(content);
				}

				// Slice out SomMark.import(...) and splice in the serialized content
				preprocessedCode =
					preprocessedCode.slice(0, match.start) +
					serialized +
					preprocessedCode.slice(match.end);
			}
		}
	}

	// LSP / Linter Safety Guard Injection
	// If the resulting code references the global SomMark keyword, prepend fallback declarations to prevent crashes.
	const hasSomMarkRef = /\bSomMark\b/.test(preprocessedCode);
	if (hasSomMarkRef) {
		const safetyGuard = `/* global SomMark */\nif (typeof globalThis.SomMark === 'undefined') { globalThis.SomMark = { static: (c) => c, import: (c) => c }; }\n`;
		preprocessedCode = safetyGuard + preprocessedCode;
	}

	return preprocessedCode;
}

/**
 * Wraps runtime JavaScript logic inside target-specific scoped structures.
 * 
 * @param {string} code - The preprocessed javascript code.
 * @param {string} format - The active compilation target format (e.g., 'html', 'mdx').
 * @param {string|null} parentId - The unique tracking identifier of the parent element.
 * @param {boolean} isGlobal - Whether the script is at the root level or block-level.
 * @returns {string} - The formatted, target-scoped runtime code.
 */
function wrapRuntimeLogic(code, format, parentId, isGlobal) {
	const trimmedCode = code
		.split("\n")
		.filter(line => line.trim() !== "")
		.join("\n");

	if (isGlobal || !parentId) {
		return `\n${trimmedCode}\n`;
	}

	const lowerFormat = format?.toLowerCase();
	if (lowerFormat === "html" || lowerFormat === "mdx") {
		const selfDefinition = `const self = document.querySelector('[data-sommark-id="${parentId}"]');`;
		return `\n(async function(){${selfDefinition}\nif (self) {\n${trimmedCode}\n}\n})();\n`;
	}

	// Fallback/Default for other formats: return the raw code untouched
	return `\n${trimmedCode}\n`;
}

function warnDroppedVariables(variables) {
	for (const [key, value] of Object.entries(variables)) {
		if (value === undefined) {
			console.warn(`[SomMark] variables.${key} is undefined and will be ignored.`);
		} else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
			for (const [nestedKey, nestedVal] of Object.entries(value)) {
				if (typeof nestedVal === "function") {
					console.warn(`[SomMark] variables.${key}.${nestedKey} is a function nested inside an object and will be ignored. Move it to the top level: variables.${nestedKey}`);
				} else if (nestedVal === undefined) {
					console.warn(`[SomMark] variables.${key}.${nestedKey} is undefined and will be ignored.`);
				}
			}
		}
	}
}

const randomBytesHex = (size) => {
	const arr = new Uint8Array(size);
	globalThis.crypto.getRandomValues(arr);
	return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
};

const BODY_PLACEHOLDER = `SOMMARKBODYPLACEHOLDER${randomBytesHex(8)}SOMMARK`;


/** 
 * Extracts all plain text from a node and its children.
 * 
 * @param {Object} node - The node to read.
 * @returns {string} - The extracted text.
 */
function getNodeText(node) {
	if (!node?.body) return "";
	let text = "";
	if (node.body) {
		for (const child of node.body) {
			if (child.type === TEXT$1) text += child.text || "";
			else if (child.type === BLOCK || child.type === FOR_EACH) text += getNodeText(child);
		}
	}
	return text;
}


/** 
 * Converts a code node into its final format (like HTML).
 * 
 * @param {Object|Object[]} ast - The node or list of nodes to convert.
 * @param {number} i - The current position in the list.
 * @param {string} format - The target format (e.g., 'html').
 * @param {Object} mapper_file - The rules for how to convert each node.
 * @returns {Promise<string>} - The final text for this node.
 */
async function generateOutput(ast, i, format, mapper_file, security = {}, parentId = null, generateRuntimeOutput = false, hideRuntimeOutput = false, instance = null, idState = null, extraCtx = {}) {
	const node = Array.isArray(ast) ? ast[i] : ast;
	if (!node) return "";

	let result = "";
	let context = "";
	let isParentBlock = false;

	if (node.id === mapper_file?.options?.moduleIdentityToken) {
		const oldFilename = mapper_file.options.filename;
		mapper_file.options.filename = node.props?.filename || oldFilename;
		let bodyOutput = "";
		if (node.body) {
			Evaluator$1.pushScope();
			for (let j = 0; j < node.body.length; j++) {
				bodyOutput += await generateOutput(node.body, j, format, mapper_file, security, parentId, generateRuntimeOutput, hideRuntimeOutput, instance, idState);
			}
			await Evaluator$1.popScope();
		}
		mapper_file.options.filename = oldFilename;
		return bodyOutput;
	}

	if (node.type === TEXT$1) {
		if (generateRuntimeOutput) return "";
		const text = String(node.text || "");
		return mapper_file ? mapper_file.text(text) : text;
	}

	if (node.type === COMMENT) {
		if (generateRuntimeOutput || mapper_file?.options?.removeComments) return "";
		return " ".repeat(node.depth) + `${mapper_file?.comment(node.text) || ""}`;
	}

	if (node.type === COMMENT_BLOCK) {
		if (generateRuntimeOutput || mapper_file?.options?.removeComments) return "";
		return " ".repeat(node.depth) + `${mapper_file?.commentBlock(node.text) || ""}`;
	}

	if (node.type === RUNTIME_LOGIC) {
		const preprocessed = await preprocessRuntimeLogic(node.code, mapper_file?.options?.filename, security, instance);
		if (hideRuntimeOutput) return "";
		if (generateRuntimeOutput) return wrapRuntimeLogic(preprocessed, format, parentId, node.depth === 1);
		return mapper_file ? mapper_file.runtimeLogic(preprocessed, node.depth === 1, parentId) : "";
	}

	if (node.type === STATIC_LOGIC) {
		try {
			const result = await Evaluator$1.execute(node.code, node.baseDir || null);
			if (generateRuntimeOutput) return "";
			if (result && typeof result === "object" && result.__raw !== undefined) {
				if (security?.allowRaw === false) {
					return mapper_file ? mapper_file.text(String(result.__raw)) : String(result.__raw);
				}
				const rawVal = String(result.__raw);
				return (security?.sanitize && typeof security.sanitize === "function") ? security.sanitize(rawVal) : rawVal;
			}
			// Hide objects (like module exports) from the final output
			const out = (result !== undefined && typeof result !== "object") ? String(result) : "";
			return mapper_file ? mapper_file.text(out) : out;
		} catch (err) {
			transpilerError([
				`<$red:Logic Error:$> ${err.message}{line}`,
				`<$yellow:Code:$> <$blue:${node.code}$>{line}`
			]);
		}
	}

	if (node.type === FOR_EACH) {
		const transpiledArgs = await transpileArgs(node.props);

		if (!node.props || (node.props[0] === undefined && node.props["items"] === undefined)) {
			const line = node.range?.start?.line + 1 || 1;
			transpilerError([
				`<$red:Missing Prop Error in [for-each]:$>{line}`,
				`[for-each] requires an array as its first prop, e.g. [for-each = \${ array }\$]{line}`,
				`at line <$yellow:${line}$>{line}`
			]);
			return "";
		}

		const items = mapper_file ? mapper_file.safeArg({ props: transpiledArgs, index: 0, key: "items", fallBack: [] }) : [];

		if (!Array.isArray(items)) {
			const line = node.range?.start?.line + 1 || 1;
			transpilerError([
				`<$red:Type Error in [for-each]:$>{line}`,
				`Expected an <$green:Array$> for 'items', but received <$yellow:${typeof items}$>:<$cyan: ${JSON.stringify(items)}$>{line}`,
				`at line <$yellow:${line}$>{line}`
			]);
			return "";
		}

		const asVar = transpiledArgs.as || "value";
		if (asVar === "i" || asVar === "length") {
			const line = node.range?.start?.line + 1 || 1;
			transpilerError([
				`<$red:Reserved Variable Error in [for-each]:$>{line}`,
				`'${asVar}' is a reserved variable name.{N}Use a different name for the 'as' prop, e.g. as: "item"{line}`,
				`at line <$yellow:${line}$>{line}`
			]);
			return "";
		}

		// Trim structural whitespace/newlines at start and end of loop body for formatting clean output
		let cleanedBody = [];
		if (node.body) {
			cleanedBody = [...node.body];

			// Trim ALL leading pure-whitespace Text nodes
			while (cleanedBody.length > 0 && cleanedBody[0].type === TEXT$1 && /^\s*$/.test(cleanedBody[0].text)) {
				cleanedBody.shift();
			}
			// If the now-first node is a Text node, trim its leading whitespace/newlines
			if (cleanedBody.length > 0 && cleanedBody[0].type === TEXT$1) {
				cleanedBody[0] = { ...cleanedBody[0], text: cleanedBody[0].text.replace(/^\s+/, "") };
			}

			// Trim ALL trailing pure-whitespace Text nodes
			while (cleanedBody.length > 0 && cleanedBody[cleanedBody.length - 1].type === TEXT$1 && /^\s*$/.test(cleanedBody[cleanedBody.length - 1].text)) {
				cleanedBody.pop();
			}
			// If the now-last node is a Text node, trim its trailing whitespace/newlines
			if (cleanedBody.length > 0 && cleanedBody[cleanedBody.length - 1].type === TEXT$1) {
				cleanedBody[cleanedBody.length - 1] = { ...cleanedBody[cleanedBody.length - 1], text: cleanedBody[cleanedBody.length - 1].text.replace(/\s+$/, "") };
			}
		}

		const rawJoin = transpiledArgs.join ?? null;
		const join = rawJoin !== null ? rawJoin.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\r/g, "\r") : null;
		const parts = [];
		let idx = 0;
		const length = items.length;
		for (const item of items) {
			Evaluator$1.pushScope();
			Evaluator$1.inject({
				[asVar]: item,
				i: idx++,
				length
			});

			let iterOutput = "";
			for (let j = 0; j < cleanedBody.length; j++) {
				iterOutput += await generateOutput(cleanedBody, j, format, mapper_file, security, parentId, generateRuntimeOutput, hideRuntimeOutput, instance, idState, extraCtx);
			}

			await Evaluator$1.popScope();
			parts.push(iterOutput);
		}
		return join !== null ? parts.join(join) : parts.join("");
	}

	let secretId = null;
	if (node.type === BLOCK) {
		if (node.props) {
			for (const key of Object.keys(node.props)) {
				if (key.toLowerCase().startsWith("data-sommark")) {
					transpilerError([
						`<$red:Reserved Attribute Error:$> The attribute name '<$yellow:${key}$>' is reserved for SomMark's internal runtime compiler logic.{line}`,
						`Please use a different attribute name.`
					]);
				}
			}
		}

		const hasRuntime = node.body?.some(child => child.type === RUNTIME_LOGIC);
		if (hasRuntime) {
			if (idState?.mode === 'replay') {
				secretId = idState.ids[idState.idx++] ?? `sommark-${node.id.toLowerCase()}-${randomBytesHex(4)}`;
			} else {
				secretId = `sommark-${node.id.toLowerCase()}-${randomBytesHex(4)}`;
				if (idState?.mode === 'record') idState.ids.push(secretId);
			}
		}
	}

	// smark-raw block — body collected verbatim by lexer, bypasses normal body processing pipeline
	if (node.type === BLOCK && (node.directives?.raw === "true" || node.directives?.raw === true)) {
		if (generateRuntimeOutput) return "";
		const rawContent = node.body?.map(n => String(n.text || "")).join("") || "";
		const transpiledArgs = await transpileArgs(node.props);
		if (Evaluator$1.active?.hasDynamicTag?.(node.id)) {
			return await Evaluator$1.active.executeDynamicTag(node.id, { props: transpiledArgs, directives: node.directives, content: rawContent, textContent: rawContent });
		}
		let rawTarget = mapper_file ? matchedValue(mapper_file.outputs, node.id) : null;
		if (!rawTarget && mapper_file) rawTarget = mapper_file.getUnknownTag(node);
		if (rawTarget) {
			const isManualMode = !!rawTarget.options?.handleAst;
			return await rawTarget.render.call(mapper_file, {
				props: transpiledArgs,
				directives: node.directives,
				content: rawContent,
				textContent: rawContent,
				ast: isManualMode ? node : undefined,
				isSelfClosing: node.isSelfClosing || false
			});
		}
		return rawContent;
	}

	let target = null;
	if (Evaluator$1.active && Evaluator$1.active.hasDynamicTag(node.id)) {
		target = {
			id: node.id,
			options: Evaluator$1.active.getDynamicTagOptions(node.id) || {},
			render: async function (payload) {
				return await Evaluator$1.active.executeDynamicTag(node.id, payload);
			}
		};
	} else {
		target = mapper_file ? matchedValue(mapper_file.outputs, node.id) : null;
		if (!target && mapper_file) {
			target = mapper_file.getUnknownTag(node);
		}
	}

	if (target) {
		const shouldResolveImmediate = target.options?.resolve === true;
		const textContent = getNodeText(node);

		let content = (node.body?.length === 0) ? "" : BODY_PLACEHOLDER;

		// 1. Determine if this is a parent block that needs newline wrapping (Trim-and-Wrap)
		// Priority: Target options > Mapper global options
		const effectiveTrimAndWrap = (target.options?.trimAndWrapBlocks !== undefined)
			? target.options.trimAndWrapBlocks
			: mapper_file?.options?.trimAndWrapBlocks;

		isParentBlock = !shouldResolveImmediate && effectiveTrimAndWrap &&
			(node.body?.length > 1 || (node.body?.length === 1 && textContent.trim().includes('\n')));

		if (isParentBlock) {
			content = `\n${BODY_PLACEHOLDER}\n`;
		}

		if (shouldResolveImmediate && node.body) {
			let resolvedBody = "";
			Evaluator$1.pushScope();
			for (let j = 0; j < node.body.length; j++) {
				resolvedBody += await generateOutput(node.body, j, format, mapper_file, security, parentId, generateRuntimeOutput, hideRuntimeOutput, instance, idState);
			}
			await Evaluator$1.popScope();
			content = dedentBy(resolvedBody, node.range?.start?.character || 0);
		}

		if (generateRuntimeOutput) {
			let childrenOutput = "";
			if (node.body) {
				for (let j = 0; j < node.body.length; j++) {
					childrenOutput += await generateOutput(node.body, j, format, mapper_file, security, secretId || parentId, generateRuntimeOutput, hideRuntimeOutput, instance, idState);
				}
			}
			return childrenOutput;
		}

		const isManualMode = target.options?.handleAst === true;

		if (isManualMode) {
			const cleanBody = [];
			let richText = "";

			Evaluator$1.pushScope();
			try {
				for (const child of (node.body || [])) {
					if (child.type === BLOCK || child.type === TEXT$1 || child.type === FOR_EACH) {
						cleanBody.push(child);
						if (child.type === TEXT$1) {
							richText += mapper_file ? mapper_file.text(String(child.text || ""), target.options) : String(child.text || "");
						}
					} else if (child.type === STATIC_LOGIC) {
						try {
							const val = await Evaluator$1.execute(child.code, child.baseDir || null);
							if (val !== undefined && typeof val !== "object") richText += String(val);
						} catch (err) {
							transpilerError([
								`<$red:Logic Error:$> ${err.message}{line}`,
								`<$yellow:Code:$> <$blue:${child.code}$>{line}`
							]);
						}
					} else if (child.type === COMMENT) {
						if (!mapper_file?.options?.removeComments) richText += mapper_file?.comment(child.text) || "";
					} else if (child.type === COMMENT_BLOCK) {
						if (!mapper_file?.options?.removeComments) richText += mapper_file?.commentBlock(child.text) || "";
					} else if (child.type === RUNTIME_LOGIC) {
						if (!hideRuntimeOutput) {
							const preprocessed = await preprocessRuntimeLogic(child.code, mapper_file?.options?.filename, security, instance);
							richText += mapper_file ? mapper_file.runtimeLogic(preprocessed, child.depth === 1, secretId || parentId) : "";
						}
					}
					// FOR_EACH → silently ignored
				}

				const cleanAst = { ...node, body: cleanBody };
				const transpiledArgs = await transpileArgs(node.props);
				if (secretId) transpiledArgs["data-sommark-id"] = secretId;

				const renderChild = async (childNode, extra = {}) => {
					return await generateOutput(childNode, 0, format, mapper_file, security, secretId || parentId, generateRuntimeOutput, hideRuntimeOutput, instance, idState, extra);
				};

				return await target.render.call(mapper_file, {
					props: transpiledArgs,
					directives: node.directives,
					content: "",
					textContent: richText || textContent,
					ast: cleanAst,
					isSelfClosing: node.isSelfClosing || false,
					...extraCtx,
					renderChild
				}) ?? "";
			} finally {
				await Evaluator$1.popScope();
			}
		}

		const transpiledArgs = await transpileArgs(node.props);
		if (secretId) {
			transpiledArgs["data-sommark-id"] = secretId;
		}
		result += await target.render.call(mapper_file, {
			props: transpiledArgs,
			directives: node.directives,
			content,
			textContent,
			ast: new Proxy({}, {
				get(target, prop) {
					if (prop === "then" || prop === "toJSON" || typeof prop === "symbol" || prop === "constructor" || prop === "inspect" || prop === "valueOf" || prop === "toString") {
						return undefined;
					}
					transpilerError([
						`<$red:Access Error:$> Attempted to access '<$yellow:ast.${String(prop)}$>', but '<$yellow:ast$>' is undefined because '<$cyan:handleAst$>' is false or not specified in this tag's registration options.{N}{N}`,
						`Please set '<$green:handleAst: true$>' in the options object of your tag registration to get the actual AST node.`
					]);
				}
			}),
			isSelfClosing: node.isSelfClosing || false,
			...extraCtx
		});
		// if (isParentBlock) result = "\n" + result;

		if (shouldResolveImmediate) {
			return result;
		}

		if (!isManualMode && node.body) {
			let prev_was_silent = false;
			const parentEscape = (security?.allowRaw === false) ? true : (target.options?.escape !== false);
			Evaluator$1.pushScope();
			for (let j = 0; j < node.body.length; j++) {
				const body_node = node.body[j];
				let bodyOutput = "";

				switch (body_node.type) {
					case TEXT$1:
						const text = String(body_node.text || "");
						// Only dedent multi-line text — inline spaces (no newlines) are separators, not indentation
						const localDedentedText = text.includes("\n") ? dedentBy(text, node.range?.start?.character || 0) : text;
						let bodyTextVal = mapper_file ? mapper_file.text(localDedentedText, { ...target?.options, escape: parentEscape }) : localDedentedText;
						if (parentEscape === false && security?.sanitize && typeof security.sanitize === "function") {
							bodyTextVal = security.sanitize(bodyTextVal);
						}
						bodyOutput = bodyTextVal;
						break;

					case COMMENT:
						if (mapper_file?.options?.removeComments) break;
						bodyOutput = " ".repeat(body_node.depth) + `${mapper_file.comment(body_node.text)}`;
						break;

					case COMMENT_BLOCK:
						if (mapper_file?.options?.removeComments) break;
						bodyOutput = " ".repeat(body_node.depth) + `${mapper_file.commentBlock(body_node.text)}`;
						break;

					case FOR_EACH:
					case BLOCK:
						bodyOutput = await generateOutput(body_node, 0, format, mapper_file, security, secretId || parentId, generateRuntimeOutput, hideRuntimeOutput, instance, idState);
						break;

					case RUNTIME_LOGIC:
						const preprocessedBody = await preprocessRuntimeLogic(body_node.code, mapper_file?.options?.filename, security, instance);
						if (hideRuntimeOutput) {
							bodyOutput = "";
						} else {
							bodyOutput = mapper_file ? mapper_file.runtimeLogic(preprocessedBody, body_node.depth === 1, secretId || parentId) : "";
						}
						break;

					case STATIC_LOGIC:
						try {
							const result = await Evaluator$1.execute(body_node.code, body_node.baseDir || null);
							if (result && typeof result === "object" && result.__raw !== undefined) {
								if (security?.allowRaw === false) {
									bodyOutput = mapper_file ? mapper_file.text(String(result.__raw)) : String(result.__raw);
								} else {
									const rawVal = String(result.__raw);
									bodyOutput = (security?.sanitize && typeof security.sanitize === "function") ? security.sanitize(rawVal) : rawVal;
								}
							} else {
								const out = (result !== undefined && typeof result !== "object") ? String(result) : "";
								bodyOutput = mapper_file ? mapper_file.text(out, { ...target?.options, escape: parentEscape }) : out;
							}
						} catch (err) {
							transpilerError([
								`<$red:Logic Error:$> ${err.message}{line}`,
								`<$yellow:Code:$> <$blue:${body_node.code}$>{line}`
							]);
						}
						break;
				}

				if (prev_was_silent && body_node.type === TEXT$1) {
					bodyOutput = bodyOutput.replace(/^\n/, "");
				}

				if (bodyOutput) {
					context += bodyOutput;
					prev_was_silent = false;
				} else {
					prev_was_silent = true;
				}
			}
			await Evaluator$1.popScope();
		}

		const finalContext = effectiveTrimAndWrap ? context.replace(/^\s*[\r\n]+|[\r\n]+\s*$/g, "") : context;

		if (result.includes(BODY_PLACEHOLDER)) {
			if (finalContext === "") {
				result = result
					.replaceAll(`\n${BODY_PLACEHOLDER}\n`, "")
					.replaceAll(`\r\n${BODY_PLACEHOLDER}\r\n`, "")
					.replaceAll(BODY_PLACEHOLDER, "");
			} else {
				result = result.replaceAll(BODY_PLACEHOLDER, finalContext);
			}
		} else {
			if (result.toLowerCase().includes(BODY_PLACEHOLDER.toLowerCase())) {
				transpilerError([
					`{line}<$red:Placeholder Corruption Error:$> Attempted to modify the '<$yellow:content$>' placeholder under '<$cyan:resolve: false$>' mode in tag '<$blue:${node.id}$>'.{line}`,
					`This corrupts SomMark's internal compilation tokens and is not allowed.{line}`,
					`If you need to read or alter the literal inner text, please use '<$green:textContent$>' instead.{line}`
				]);
			}
			if (finalContext.trim()) {
				result += finalContext;
			}
		}
	} else {
		transpilerError([
			"{line}<$red:Invalid Identifier:$> ",
			`<$yellow:Identifier$> <$blue:'${node.id}'$> <$yellow: is not found in mapping outputs$>{line}`
		]);
	}

	return result;
}

/** 
 * The main entry point for the SomMark Transpiler.
 * It takes an AST and turns it into the final formatted output.
 * 
 * @param {Object|Object[]} optionsOrAst - Either the full options object or just the AST.
 * @param {string} [format] - The target format.
 * @param {Object} [mapperFile] - The mapper rules to use.
 * @returns {Promise<string>} - The final formatted document.
 */
async function transpiler(optionsOrAst, format, mapperFile) {
	let body = null;
	let targetFormat = format;
	let targetMapper = mapperFile;
	const security = (optionsOrAst && optionsOrAst.security) ? optionsOrAst.security : {};

	if (typeof optionsOrAst === "object" && !Array.isArray(optionsOrAst) && (optionsOrAst.ast || Array.isArray(optionsOrAst))) {
		if (optionsOrAst.ast) {
			const root = optionsOrAst.ast;
			body = Array.isArray(root) ? root : (root.body || [root]);
			targetFormat = optionsOrAst.format;
			targetMapper = optionsOrAst.mapperFile;
		} else if (Array.isArray(optionsOrAst)) {
			body = optionsOrAst;
		}
	} else if (Array.isArray(optionsOrAst)) {
		body = optionsOrAst;
	}

	if (!body || !Array.isArray(body)) return "";

	const settings = optionsOrAst?.settings || { format: targetFormat || "html" };
	const instance = optionsOrAst?.instance;
	if (instance) {
		settings.instance = instance;
		settings.fs = instance.fs;
	}

	const fileBaseDir = (() => {
		const filename = instance?.filename;
		const cwd = instance?.cwd || "/";
		if (!filename || filename === "anonymous") return cwd;
		const abs = /^(\/|[a-zA-Z]:\\|https?:\/\/)/.test(filename) ? filename : posix.resolve(cwd, filename);
		return posix.dirname(abs);
	})();

	const dualOutput = optionsOrAst?.dualOutput || false;
	const placeholders = optionsOrAst?.placeholders || settings?.placeholders || {};
	const variables = optionsOrAst?.variables || settings?.variables || {};
	warnDroppedVariables(variables);

	return withEvaluator(async () => {
		// Initialize Logic Sandbox inside isolated async context
		await Evaluator$1.init(fileBaseDir, security, settings, targetMapper);
		Evaluator$1.inject(placeholders);
		Evaluator$1.inject(variables);

		let output = "";
		let prev_body_node = null;
		let prev_was_silent = false;

		if (dualOutput) {
			const idState = { mode: 'record', ids: [], idx: 0 };

			// HTML pass — generate HTML, record element IDs for runtime blocks
			let htmlOutput = "";
			try {
				for (let i = 0; i < body.length; i++) {
					const node = body[i];
					const blockOutput = await generateOutput(body, i, targetFormat, targetMapper, security, null, false, true, instance, idState);
					let finalBlockOutput = blockOutput;
					if (prev_was_silent && node.type === TEXT$1) finalBlockOutput = finalBlockOutput.replace(/^\n/, "");
					if (finalBlockOutput) {
						htmlOutput += finalBlockOutput;
						prev_was_silent = false;
					} else {
						prev_was_silent = true;
						if ((node.type === COMMENT || node.type === COMMENT_BLOCK) && targetMapper?.options?.removeComments) {
							const nextNode = body[i + 1];
							if (nextNode && nextNode.type === TEXT$1 && (nextNode.text === "\n" || nextNode.text === "\r\n")) i++;
						}
					}
				}
			} finally {
				Evaluator$1.destroy();
			}

			// JS pass — replay the same IDs so querySelector targets match HTML
			idState.mode = 'replay';
			idState.idx = 0;
			prev_was_silent = false;

			await Evaluator$1.init(fileBaseDir, security, settings, targetMapper);
			Evaluator$1.inject(placeholders);
			Evaluator$1.inject(variables);

			let jsOutput = "";
			try {
				for (let i = 0; i < body.length; i++) {
					const node = body[i];
					const blockOutput = await generateOutput(body, i, targetFormat, targetMapper, security, null, true, false, instance, idState);
					let finalBlockOutput = blockOutput;
					if (prev_was_silent && node.type === TEXT$1) finalBlockOutput = finalBlockOutput.replace(/^\n/, "");
					if (finalBlockOutput) {
						jsOutput += finalBlockOutput;
						prev_was_silent = false;
					} else {
						prev_was_silent = true;
					}
				}
			} finally {
				Evaluator$1.destroy();
			}

			return [htmlOutput.trim(), jsOutput.trim()];
		}

		try {
			for (let i = 0; i < body.length; i++) {
				const node = body[i];
				const blockOutput = await generateOutput(body, i, targetFormat, targetMapper, security, null, false, false, instance);

				let finalBlockOutput = blockOutput;
				if (prev_was_silent && node.type === TEXT$1) {
					finalBlockOutput = finalBlockOutput.replace(/^\n/, "");
				}

				if (finalBlockOutput) {
					output += finalBlockOutput;
					prev_was_silent = false;
					if (node.type !== TEXT$1 || node.text.trim().length > 0) {
						prev_body_node = node;
					}
				} else {
					prev_was_silent = true;
					if ((node.type === COMMENT || node.type === COMMENT_BLOCK) && targetMapper?.options?.removeComments) {
						const nextNode = body[i + 1];
						if (nextNode && nextNode.type === TEXT$1 && (nextNode.text === "\n" || nextNode.text === "\r\n")) {
							i++;
						}
					}
				}
			}
		} finally {
			Evaluator$1.destroy();
		}

		return output.trim();
	});
}

/**
 * Transpiles block arguments, resolving logic or variables.
 */
async function transpileArgs(props) {
	const result = {};
	if (!props) return result;

	for (const [key, value] of Object.entries(props)) {
		if (key.toLowerCase().startsWith("data-sommark") && key.toLowerCase() !== "data-sommark-id") {
			transpilerError([
				`<$red:Reserved Attribute Error:$> The attribute name '<$yellow:${key}$>' is reserved for SomMark's internal runtime compiler logic.{line}`,
				`Please use a different attribute name.`
			]);
		}
		if (value && typeof value === "object") {
			if (value.type === RUNTIME_LOGIC) {
				// Discard runtime logic for security
				result[key] = "";
			} else if (value.type === STATIC_LOGIC) {
				try {
					result[key] = await Evaluator$1.execute(value.code, value.baseDir || null);
				} catch (err) {
					transpilerError([
						`<$red:Logic Error (Argument):$> ${err.message}{line}`,
						`<$yellow:Code:$> <$blue:${value.code}$>{line}`
					]);
				}
			} else {
				result[key] = value;
			}
		} else {
			result[key] = value;
		}
	}
	return result;
}

/**
 * Makes a string safe to display in HTML by replacing special characters.
 * This helps prevent security issues and formatting errors.
 * 
 * @param {string} str - The raw string to escape.
 * @returns {string} - The HTML-safe string.
 */
function escapeHTML(str) {
        return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
}

/**
 * Changes CamelCase or PascalCase names into kebab-case.
 * 
 * @param {string} str - The string to convert.
 * @returns {string} - The kebab-cased string.
 */
const kebabize = str => str.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);

const HTML_PROPS = new Set([
	// Global Attributes
	"id",
	"class",
	"className",
	"title",
	"lang",
	"dir",
	"tabindex",
	"hidden",
	"accesskey",
	"draggable",
	"spellcheck",
	"contenteditable",
	"role",
	"style",
	"slot",
	"autofocus",
	"translate",
	"enterkeyhint",
	"inputmode",

	// Common Element-Specific
	"href",
	"src",
	"alt",
	"type",
	"name",
	"value",
	"placeholder",
	"target",
	"rel",
	"width",
	"height",
	"loading",
	"decoding",
	"crossorigin",
	"charset",
	"content",
	"action",
	"method",
	"enctype",
	"autocomplete",
	"required",
	"readonly",
	"disabled",
	"multiple",
	"pattern",
	"min",
	"max",
	"step",
	"checked",
	"selected",
	"rows",
	"cols",
	"wrap",
	"for",
	"media",
	"async",
	"defer",
	"poster",
	"controls",
	"autoplay",
	"loop",
	"muted",
	"preload",
	"sandbox",
	"allow",
	"allowfullscreen",
	"anchor",
	"autocapitalize",
	"autocorrect",
	"capture",
	"download",
	"exportparts",
	"form",
	"formaction",
	"formenctype",
	"formmethod",
	"formnovalidate",
	"formtarget",
	"inert",
	"integrity",
	"is",
	"itemid",
	"itemprop",
	"itemref",
	"itemscope",
	"itemtype",
	"list",
	"maxlength",
	"minlength",
	"nonce",
	"part",
	"playsinline",
	"popover",
	"referrerpolicy",
	"sizes",
	"srcset",
	"virtualkeyboardpolicy",

	// Links & navigation
	"hreflang",
	"ping",
	"accept-charset",

	// Forms
	"accept",
	"novalidate",
	"dirname",

	// Tables
	"colspan",
	"rowspan",
	"scope",
	"headers",
	"span",

	// Lists
	"reversed",
	"start",

	// Interactive / structural
	"open",
	"size",
	"cite",
	"datetime",

	// Media & track
	"default",
	"kind",
	"label",
	"srcdoc",
	"srclang",

	// Images
	"ismap",
	"usemap",

	// Resource hints
	"as",
	"fetchpriority",

	// Meta
	"http-equiv",

	// Meter
	"high",
	"low",
	"optimum",

	// Deprecated (still valid)
	"coords",
	"shape",
	"summary",

	// Experimental
	"elementtiming",
	"colorspace",
	"csp",
]);

const VOID_ELEMENTS = new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"source",
	"track",
	"wbr",
	"param",
	"circle",
	"ellipse",
	"line",
	"path",
	"polygon",
	"polyline",
	"rect",
	"stop",
	"use",
	"image"
]);

/**
 * TagBuilder - A builder pattern utility for programmatic HTML/XML tag generation.
 * Handles attributes, body content, and self-closing tags with high-fidelity escaping.
 */
class TagBuilder {
	#children;
	#attr;
	#is_self_close;

	/**
	 * Creates a new TagBuilder instance.
	 * @param {string} tagName - The name of the tag (e.g., 'div', 'span').
	 */
	constructor(tagName) {
		this.tagName = tagName;
		this.#children = "";
		this.#attr = [];
		this.#is_self_close = false;
	}

	/**
	 * Adds attributes to the tag.
	 * @param {Object} obj - Key-value pair of attributes.
	 * @param {boolean} [strict=false] - If true, boolean true values render as key="true".
	 * @param {...string} arr - Optional list of boolean attributes (e.g., 'disabled', 'required').
	 * @returns {TagBuilder} - Returns this instance for chaining.
	 */
	attributes(obj, strict = false, ...arr) {
		if (obj && obj instanceof Object) {
			Object.entries(obj).forEach(([key, value]) => {
				if (!isNaN(parseInt(key))) return; // Skip numeric positional arguments
				if (value === true) {
					this.#attr.push(strict ? `${key}="true"` : `${key}`);
				} else if (value !== false) {
					let val = value ?? "";
					if (key === "style" && typeof val === "string") {
						// V4 DYNAMIC CSS: Automatically wrap CSS variables in var()
						val = val.replace(/(^|[^\w\-_$])(--[\w\-_$]+)(?![\w\-_$]|:)/g, "$1var($2)");
					}
					this.#attr.push(`${key}="${escapeHTML(val)}"`);
				}
			});
		}
		if (arr && Array.isArray(arr)) {
			arr.forEach(key => {
				this.#attr.push(`${key}`);
			});
		}
		return this;
	}

	/**
	 * Adds attributes with project-certified smart handling (kebabization, styling fallback).
	 * Implements the V4 "Smart Styling Fallback" strategy.
	 * 
	 * @param {Object} args - Key-value pair of Smark arguments/attributes.
	 * @param {Set<string>} [customProps=new Set()] - Set of project-certified custom properties.
	 * @param {Object} [options={}] - Configuration flags (e.g., skipSmartHandling).
	 * @returns {TagBuilder} - Returns this instance for chaining.
	 */
	smartAttributes(args, customProps = new Set(), options = {}) {
		if (!args || typeof args !== "object") return this;

		const id = this.tagName.toLowerCase();
		const isCodeStyleOrScript = ["style", "script"].includes(id);
		let inline_style = "";

		// 1. Initial style processing
		if (!isCodeStyleOrScript && args.style) {
			if (typeof args.style === "object") {
				inline_style = Object.entries(args.style)
					.map(([k, v]) => `${kebabize(k)}:${v}`)
					.join(";") + (Object.keys(args.style).length > 0 ? ";" : "");
			} else if (typeof args.style === "string") {
				inline_style = args.style.endsWith(";") ? args.style : args.style + ";";
			} else {
				inline_style = String(args.style) + ";";
			}
		}

		// 2. Attribute dispatching
		const keys = Object.keys(args).filter(arg => isNaN(parseInt(arg)));
		keys.forEach(key => {
			if (key === "style") return;
			if (isCodeStyleOrScript && key === "scoped") return;

			const isDimensionAttributeSupported = ["img", "video", "svg", "canvas", "iframe", "object", "embed"].includes(id);
			const isWidthOrHeight = key === "width" || key === "height";
			const isEvent = key.toLowerCase().startsWith("on");
			const isNative = HTML_PROPS.has(key);
			const isCustom = customProps.has(key) || customProps.has(kebabize(key));
			const isDataOrAria = kebabize(key).startsWith("data-") || kebabize(key).startsWith("aria-");

			const k = isEvent ? key.toLowerCase() : (isNative || isCustom) ? key : kebabize(key);
			const val = typeof args[key] === "object" ? JSON.stringify(args[key]) : args[key];

			if (isCodeStyleOrScript || options.fallbackTarget === false) {
				// Specialized tags or fallback disabled: render as standard attributes
				this.#attr.push(`${k}="${escapeHTML(String(val))}"`);
			} else {
				if (isEvent || ((isNative || isCustom) && (!isWidthOrHeight || isDimensionAttributeSupported)) || isDataOrAria) {
					this.#attr.push(`${k}="${escapeHTML(String(val))}"`);
				} else {
					// Unknown attribute: fall through to inline style
					inline_style += `${k}:${val};`;
				}
			}
		});

		if (inline_style) {
			// Wrap CSS variables in var()
			const processedStyle = inline_style.replace(/(^|[^\w\-_$])(--[\w\-_$]+)(?![\w\-_$]|:)/g, "$1var($2)");
			this.#attr.push(`style="${escapeHTML(processedStyle)}"`);
		}

		return this;
	}

	/**
	 * Converts SomMark arguments into JSX props and applies them to the tag.
	 * Implements smart handling for className, style objects, and automated JSX expression wrapping.
	 * 
	 * @param {Object} args - The list of arguments.
	 * @returns {TagBuilder} - Returns this instance for chaining.
	 */
	jsxProps(args) {
		if (!args || typeof args !== "object") return this;

		const jsxProps = [];
		const styleObj = {};

		const keys = Object.keys(args).filter(arg => isNaN(parseInt(arg)));
		keys.forEach(key => {
			let val = args[key];

			let k = key;
			if (k === "class") k = "className";

			// Strip quotes from string literals if they were passed raw
			if (typeof val === "string" && ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))) {
				val = val.slice(1, -1);
			}

			if (k === "style") {
				// Convert CSS strings to React-style objects
				if (typeof val === "string") {
					const pairs = val.includes(";") ? val.split(";") : val.split(",");
					pairs.forEach(pair => {
						let [prop, value] = pair.split(":").map(s => s.trim());
						if (prop && value) {
							const camelProp = prop.replace(/-([a-z])/g, g => g[1].toUpperCase());
							styleObj[camelProp] = value;
						}
					});
				} else if (typeof val === "object") {
					Object.assign(styleObj, val);
				}
			} else {
				// Detect if it should be wrapped in {} (JSX Expression)
				const isObject = typeof val === "object" && val !== null;
				const isBoolean = typeof val === "boolean" || val === "true" || val === "false";
				const isNumeric = typeof val === "number" || (typeof val === "string" && val !== "" && !isNaN(val));
				const isWrappedInBraces = typeof val === "string" && val.startsWith("{") && val.endsWith("}");

				const shouldBeJSXExpression = isObject || isBoolean || isNumeric || isWrappedInBraces;

				let finalVal = val;
				if (val === "true") finalVal = true;
				if (val === "false") finalVal = false;
				if (typeof val === "string" && isNumeric) finalVal = Number(val);

				if (isWrappedInBraces) {
					// Strip outer braces: {theme} -> theme
					finalVal = val.slice(1, -1);
				} else if (isObject) {
					// Clean JS string for JSX: { a: 1 } instead of {"a":1}
					finalVal = JSON.stringify(val).replace(/"([^"]+)":/g, "$1:");
				}

				jsxProps.push({
					__type__: shouldBeJSXExpression ? "other" : "string",
					[k]: finalVal
				});
			}
		});

		if (Object.keys(styleObj).length > 0) {
			const styleStr = JSON.stringify(styleObj).replace(/"([^"]+)":/g, "$1:");
			jsxProps.push({ __type__: "other", style: styleStr });
		}

		// Use the legacy props helper to apply the generated list
		this.props(jsxProps);
		return this;
	}

	/**
	 * Internal helper to apply MDX-style property entries.
	 * Note: This method no longer returns 'this' and is removed from the chain.
	 * Use .jsxProps(args) instead.
	 * 
	 * @param {Object|Array} propsList - The property entries to add.
	 */
	props(propsList) {
		const list = Array.isArray(propsList) ? propsList : [propsList];
		if (list.length > 0) {
			for (const propEntry of list) {
				if (typeof propEntry !== "object" || propEntry === null || !Object.prototype.hasOwnProperty.call(propEntry, "__type__")) {
					continue;
				}

				const { __type__, ...rest } = propEntry;
				const entries = Object.entries(rest);
				if (entries.length === 0) continue;

				const [key, value] = entries[0];
				switch (__type__) {
					case "string":
						this.#attr.push(`${key}="${escapeHTML(String(value))}"`);
						break;
					case "other":
						this.#attr.push(`${key}={${value}}`);
						break;
				}
			}
		}
	}

	/**
	 * Sets the body content of the tag. 
	 * Note: Calling this method finalizes the builder state by returning the generated string.
	 * @param {string|Array} nodes - The inner content of the tag.
	 * @returns {string} - The generated HTML string.
	 */
	body(nodes) {
		if (nodes) {
			let space = this.#children ? " " : "";
			this.#children += space + nodes;
		}
		return this.builder();
	}

	/**
	 * Marks the tag as self-closing (e.g., <img />).
	 * Note: Calling this method finalizes the builder state by returning the generated string.
	 * @returns {string} - The generated HTML string.
	 */
	selfClose() {
		this.#is_self_close = true;
		return this.builder();
	}

	/**
	 * Internal method to construct the final tag string.
	 * @private
	 * @returns {string} - The generated HTML string.
	 */
	builder() {
		const props = this.#attr.length > 0 ? " " + this.#attr.join(" ") : "";
		if (this.#is_self_close) {
			return `<${this.tagName}${props} />`;
		}
		return `<${this.tagName}${props}>${this.#children}</${this.tagName}>`;
	}
}

/**
 * MarkdownBuilder - A utility class for generating Markdown strings from structured data.
 * Used primarily by the Markdown mapper to produce formatted text.
 */
class MarkdownBuilder {
	constructor() { }

	/**
	 * Formats text as a Markdown heading.
	 * @param {string} text - The heading content.
	 * @param {number|string} [level=1] - The heading level (1-6).
	 * @returns {string} - Formatted heading string.
	 */
	heading(text, level) {
		if (!text && !level) {
			return "";
		}
		const min = 1,
			max = 6;
		if (typeof text === "string" && (typeof level === "number" || typeof level === "string")) {
			if (typeof level === "string") {
				level = Number(level);
			}
			if (level > max) {
				level = max;
			} else if (level < min) {
				level = min;
			}
			return `${"#".repeat(level)} ${text}`;
		}
		return text;
	}

	/**
	 * Formats a Markdown link or image.
	 * @param {string} [type=""] - The link type ("image" for '!', otherwise empty).
	 * @param {string} text - The display text or alt text.
	 * @param {string} [url=""] - The target URL.
	 * @param {string} [title=""] - Optional hover title.
	 * @returns {string} - Formatted Markdown link/image string.
	 */
	url(type = "", text, url = "", title = "") {
		if (!text && !url) {
			return "";
		}
		return `${type === "image" ? "!" : ""}[${text}](${url + (title ? " " : "")}${title ? JSON.stringify(title) : ""})`;
	}

	/**
	 * Formats text as bold.
	 * @param {string} text - The content to bold.
	 * @param {boolean} [is_underscore=false] - Use underscores ('__') instead of asterisks ('**').
	 * @returns {string} - Formatted bold string.
	 */
	bold(text, is_underscore = false) {
		if (!text) {
			return "";
		}
		const format = is_underscore ? "__" : "**";
		return `${format}${text}${format}`;
	}

	/**
	 * Formats text as italic (emphasis).
	 * @param {string} text - The content to italicize.
	 * @param {boolean} [is_underscore=false] - Use underscores ('_') instead of asterisks ('*').
	 * @returns {string} - Formatted italic string.
	 */
	italic(text, is_underscore = false) {
		if (!text) {
			return "";
		}
		const format = is_underscore ? "_" : "*";
		return `${format}${text}${format}`;
	}

	/**
	 * Formats text as bold-italic (strong emphasis).
	 * @param {string} text - The content to emphasize.
	 * @param {boolean} [is_underscore=false] - Use underscores ('___') instead of asterisks ('***').
	 * @returns {string} - Formatted emphasized string.
	 */
	emphasis(text, is_underscore = false) {
		if (!text) {
			return "";
		}
		const format = is_underscore ? "___" : "***";
		return `${format}${text}${format}`;
	}

	/**
	 * Formats text with strikethrough.
	 * @param {string} text - The content to strike.
	 * @returns {string} - Formatted strikethrough string.
	 */
	strike(text) {
		if (!text) {
			return "";
		}
		return `~~${text}~~`;
	}

	/**
	 * Formats source code as a Markdown fenced code block.
	 * @param {string|Array} code - The code content.
	 * @param {string} [language=""] - The language identifier for syntax highlighting.
	 * @returns {string} - Formatted code block string.
	 */
	codeBlock(code, language = "") {
		if (!code) return "";

		const normalizeContent = c => {
			if (Array.isArray(c)) return c.join("\n");
			if (typeof c === "string") return c;
			return "";
		};

		const content = normalizeContent(code);

		if (!content) return "";

		const lang = language ? language : "";
		return `\n\`\`\`${lang}\n${content.trim()}\n\`\`\``;
	}

	/**
	 * Formats a Markdown horizontal rule.
	 * @param {string} [format="*"] - The character to use for the rule.
	 * @returns {string} - Formatted horizontal rule string.
	 */
	horizontal(format = "*") {
		return `\n${format.repeat(3)}`;
	}

	/**
	 * Escapes special Markdown characters to prevent unintended formatting.
	 * @param {string} text - The text to escape.
	 * @returns {string} - Escaped text string.
	 */
	escape(text) {
		if (!text) return "";

		const special = /[\\*_{}\[\]()#+\-.!>|~`]/g;

		return text.replace(special, "\\$&");
	}

	/**
	 * Smartly escapes text to prevent unintended Markdown/HTML formatting
	 * while keeping "innocent" symbols clean (e.g., math, solo symbols).
	 * 
	 * @param {string} text - The raw text to escape.
	 * @returns {string} - The safely escaped text.
	 */
	smartEscaper(text) {
		if (!text) return "";

		// 1. Literal backslashes must stay literal
		let result = text.replace(/\\/g, "\\\\");

		// 2. HTML Tags: Detect <tag ... > or </tag>
		// We do this BEFORE escaping & to prevent &amp;lt;
		result = result.replace(/<([a-zA-Z\/][^>]*?)>/g, "&lt;$1&gt;");

		// 3. Basics: Escape ampersands and quotes
		// We use a lookahead to avoid double-escaping the '&' in '&lt;' and '&gt;' we just created
		result = result.replace(/&(?!lt;|gt;)/g, "&amp;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");

		// 4. Markdown Heading Triggers: # at the start of a line
		result = result.replace(/^#{1,6}\s+/gm, "\\$&");

		// 5. Markdown List Triggers: -, *, +, or 1. at the start of a line
		result = result.replace(/^([-*+]\s+)/gm, "\\$1");
		result = result.replace(/^(\d+\.\s+)/gm, "\\$1");

		// 6. Emphasis Triggers: *text*, **text**, _text_, ~~text~~
		// We look for balanced wrappers around non-whitespace content.
		result = result.replace(/(\*+|_+|~~)(\S[\s\S]*?\S)\1/g, (match, prefix, content) => {
			const escapedPrefix = prefix.split("").map(c => "\\" + c).join("");
			return escapedPrefix + content + escapedPrefix;
		});

		// 7. Horizontal Rule Triggers: ---, ***, ___ on their own line
		result = result.replace(/^([*_-]{3,})\s*$/gm, "\\$1");

		return result;
	}

	/**
	 * Escapes Markdown trigger characters for MDX output using HTML entities instead of
	 * backslashes. Backslash escapes render literally inside JSX text children, so entities
	 * are the only reliable way to neutralise Markdown symbols in MDX.
	 */
	mdxEscaper(text) {
		if (!text) return "";

		// 1. HTML tags → entities (before & escaping to avoid double-encoding)
		let result = text.replace(/<([a-zA-Z\/][^>]*?)>/g, "&lt;$1&gt;");

		// 2. Ampersands and quotes
		result = result
			.replace(/&(?!lt;|gt;)/g, "&amp;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");

		// 3. Unordered list triggers: -, *, + at start of line followed by space
		result = result.replace(/^([-*+])(\s+)/gm, (_, c, sp) => `&#${c.codePointAt(0)};${sp}`);

		// 4. Ordered list triggers: 1. at start of line — encode the dot
		result = result.replace(/^(\d+)\.(\s+)/gm, (_, n, sp) => `${n}&#46;${sp}`);

		// 5. Emphasis triggers: *text*, **text**, _text_, ~~text~~
		result = result.replace(/(\*+|_+|~~)(\S[\s\S]*?\S)\1/g, (_, prefix, content) => {
			const enc = prefix.split("").map(c => `&#${c.codePointAt(0)};`).join("");
			return enc + content + enc;
		});

		// 6. Horizontal rule triggers: ---, ***, ___ on their own line
		result = result.replace(/^([*_-]{3,})\s*$/gm, (m) =>
			m.replace(/[*_-]/g, c => `&#${c.codePointAt(0)};`)
		);

		return result;
	}

	/**
	 * Formats data as a Markdown table.
	 * @param {Array<string>} headers - The table column headers.
	 * @param {Array<string|Array>} rows - The table row data.
	 * @returns {string} - Formatted Markdown table string.
	 */
	table(headers, rows) {
		let result = "";
		const isNotEmptyArray = arr => Array.isArray(arr) && arr.length > 0;
		if (isNotEmptyArray(headers) && isNotEmptyArray(rows)) {
			for (let i = 0; i < headers.length; i++) {
				const header = headers[i];
				result += i === 0 ? `| ${header} |` : ` ${header} |${i === headers.length - 1 ? "\n" : ""}`;
			}
			for (let i = 0; i < headers.length; i++) {
				headers[i];
				result +=
					i === 0
						? `| --- |`
						: ` --- |${i === headers.length - 1 ? "\n" : ""}`;
			}
			rows = rows.map(row => {
				let columns;
				if (typeof row === "string") {
					columns = row.split(/(?<!\\),/).map(c => c.trim().replace(/\\(.)/g, "$1"));
				} else if (Array.isArray(row)) {
					columns = row.map(c => String(c).trim().replace(/\\(.)/g, "$1"));
				} else {
					return "";
				}

				if (columns.length > 0 && columns[0].startsWith("-")) {
					columns[0] = `- ${columns[0].substring(1).trim()}`;
				}

				return `| ${columns.join(" | ")}`;
			});
			for (let i = 0; i < rows.length; i++) {
				const row = rows[i];
				result += `${row} |${i === rows.length - 1 ? "" : "\n"}`;
			}
		}
		return result;
	}

	/**
	 * Formats a task list item.
	 * @param {boolean|string} [status=false] - The task status (true, "x", or "done" for checked).
	 * @param {string} text - The task description.
	 * @returns {string} - Formatted task list item string.
	 */
	todo(status = false, text) {
		if (!text) return "";
		let checked = status;
		if (typeof status === "string") {
			const s = status.trim().toLowerCase();
			checked = s === "x" || s === "done";
		}
		return checked ? `- [x] ${text}` : `- [ ] ${text}`;
	}

	/**
	 * Formats an unordered Markdown list.
	 * @param {Array<string>} items - The list items.
	 * @param {number} [depth=0] - The nesting depth for indentation.
	 * @param {string} [marker="-"] - The bullet point character.
	 * @returns {string} - Formatted unordered list string.
	 */
	unorderedList(items, depth = 0, marker = "-") {
		if (!Array.isArray(items)) return "";
		const indent = "  ".repeat(depth);
		return items.map(item => `${indent}${marker} ${item.replace(/\n/g, "\n" + indent + "  ")}`).join("\n");
	}

	/**
	 * Formats an ordered Markdown list.
	 * @param {Array<string>} items - The list items.
	 * @param {number} [depth=0] - The nesting depth for indentation.
	 * @returns {string} - Formatted ordered list string.
	 */
	orderedList(items, depth = 0) {
		if (!Array.isArray(items)) return "";
		const indent = "  ".repeat(depth);
		return items.map((item, i) => `${indent}${i + 1}. ${item.replace(/\n/g, "\n" + indent + "  ")}`).join("\n");
	}

	/**
	 * Formats text as a Markdown blockquote or GFM alert (admonition).
	 * @param {string} content - The content to quote.
	 * @param {string} [type=""] - The alert type ("note", "tip", "important", "caution", "warning").
	 * @returns {string} - Formatted blockquote string.
	 */
	/**
	 * Formats text as a Markdown blockquote or GFM alert (admonition).
	 * @param {string} content - The content to quote.
	 * @param {string} [type=""] - The alert type ("note", "tip", "important", "caution", "warning").
	 * @returns {string} - Formatted blockquote string.
	 */
	quote(content, type = "") {
		if (!content) return "";

		const alertTypes = ["note", "tip", "important", "caution", "warning"];
		const alertType = type ? type.toLowerCase().trim() : "";
		const isAlert = alertTypes.includes(alertType);

		const cleanContent = content.trim();

		const prefix = isAlert ? `[!${alertType.toUpperCase()}]\n` : "";

		const fullText = prefix + cleanContent;
		const lines = fullText.split(/\r?\n/);

		return lines.map(line => `> ${line}`).join("\n");
	}
}

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
	 * @param {Function} renderOutput - The function that formats this tag. It receives:
	 *    - `props`: Tag attributes.
	 *    - `content`: Formatted inner content.
	 *    - `textContent`: Raw inner text.
	 *    - `isSelfClosing`: (Blocks only) True if marked with !.
	 *    - `ast`: The full AST node.
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

		// -- RESERVED KEYWORD PROTECTION --
		// We protect core engine keywords that would cause syntax errors if used as tag names.
		const RESERVED = new Set(["end", "import", "slot", "$use-module", "for-each"]);
		const ids = Array.isArray(id) ? id : [id];

		for (const singleId of ids) {
			if (RESERVED.has(singleId.toLowerCase())) {
				sommarkError(`<$red:Reserved Keyword Error:$> Cannot register mapper for <$yellow:${singleId}$>. This is a protected SomMark engine keyword.`);
			}
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
		if (typeof id !== "string") {
			throw new TypeError("argument 'id' expected to be a string");
		}

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
	 * Placeholder for block comment rendering. Should be overridden by specific mappers.
	 * @param {string} text - The raw comment text.
	 * @returns {string} - The formatted block comment string.
	 */
	commentBlock(text, indent = "") {
		return this.comment(text);
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
	 * Formats runtime logic blocks natively.
	 * By default, this returns an empty string to discard logic for formats like JSON/MDX.
	 */
	runtimeLogic(code, isGlobal) {
		return "";
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
		return safeArg$1(options);
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

/**
 * Registers universal utility blocks shared across all SomMark mappers.
 *
 * @param {Mapper} mapper - The mapper instance to register tags on.
 */
function registerSharedOutputs(mapper) {
	mapper.register(
		["raw", "Raw"],
		({ content }) => {
			return content;
		},
    {
      escape: false, rules: {
      required_directives: ["raw"]
		} }
	);
}

const SVG_ELEMENTS = new Set([
	// Basic shapes
	"circle", "ellipse", "line", "path", "polygon", "polyline", "rect",
	// Containers
	"svg", "g", "defs", "symbol", "use", "marker", "mask", "pattern", "switch",
	// Text
	"text", "tspan", "textpath", "tref",
	// Image
	"image",
	// Gradients
	"lineargradient", "radialgradient", "stop", "solidcolor",
	"meshgradient", "meshrow", "meshpatch",
	// Hatch (SVG 2)
	"hatch", "hatchpath",
	// Filter container
	"filter",
	// Filter primitives
	"feblend", "fecolormatrix", "fecomponenttransfer", "fecomposite",
	"feconvolvematrix", "fediffuselighting", "fedisplacementmap", "fedropshadow",
	"feflood", "fefunca", "fefuncb", "fefuncg", "fefuncr",
	"fegaussianblur", "feimage", "femerge", "femergenode",
	"femorphology", "feoffset", "fespecularlighting", "fetile", "feturbulence",
	// Light sources
	"fedistantlight", "fepointlight", "fespotlight",
	// Animation
	"animate", "animatemotion", "animatetransform", "set", "mpath", "discard",
	// Descriptive
	"desc", "title", "metadata",
	// Other
	"clippath", "foreignobject", "view", "cursor",
]);

/**
 * Helper to format an HTML tag with attributes and content.
 * 
 * @param {string} id - The name of the HTML tag.
 * @param {Object} props - The attributes for the tag.
 * @param {string} content - The text or tags inside this tag.
 * @returns {string} - The finished HTML string.
 */
const renderHtmlTag = function (id, props, content, isSelfClosing) {
	const element = this.tag(id);
	const idLower = id.toLowerCase();

	if (SVG_ELEMENTS.has(idLower)) {
		element.attributes(props);
	} else {
		element.smartAttributes(props, this.customProps, this.options);
	}

	let finalContent = content;
	if (idLower === "script" && props.scoped === true) {
		finalContent = `(function(){\n${content}\n})();`;
	}

	if (VOID_ELEMENTS.has(idLower) || isSelfClosing) {
		return element.selfClose();
	}

	return element.body(finalContent);
};

/**
 * The HTML Mapper used for generating web pages.
 */
const HTML = Mapper.define({
	/**
	 * Formats an HTML comment.
	 * @param {string} text - The text inside the comment.
	 * @returns {string} - The finished comment.
	 */
	comment(text) {
		return `<!-- ${text} -->`;
	},

	/**
	 * Natively formats runtime logic for HTML.
	 * Global logic is placed in a raw script tag.
	 * Block-level logic is wrapped in a self-executing function to isolate scope and provide `self` reference.
	 */
	runtimeLogic(code, isGlobal, parentId) {
		if (isGlobal) {
			return this.tag("script").body(`\n${code.split("\n").filter(line => line.trim() !== "").join("\n")}\n`);
		} else {
			const selfDefinition = parentId
				? `const self = document.querySelector('[data-sommark-id="${parentId}"]');`
				: `const self = document.currentScript.parentElement;`;
			return this.tag("script").body(`\n(async function(){${selfDefinition}\nif (self) {\n${code.split("\n").filter(line => line.trim() !== "").join("\n")}\n}\n})();\n`);
		}
	},

	/**
	 * Formats plain text and makes sure it's safe for HTML if needed.
	 */
	text(text, options) {
		if (options?.escape === false) return text;
		return this.escapeHTML(text);
	},

	/**
	 * Provides high-fidelity fallback for unknown ids by rendering them as HTML elements.
	 * @param {Object} node - The unknown AST node.
	 * @returns {Object} - A virtual id registration for fallback rendering.
	 */
	getUnknownTag(node) {
		const idLower = node.id.toLowerCase();
		const isVoid = VOID_ELEMENTS.has(idLower);
		const isCodeStyleOrScript = ["code", "style", "script"].includes(idLower);

		return {
			render: function ({ props, content, isSelfClosing }) { return renderHtmlTag.call(this, node.id, props, content, isSelfClosing); },
			options: {
				escape: !isCodeStyleOrScript,
				rules: { is_empty_body: isVoid }
			}
		};
	},

	options: {
		trimAndWrapBlocks: true
	}
});

// DOCTYPE tag
HTML.register(["DOCTYPE", "doctype"], () => {
	return "<!DOCTYPE html>";
}, { rules: { is_empty_body: true } });

// head tag
HTML.register("head", function ({ content }) {
	let varsStyle = "";
	if (this.cssVariables) {
		varsStyle = `<style>:root { ${this.cssVariables} }</style>\n`;
	}
	return this.tag("head").body(`${varsStyle}${content}`);
}, { escape: false });

// Root tag for Metadata and CSS Variables (Collector)
HTML.register(
	["Root", "root"],
	function ({ props }) {
		this.cssVariables = this.cssVariables || "";
		Object.keys(props).forEach(key => {
			if (key.startsWith("--")) {
				this.cssVariables += `${key}:${props[key]};`;
			}
		});
		return "";
	},
);
registerSharedOutputs(HTML);

/**
 * The Markdown Mapper used for generating Markdown text.
 */
const MARKDOWN = Mapper.define({
	options: {
		trimAndWrapBlocks: false
	},
	/**
	 * Renders an HTML-style comment in Markdown output.
	 */
	comment(text) {
		return `<!-- ${text} -->`;
	},
	/**
	 * Formats a plain text node with Markdown escaping only.
	 */
	text(text, options) {
		if (options?.escape === false) return text;
		// Use smartEscaper to protect special characters like math
		let out = text;
		if (this.md && this.md.smartEscaper) out = this.md.smartEscaper(out);
		return out;
	},

	/**
	 * Provides a fallback for unknown tags by rendering them as HTML elements.
	 * Passes child nodes to the transpiler, which handles all node types (such as ForEach).
	 **/
	getUnknownTag(node) {
		const id = node.id;
		return {
			options: { trimAndWrapBlocks: true },
			render: ({ props, content, isSelfClosing }) => {
				const element = this.tag(id).smartAttributes(props, this.customProps, this.options);
				if (isSelfClosing || VOID_ELEMENTS.has(id)) return element.selfClose();
				return element.body(content);
			}
		};
	}
});

MARKDOWN.inherit(HTML);
const { md, safeArg } = MARKDOWN;
registerSharedOutputs(MARKDOWN);

/**
 * Quote - Renders blockquote content or GFM alerts.
 */
MARKDOWN.register(
	"quote",
	({ props, content }) => {
		const type = safeArg({ props, index: 0, key: "type", fallBack: "" });
		return md.quote(content, type);
	},
	{ resolve: true }
);

/**
 * Headings - Renders H1-H6 block headings.
 */
["h1", "h2", "h3", "h4", "h5", "h6"].forEach(heading => {
	MARKDOWN.register(heading, function ({ props, content, isSelfClosing }) {
		const format = safeArg({ props, key: "format", type: "string", fallBack: "" });
		const lvl = heading[1] && !isNaN(Number(heading[1])) ? Number(heading[1]) : 1;
		if (format.toLowerCase() === "html") {
			delete props.format;
			const el = this.tag(heading).smartAttributes(props);
			if (isSelfClosing) return el.selfClose();
			return el.body(content);
		}
		return this.md.heading(content, lvl);
	});
});

/**
 * Bold - Renders bold text (**text**).
 * Self-closing: [bold = "text" !] or [bold = text: "text" !]
 */
MARKDOWN.register(["bold", "b"], ({ props, content, isSelfClosing }) => {
	const text = isSelfClosing ? safeArg({ props, index: 0, key: "text", fallBack: "" }) : content;
	return md.bold(text);
});

/**
 * Italic - Renders italic text (*text*).
 * Self-closing: [italic = "text" !] or [italic = text: "text" !]
 */
MARKDOWN.register(["italic", "i"], ({ props, content, isSelfClosing }) => {
	const text = isSelfClosing ? safeArg({ props, index: 0, key: "text", fallBack: "" }) : content;
	return md.italic(text);
});

/**
 * Emphasis - Renders bold-italic text (***text***).
 * Self-closing: [emphasis = "text" !] or [emphasis = text: "text" !]
 */
MARKDOWN.register(["emphasis", "em"], ({ props, content, isSelfClosing }) => {
	const text = isSelfClosing ? safeArg({ props, index: 0, key: "text", fallBack: "" }) : content;
	return md.emphasis(text);
});

/**
 * Strike - Renders strikethrough text (~~text~~).
 * Self-closing: [strike = "text" !] or [strike = text: "text" !]
 */
MARKDOWN.register(["strike", "s"], ({ props, content, isSelfClosing }) => {
	const text = isSelfClosing ? safeArg({ props, index: 0, key: "text", fallBack: "" }) : content;
	return md.strike(text);
});

/**
 * Code - Renders inline or fenced code blocks.
 */
MARKDOWN.register(
	["Code", "code"],
	({ props, content, isSelfClosing }) => {
		if (isSelfClosing) {
			const text = safeArg({ props, index: 0, key: "text", fallBack: "" });
			return `\`${text}\``;
		}
		const lang = safeArg({ props, index: 0, key: "lang", fallBack: "" });
		return md.codeBlock(content, lang);
	},
	{ escape: false }
);

/**
 * Link - Renders Markdown links [text](url).
 * Body form:       [link = src: "url", title: "..."]text[end]
 * Self-closing:    [link = "text", "url" !] or [link = text: "...", src: "...", title: "..." !]
 */
MARKDOWN.register(
	"link",
	({ props, content, isSelfClosing }) => {
		if (isSelfClosing) {
			const text = safeArg({ props, index: 0, key: "text", fallBack: "" });
			const src = safeArg({ props, index: 1, key: "src", fallBack: "" });
			const title = safeArg({ props, index: 2, key: "title", fallBack: "" });
			return md.url("link", text, src, title);
		}
		const src = safeArg({ props, index: 0, key: "src", fallBack: "" });
		const title = safeArg({ props, index: 1, key: "title", fallBack: "" });
		return md.url("link", content, src, title);
	},
	{ rules: { is_empty_body: false } }
);

/**
 * Image - Renders Markdown images ![alt](url).
 * [image = "alt", "src", "title" !] or [image = alt: "...", src: "...", title: "..." !]
 */
MARKDOWN.register(
	"image",
	({ props }) => {
		const alt = safeArg({ props, index: 0, key: "alt", fallBack: "" });
		const src = safeArg({ props, index: 1, key: "src", fallBack: "" });
		const title = safeArg({ props, index: 2, key: "title", fallBack: "" });
		return md.url("image", alt, src, title);
	},
	{ rules: { is_empty_body: true } }
);

/**
 * HR (Horizontal Rule) - Renders a thematic break (---).
 */
MARKDOWN.register(
	"hr",
	({ props }) => {
		const fmt = safeArg({ props, index: 0, fallBack: "-" });
		return md.horizontal(fmt);
	},
	{ rules: { is_empty_body: true } }
);

/**
 * Escape - Escapes special Markdown characters.
 * Self-closing: [escape = "text" !] or [escape = text: "text" !]
 */
MARKDOWN.register(
	["escape", "e"],
	function ({ props, content, isSelfClosing }) {
		const text = isSelfClosing ? safeArg({ props, index: 0, key: "text", fallBack: "" }) : content;
		return this.md.escape(text);
	},
	{ resolve: true }
);

const ROW_SEP = "\x1E";
const CELL_SEP = "\x1F";

/**
 * Table - Authoritative Native AST Table resolution.
 * Processes Header/Body sections with Row/Cell nesting.
 * Supports [for-each] inside [body] for dynamic rows.
 */
MARKDOWN.register(
	"Table",
	async function ({ ast, renderChild }) {
		const headers = [];
		const rows = [];

		const extractRows = async sectionNode => {
			const sectionRows = [];
			for (const child of sectionNode.body || []) {
				if (child.type === BLOCK && child.id?.toLowerCase() === "row") {
					const rendered = await renderChild(child, { inTable: true });
					const cells =
						rendered
							.split(ROW_SEP)[0]
							?.split(CELL_SEP)
							.filter(c => c !== "") ?? [];
					if (cells.length > 0) sectionRows.push(cells);
				} else if (child.type === FOR_EACH) {
					const rendered = await renderChild(child, { inTable: true });
					for (const row of rendered.split(ROW_SEP)) {
						const cells = row.split(CELL_SEP).filter(c => c !== "");
						if (cells.length > 0) sectionRows.push(cells);
					}
				}
			}
			return sectionRows;
		};

		for (const node of ast.body) {
			if (node.type !== BLOCK) continue;
			const id = node.id.toLowerCase();
			if (id === "header") {
				const headerRows = await extractRows(node);
				if (headerRows.length > 0) headers.push(...headerRows[0]);
			} else if (id === "body") {
				rows.push(...(await extractRows(node)));
			}
		}

		return md.table(headers, rows);
	},
	{ escape: true, handleAst: true, trimAndWrapBlocks: false }
);

/**
 * Table Helpers - Internal tags for table structural organization.
 */
MARKDOWN.register(["header", "body"], ({ content }) => content);

MARKDOWN.register(
	"row",
	async function ({ ast, renderChild, inTable }) {
		if (!inTable) {
			let result = "";
			for (const child of ast.body) {
				if (child.type === TEXT$1) result += this.text(child.text);
				else if (child.type === BLOCK) result += await renderChild(child);
			}
			return result;
		}
		let cells = "";
		for (const child of ast.body) {
			if (child.type !== BLOCK) continue;
			const id = child.id?.toLowerCase();
			if (id === "cell" || id === "th" || id === "td") {
				cells += await renderChild(child, { inTable: true });
			}
		}
		return cells + ROW_SEP;
	},
	{ handleAst: true }
);

MARKDOWN.register(["cell", "th", "td"], ({ content, inTable }) => {
	return inTable ? content.trim() + CELL_SEP : content;
});

/**
 * Lists - Authoritative Native AST List resolution.
 * Supports Ordered (Number) and Unordered (Dotlex) lists with deep nesting.
 */
MARKDOWN.register(
	["list", "List"],
	async function ({ ast, props, renderChild }) {
		const indicator = safeArg({ props, index: 0, fallBack: "dot" });
		const isOrdered = indicator === "number" || indicator === "ol";
		const marker = isOrdered ? "" : indicator === "dot" ? "-" : indicator;
		const items = [];

		for (const node of ast.body) {
			if (node.type !== BLOCK) continue;
			const id = node.id?.toLowerCase();
			if (id === "item") {
				items.push((await renderChild(node)).trim());
			}
		}

		return isOrdered ? md.orderedList(items, 0) : md.unorderedList(items, 0, marker);
	},
	{ handleAst: true, trimAndWrapBlocks: false }
);

/**
 * List Helpers - Internal tags for list structural organization.
 */
MARKDOWN.register(
	["item", "Item"],
	async function ({ ast, renderChild }) {
		let result = "";
		for (const child of ast.body) {
			if (child.type === TEXT$1) result += this.text(child.text);
			else if (child.type === BLOCK) result += await renderChild(child);
		}
		return result.trim();
	},
	{ handleAst: true, trimAndWrapBlocks: false }
);

/**
 * Todo - Renders task list items with status markers.
 *
 * Supported forms:
 *   [todo = task: "Add feature", status: "x" !]   named self-closing
 *   [todo = "Add feature", "x" !]                 positional self-closing (task, status)
 *   [todo = "x"]Add feature[end]                  status in prop, task in body
 */
MARKDOWN.register(
	"todo",
	({ props, content, isSelfClosing }) => {
		let status, task;

		if (isSelfClosing) {
			task = safeArg({ props, index: 0, key: "task", fallBack: "" });
			status = safeArg({ props, index: 1, key: "status", fallBack: "" });
		} else {
			status = safeArg({ props, index: 0, fallBack: "" });
			task = content;
		}

		return md.todo(status, task);
	},
	{ trimAndWrapBlocks: false }
);

/**
 * The MDX Mapper used for generating Markdown with JSX.
 */
const MDX = Mapper.define({
	/**
	 * Renders a JSX-style comment in MDX output.
	 * @param {string} text - The raw comment text.
	 * @returns {string} - Formatted JSX comment string.
	 */
	comment(text) {
		return `{/* ${text} */}`;
	},

	/**
	 * Provides high-fidelity fallback for unknown tags by rendering them as JSX components.
	 * @param {Object} node - The unknown AST node.
	 * @returns {Object} - A virtual tag registration for JSX rendering.
	 */
	getUnknownTag(node) {
		const tagName = node.id;
		const lowerId = tagName.toLowerCase();
		const isVoid = VOID_ELEMENTS.has(lowerId);
		const isCodeStyleOrScript = ["code", "style", "script"].includes(lowerId);

		return {
			render: (ctx) => {
				const { props, content, isSelfClosing } = ctx;
				const element = this.tag(tagName).jsxProps(props);
				return (isSelfClosing || isVoid) ? element.selfClose() : element.body(content);
			},
			options: {
				escape: !isCodeStyleOrScript,
				rules: { is_empty_body: isVoid }
			}
		};
	},

	options: {
		trimAndWrapBlocks: true
	},

	/**
	 * Formats a plain text node with Markdown escaping.
	 */
	text(text, options) {
		let out = text;
		if (options?.escape !== false) {
			out = this.md.mdxEscaper(out);
		}
		return out;
	},

});

const { tag } = MDX;

MDX.inherit(MARKDOWN);
MDX.md = MARKDOWN.md;

["h1", "h2", "h3", "h4", "h5", "h6"].forEach(h => {
	MDX.register(h, function ({ props, content }) {
		const format = this.safeArg({ props, key: "format", fallBack: "" });
		if (format === "md" || format === "markdown") {
			return this.md.heading(content, h.slice(1) || 1);
		}
		delete props.format;
		return tag(h).jsxProps(props).body(content);
	});
});

const ITEM_SEP$3 = "\x1F";

function getIndent$1(depth) {
	return "  ".repeat(depth);
}

function escapeString(str, trim = false) {
	let out = String(str);
	if (trim) out = out.trim();
	return JSON.stringify(out);
}

function renderMember(props, value, inArray = false) {
	if (inArray) return value + ITEM_SEP$3;
	const posArgs = getPositionalArgs(props);
	const key = props.key || posArgs[0];
	if (key) return `${escapeString(key)}: ${value}` + ITEM_SEP$3;
	return value;
}

const Json = Mapper.define({});

Json.register(["Object", "object"], async function ({ props, ast, depth = 0, inArray = false, renderChild }) {
	let combined = "";
	for (const child of ast.body) {
		const out = await renderChild(child, { depth: depth + 1, inArray: false });
		if (out) combined += out;
	}
	const parts = combined.split(ITEM_SEP$3).map(v => v.trim()).filter(v => v !== "");
	const value = parts.length === 0
		? "{}"
		: `{\n${parts.map(p => getIndent$1(depth + 1) + p).join(",\n")}\n${getIndent$1(depth)}}`;
	return renderMember(props, value, inArray);
}, { handleAst: true });

Json.register(["Array", "array"], async function ({ props, ast, depth = 0, inArray = false, renderChild }) {
	let combined = "";
	for (const child of ast.body) {
		const out = await renderChild(child, { depth: depth + 1, inArray: true });
		if (out) combined += out;
	}
	const parts = combined.split(ITEM_SEP$3).map(v => v.trim()).filter(v => v !== "");
	const value = parts.length === 0
		? "[]"
		: `[\n${parts.map(p => getIndent$1(depth + 1) + p).join(",\n")}\n${getIndent$1(depth)}]`;
	return renderMember(props, value, inArray);
}, { handleAst: true });

Json.register(["string", "str"], ({ props, textContent, inArray }) => {
	const trim = safeArg$1({
		props,
		key: "trim",
		type: "boolean",
		setType: v => v === "true" || v === true,
		fallBack: false
	});
	const raw = safeArg$1({ props, index: inArray ? 0 : undefined, key: "value", fallBack: textContent });
	return renderMember(props, escapeString(raw, trim), inArray);
}, { handleAst: true });

Json.register("number", ({ props, textContent, inArray }) => {
	const raw = String(safeArg$1({ props, index: inArray ? 0 : undefined, key: "value", fallBack: textContent })).trim();
	const val = (isNaN(Number(raw)) || raw === "") ? "0" : raw;
	return renderMember(props, val, inArray);
}, { handleAst: true });

Json.register("bool", ({ props, textContent, inArray }) => {
	const raw = String(safeArg$1({ props, index: inArray ? 0 : undefined, key: "value", fallBack: textContent })).trim().toLowerCase();
	return renderMember(props, (raw === "true" || raw === "1") ? "true" : "false", inArray);
}, { handleAst: true });

Json.register("null", ({ props, inArray }) => {
	return renderMember(props, "null", inArray);
}, { handleAst: true });

Json.getUnknownTag = function (node) {
	const key = node.id;
	return {
		render({ props, textContent, inArray = false }) {
			if (inArray) {
				transpilerError(
					`Unknown tag '<$yellow:[${key}]$>' cannot be used inside <$yellow:[Array]$>.{N}Use <$cyan:[string]$>, <$cyan:[number]$>, <$cyan:[bool]$>, or <$cyan:[null]$> instead.`
				);
			}
			const raw = String(
				safeArg$1({ props, index: 0, key: "value", fallBack: textContent.trim() })
			).trim();
			let val;
			if (raw === "null")                             val = "null";
			else if (raw === "true" || raw === "false")     val = raw;
			else if (raw !== "" && !isNaN(Number(raw)))     val = raw;
			else                                            val = escapeString(raw);
			return `${escapeString(key)}: ${val}` + ITEM_SEP$3;
		},
		options: { handleAst: true }
	};
};

const ITEM_SEP$2 = "\x1F";

const Jsonc = Json.clone();

Jsonc.comment = function (text) {
	return `// ${text}`;
};

Jsonc.commentBlock = function (text, indent = "  ") {
	if (text.includes("\n")) {
		const lines = text.split("\n");
		return `/*\n${lines.map(line => indent + line).join("\n")}\n${indent}*/`;
	}
	return `/* ${text} */`;
};

async function renderStructure(props, ast, depth, inArray, childInArray, openBracket, closeBracket, renderChild) {
	let combined = "";
	for (const child of ast.body) {
		const out = await renderChild(child, { depth: depth + 1, inArray: childInArray });
		if (out) combined += out;
	}
	const parts = combined.split(ITEM_SEP$2).map(v => v.trim()).filter(v => v !== "");
	const value = parts.length === 0
		? `${openBracket}${closeBracket}`
		: `${openBracket}\n${parts.map(p => getIndent$1(depth + 1) + p).join(",\n")}\n${getIndent$1(depth)}${closeBracket}`;
	return renderMember(props, value, inArray);
}

Jsonc.register(["Object", "object"], async function ({ props, ast, depth = 0, inArray = false, renderChild }) {
	return renderStructure(props, ast, depth, inArray, false, "{", "}", renderChild);
}, { handleAst: true });

Jsonc.register(["Array", "array"], async function ({ props, ast, depth = 0, inArray = false, renderChild }) {
	return renderStructure(props, ast, depth, inArray, true, "[", "]", renderChild);
}, { handleAst: true });

/**
 * Renders a standard XML tag based on the provided identifier and arguments.
 * Ensures strict attribute quoting and handles self-closing tags for empty bodies.
 *
 * @param {string} id - The XML tag identifier (case-sensitive).
 * @param {Object} props - Key-value pairs to be rendered as XML attributes.
 * @param {string} content - The rendered inner content of the tag.
 * @returns {string} The fully rendered XML tag string.
 */
const renderXmlTag = function (id, props, content, isSelfClosing) {
	// XML is case-sensitive, so we use the exact id provided
	const element = this.tag(id);

	// Filter out positional indices (numeric keys) for XML attributes
	const namedArgs = {};
	Object.keys(props).forEach(key => {
		if (isNaN(parseInt(key))) {
			namedArgs[key] = props[key];
		}
	});

	// In XML, attributes must always have values (strict = true)
	element.attributes(namedArgs, true);

	const hasBody = typeof content === "string" && content.trim().length > 0;

	if (isSelfClosing || !hasBody) {
		return element.selfClose();
	}

	return element.body(content);
};

/**
 * The XML Mapper used for creating XML pages.
 */
const XML = Mapper.define({
	/**
	 * Renders a comment in XML format.
	 * @param {string} text - The comment content.
	 * @returns {string}
	 */
	comment(text) {
		return `<!-- ${text} -->`;
	},

	/**
	 * Resolves unknown tags by preserving their original case and applying XML rules.
	 * @param {Object} node - The AST node representing the unknown tag.
	 * @returns {Object} Renderer definition for the tag.
	 */
	getUnknownTag(node) {
		const id = node.id;
		return {
			render: ({ props, content, isSelfClosing }) => renderXmlTag.call(this, id, props, content, isSelfClosing),
			options: {}
		};
	},
	options: {
		trimAndWrapBlocks: true
	}
});

/**
 * Registers the XML declaration as a self-closing block.
 * Usage: [xml = version: "1.0", encoding: "UTF-8"]
 */
XML.register(
	"xml",
	({ props }) => {
		const version = props.version || "1.0";
		const encoding = props.encoding || "UTF-8";
		return `<?xml version="${version}" encoding="${encoding}"?>`;
	},
	{ rules: { is_empty_body: true } }
);

/**
 * Registers the DOCTYPE declaration.
 * Usage: [doctype = root: "note", system: "note.dtd"]
 */
XML.register(
	["DOCTYPE", "doctype"],
	({ props }) => {
		const root = props.root || "root";
		const system = props.system;
		const pub = props.public || props.fpi;

		if (pub && system) {
			return `<!DOCTYPE ${root} PUBLIC "${pub}" "${system}">`;
		} else if (system) {
			return `<!DOCTYPE ${root} SYSTEM "${system}">`;
		}
		return `<!DOCTYPE ${root}>`;
	},
	{ rules: { is_empty_body: true } }
);

/**
 * Registers the XML stylesheet processing instruction.
 * Usage: [xml-stylesheet = href: "style.xsl"]
 */
XML.register(
	"xml-stylesheet",
	({ props }) => {
		const type = props.type || "text/xsl";
		const href = props.href;
		if (!href) return "";
		return `<?xml-stylesheet type="${type}" href="${href}"?>`;
	},
	{ rules: { is_empty_body: true } }
);

/**
 * Registers CDATA sections.
 * Body form:    [cdata]raw content[end]
 * Self-closing: [cdata = "raw content" !] or [cdata = text: "raw content" !]
 */
XML.register("cdata", ({ props, content, isSelfClosing }) => {
	const text = isSelfClosing ? (props[0] ?? props.text ?? "") : content;
	return `<![CDATA[${text}]]>`;
});

registerSharedOutputs(XML);

const csvEscape = (value) => {
	const str = String(value ?? "").trim();
	if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
};

const rowFromProps = (props) =>
	Object.keys(props)
		.filter(k => !isNaN(parseInt(k)))
		.sort((a, b) => parseInt(a) - parseInt(b))
		.map(k => csvEscape(props[k]))
		.join(",");

const renderRow = async ({ props, ast, isSelfClosing, renderChild }) => {
	if (isSelfClosing) return rowFromProps(props) + "\n";
	const cells = [];
	for (const child of ast.body.filter(c => c.type === "Block")) {
		const out = await renderChild(child);
		if (out != null && out !== "") cells.push(out);
	}
	return cells.join(",") + "\n";
};

const CSV = Mapper.define({
	comment(text) {
		return `# ${text}`;
	},
	text(text) {
		return text.trim() === "" ? "" : text;
	}
});

/**
 * [header] — header row
 * Self-closing: [header = "name", "age", "city" !]
 * Body form:    [header][col]name[end][col]age[end][end]
 */
CSV.register(["header", "thead"], renderRow, { handleAst: true });

/**
 * [row] / [tr] — data row
 * Self-closing: [row = "Alice", "30", "New York" !]
 * Body form:    [row][col]Alice[end][col]30[end][end]
 */
CSV.register(["row", "tr"], renderRow, { handleAst: true });

/**
 * [col] / [cell] / [td] — single cell, used inside body-form rows
 * [col]New York, NY[end]
 */
CSV.register(["col", "cell", "td"], ({ textContent }) => {
	return csvEscape(textContent);
}, { handleAst: true, trimAndWrapBlocks: false });

registerSharedOutputs(CSV);

const isValidInt$1    = (v) => v !== "" && !isNaN(Number(v)) && !v.includes(".");
const isValidFloat$1  = (v) => v !== "" && !isNaN(Number(v)) && v.includes(".");
const isValidNumber$1 = (v) => v !== "" && !isNaN(Number(v));

// Escape a string value for use inside TOML basic strings
const tomlEscapeString = (str) =>
	String(str ?? "")
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\x08/g, "\\b")
		.replace(/\f/g, "\\f")
		.replace(/\n/g, "\\n")
		.replace(/\r/g, "\\r")
		.replace(/\t/g, "\\t");

// Quote a bare key segment if it contains characters outside [A-Za-z0-9_-]
const toBareKey = (k) => /^[A-Za-z0-9_-]+$/.test(k) ? k : `"${tomlEscapeString(k)}"`;

// Handle dotted keys like "database.host" → database.host
const tomlKey = (key) => String(key).split(".").map(toBareKey).join(".");

const ITEM_SEP$1 = "\x1F";

const TOML = Mapper.define({
	comment(text) {
		return `# ${text}`;
	},
	text(text) {
		return text.trim() === "" ? "" : text;
	}
});

/**
 * [str] / [string] — string key-value pair or array string value
 *
 * Key-value:  [str = "title", "My App" !]         → title = "My App"
 * Body form:  [str = "description"]Long text[end] → description = "Long text"
 * In array:   [str = "hello" !]                   → "hello"
 */
TOML.register(["str", "string"], ({ props, textContent, inArray = false }) => {
	const value = inArray
		? safeArg$1({ props, index: 0, key: "value", fallBack: textContent.trim() })
		: safeArg$1({ props, index: 1, key: "value", fallBack: textContent.trim() });
	const escaped = `"${tomlEscapeString(String(value))}"`;
	if (inArray) return escaped + ITEM_SEP$1;
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	return `${tomlKey(key)} = ${escaped}\n`;
}, { handleAst: true });

/**
 * [int] / [integer] — integer key-value pair or array integer value
 *
 * Key-value:  [int = "port", "5432" !]  → port = 5432
 * In array:   [int = "5432" !]          → 5432
 */
TOML.register(["int", "integer"], ({ props, textContent, inArray = false }) => {
	const raw = String(safeArg$1({ props, index: inArray ? 0 : 1, key: "value", fallBack: textContent.trim() })).trim();
	if (!isValidInt$1(raw))
		transpilerError(`<$yellow:[int]$> expects a whole number but got <$yellow:'${raw}'$>.{N}Use <$cyan:[float]$> for decimal numbers or <$cyan:[number]$> for either.`);
	if (inArray) return raw + ITEM_SEP$1;
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	return `${tomlKey(key)} = ${raw}\n`;
}, { handleAst: true });

TOML.register("float", ({ props, textContent, inArray = false }) => {
	const raw = String(safeArg$1({ props, index: inArray ? 0 : 1, key: "value", fallBack: textContent.trim() })).trim();
	if (!isValidFloat$1(raw))
		transpilerError(`<$yellow:[float]$> expects a decimal number but got <$yellow:'${raw}'$>.{N}Use <$cyan:[int]$> for whole numbers or <$cyan:[number]$> for either.`);
	if (inArray) return raw + ITEM_SEP$1;
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	return `${tomlKey(key)} = ${raw}\n`;
}, { handleAst: true });

TOML.register("number", ({ props, textContent, inArray = false }) => {
	const raw = String(safeArg$1({ props, index: inArray ? 0 : 1, key: "value", fallBack: textContent.trim() })).trim();
	if (!isValidNumber$1(raw))
		transpilerError(`<$yellow:[number]$> expects a numeric value but got <$yellow:'${raw}'$>.`);
	if (inArray) return raw + ITEM_SEP$1;
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	return `${tomlKey(key)} = ${raw}\n`;
}, { handleAst: true });

/**
 * [bool] / [boolean] — boolean key-value pair or array bool value
 *
 * Key-value:  [bool = "debug", "false" !]  → debug = false
 * In array:   [bool = "true" !]            → true
 */
TOML.register(["bool", "boolean"], ({ props, textContent, inArray = false }) => {
	const raw = String(
		inArray
			? safeArg$1({ props, index: 0, key: "value", fallBack: textContent.trim() })
			: safeArg$1({ props, index: 1, key: "value", fallBack: textContent.trim() })
	).trim().toLowerCase();
	const value = (raw === "true" || raw === "1" || raw === "yes") ? "true" : "false";
	if (inArray) return value + ITEM_SEP$1;
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	return `${tomlKey(key)} = ${value}\n`;
}, { handleAst: true });

/**
 * [datetime] — datetime key-value pair
 * TOML datetimes are bare (unquoted): 1979-05-27T07:32:00Z
 *
 * [datetime = "born", "1979-05-27T07:32:00Z" !]  → born = 1979-05-27T07:32:00Z
 */
TOML.register("datetime", ({ props, textContent, inArray = false }) => {
	const raw = String(
		inArray
			? safeArg$1({ props, index: 0, key: "value", fallBack: textContent.trim() })
			: safeArg$1({ props, index: 1, key: "value", fallBack: textContent.trim() })
	).trim();
	if (inArray) return raw + ITEM_SEP$1;
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	return `${tomlKey(key)} = ${raw}\n`;
}, { handleAst: true });

/**
 * [table] / [section] — renders a TOML table header + children
 *
 * [table = "database"]
 *   [str = "host", "localhost" !]
 *   [int = "port", "5432" !]
 * [end]
 *
 * →
 *
 * [database]
 * host = "localhost"
 * port = 5432
 */
TOML.register(["table", "section"], async ({ props, ast, renderChild }) => {
	const name = safeArg$1({ props, index: 0, key: "name", fallBack: "" });
	const parts = [];
	for (const child of ast.body) {
		const out = await renderChild(child);
		if (out != null && out.trim() !== "") parts.push(out);
	}
	return `[${tomlKey(name)}]\n${parts.join("")}\n`;
}, { handleAst: true });

/**
 * [array-table] — renders a TOML array of tables entry
 *
 * [array-table = "servers"]
 *   [str = "name", "alpha" !]
 *   [str = "ip", "10.0.0.1" !]
 * [end]
 *
 * →
 *
 * [[servers]]
 * name = "alpha"
 * ip = "10.0.0.1"
 */
TOML.register("array-table", async ({ props, ast, renderChild }) => {
	const name = safeArg$1({ props, index: 0, key: "name", fallBack: "" });
	const parts = [];
	for (const child of ast.body) {
		const out = await renderChild(child);
		if (out != null && out.trim() !== "") parts.push(out);
	}
	return `[[${tomlKey(name)}]]\n${parts.join("")}\n`;
}, { handleAst: true });

/**
 * [array] — renders a TOML inline array
 * Children are rendered with inArray: true so they output just their value.
 *
 * [array = "ports"]
 *   [int = "8001" !][int = "8002" !][int = "8003" !]
 * [end]
 *
 * → ports = [8001, 8002, 8003]
 *
 * Works with [for-each] for dynamic arrays:
 * [array = "tags"]
 *   [for-each = ${ tags }$, as: "item"][str = ${ item }$ !][end]
 * [end]
 */
/**
 * Unknown tag — tag name becomes the TOML key, first positional arg is the value.
 * Type is inferred: number → raw integer/float, true/false → boolean, everything else → quoted string.
 *
 * [name = "Adam" !]    → name = "Adam"
 * [port = 5432 !]      → port = 5432
 * [debug = false !]    → debug = false
 * [bio]Long text[end]  → bio = "Long text"
 */
TOML.getUnknownTag = function (node) {
	const key = node.id;
	return {
		render({ props, textContent, inArray = false }) {
			const raw = String(
				safeArg$1({ props, index: 0, key: "value", fallBack: textContent.trim() })
			).trim();

			let val;
			if (raw === "true" || raw === "false") {
				val = raw;
			} else if (raw !== "" && !isNaN(Number(raw))) {
				val = raw;
			} else {
				val = `"${tomlEscapeString(raw)}"`;
			}

			if (inArray) return val + ITEM_SEP$1;
			return `${tomlKey(key)} = ${val}\n`;
		},
		options: { handleAst: true }
	};
};

TOML.register("array", async ({ props, ast, renderChild }) => {
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	let combined = "";
	for (const child of ast.body) {
		combined += await renderChild(child, { inArray: true });
	}
	const vals = combined.split(ITEM_SEP$1).filter(v => v.trim() !== "");
	return `${tomlKey(key)} = [${vals.join(", ")}]\n`;
}, { handleAst: true });

registerSharedOutputs(TOML);

const isValidInt    = (v) => v !== "" && !isNaN(Number(v)) && !v.includes(".");
const isValidFloat  = (v) => v !== "" && !isNaN(Number(v)) && v.includes(".");
const isValidNumber = (v) => v !== "" && !isNaN(Number(v));

const ITEM_SEP = "\x1F";

const getIndent = (depth) => "  ".repeat(depth);

// Escape a string value for use inside YAML double-quoted scalars
const yamlEscape = (str) =>
	String(str ?? "")
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\n/g, "\\n")
		.replace(/\r/g, "\\r")
		.replace(/\t/g, "\\t");

// Always double-quote string values — [str] is explicitly typed, no ambiguity needed
const yamlStr = (val) => `"${yamlEscape(val)}"`;

// Bare keys: [A-Za-z0-9_-] are safe without quoting
const yamlKey = (key) => {
	const s = String(key ?? "");
	return /^[A-Za-z0-9_\-]+$/.test(s) ? s : `"${yamlEscape(s)}"`;
};

const YAML = Mapper.define({
	comment(text) {
		return `# ${text}`;
	},
	text(text) {
		return text.trim() === "" ? "" : text;
	}
});

/**
 * [str] / [string] — string scalar
 *
 * Key-value:    [str = "name", "SomMark" !]            → name: "SomMark"
 * Body form:    [str = "desc"]Long text[end]           → desc: "Long text"
 * In sequence:  [str = "rust" !]                       → - "rust"
 * In map-item:  [str = "host", "localhost" !]          → host: "localhost"  (no indent, feeds [map-item])
 */
YAML.register(["str", "string"], ({ props, textContent, depth = 0, inSeq = false, inMapItem = false }) => {
	if (inSeq) {
		const val = safeArg$1({ props, index: 0, key: "value", fallBack: textContent.trim() });
		return `${getIndent(depth)}- ${yamlStr(val)}\n`;
	}
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	const val = safeArg$1({ props, index: 1, key: "value", fallBack: textContent.trim() });
	if (inMapItem) return `${yamlKey(key)}: ${yamlStr(val)}${ITEM_SEP}`;
	return `${getIndent(depth)}${yamlKey(key)}: ${yamlStr(val)}\n`;
}, { handleAst: true });

/**
 * [int] / [integer] — integer scalar
 *
 * Key-value:    [int = "port", "5432" !]   → port: 5432
 * In sequence:  [int = "8001" !]           → - 8001
 */
YAML.register(["int", "integer"], ({ props, textContent, depth = 0, inSeq = false, inMapItem = false }) => {
	const val = String(safeArg$1({ props, index: inSeq ? 0 : 1, key: "value", fallBack: textContent.trim() })).trim();
	if (!isValidInt(val))
		transpilerError(`<$yellow:[int]$> expects a whole number but got <$yellow:'${val}'$>.{N}Use <$cyan:[float]$> for decimal numbers or <$cyan:[number]$> for either.`);
	if (inSeq) return `${getIndent(depth)}- ${val}\n`;
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	if (inMapItem) return `${yamlKey(key)}: ${val}${ITEM_SEP}`;
	return `${getIndent(depth)}${yamlKey(key)}: ${val}\n`;
}, { handleAst: true });

YAML.register("float", ({ props, textContent, depth = 0, inSeq = false, inMapItem = false }) => {
	const val = String(safeArg$1({ props, index: inSeq ? 0 : 1, key: "value", fallBack: textContent.trim() })).trim();
	if (!isValidFloat(val))
		transpilerError(`<$yellow:[float]$> expects a decimal number but got <$yellow:'${val}'$>.{N}Use <$cyan:[int]$> for whole numbers or <$cyan:[number]$> for either.`);
	if (inSeq) return `${getIndent(depth)}- ${val}\n`;
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	if (inMapItem) return `${yamlKey(key)}: ${val}${ITEM_SEP}`;
	return `${getIndent(depth)}${yamlKey(key)}: ${val}\n`;
}, { handleAst: true });

YAML.register("number", ({ props, textContent, depth = 0, inSeq = false, inMapItem = false }) => {
	const val = String(safeArg$1({ props, index: inSeq ? 0 : 1, key: "value", fallBack: textContent.trim() })).trim();
	if (!isValidNumber(val))
		transpilerError(`<$yellow:[number]$> expects a numeric value but got <$yellow:'${val}'$>.`);
	if (inSeq) return `${getIndent(depth)}- ${val}\n`;
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	if (inMapItem) return `${yamlKey(key)}: ${val}${ITEM_SEP}`;
	return `${getIndent(depth)}${yamlKey(key)}: ${val}\n`;
}, { handleAst: true });

/**
 * [bool] / [boolean] — boolean scalar
 *
 * Key-value:    [bool = "debug", "false" !]   → debug: false
 * In sequence:  [bool = "true" !]             → - true
 */
YAML.register(["bool", "boolean"], ({ props, textContent, depth = 0, inSeq = false, inMapItem = false }) => {
	const raw = String(
		inSeq
			? safeArg$1({ props, index: 0, key: "value", fallBack: textContent.trim() })
			: safeArg$1({ props, index: 1, key: "value", fallBack: textContent.trim() })
	).trim().toLowerCase();
	const val = (raw === "true" || raw === "1" || raw === "yes") ? "true" : "false";
	if (inSeq) return `${getIndent(depth)}- ${val}\n`;
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	if (inMapItem) return `${yamlKey(key)}: ${val}${ITEM_SEP}`;
	return `${getIndent(depth)}${yamlKey(key)}: ${val}\n`;
}, { handleAst: true });

/**
 * [null] — null scalar
 *
 * Key-value:    [null = "missing" !]   → missing: null
 * In sequence:  [null !]               → - null
 */
YAML.register("null", ({ props, depth = 0, inSeq = false, inMapItem = false }) => {
	if (inSeq) return `${getIndent(depth)}- null\n`;
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	if (inMapItem) return `${yamlKey(key)}: null${ITEM_SEP}`;
	return `${getIndent(depth)}${yamlKey(key)}: null\n`;
}, { handleAst: true });

/**
 * [mapping] / [map] — block mapping (YAML object)
 *
 * [mapping = "database"]
 *   [str = "host", "localhost" !]
 *   [int = "port", "5432" !]
 * [end]
 *
 * →
 *
 * database:
 *   host: "localhost"
 *   port: 5432
 *
 * Omit the key for a root mapping.
 * Supports [for-each] inside — each iteration's lines are pre-indented and concatenate correctly.
 */
YAML.register(["mapping", "map"], async ({ props, ast, depth = 0, renderChild }) => {
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	const childDepth = key ? depth + 1 : depth;
	let body = "";
	for (const child of ast.body) {
		body += await renderChild(child, { depth: childDepth });
	}
	if (!key) return body;
	return `${getIndent(depth)}${yamlKey(key)}:\n${body}`;
}, { handleAst: true });

/**
 * [seq] / [sequence] / [list] — block sequence (YAML array of scalars)
 *
 * Scalar items use [str], [int], [bool], [float], [null].
 * Mapping items use [map-item].
 *
 * [seq = "tags"]
 *   [str = "rust" !]
 *   [str = "cli" !]
 * [end]
 *
 * →
 *
 * tags:
 *   - "rust"
 *   - "cli"
 *
 * Supports [for-each] inside naturally.
 */
YAML.register(["seq", "sequence", "list"], async ({ props, ast, depth = 0, renderChild }) => {
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	let body = "";
	for (const child of ast.body) {
		body += await renderChild(child, { depth: depth + 1, inSeq: true });
	}
	if (!key) return body;
	return `${getIndent(depth)}${yamlKey(key)}:\n${body}`;
}, { handleAst: true });

/**
 * [map-item] — mapping as a sequence item (used inside [seq])
 *
 * Each child scalar renders a bare "key: value" pair (no indent).
 * [map-item] assembles them with the correct "- " prefix on the first pair
 * and aligned indentation for the rest.
 *
 * [seq = "servers"]
 *   [map-item]
 *     [str = "host", "10.0.0.1" !]
 *     [int = "port", "8001" !]
 *   [end]
 * [end]
 *
 * →
 *
 * servers:
 *   - host: "10.0.0.1"
 *     port: 8001
 */
YAML.register("map-item", async ({ props, ast, depth = 0, renderChild }) => {
	let combined = "";
	for (const child of ast.body) {
		combined += await renderChild(child, { depth: 0, inMapItem: true });
	}
	const pairs = combined.split(ITEM_SEP).map(v => v.trim()).filter(v => v !== "");
	if (pairs.length === 0) return "";
	const seqIndent  = getIndent(depth);
	const bodyIndent = getIndent(depth) + "  ";
	const [first, ...rest] = pairs;
	const restLines = rest.length > 0 ? `\n${rest.map(p => `${bodyIndent}${p}`).join("\n")}` : "";
	return `${seqIndent}- ${first}${restLines}\n`;
}, { handleAst: true });

/**
 * [literal] / [lit] — literal block scalar (|)
 * Preserves newlines exactly as written.
 *
 * [literal = "script"]
 *   echo "hello"
 *   echo "world"
 * [end]
 *
 * →
 *
 * script: |
 *   echo "hello"
 *   echo "world"
 */
YAML.register(["literal", "lit"], ({ props, textContent, depth = 0, inMapItem = false }) => {
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	const childIndent = getIndent(depth + 1);
	const lines = textContent
		.split("\n")
		.map(l => l.trim())
		.filter((l, i, a) => !(i === 0 && l === "") && !(i === a.length - 1 && l === ""))
		.map(l => l === "" ? "" : `${childIndent}${l}`)
		.join("\n");
	if (inMapItem) return `${yamlKey(key)}: |\n${lines}\n${ITEM_SEP}`;
	return `${getIndent(depth)}${yamlKey(key)}: |\n${lines}\n`;
}, { handleAst: true });

/**
 * [folded] / [fold] — folded block scalar (>)
 * Newlines become spaces; blank lines become paragraph breaks.
 *
 * [folded = "description"]
 *   This is a long
 *   description.
 * [end]
 *
 * →
 *
 * description: >
 *   This is a long
 *   description.
 */
YAML.register(["folded", "fold"], ({ props, textContent, depth = 0, inMapItem = false }) => {
	const key = safeArg$1({ props, index: 0, key: "key", fallBack: "" });
	const childIndent = getIndent(depth + 1);
	const lines = textContent
		.split("\n")
		.map(l => l.trim())
		.filter((l, i, a) => !(i === 0 && l === "") && !(i === a.length - 1 && l === ""))
		.map(l => l === "" ? "" : `${childIndent}${l}`)
		.join("\n");
	if (inMapItem) return `${yamlKey(key)}: >\n${lines}\n${ITEM_SEP}`;
	return `${getIndent(depth)}${yamlKey(key)}: >\n${lines}\n`;
}, { handleAst: true });

/**
 * Unknown tag — tag name becomes the YAML key, first positional arg is the value.
 * Type is inferred: number → raw, true/false → boolean, everything else → quoted string.
 *
 * [greeting = "Hello" !]    → greeting: "Hello"
 * [price = 99.99 !]         → price: 99.99
 * [active = true !]         → active: true
 * [label]My text[end]       → label: "My text"
 */
YAML.getUnknownTag = function (node) {
	const key = node.id;
	return {
		render({ props, textContent, depth = 0, inSeq = false, inMapItem = false }) {
			const raw = String(
				safeArg$1({ props, index: 0, key: "value", fallBack: textContent.trim() })
			).trim();

			let val;
			if (raw === "true" || raw === "false") {
				val = raw;
			} else if (raw !== "" && !isNaN(Number(raw))) {
				val = raw;
			} else {
				val = yamlStr(raw);
			}

			if (inSeq) return `${getIndent(depth)}- ${val}\n`;
			if (inMapItem) return `${yamlKey(key)}: ${val}${ITEM_SEP}`;
			return `${getIndent(depth)}${yamlKey(key)}: ${val}\n`;
		},
		options: { handleAst: true }
	};
};

/**
 * [doc-start] — YAML document start marker (---)
 * [doc-start !]  →  ---
 */
YAML.register("doc-start", () => "---\n", { rules: { is_empty_body: true } });

/**
 * [doc-end] — YAML document end marker (...)
 * [doc-end !]  →  ...
 */
YAML.register("doc-end", () => "...\n", { rules: { is_empty_body: true } });

registerSharedOutputs(YAML);

/**
 * The Text Mapper used for plain-text extraction.
 */
const TEXT = Mapper.define({
	options: {
		trimAndWrapBlocks: false
	},

	/**
	 * Comments are discarded in plain-text output.
	 */
	comment() {
		return "";
	},

	/**
	 * Comment blocks are discarded in plain-text output.
	 */
	commentBlock() {
		return "";
	},

	/**
	 * Runtime logic is discarded in plain-text output.
	 */
	runtimeLogic() {
		return "";
	},

	/**
	 * Returns plain text literally.
	 */
	text(text) {
		return text;
	},

	/**
	 * Fallback for all tags - extracts inner content.
	 */
	getUnknownTag() {
		return {
			render: ({ content }) => content,
			options: {}
		};
	}
});

/**
 * A list of supported output formats for SomMark.
 */
const textFormat = "text";
const htmlFormat = "html";
const markdownFormat = "markdown";
const mdxFormat = "mdx";
const jsonFormat = "json";
const jsoncFormat = "jsonc";
const xmlFormat = "xml";
const csvFormat = "csv";
const tomlFormat = "toml";
const yamlFormat = "yaml";

const formats = {
	textFormat,
	htmlFormat,
	markdownFormat,
	mdxFormat,
	jsonFormat,
	jsoncFormat,
	xmlFormat,
	csvFormat,
	tomlFormat,
	yamlFormat
};

function fileURLToPath(url) {
	if (typeof url !== "string") return url;
	if (url.startsWith("file://")) {
		let p = url.slice(7);
		// On Windows (starts with /C:/ or similar), remove the leading slash:
		if (/^\/[a-zA-Z]:/.test(p)) {
			p = p.slice(1);
		}
		return p;
	}
	return url;
}

/**
 * Resolves a module path relative to a base directory.
 */
const resolveModulePath = (filePath, currentBaseDir) => {
	if (/^https?:\/\//.test(currentBaseDir)) {
		return new URL(filePath, currentBaseDir.endsWith("/") ? currentBaseDir : currentBaseDir + "/").href;
	}
	return posix.resolve(currentBaseDir, filePath);
};

/**
 * Changes a filename or file URL into a full, absolute file path.
 * 
 * @param {string} filename - The name of the file or its URL.
 * @param {Object} [aliases={}] - Custom path aliases for modules.
 * @returns {string} - The corrected absolute path.
 */
const normalizePath = (filename, aliases = {}, cwd = "/") => {
	if (!filename || filename === "anonymous") return cwd;

	// Handle Aliases (like @/components)
	for (const [prefix, replacement] of Object.entries(aliases)) {
		if (filename.startsWith(prefix)) {
			const resolvedPath = posix.resolve(cwd, filename.replace(prefix, replacement));
			return resolvedPath;
		}
	}

	if (filename.startsWith("file://")) {
		try {
			return fileURLToPath(filename);
		} catch (e) {
			return filename;
		}
	}

	return posix.resolve(cwd, filename);
};

const VAR_PATTERN = /SOMMARK_UNRESOLVED_v_(.+?)_SOMMARK/g;
const VAR_PREFIX = "SOMMARK_UNRESOLVED_v_";
const VAR_SUFFIX = "_SOMMARK";

const resolveAstVariables = (nodes, variables) => {
	if (!nodes) return;

	for (const node of nodes) {
		if (node.type === TEXT$1) {
			if (node.text.includes(VAR_PREFIX)) {
				node.text = node.text.replace(VAR_PATTERN, (match, keyAndFallback) => {
					const pipeIdx = keyAndFallback.indexOf('|');
					const key = pipeIdx >= 0 ? keyAndFallback.slice(0, pipeIdx) : keyAndFallback;
					const fallback = pipeIdx >= 0 ? keyAndFallback.slice(pipeIdx + 1) : undefined;
					if (variables[key] !== undefined) {
						if (!variables.__consumed__) {
							Object.defineProperty(variables, "__consumed__", {
								value: new Set(),
								writable: true,
								enumerable: false,
								configurable: true
							});
						}
						variables.__consumed__.add(key);
						return String(variables[key]);
					}
					if (fallback !== undefined) return fallback;
					return match;
				});
			}
		} else if (node.type === BLOCK) {
			// Resolve any unresolved variables in block arguments
			for (const [argKey, argVal] of Object.entries(node.props)) {
				if (typeof argVal !== "string" || !argVal.includes(VAR_PREFIX)) continue;

				if (argVal.startsWith(VAR_PREFIX) && argVal.endsWith(VAR_SUFFIX)) {
					// Entire value is an envelope — resolve to scalar or fallback
					const keyAndFallback = argVal.slice(VAR_PREFIX.length, -VAR_SUFFIX.length);
					const pipeIdx = keyAndFallback.indexOf('|');
					const varKey = pipeIdx >= 0 ? keyAndFallback.slice(0, pipeIdx) : keyAndFallback;
					const fallback = pipeIdx >= 0 ? keyAndFallback.slice(pipeIdx + 1) : undefined;
					if (variables[varKey] !== undefined) {
						node.props[argKey] = variables[varKey];
						if (!variables.__consumed__) {
							Object.defineProperty(variables, "__consumed__", {
								value: new Set(),
								writable: true,
								enumerable: false,
								configurable: true
							});
						}
						variables.__consumed__.add(varKey);
					} else if (fallback !== undefined) {
						node.props[argKey] = fallback;
					}
				} else {
					// Envelope embedded inside a larger string — replace in-place.
					// Unresolved envelopes become "" so they don't pollute class names etc.
					node.props[argKey] = argVal.replace(VAR_PATTERN, (match, keyAndFallback) => {
						const pipeIdx = keyAndFallback.indexOf('|');
						const key = pipeIdx >= 0 ? keyAndFallback.slice(0, pipeIdx) : keyAndFallback;
						const fallback = pipeIdx >= 0 ? keyAndFallback.slice(pipeIdx + 1) : undefined;
						if (variables[key] !== undefined) {
							if (!variables.__consumed__) {
								Object.defineProperty(variables, "__consumed__", {
									value: new Set(),
									writable: true,
									enumerable: false,
									configurable: true
								});
							}
							variables.__consumed__.add(key);
							return String(variables[key]);
						}
						if (fallback !== undefined) return fallback;
						return "";
					});
				}
			}
			if (node.body) {
				resolveAstVariables(node.body, variables);
			}
		}
	}
};

/**
 * Hand-optimized AST cloner.
 * Native structuredClone is extremely slow for basic JSON-like tree data.
 * This helper achieves up to 11x faster performance by cloning only required AST fields.
 */
const cloneAst = (nodes) => {
	if (!nodes) return [];
	const len = nodes.length;
	const copy = new Array(len);
	for (let i = 0; i < len; i++) {
		const node = nodes[i];
		const nodeCopy = {
			type: node.type,
			range: node.range
		};
		if (node.structure !== undefined) nodeCopy.structure = node.structure;
		if (node.text !== undefined) nodeCopy.text = node.text;
		if (node.id !== undefined) nodeCopy.id = node.id;
		if (node.code !== undefined) nodeCopy.code = node.code;
		if (node.isSelfClosing !== undefined) nodeCopy.isSelfClosing = node.isSelfClosing;
		if (node.baseDir !== undefined) nodeCopy.baseDir = node.baseDir;
		if (node.props !== undefined) {
			nodeCopy.props = { ...node.props };
		}
		if (node.body !== undefined) {
			nodeCopy.body = cloneAst(node.body);
		}
		copy[i] = nodeCopy;
	}
	return copy;
};

/**
 * Tags all STATIC_LOGIC and RUNTIME_LOGIC nodes in a subtree with their
 * source module's baseDir so the evaluator can resolve imports correctly.
 */
const tagLogicNodes = (nodes, baseDir) => {
	if (!nodes) return;
	for (const node of nodes) {
		if ((node.type === STATIC_LOGIC || node.type === RUNTIME_LOGIC) && !node.baseDir) {
			node.baseDir = baseDir;
		}
		if (node.body) tagLogicNodes(node.body, baseDir);
	}
};

/**
 * Handles all [import] and [$use-module] blocks in your code.
 * It loads the requested files, checks for errors, and puts the content into the main document.
 * 
 * @param {Object[]} ast - The list of code parts to check.
 * @param {Object} context - Settings like the filename and current format.
 * @returns {Promise<Object[]>} - The final list of code parts with modules loaded.
 */
async function resolveModules(ast, context) {
	const modules = new Map();
	const filename = context.filename || "anonymous";
	const importAliases = context.instance.importAliases || {};
	const absFilename = normalizePath(filename, importAliases, context.instance.cwd || "/");

	// baseDir can be a local path
	const baseDir = context.instance.baseDir || ((filename === "anonymous") ? absFilename : posix.dirname(absFilename));

	// 1. Helper: Trim AST to remove file-boundary whitespace and "ghost" newlines
	const trimAst = (nodes, trimBoundaries = true) => {
		if (!nodes) return [];

		// 1. Filter out whitespace-only text nodes adjacent (directly or through other whitespace)
		// to non-rendering nodes (Comments, Imports, USE_MODULE).
		const nonRenderingTypes = [COMMENT, IMPORT, USE_MODULE];
		let res = nodes.filter((node, idx) => {
			if (node.type !== TEXT$1 || node.text.trim() !== "") return true;

			// Walk backwards through consecutive whitespace nodes to find prev non-whitespace
			let prevIsNonRendering = false;
			for (let j = idx - 1; j >= 0; j--) {
				if (nodes[j].type === TEXT$1 && nodes[j].text.trim() === "") continue;
				prevIsNonRendering = nonRenderingTypes.includes(nodes[j].type);
				break;
			}

			// Walk forwards through consecutive whitespace nodes to find next non-whitespace
			let nextIsNonRendering = false;
			for (let j = idx + 1; j < nodes.length; j++) {
				if (nodes[j].type === TEXT$1 && nodes[j].text.trim() === "") continue;
				nextIsNonRendering = nonRenderingTypes.includes(nodes[j].type);
				break;
			}

			return !(prevIsNonRendering || nextIsNonRendering);
		});

		if (trimBoundaries) {
			// 2. Final pass: trim leading/trailing newlines from the remaining boundary text nodes
			if (res.length > 0 && res[0].type === TEXT$1) {
				res[0].text = res[0].text.replace(/^[\r\n]+/, "");
			}
			if (res.length > 0 && res[res.length - 1].type === TEXT$1) {
				res[res.length - 1].text = res[res.length - 1].text.replace(/[\r\n]+\s*$/, "");
			}

			// 3. Remove any nodes that became purely empty after trimming
			res = res.filter(node => node.type !== TEXT$1 || node.text !== "");
		}

		return res;
	};

	// 2. Helper: Inject Slots with Indentation Propagation
	const injectSlots = (nodes, callerBody) => {
		const result = [];
		for (let i = 0; i < nodes.length; i++) {
			const child = nodes[i];
			if (child.type === SLOT) {
				if (callerBody && callerBody.length > 0) {
					// Detect leading indentation from the preceding text node
					let indentation = "";
					const prev = result[result.length - 1];
					if (prev && prev.type === TEXT$1) {
						const lines = prev.text.split("\n");
						const lastLine = lines[lines.length - 1];
						if (lastLine.trim() === "" && lastLine.length > 0) {
							indentation = lastLine;
						}
					}

					// Clone and Indent caller body if needed
					const indentedBody = callerBody.map(node => {
						if (node.type === TEXT$1 && indentation) {
							return { ...node, text: node.text.split("\n").map((line, idx) => idx === 0 ? line : indentation + line).join("\n") };
						}
						return { ...node };
					});

					result.push(...indentedBody);
				} else {
					result.push(...child.body);
				}
			} else {
				if (child.body && Array.isArray(child.body)) {
					child.body = injectSlots(child.body, callerBody);
				}
				result.push(child);
			}
		}
		return result;
	};

	let hasContentStarted = false;

	const processNodes = async (nodes, currentBaseDir, isTopLevel = false) => {
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];

			// 1. Handle Import Node: [import = alias: "path"]
			if (node.type === IMPORT) {
				if (hasContentStarted || !isTopLevel) {
					runtimeError([`<$red:Module Placement Error:$> Imports must be declared at the top level before any content at line <$yellow:${node.range.start.line + 1}$>`]);
				}

				const alias = Object.keys(node.props).find(k => isNaN(k));
				let filePath = alias ? node.props[alias] : node.props[0];
				if (typeof filePath === "string") filePath = filePath.trim().replace(/^["']|["']$/g, "");

				// 1a. Handle Aliases
				let resolvedPath = filePath;
				for (const [prefix, replacement] of Object.entries(importAliases)) {
					if (filePath.startsWith(prefix)) {
						resolvedPath = posix.resolve(context.instance.cwd || "/", filePath.replace(prefix, replacement));
						break;
					}
				}

				// 1b. Resolve relative to current base (FS)
				const absolutePath = resolveModulePath(resolvedPath, currentBaseDir);

				if (!context.instance.fs) {
					runtimeError([`<$red:Module Error:$> Cannot import <$magenta:${filePath}$> — no filesystem is available.{N}In browser mode, pass a URL-based <$cyan:baseDir$> or a <$cyan:files$> map to enable module loading.`]);
				}

				// Local Path Resolution with Auto-Extension
				let localPath = absolutePath;
				if (!await context.instance.fs.exists(localPath) && !localPath.endsWith(".smark")) {
					const withSmark = localPath + ".smark";
					if (await context.instance.fs.exists(withSmark)) localPath = withSmark;
				}
				if (!await context.instance.fs.exists(localPath)) {
					runtimeError([`<$red:Module Path Error:$> File not found: <$magenta:${filePath}$> at line <$yellow:${node.range.start.line + 1}$>`]);
				}
				let mod = { path: absolutePath, localPath: localPath, type: "smark" };

				const ext = posix.extname(mod.localPath).slice(1);
				if (ext !== "smark") {
					runtimeError([`<$red:Module Extension Error:$> Unsupported extension .${ext} for module <$magenta:${alias}$>. Only .smark files are supported.`]);
				}

				modules.set(alias, { ...mod, used: false, range: node.range });
				nodes.splice(i, 1);
				const next = nodes[i];
				if (next && next.type === TEXT$1 && next.text.startsWith("\n")) {
					next.text = next.text.slice(1);
					if (next.text === "") nodes.splice(i, 1);
				}
				i--;
			}
			// 2. Handle Usage Node: [$use-module = alias]
			else if (node.type === USE_MODULE) {
				hasContentStarted = true;
				const alias = node.props[0] || Object.values(node.props)[0];
				if (!alias || !modules.has(alias)) {
					runtimeError([`<$red:Module Usage Error:$> Undefined module alias <$magenta:${alias}$> at line <$yellow:${node.range.start.line + 1}$>`]);
				}

				const mod = modules.get(alias);
				mod.used = true;

				const stack = context.importStack || [];
				const maxDepth = context.instance.security?.maxDepth ?? 5;
				if (stack.length >= maxDepth) {
					runtimeError([`<$red:Security Error:$> Recursion Guard: Maximum Smark compilation depth exceeded (limit is ${maxDepth}).`]);
				}
				if (stack.includes(mod.path)) {
					runtimeError([`<$red:Circular Dependency Detected$>: ${mod.path}`]);
				}

				const cached = context.instance.moduleCache.get(mod.localPath);
				let expandedNodes;
				if (cached) {
					expandedNodes = trimAst(cloneAst(cached));
				} else {
					const content = await context.instance.fs.readFile(mod.localPath, "utf-8");
					const SomMark = context.instance.constructor;
					const subSmark = new SomMark({
						src: content,
						format: context.format,
						filename: mod.path,
						baseDir: posix.dirname(mod.localPath),
						fs: context.instance.fs,
						mapperFile: context.instance.mapperFile,
						placeholders: context.instance.placeholders,
						variables: {},
						importAliases: context.instance.importAliases,
						customProps: context.instance.customProps,
						fallbackTarget: context.instance.fallbackTarget,
						removeComments: context.instance.removeComments,
						security: context.instance.security,
						showSpinner: context.instance.showSpinner,
						importStack: [...stack, absFilename],
						moduleIdentityToken: context.instance.moduleIdentityToken,
						moduleCache: context.instance.moduleCache
					});

					const subAst = await subSmark.parse();
					tagLogicNodes(subAst, posix.dirname(mod.localPath));
					context.instance.moduleCache.set(mod.localPath, subAst);
					expandedNodes = trimAst(subAst);
				}

				const boundaryNode = {
					type: BLOCK,
					id: context.instance.moduleIdentityToken,
					props: { filename: mod.path },
					body: expandedNodes
				};
				nodes.splice(i, 1, boundaryNode);
				const next = nodes[i + 1];
				if (next && next.type === TEXT$1 && next.text.startsWith("\n")) {
					next.text = next.text.slice(1);
					if (next.text === "") nodes.splice(i + 1, 1);
				}
			}
			// 3. Handle Component Usage: [Alias] ... [end]
			else if (node.type === BLOCK && modules.has(node.id)) {
				hasContentStarted = true;
				const mod = modules.get(node.id);
				mod.used = true;
				const stack = context.importStack || [];
				const maxDepth = context.instance.security?.maxDepth ?? 5;
				if (stack.length >= maxDepth) {
					runtimeError([`<$red:Security Error:$> Recursion Guard: Maximum Smark compilation depth exceeded (limit is ${maxDepth}).`]);
				}
				if (stack.includes(mod.path)) {
					runtimeError([`<$red:Circular Dependency Detected$>: ${mod.path}`]);
				}

				const cached = context.instance.moduleCache.get(mod.localPath);
				let subAst;
				if (cached) {
					subAst = cloneAst(cached);
				} else {
					const content = await context.instance.fs.readFile(mod.localPath, "utf-8");
					const SomMark = context.instance.constructor;
					const subSmark = new SomMark({
						src: content,
						format: context.format,
						filename: mod.path,
						baseDir: posix.dirname(mod.localPath),
						fs: context.instance.fs,
						mapperFile: context.instance.mapperFile,
						placeholders: context.instance.placeholders,
						variables: {}, // Parse without variables to keep the cached AST pure
						importAliases: context.instance.importAliases,
						customProps: context.instance.customProps,
						fallbackTarget: context.instance.fallbackTarget,
						removeComments: context.instance.removeComments,
						security: context.instance.security,
						showSpinner: context.instance.showSpinner,
						importStack: [...stack, absFilename],
						moduleIdentityToken: context.instance.moduleIdentityToken,
						moduleCache: context.instance.moduleCache
					});

					subAst = await subSmark.parse();
					tagLogicNodes(subAst, posix.dirname(mod.localPath));
					context.instance.moduleCache.set(mod.localPath, subAst);
					subAst = cloneAst(subAst);
				}

				// Dynamically resolve variable placeholders inside the cloned AST
				resolveAstVariables(subAst, node.props);

				await processNodes(node.body, currentBaseDir, false);
				const expandedNodes = injectSlots(trimAst(subAst), trimAst(node.body));
				const rootTag = expandedNodes.find(n => n.type === BLOCK);
				if (rootTag) {
					const consumed = node.props.__consumed__ || new Set();

					const publicArgs = Object.fromEntries(
						Object.entries(node.props).filter(([key]) => {
							if (key === "__consumed__") return false;
							if (consumed.has(key)) return false; // THE FIX: Filter if hit by v{}
							return true;
						})
					);
					rootTag.props = { ...rootTag.props, ...publicArgs };
				}

				const boundaryNode = {
					type: BLOCK,
					id: context.instance.moduleIdentityToken,
					props: { filename: mod.path },
					body: expandedNodes
				};
				nodes.splice(i, 1, boundaryNode);
			}
			// 4. Handle Regular Blocks: Process body recursively for nested components and trim whitespace
			else if (node.type === BLOCK) {
				hasContentStarted = true;
				if (node.body && Array.isArray(node.body)) {
					node.body = trimAst(node.body);
					await processNodes(node.body, currentBaseDir, false);
				}
			}

			// 4. Recurse into children (Standard Blocks)
			else {
				if (node.type === TEXT$1 && node.text.trim() === "") ; else if (node.type !== COMMENT) {
					hasContentStarted = true;
				}

				if (node.body && Array.isArray(node.body)) {
					await processNodes(node.body, currentBaseDir, false);
				}
			}
		}
	};

	await processNodes(ast, baseDir, true);

	// 4. Report Unused Imports
	for (const [alias, mod] of modules) {
		if (!mod.used) {
			context.instance.warnings.push({
				type: "UnusedModule",
				message: `Module alias <$magenta:${alias}$> is imported but never used.`,
				range: mod.range
			});
		}
	}

	return ast;
}

/**
 * After full transpilation of the top-level file, apply any v{} fallbacks that
 * remain unresolved. Envelopes with no fallback are kept as-is (debugging signal).
 * Must NOT be called on sub-module ASTs — only on the final top-level AST.
 */
const applyVariableFallbacks = (ast) => resolveAstVariables(ast, {});

/**
 * SomMark Rules Validator
 * 
 * This module ensures the AST matches the expected structure.
 * It focuses on structural integrity (like self-closing tags)
 * while leaving specific patterns to the mapper's discretion.
 */

/**
 * Runs all validation rules against a single code node.
 * 
 * @param {Object} node - The code node to check.
 * @param {Object} target - The rule definition for this node.
 * @param {Object} instance - The current SomMark context.
 */
const runValidations = (node, target, instance) => {
	if (!target || !target.options) return;
	const rules = target.options.rules || {};
	const id = (target.id) ? (Array.isArray(target.id) ? target.id.join(" | ") : target.id) : (node.id || "Unknown");
	const errorRange = node.range ? {
		start: node.range.start,
		end: {
			line: node.range.start.line,
			character: node.range.start.character + (node.id || "").length + 2
		}
	} : null;
	const context = instance ? { src: instance.src, range: errorRange, filename: instance.filename } : null;

	// -- Structural Integrity (Empty Body / Self-Closing) ----------------- //
	const isEmptyBodyTarget = rules.is_empty_body;

	if (isEmptyBodyTarget && node.type === "Block" && !node.isSelfClosing && node.body) {
		const hasContent = node.body.some(child => {
			if (child.type === "Text") {
				return (child.text || "").trim().length > 0;
			}
			return true; // Any other node type (Block, Inline, etc.) counts as content
		});

		if (hasContent) {
			transpilerError(
				[
					"{N}",
					"<$red:[Validation Error]:$>{N}",
					`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:is defined as an empty-body component and cannot have children.$>`
				],
				context
			);
		}
	}

	// -- Arguments Validation (Required Args) ----------------------------- //
	const isStructural = node.type === "Block";
	if (isStructural && rules.required_args && Array.isArray(rules.required_args)) {
		const missingArgs = rules.required_args.filter(arg => {
			if (typeof arg === "number") return node.props[arg] === undefined;
			return node.props[arg] === undefined;
		});

		if (missingArgs.length > 0) {
			transpilerError(
				[
					"{N}",
					`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:is missing required arguments:$> <$red:${missingArgs.join(", ")}$>{N}`,
					`<$blue:Please ensure these arguments are provided in the template usage.$>`
				],
				context
			);
		}
	}

	// -- Directives Validation (Required Directives) ----------------------- //
	if (isStructural && rules.required_directives && Array.isArray(rules.required_directives)) {
		const missingDirectives = rules.required_directives.filter(key => node.directives?.[key] === undefined);

		if (missingDirectives.length > 0) {
			transpilerError(
				[
					"{N}",
					`<$yellow:Identifier$> <$blue:'${id}'$> <$yellow:is missing required directive props:$> <$red:${missingDirectives.map(k => `smark-${k}`).join(", ")}$>{N}`,
					`<$blue:Please ensure these directive props are provided in the template usage.$>`
				],
				context
			);
		}
	}
};

/**
 * Checks every node in the entire document for structural issues.
 * 
 * @param {Object|Array} ast - The Abstract Syntax Tree to validate.
 * @param {Object} mapperFile - The mapper instance containing tag registrations.
 * @param {Object} instance - The current SomMark context.
 * @returns {Object|Array} - The validated AST.
 */
function validateAST(ast, mapperFile, instance) {
	if (!mapperFile) return ast;

	const validateNode = (node) => {
		if (!node) return;

		// Handle filename context updates for module identity tokens
		if (instance?.moduleIdentityToken && node.id === instance.moduleIdentityToken) {
			const oldFilename = instance.filename;
			instance.filename = node.props?.filename || oldFilename;
			if (node.body) {
				node.body.forEach(child => validateNode(child));
			}
			instance.filename = oldFilename;
			return;
		}

		// 1. Identify Target
		if (node.id) {
			let target = null;
			const lowerId = node.id.toLowerCase();
			if (["import", "$use-module", "slot", "for-each"].includes(lowerId)) {
				target = {
					id: lowerId,
					options: {}
				};
			} else {
				target = mapperFile.get(node.id) || (mapperFile.getUnknownTag ? mapperFile.getUnknownTag(node) : null);
			}

			if (target) {
				runValidations(node, target, instance);
			}
		}

		// 2. Recursive Traversal
		if (node.body && Array.isArray(node.body)) {
			node.body.forEach(child => validateNode(child));
		}
	};

	const rootNodes = Array.isArray(ast) ? ast : [ast];
	rootNodes.forEach(node => validateNode(node));

	return ast;
}

// Premium, dependency-free interactive terminal spinner for compilation feedback
const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
let spinnerIndex = 0;
let activeSpinner = null;
let spinnerDepth = 0;

let originalStdoutWrite = null;
let originalStderrWrite = null;
let redrawTimeout = null;

function startSpinner() {
	if (typeof process === "undefined" || !process.stdout?.isTTY) {
		spinnerDepth++;
		return;
	}
	if (!activeSpinner) {
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

function stopSpinner() {
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

		if (typeof process !== "undefined" && process.stdout) {
			// Clear the spinner line and restore the terminal cursor
			process.stdout.write("\r\x1b[K\x1b[?25h");
		}
		}
	}
}

let defaultFs = null;
let defaultCwd = "/";
let defaultFindAndLoadConfig = async () => ({});
let defaultResolvePath = (p) => p; // identity in browser; overridden to path.resolve in Node.js

const isURL = (s) => typeof s === "string" && /^https?:\/\//.test(s);

function setDefaultCwd(cwd) {
	defaultCwd = cwd;
}

function setDefaultFs(fs) {
	defaultFs = fs;
	Evaluator$1.setDefaultFs(fs);
}

function setDefaultEnv(env) {
	Evaluator$1.setDefaultEnv(env);
}

function setDefaultAsyncLocalStorage(cls) {
	Evaluator$1.setDefaultAsyncLocalStorage(cls);
}

function setDefaultResolvePath(fn) {
	defaultResolvePath = fn;
}

const resolveFilename = (f) => (f && f !== "anonymous") ? defaultResolvePath(f) : f;

function setDefaultFindAndLoadConfig(fn) {
	defaultFindAndLoadConfig = fn;
}

/**
 * The SomMark Core Engine.
 * Processes SomMark code and turns it into different formats.
 */
class SomMark {
	static Mapper = Mapper;
	/**
	 * Creates a new SomMark engine.
	 * 
	 * @param {Object} options - Settings for the engine.
	 * @param {string} options.src - The SomMark code to process.
	 * @param {string} options.format - The final format you want (like 'html' or 'markdown').
	 * @param {Mapper|null} [options.mapperFile=null] - Custom rules for formatting.
	 * @param {string} [options.filename="anonymous"] - The name of the file, used for errors and settings.
	 * @param {boolean} [options.removeComments=true] - If true, comments will be removed from the final code.
	 * @param {Object} [options.placeholders={}] - Values to use for p{placeholders}.
	 * @param {Array<string>} [options.customProps=[]] - Allowed custom HTML attributes.
	 * @param {Object} [options.importAliases={}] - Custom path aliases for modules.
	 * @param {Array<string>} [options.importStack=[]] - Tracking for circular dependencies.
	 * @param {string} [options.baseDir=null] - The base directory for resolving relative paths.
	 */
	constructor(options = {}) {
		const { src, ast = null, format, mapperFile = null, filename = "anonymous", removeComments = true, placeholders = {}, customProps = [], fallbackTarget = true, outputValidator = null, importAliases = {}, importStack = [], baseDir = null, moduleCache = null, showSpinner = true, security = {}, dualOutput = false, moduleIdentityToken = null } = options;
		this.rawSettings = options;
		this.src = src;
		this.ast = ast;
		this.targetFormat = format;
		this.mapperFile = mapperFile;
		this.filename = resolveFilename(filename);
		this.removeComments = removeComments;
		this.placeholders = placeholders;
		this.customProps = customProps;
		this.dualOutput = dualOutput;
		this.cwd = options.baseDir || (options.files ? "/" : defaultCwd);
		this.fs = options.fs
			|| (options.files ? new VirtualFS(options.files) : null)
			|| (isURL(options.baseDir) ? new FetchFS(options.baseDir) : defaultFs);

		// Validate fallbackTarget — "style" is accepted as an alias for true (backward compat)
		const VALID_FALLBACK_TARGETS = new Set([true, false, "style"]);
		if (!VALID_FALLBACK_TARGETS.has(fallbackTarget)) {
			runtimeError([
				`{line}<$red:Invalid fallbackTarget$>: <$green:'${fallbackTarget}'$> <$yellow:is not a valid value.$>`,
				`{N}<$yellow:Use$> <$green:true$> <$yellow:or$> <$green:false$><$yellow:.$>{line}`
			]);
		}
		this.fallbackTarget = fallbackTarget === "style" ? true : fallbackTarget;
		this.outputValidator = outputValidator;
		this.importAliases = importAliases;
		this.importStack = importStack;
		this.baseDir = baseDir;
		this.moduleCache = moduleCache || new Map();
		this.showSpinner = showSpinner;
		this.security = {
			allowRaw: security?.allowRaw !== false,
			maxDepth: security?.maxDepth ?? 5,
			timeout: security?.timeout ?? 5000,
			sanitize: typeof security?.sanitize === "function" ? security.sanitize : null,
			allowFetch: security?.allowFetch !== false,
			allowHttp: security?.allowHttp === true,
			allowedOrigins: Array.isArray(security?.allowedOrigins) ? security.allowedOrigins.map(o => o.toLowerCase()) : null,
			allowedExtensions: Array.isArray(security?.allowedExtensions) ? security.allowedExtensions.map(e => e.toLowerCase()) : null,
			env: Array.isArray(security?.env) ? security.env : []
		};
		this.warnings = [];
		this._prepared = false;

		// Create a random token to safely wrap data
		this.moduleIdentityToken = moduleIdentityToken || `$_SM_MOD_${Math.random().toString(36).slice(2, 7)}_$`;

		this.Mapper = Mapper;

		const mapperFiles = { [htmlFormat]: HTML, [markdownFormat]: MARKDOWN, [mdxFormat]: MDX, [jsonFormat]: Json, [jsoncFormat]: Jsonc, [xmlFormat]: XML, [csvFormat]: CSV, [tomlFormat]: TOML, [yamlFormat]: YAML, [textFormat]: TEXT };

		if (!this.mapperFile && this.targetFormat) {
			const DefaultMapper = mapperFiles[this.targetFormat];
			if (DefaultMapper) {
				this.mapperFile = DefaultMapper.clone();
			}
		} else if (this.mapperFile) {
			this.mapperFile = this.mapperFile.clone();
		}

		if (this.mapperFile) {
			this.mapperFile.options.removeComments = this.removeComments;
			this.mapperFile.options.moduleIdentityToken = this.moduleIdentityToken;
			this.mapperFile.options.filename = this.filename;

			this.mapperFile.options.usePrivateAttributes = this.usePrivateAttributes;
			this.mapperFile.options.fallbackTarget = this.fallbackTarget;

			// Initialize custom props whitelist
			if (this.customProps && this.customProps.length > 0) {
				const props = Array.isArray(this.customProps) ? this.customProps : [this.customProps];
				props.forEach(prop => this.mapperFile.customProps.add(prop));
			}
		}

		this._initializeMappers();
	}


	/**
	 * Adds a new rule or changes an existing one.
	 * 
	 * @param {string} id - The name of the tag.
	 * @param {Function} render - The function that formats the tag.
	 * @param {Object} [options] - Extra settings for the tag.
	 */
	register = (id, render, options) => {
		this.mapperFile.register(id, render, options);
	};

	/**
	 * Copies rules from other mappers.
	 * 
	 * @param {...Mapper} mappers - The mappers to copy from.
	 */
	inherit = (...mappers) => {
		this.mapperFile.inherit(...mappers);
	};

	/**
	 * Gets a rule by its name.
	 * 
	 * @param {string} id - The tag name.
	 * @returns {Object|null}
	 */
	get = id => {
		return this.mapperFile.get(id);
	};

	removeOutput = id => {
		this.mapperFile.removeOutput(id);
	};

	clear = () => {
		this.mapperFile.clear();
	};

	_initializeMappers() {
		if (!this.targetFormat) {
			runtimeError(["{line}<$red:Undefined Format$>: <$yellow:Format argument is not defined.$>{line}"]);
		}

		if (!this.mapperFile && this.targetFormat) {
			runtimeError([`{line}<$red:Unknown Format$>: <$yellow:Mapper for format '${this.targetFormat}' not found.$>{line}`]);
		}
	}

	reportWarning(message) {
		this.warnings.push(message);
	}


	_ensurePrepared() {
		if (this._prepared) return;

		// Final check
		if (!this.mapperFile) {
			runtimeError([
				`{line}<$red:Unknown Format$>: <$yellow:No mapper found for format:$> <$green:'${this.targetFormat}'$>`,
				`{N}<$yellow:Make sure you have registered format mapper correctly.$>{line}`
			]);
		}

		this._prepared = true;
	}

	/**
	 * Breaks the code into small pieces called tokens.
	 * 
	 * @param {string} [src=this.src] - The code to break apart.
	 * @returns {Promise<Array<Object>>} - The list of tokens.
	 */
	async lex(src = this.src) {
		this._ensurePrepared();
		if (src !== this.src) this.src = src;
		let tokens = lexer(this.src, this.filename);
		return tokens;
	}

	lexSync(src = this.src) {
		this._ensurePrepared();
		if (src !== this.src) this.src = src;
		let tokens = lexer(this.src, this.filename);
		return tokens;
	}

	/**
	 * Organizes the code into a tree structure.
	 * Also handles modules and checks for errors.
	 * 
	 * @param {string} [src=this.src] - Optional source override.
	 * @returns {Promise<Array<Object>>} - The final code tree.
	 */
	async parse(src = this.src) {
		const tokens = await this.lex(src);
		let ast = parser(tokens, this.filename, this.placeholders, {});

		ast = await resolveModules(ast, {
			mapperFile: this.mapperFile,
			filename: this.filename,
			format: this.targetFormat,
			instance: this,
			importStack: this.importStack
		});

		if (this.mapperFile) {
			validateAST(ast, this.mapperFile, this);
		}

		return ast;
	}

	parseSync(src = this.src) {
		this._ensurePrepared();
		if (src !== this.src) this.src = src;
		const tokens = lexer(this.src, this.filename);
		let ast = parser(tokens, this.filename, this.placeholders, {});

		if (this.mapperFile) {
			validateAST(ast, this.mapperFile, this);
		}

		return ast;
	}

	/**
	 * Turns the SomMark code into the final format.
	 * 
	 * @param {string} [src=this.src] - Optional source override.
	 * @returns {Promise<string>} - The finished code.
	 */
	async transpile(src = this.src) {
		if (src !== this.src) this.src = src;
		this._ensurePrepared();

		if (this.showSpinner) startSpinner();
		try {
			const ast = this.ast || await this.parse(src);
			applyVariableFallbacks(ast);
			let result = await transpiler({
				ast,
				format: this.targetFormat,
				mapperFile: this.mapperFile,
				security: this.security,
				settings: this.rawSettings,
				dualOutput: this.dualOutput,
				instance: this
			});

			if (this.outputValidator && typeof this.outputValidator === "function") {
				await this.outputValidator(result);
			}

			return result;
		} finally {
			if (this.showSpinner) stopSpinner();
		}
	}


}

/**
 * A quick way to break code into tokens.
 * Uses HTML settings by default.
 * 
 * @param {string} src - The raw SomMark source.
 * @param {string} [filename="anonymous"] - Filename for error context.
 * @returns {Promise<Array<Object>>} - The list of tokens.
 */
const lex = async (src, filename = "anonymous") => {
	if (src === undefined || src === null) {
		runtimeError([`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for tokenization.$>{line}`]);
	}
	if (typeof src !== "string") {
		runtimeError([`{line}<$red:Invalid Source Type:$> <$yellow:The 'src' argument must be a string, received ${typeof src}.$>{line}`]);
	}
	return lexer(src, resolveFilename(filename));
};

/**
 * A quick way to organize code into a tree.
 * Uses HTML settings by default.
 * 
 * @param {string} src - The raw SomMark source.
 * @param {string} [filename="anonymous"] - Filename for error context.
 * @returns {Promise<Array<Object>>} - The final code tree.
 */
async function parse(src, filename = "anonymous") {
	if (src === undefined || src === null) {
		runtimeError([`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for parsing.$>{line}`]);
	}
	if (typeof src !== "string") {
		runtimeError([`{line}<$red:Invalid Source Type:$> <$yellow:The 'src' argument must be a string, received ${typeof src}.$>{line}`]);
	}
	return await new SomMark({ src, filename, format: textFormat }).parse();
}

/**
 * Transpiles SomMark code to a target format.
 * 
 * @param {Object} options - Transpilation options.
 * @param {string} options.src - Raw source code.
 * @param {string} [options.format="html"] - Target format.
 * @param {string} [options.filename="anonymous"] - Filename for context.
 * @param {Mapper|null} [options.mapperFile=null] - Custom rules for formatting.
 * @param {boolean} [options.removeComments=true] - Strip comments.
 * @param {Object} [options.placeholders={}] - Global placeholders.
 * @param {Array<string>} [options.customProps=[]] - Custom attribute whitelist.
 * @param {Object} [options.importAliases={}] - Custom path aliases for modules.
 * @returns {Promise<string>} - Transpiled output.
 */
async function transpile(options = {}) {
	if (typeof options !== "object" || options === null) {
		runtimeError([`{line}<$red:Invalid Options:$> <$yellow:The options argument must be a non-null object.$>{line}`]);
	}
	const { src, ast, format } = options;

	if (format === undefined || format === null) {
		runtimeError([`{line}<$red:Missing Target Format:$> <$yellow:The 'format' parameter is required for transpilation (e.g. 'html', 'markdown', 'xml', 'mdx', 'json', etc.).$>{line}`]);
	}

	if ((src === undefined || src === null) && (ast === undefined || ast === null)) {
		runtimeError([`{line}<$red:Missing Input:$> <$yellow:Either 'src' or 'ast' must be provided for transpilation.$>{line}`]);
	}

	const sm = new SomMark(options);
	return await sm.transpile();
}

/**
 * A quick, synchronous way to get tokens.
 * 
 * @param {string} src - Raw source code.
 * @param {string} [filename="anonymous"] - Filename for error context.
 * @returns {Array<Object>} - The list of tokens.
 */
const lexSync = (src, filename = "anonymous") => {
	if (src === undefined || src === null) {
		runtimeError([`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for tokenization.$>{line}`]);
	}
	if (typeof src !== "string") {
		runtimeError([`{line}<$red:Invalid Source Type:$> <$yellow:The 'src' argument must be a string, received ${typeof src}.$>{line}`]);
	}
	return lexer(src, resolveFilename(filename));
};

/**
 * A quick, synchronous way to get the code tree.
 * 
 * @param {string} src - Raw source code.
 * @param {Object} [options={}] - Parsing options.
 * @returns {Array<Object>} - The code tree.
 */
const parseSync = (src, filename = "anonymous") => {
	if (src === undefined || src === null) {
		runtimeError([`{line}<$red:Missing Source:$> <$yellow:The 'src' argument is required for parsing.$>{line}`]);
	}
	if (typeof src !== "string") {
		runtimeError([`{line}<$red:Invalid Source Type:$> <$yellow:The 'src' argument must be a string, received ${typeof src}.$>{line}`]);
	}
	const resolved = resolveFilename(filename);
	const tokens = lexer(src, resolved);
	return parser(tokens, resolved);
};

async function findAndLoadConfig(targetPath) {
	return await defaultFindAndLoadConfig(targetPath);
}
setCompilerClass(SomMark);

class AsyncLocalStorage {
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

setDefaultFs(null);
setDefaultCwd("/");
setDefaultEnv(null);
setDefaultAsyncLocalStorage(AsyncLocalStorage);

/**
 * Resolves a relative path into a full URL using the current document location.
 * Use this to set `baseDir` when loading .smark modules via fetch in the browser.
 *
 * @param {string} relativePath - Path relative to the HTML document (e.g. "./templates/").
 * @returns {string} Absolute URL string suitable for use as `baseDir`.
 *
 * @example
 * import SomMark, { resolveBaseDir } from "sommark/browser";
 * const engine = new SomMark({ src, format: "html", baseDir: resolveBaseDir("./templates/") });
 */
function resolveBaseDir(relativePath = "./") {
    if (typeof document === "undefined") {
        throw new Error(
            "[SomMark] resolveBaseDir() can only be called in a browser environment.\n" +
            "In Node.js, pass a file path directly as 'baseDir' instead."
        );
    }

    if (typeof relativePath !== "string" || relativePath.trim() === "") {
        throw new Error(
            "[SomMark] resolveBaseDir() expects a non-empty string path, " +
            `but received: ${JSON.stringify(relativePath)}`
        );
    }

    try {
        return new URL(relativePath, document.baseURI).href;
    } catch (err) {
        throw new Error(
            `[SomMark] resolveBaseDir() could not resolve path '${relativePath}' ` +
            `against document URL '${document.baseURI}'.\n${err.message}`
        );
    }
}

/**
 * Injects compiled HTML into a container and activates any <script> tags inside it.
 * Browsers intentionally skip scripts inserted via innerHTML — this re-creates each
 * one as a live DOM element so they execute normally.
 *
 * @param {HTMLElement} container - The element to render into.
 * @param {string} html - The compiled HTML string.
 *
 * @example
 * import SomMark, { renderCompiledHTML } from "sommark/browser";
 * const html = await new SomMark({ src, format: "html" }).transpile();
 * renderCompiledHTML(document.getElementById("output"), html);
 */
function renderCompiledHTML(container, html) {
    if (typeof document === "undefined") {
        throw new Error(
            "[SomMark] renderCompiledHTML() can only be called in a browser environment."
        );
    }
    if (!(container instanceof HTMLElement)) {
        throw new TypeError(
            "[SomMark] renderCompiledHTML() expects an HTMLElement as the first argument, " +
            `but received: ${Object.prototype.toString.call(container)}`
        );
    }
    if (typeof html !== "string") {
        throw new TypeError(
            "[SomMark] renderCompiledHTML() expects a string as the second argument, " +
            `but received: ${Object.prototype.toString.call(html)}`
        );
    }

    container.innerHTML = html;

    for (const inertScript of container.querySelectorAll("script")) {
        const liveScript = document.createElement("script");
        for (const { name, value } of inertScript.attributes) {
            liveScript.setAttribute(name, value);
        }
        liveScript.textContent = inertScript.textContent;
        inertScript.replaceWith(liveScript);
    }
}

export { CSV, Evaluator$1 as Evaluator, formats as FORMATS, HTML, Json, Jsonc, MARKDOWN, MDX, Mapper, TOKEN_TYPES, TOML, XML, YAML, SomMark as default, enableColor, findAndLoadConfig, labels, lex, lexSync, parse, parseSync, preprocessRuntimeLogic, registerSharedOutputs, renderCompiledHTML, resolveBaseDir, safeArg$1 as safeArg, setDefaultAsyncLocalStorage, setDefaultCwd, setDefaultEnv, setDefaultFindAndLoadConfig, setDefaultFs, setDefaultResolvePath, transpile };
