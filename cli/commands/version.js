// ###################
// -v and the header
// ###################

import pkg from "../../package.json" with { type: "json" };

export const printVersion = () => console.log(pkg.version);

export const printHeader = () => {
	console.log([
		`ArcMoon-${pkg.version}`,
		"ArcMoon is a template language that compiles to HTML.",
		"Run \"arcmoon --help\" for commands."
	].join("\n"));
};
