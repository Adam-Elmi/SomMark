import { COMMENT } from "../labels.js";

/**
 * Built-in plugin to remove all comments from the AST.
 * Active by default.
 */
export default {
    name: "comment-remover",
    type: "on-ast",
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
