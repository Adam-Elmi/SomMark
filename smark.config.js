export default {
	outputFile: "output",
	outputDir: "./",
	mappingFile: null,
    plugins: [
        "comment-remover",
        { name: "self-closing", options: { all: true } }
    ]
};
