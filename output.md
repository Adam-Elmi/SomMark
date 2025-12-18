#  SomMark
Hello **Visitor** , welcome to SomMark!
SomMark is a clean, human-readable markup language designed for documentation.

To install the CLI:

``` sh
npm install -g sommark
sommark --version
```

Next, create your first file:

``` sh
echo "[Doc]\nHello SomMark!\n[end]" > example.smark
```

Now transpile it:

``` sh
sommark example.smark --out example.html
```
`[Hello Adam]`
More info at [SomMark Docs](https://sommark.dev/docs) .
