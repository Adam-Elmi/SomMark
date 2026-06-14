export const SVG_ELEMENTS = new Set([
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
