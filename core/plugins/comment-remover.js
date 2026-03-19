import { COMMENT } from "../labels.js";

/**
 * Comment Remover Plugin
 * Removes all comments from the document so they don't appear in the final output.
 */
export default {
    name: "comment-remover",
    type: "on-ast",
    author: "Adam-Elmi",
    description: "Removes all comments from the document so they don't appear in the final output.",
    onAst: function (ast) {
        // ========================================================================== //
        //  Recursive function to filter out comments                               //
        // ========================================================================== //
        const cleanNodes = (nodes) => {
            if (!Array.isArray(nodes)) return nodes;

            return nodes
                .filter(node => node.type !== COMMENT)
                .map(node => {
                    if (node.body && Array.isArray(node.body)) {
                        return {
                            ...node,
                            body: cleanNodes(node.body)
                        };
                    }
                    return node;
                });
        };
        // ========================================================================== //
        //  Handle both root array and individual node objects                        //
        // ========================================================================== //
        if (Array.isArray(ast)) {
            return cleanNodes(ast);
        }

        if (ast && ast.body) {
            return {
                ...ast,
                body: cleanNodes(ast.body)
            };
        }

        return ast;
    }
};
