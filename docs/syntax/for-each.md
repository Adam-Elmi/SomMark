# For-Each Loop

Repeats a block of content once for every item in an array.

---

## 1. Syntax

```ini
[for-each = ${ array }$, as: "alias"]
  body content
[end:for-each]
```

| Part | Required | Description |
| :--- | :--- | :--- |
| `${ array }$` | Yes | A compile-time block that returns an array. The `static` keyword is optional. |
| `as: "alias"` | No | Names the current item variable. Defaults to `"value"` if omitted. |
| `join: "separator"` | No | String inserted between each iteration's output. Defaults to `""` (no separator). |

---

## 2. Reserved Variables

Every `for-each` loop automatically provides these variables:

| Variable | Description |
| :--- | :--- |
| `i` | The 0-based index of the current iteration. Always `i` — not customizable. |
| `length` | The total number of items in the array. Always `length` — not customizable. |
| `value` | The current item. This is the default alias; rename it with `as:`. |

`i` and `length` are **reserved** — you cannot use `as: "i"` or `as: "length"`.

---

## 3. Basic Usage

Loop over a simple array of strings:

```ini
[ul]
  [for-each = ${ ["Apple", "Banana", "Mango"] }$]
    [li]${ i }$: ${ value }$[end:li]
  [end:for-each]
[end:ul]
```

**HTML Output:**
```html
<ul>
  <li>0: Apple</li>
  <li>1: Banana</li>
  <li>2: Mango</li>
</ul>
```

---

## 4. The `as` Keyword

Use `as` to rename the current item variable to something more descriptive:

```ini
[for-each = ${ ["Red", "Green", "Blue"] }$, as: "color"]
  [span]${ i }$: ${ color }$[end:span]
[end:for-each]
```

The index is always `i` regardless of what `as` is set to.

---

## 5. Looping Over Objects

Pass an array of objects and access their properties through dot notation:

```ini
[table]
  [tr]
    [th]Name[end:th]
    [th]Role[end:th]
  [end:tr]
  [for-each = ${ [
    { name: "Adam", role: "Engineer" },
    { name: "Hawa", role: "Designer" },
    { name: "Ilham", role: "Writer" }
  ] }$, as: "person"]
    [tr]
      [td]${ person.name }$[end:td]
      [td]${ person.role }$[end:td]
    [end:tr]
  [end:for-each]
[end:table]
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

You can define data in a compile-time block before the loop and reference it:

```ini
${
  const cities = [
    { name: "Mogadishu", country: "Somalia" },
    { name: "Nairobi", country: "Kenya" },
    { name: "Cairo", country: "Egypt" }
  ];
}$

[ul]
  [for-each = ${ cities }$, as: "city"]
    [li]${ city.name }$ — ${ city.country }$[end:li]
  [end:for-each]
[end:ul]
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

Loops can be nested. Each loop has its own `as` alias; both share the same `i` variable, so the inner `i` shadows the outer one inside the inner loop body.

```ini
${
  const groups = [
    { label: "Fruits", items: ["Apple", "Banana"] },
    { label: "Colors", items: ["Red", "Blue"] }
  ];
}$

[div]
  [for-each = ${ groups }$, as: "group"]
    [h3]${ group.label }$[end:h3]
    [ul]
      [for-each = ${ group.items }$, as: "entry"]
        [li]${ i }$: ${ entry }$[end:li]
      [end:for-each]
    [end:ul]
  [end:for-each]
[end:div]
```

**HTML Output:**
```html
<div>
  <h3>Fruits</h3>
  <ul>
    <li>0: Apple</li>
    <li>1: Banana</li>
  </ul>
  <h3>Colors</h3>
  <ul>
    <li>0: Red</li>
    <li>1: Blue</li>
  </ul>
</div>
```

---

## 8. Using Components Inside Loops

Combine `for-each` with imported components to render repeated layouts:

**`components/Card.smark`**
```ini
[div = class: "card"]
  [h2]v{title}[end:h2]
  [div = class: "card-body"]
    [slot][end:slot]
  [end:div]
[end:div]
```

**`page.smark`**
```ini
[import = Card: "./components/Card.smark" !]

[for-each = ${ [
  { title: "First", body: "Content A" },
  { title: "Second", body: "Content B" }
] }$, as: "card"]
  [Card = title: ${ card.title }$]
    ${ card.body }$
  [end:Card]
[end:for-each]
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
[for-each = ${ ["X", "Y"] }$, as: "val"]
  ${ const inner = val + "!"; }$
  ${ inner }$
[end:for-each]

# 'inner', 'val', and 'i' are no longer accessible here
```

---

## 10. The `join` Prop

Use `join` to insert a separator string between each iteration's output. The separator is not added after the last item.

```ini
[for-each = ${ [1, 2, 3] }$, join: "\n"]
  ${ value }$
[end:for-each]
```

**Output:**
```
1
2
3
```

Comma-separated list:

```ini
[for-each = ${ ["Apple", "Banana", "Mango"] }$, join: ", "]
  ${ value }$
[end:for-each]
```

**Output:**
```
Apple, Banana, Mango
```

---

## 11. Using `length`

`length` holds the total number of items. Combined with `i`, you can handle first/last item logic without a plugin:

```ini
[for-each = ${ ["Apple", "Banana", "Mango"] }$]
  ${ value }$${ i < length - 1 ? ", " : "" }$
[end:for-each]
```

**Output:**
```
Apple, Banana, Mango
```

---

## 12. Rules

- The first prop **must** be a `${}$` compile-time block that returns an array. Omitting it throws a missing prop error. Passing a non-array value throws a type error.
- The `as` value must be a quoted string (e.g. `as: "user"`).
- `i` and `length` are reserved. Using `as: "i"` or `as: "length"` throws a reserved variable error.
- `for-each` is a reserved keyword. It cannot be used as a custom block identifier.
- Each iteration gets a fresh scope. Variables from one iteration do not carry over to the next.

### Errors

**Missing array prop:**
```ini
[for-each]
  ${ value }$
[end:for-each]
```
```
Missing Prop Error in [for-each]:
[for-each] requires an array as its first prop, e.g. [for-each = ${ array }$]
```

**Non-array value:**
```ini
[for-each = ${ "hello" }$]
  ${ value }$
[end:for-each]
```
```
Type Error in [for-each]:
Expected an Array for 'items', but received string: "hello"
```

**Reserved variable name:**
```ini
[for-each = ${ [1, 2, 3] }$, as: "i"]
  ${ value }$
[end:for-each]
```
```
Reserved Variable Error in [for-each]:
'i' is a reserved variable name. Use a different name for the 'as' prop, e.g. as: "item"
```
