#  SomMark
Hello **Visitor** , welcome to SomMark!
SomMark is a clean, human-readable markup language designed for documentation.

To install the CLI:

``` sh
npm install -g sommark
smark -v
```

Next, create your first file:

``` sh
echo "[Doc]
Hello SomMark!
[end]" > example.smark
```

Now transpile it:

``` sh
smark --html ./example.smark -o output.html ./generate
```
`[Hello Adam]`
More info at [SomMark Docs](https://sommark.dev/docs) .
