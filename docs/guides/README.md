# Guides

Step-by-step walkthroughs for building things with SomMark.

| Guide | What it covers |
| ----- | -------------- |
| [Creating an HTML Mapper](html-mapper.md) | Build a mapper that outputs HTML — `this.tag()`, `getUnknownTag`, `escape: false`, `isSelfClosing`, and why `handleAst` is rarely needed |
| [Creating a YAML Mapper](yaml-mapper.md) | Build a mapper that outputs YAML — `handleAst: true`, depth tracking, `inSeq`/`inMapItem` context, `[map-item]` assembly, and build-time validation |

The two guides are designed to be read together. HTML shows the simple pattern
(wrap content, no context needed). YAML shows the advanced pattern (walk
children, pass context through `renderChild`). Reading both gives you a
complete picture of how mappers work.
