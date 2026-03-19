import SomMark, { BUILT_IN_PLUGINS } from "../../index.js";
import { loadConfig } from "../helpers/config.js";
import { formatMessage } from "../../core/errors.js";

/**
 * List Plugins Command
 * smark list plugins
 * smark list --internal plugins
 * smark list --external plugins
 */
export async function runListPlugins(args) {
    const config = await loadConfig();

    const sm = new SomMark({
        src: "",
        format: "html",
        plugins: config.plugins,
        excludePlugins: config.excludePlugins,
        priority: config.priority
    });

    const enabledPlugins = sm.plugins;

    // Filter flags
    const showInternal = args.includes("--internal") || args.includes("-i");
    const showExternal = args.includes("--external") || args.includes("-e");
    const showAll = (!showInternal && !showExternal) || (args.length === 1 && args[0] === "plugins");

    console.log(formatMessage(`{N}<$yellow:SomMark Enabled Plugins:$>{N}`));

    let found = false;

    // 1. Internal Plugins
    if (showInternal || showAll) {
        const internal = enabledPlugins.filter(p => {
            return BUILT_IN_PLUGINS.some(bp => bp.name === p.name);
        });

        if (internal.length > 0) {
            console.log(formatMessage(`  <$magenta:Internal Plugins (Built-in):$>{N}`));
            internal.forEach(p => {
                const pluginObj = BUILT_IN_PLUGINS.find(bp => bp.name === p.name);
                printPluginInfo(p.name, pluginObj);
            });
            found = true;
        }
    }

    // 2. External Plugins
    if (showExternal || showAll) {
        const external = enabledPlugins.filter(p => {
            return !BUILT_IN_PLUGINS.some(bp => bp.name === p.name);
        });

        if (external.length > 0) {
            console.log(formatMessage(`${found ? "{N}" : ""}  <$magenta:External Plugins (User-defined):$>{N}`));
            external.forEach(p => {
                printPluginInfo(p.name || "Unknown", p);
            });
            found = true;
        }
    }

    if (!found) {
        console.log(formatMessage(`  <$red:No plugins enabled or matching the filter.$>{N}`));
    } else {
        console.log("");
    }
}

/**
 * List Pipeline Command
 * smark list pipeline
 */
export async function runListPipeline() {
    const config = await loadConfig();
    const sm = new SomMark({
        src: "",
        format: "html", // Default format
        plugins: config.plugins,
        priority: config.priority
    });

    const pipeline = sm.pluginManager.plugins;

    console.log(formatMessage(`{N}<$yellow:SomMark Execution Pipeline:$>{N}`));

    const phases = [
        { name: "1. Preprocessors (Global)", type: "preprocessor", scope: "top-level" },
        { name: "2. Preprocessors (Scoped)", type: "preprocessor", scope: "arguments" },
        { name: "3. After Lexer (Tokens)", type: ["lexer", "after-lexer"] },
        { name: "4. AST Handlers (Parser Hooks)", type: ["parser", "on-ast"] },
        { name: "5. Mapper Extensions (Rules)", type: "mapper" },
        { name: "6. Output Transformers (Final)", type: ["transform", "postprocessor"] }
    ];

    phases.forEach((phase, index) => {
        const types = Array.isArray(phase.type) ? phase.type : [phase.type];
        const matched = pipeline.filter(p => {
            const pTypes = Array.isArray(p.type) ? p.type : [p.type];
            const typeMatch = pTypes.some(t => types.includes(t));
            const scopeMatch = !phase.scope || p.scope === phase.scope;
            return typeMatch && scopeMatch;
        });

        console.log(formatMessage(`  <$magenta:${phase.name}$>`));
        if (matched.length > 0) {
            matched.forEach(p => {
                console.log(formatMessage(`    <$green:└── ${p.name}$> <$cyan:[${Array.isArray(p.type) ? p.type.join(", ") : p.type}]$>`));
            });
        } else {
            console.log(formatMessage(`    <$yellow: (None registered)$>`));
        }
        if (index < phases.length - 1) console.log("");
    });
    console.log("");
}

function printPluginInfo(name, pluginObj) {
    const author = pluginObj?.author || "Unknown";
    const desc = pluginObj?.description || "No description provided.";
    console.log(formatMessage(`    <$green:└── ${name}$> - <$cyan:by ${author}$>`));
    console.log(formatMessage(`      <$yellow:${desc}$>`));
}
