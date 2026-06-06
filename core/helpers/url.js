export function fileURLToPath(url) {
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
