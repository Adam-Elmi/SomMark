# HTML Mapper

The HTML Mapper converts SomMark blocks into valid HTML5. Any block name that is not registered is output as an HTML element with that name — so `[div]`, `[section]`, `[article]`, and all other HTML elements work without any setup.

---

## Advantages over Raw HTML

| Feature | SomMark | Raw HTML |
| :--- | :--- | :--- |
| **Module system** | `[import]` splits files into reusable parts | No file includes |
| **Component system** | `[slot]` + `[import]` = reusable layouts where you choose what content goes inside | No components |
| **Placeholder blocks** | `p{key}` injects data at build time | No variables |
| **Component props** | `v{key}` passes different values into imported components | Every component always outputs the same thing |
| **Compile-time logic** | `${}$` runs JS at build time in a safe separate environment (`static` keyword is optional) | No build-time logic |
| **Runtime JS scoping** | `runtime ${}$` scopes scripts to their parent element | Manual DOM queries |
| **Looping** | `[for-each]` generates repeated content at build time | No looping |
| **Consistent syntax** | Every block follows the same `[name = props]body[end]` pattern | Different rules per element |

---

## 1. Native HTML Elements

Any block name that is not registered is output as an HTML element with that name. You never need to register standard elements.

```ini
[section = padding: "20px"]
  [article]
    [header][h1]Article Title[end][end:header]
    [p]Standard HTML5 article structure.[end]
  [end:article]
[end:section]
```

---

## 2. Props to Attributes

The HTML Mapper looks at each prop and decides whether it goes in the HTML attribute list or in the `style` attribute.

### Unknown Props Go to Style

If a prop is not a known HTML attribute (like `color`, `fontSize`, or `padding`), SomMark moves it into `style` automatically.

Props can be written in **camelCase** — SomMark converts them to the correct HTML/CSS form (`backgroundColor` → `background-color`, `onClick` → `onclick`, `dataId` → `data-id`).

If you pass both a `style` prop and extra CSS props, SomMark combines them:

```ini
[div = style: "opacity: 0.5", color: "red", margin: "10px"] ... [end]
```

```html
<div style="opacity: 0.5;color:red;margin:10px;"> ... </div>
```

```ini
[button =
  style: "transition: 0.3s",
  backgroundColor: "green",
  color: "white",
  border: "none",
  padding: "10px 20px"
]Click Me[end:button]
```

```html
<button style="transition: 0.3s;background-color:green;color:white;border:none;padding:10px 20px;">Click Me</button>
```

### Custom Props (`customProps`)

Props that are not standard HTML attributes land in `style` by default. If you want them output as real HTML attributes, list them in `customProps`.

> Standard `data-*`, `on*`, and `aria-*` attributes always work as attributes — no setup needed.

```javascript
const sm = new SomMark({
  src: source,
  format: "html",
  customProps: ["variant", "theme"]
});
```

```ini
[button = variant: "primary", theme: "dark", data-id: "123"]Click[end]
```

```html
<button variant="primary" theme="dark" data-id="123">Click</button>
```

Without `customProps`, `variant` and `theme` would land in `style`.

### Turn Off Style Fallback (`fallbackTarget: false`)

To output all props as plain HTML attributes with no style fallback, set `fallbackTarget: false`:

```javascript
const sm = new SomMark({
  src: source,
  format: "html",
  fallbackTarget: false
});
```

```ini
[button = variant: "primary", theme: "dark"]Click[end]
```

```html
<button variant="primary" theme="dark">Click</button>
```

---

## 3. Built-in Blocks

These special blocks come built-in with the HTML Mapper.

### `[DOCTYPE]` / `[doctype]`

Outputs the HTML5 doctype line.

```ini
[DOCTYPE !]
```

```html
<!DOCTYPE html>
```

### `[head]`

Outputs the `<head>` element. Any CSS variables you define in `[Root]` are added automatically as a `:root` style block.

```ini
[head]
  [title]My Page[end]
  [meta = charset: "utf-8" !]
[end:head]
```

```html
<head>
  <style>:root { /* collected CSS variables */ }</style>
  <title>My Page</title>
  <meta charset="utf-8" />
</head>
```

### `[Root]` / `[root]`

Gathers any props whose name starts with `--` (these are CSS variables) and adds them into `[head]` as a `:root` style block.

```ini
[Root =
  --primary: "#007bff",
  --bg: "#ffffff"
!]
```

### `[script]`

Outputs a `<script>` block. Set `scoped: true` to wrap the code in a self-calling function so its variables don't leak into the page.

```ini
[script = scoped: true]
  const x = "isolated";
  console.log(x);
[end:script]
```

```html
<script>
(function(){
  const x = "isolated";
  console.log(x);
})();
</script>
```

---

## 4. Self-Closing HTML Elements

HTML void elements (`img`, `br`, `hr`, `meta`, `link`, etc.) are handled automatically:

- They are output as self-closing (`<img />`).
- Putting body content inside one throws an error.

```ini
# Valid
[img = src: "photo.jpg" !]

# Invalid — throws an error
[img = src: "photo.jpg"]Content not allowed[end]
```

---

## 5. CSS Variables

Use `[Root]` to define CSS variables, then `[head]` picks them up and adds them as a `:root` block.

```ini
[Root =
  --bg: "#f0f0f0",
  --text: "#333",
  --accent: "orange"
!]

[head]
  [title]Themed Page[end]
[end:head]

[body = backgroundColor: --bg, color: --text]
  [h1 = borderBottom: "2px solid" + --accent]Header[end]
[end:body]
```

```html
<head>
  <style>:root { --bg:#f0f0f0;--text:#333;--accent:orange; }</style>
  <title>Themed Page</title>
</head>
```

---

## 6. Runtime Scripts

### Isolated Script Scope

`scoped: true` wraps the script in a self-calling function so its variables don't leak into the page.

### Scoped Runtime Scripts (`runtime ${}$`)

When you put a `runtime ${}$` block inside a SomMark block, SomMark adds a unique `data-sommark-id` to the parent element and gives you a `self` variable pointing to it:

```javascript
(async function(){
  const self = document.querySelector('[data-sommark-id="sommark-button-xxxxxx"]');
  if (self) {
    self.addEventListener('click', () => { ... });
  }
})();
```

Each block gets its own piece of the page — no framework needed.

### HTML Escaping

All block body content is HTML-escaped by default.
