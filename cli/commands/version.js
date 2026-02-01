import projectJson from "../../package.json" with { type: "json" };

// ========================================================================== //
//  Version Command                                                           //
// ========================================================================== //

export function printVersion() {
    if (projectJson && projectJson.version) {
        console.log(projectJson.version);
    }
}

export function printHeader() {
    console.log(
        [
            `SomMark-${projectJson.version}`,
            "SomMark is a structural markup language for writing structured documents.",
            "Copyright (C) Adam Elmi",
            "Github: https://github.com/Adam-Elmi/SomMark"
        ]
            .filter(value => value !== "")
            .join("\n")
    );
}
