import projectJson from "../../package.json" with { type: "json" };

// ========================================================================== //
//  Version Command                                                           //
// ========================================================================== //

/**
 * Prints the current version of SomMark (from package.json) to the console.
 */
export function printVersion() {
    if (projectJson && projectJson.version) {
        console.log(projectJson.version);
    }
}

/**
 * Prints the SomMark header/banner with version, description, and copyright information.
 */
export function printHeader() {
    console.log(
        [
            `SomMark-${projectJson.version}`,
            "SomMark is a structural markup language for writing structured content.",
            "Copyright (C) Adam Elmi",
            "Github: https://github.com/Adam-Elmi/SomMark"
        ]
            .filter(value => value !== "")
            .join("\n")
    );
}
