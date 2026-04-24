/**
 * Registers shared utility tags across HTML, Markdown, and MDX mappers.
 * @param {Mapper} mapper - The mapper instance to register tags on.
 */
export function registerSharedOutputs(mapper) {
    // 1. 'raw' - AtBlock that return the raw, unparsed content.
    mapper.register("raw", ({ content }) => content, { 
        type: "AtBlock",
        escape: false 
    });

    // 2. 'css' - An Inline tag that applies inline styles to its content.
    // Usage: (text)->(css: "color: red")
    mapper.register("css", ({ args, content }) => {
        let style = mapper.safeArg({ args, index: 0, key: "style", fallBack: "" });
        style = style.split(";").map(s => s.trim().split(":").map(s => s.trim()).join(":")).join(";");
        return mapper.tag("span").attributes({ style }).body(content);
    }, { 
        type: "Inline" 
    });

}
