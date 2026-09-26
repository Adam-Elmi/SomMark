// ###################
// Closest name, for "did you mean ...?"
// ###################

// ###################
// Edits between two names; swapping two letters counts as one
// ###################
const distance = (a, b) => {
	const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
	for (let j = 1; j <= b.length; j++) d[0][j] = j;
	for (let i = 1; i <= a.length; i++) {
		for (let j = 1; j <= b.length; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
			if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
		}
	}
	return d[a.length][b.length];
};

// ###################
// At most 2 edits away; on a tie, same first letter wins
// ###################
export default function closest(name, names) {
	let best = null;
	let bestScore = Infinity;
	for (const n of names) {
		const d = distance(name, n);
		if (d > 2) continue;
		const score = d * 2 + (n[0] === name[0] ? 0 : 1);
		if (score < bestScore) [best, bestScore] = [n, score];
	}
	return best;
}
