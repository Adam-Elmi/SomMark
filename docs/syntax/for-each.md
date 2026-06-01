# For-Each Loop

Repeats a block of content once for every item in an array. The array is evaluated at compile-time inside a static block.

---

## 1. Syntax

```ini
[for-each = static ${ array }$, as: "alias"]
  body content
[end]
```

| Part | Required | Description |
| :--- | :--- | :--- |
| `static ${ array }$` | Yes | A static block that returns an array. This is the data source. |
| `as: "alias"` | No | Names the current item variable. Defaults to `"item"` if omitted. |

---

## 2. Basic Usage

Loop over a simple array of strings:

```ini
[ul]
  [for-each = static ${ ["Apple", "Banana", "Mango"] }$, as: "fruit"]
    [li]static ${ fruit }$[end]
  [end]
[end]
```

**HTML Output:**
```html
<ul>
  <li>Apple</li>
  <li>Banana</li>
  <li>Mango</li>
</ul>
```

---

## 3. The `as` Keyword

The `as` prop controls the variable name used to access each item inside the loop body.

```ini
[for-each = static ${ ["Red", "Green", "Blue"] }$, as: "color"]
  [span]static ${ color }$[end]
[end]
```

Here, each string in the array is accessible through `static ${ color }$`.

If you omit `as`, SomMark uses `"item"` as the default:

```ini
[for-each = static ${ ["Red", "Green", "Blue"] }$]
  [span]static ${ item }$[end]
[end]
```

---

## 4. Index Variable

SomMark automatically creates an index variable named `alias_index`. It holds the 0-based position of the current iteration.

The name is always your `as` value followed by `_index`. For example:
- `as: "color"` creates `color_index`
- `as: "user"` creates `user_index`
- Default (`item`) creates `item_index`

```ini
[ol]
  [for-each = static ${ ["Adam", "Hawa", "Ilham"] }$, as: "name"]
    [li]static ${ name_index }$: static ${ name }$[end]
  [end]
[end]
```

**HTML Output:**
```html
<ol>
  <li>0: Adam</li>
  <li>1: Hawa</li>
  <li>2: Ilham</li>
</ol>
```

---

## 5. Looping Over Objects

Pass an array of objects and access their properties through dot notation:

```ini
[table]
  [tr]
    [th]Name[end]
    [th]Role[end]
  [end]
  [for-each = static ${ [
    { name: "Adam", role: "Engineer" },
    { name: "Hawa", role: "Designer" },
    { name: "Ilham", role: "Writer" }
  ] }$, as: "person"]
    [tr]
      [td]static ${ person.name }$[end]
      [td]static ${ person.role }$[end]
    [end]
  [end]
[end]
```

**HTML Output:**
```html
<table>
  <tr>
    <th>Name</th>
    <th>Role</th>
  </tr>
  <tr>
    <td>Adam</td>
    <td>Engineer</td>
  </tr>
  <tr>
    <td>Hawa</td>
    <td>Designer</td>
  </tr>
  <tr>
    <td>Ilham</td>
    <td>Writer</td>
  </tr>
</table>
```

---

## 6. Using Shared Variables

You can define data in a static block before the loop and reference it:

```ini
static ${
  const cities = [
    { name: "Mogadishu", country: "Somalia" },
    { name: "Nairobi", country: "Kenya" },
    { name: "Cairo", country: "Egypt" }
  ];
}$

[ul]
  [for-each = static ${ cities }$, as: "city"]
    [li]static ${ city.name }$ — static ${ city.country }$[end]
  [end]
[end]
```

**HTML Output:**
```html
<ul>
  <li>Mogadishu — Somalia</li>
  <li>Nairobi — Kenya</li>
  <li>Cairo — Egypt</li>
</ul>
```

---

## 7. Nested Loops

Loops can be nested inside each other. Each loop has its own alias and index variable, so they do not conflict.

```ini
static ${
  const groups = [
    { label: "Fruits", items: ["Apple", "Banana"] },
    { label: "Colors", items: ["Red", "Blue"] }
  ];
}$

[div]
  [for-each = static ${ groups }$, as: "group"]
    [h3]static ${ group.label }$[end]
    [ul]
      [for-each = static ${ group.items }$, as: "entry"]
        [li]static ${ entry }$[end]
      [end]
    [end]
  [end]
[end]
```

**HTML Output:**
```html
<div>
  <h3>Fruits</h3>
  <ul>
    <li>Apple</li>
    <li>Banana</li>
  </ul>
  <h3>Colors</h3>
  <ul>
    <li>Red</li>
    <li>Blue</li>
  </ul>
</div>
```

---

## 8. Using Components Inside Loops

Combine `for-each` with imported components to render repeated layouts:

**`components/Card.smark`**
```ini
[div = class: "card"]
  [h2]v{title}[end]
  [div = class: "card-body"]
    [slot][end]
  [end]
[end]
```

**`page.smark`**
```ini
[import = Card: "./components/Card.smark"][end]

[for-each = static ${ [
  { title: "First", body: "Content A" },
  { title: "Second", body: "Content B" }
] }$, as: "card"]
  [Card = title: static ${ card.title }$]
    static ${ card.body }$
  [end]
[end]
```

**HTML Output:**
```html
<div class="card">
  <h2>First</h2>
  <div class="card-body">
    Content A
  </div>
</div>
<div class="card">
  <h2>Second</h2>
  <div class="card-body">
    Content B
  </div>
</div>
```

---

## 9. Scope Isolation

Variables created inside a `for-each` loop body are isolated to that loop. They are automatically cleaned up when the loop closes and cannot be accessed outside.

```ini
[for-each = static ${ ["X", "Y"] }$, as: "val"]
  static ${ const inner = val + "!"; }$
  static ${ inner }$
[end]

# 'inner' and 'val' are no longer accessible here
```

---

## 10. Rules

- The first prop **must** be a `static ${}$` block that returns an array. Passing a non-array value causes a type error.
- The `as` value must be a quoted string (e.g. `as: "user"`).
- `for-each` is a reserved keyword. It cannot be used as a custom block identifier.
- Each iteration gets a fresh scope. Variables from one iteration do not carry over to the next.
