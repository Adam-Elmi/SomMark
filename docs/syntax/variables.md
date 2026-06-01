# The Variable Layer `v{}`

`v{}` is SomMark's local data-binding hook. It resolves data dynamically inside **components** and **loops**.

---

## 1. Automatic Scoping (Usage = Privacy)

When you pass properties to a component, SomMark automatically isolates used variables from the root tag to prevent duplicate attributes ("Double Hits").

*   **Inherited**: If a property is **not used** via `v{}`, it is automatically appended to the root tag of the component.
*   **Isolated**: If a property **is used** via `v{}`, it is consumed locally and hidden from the root tag.

### Example: Automatic Isolation
**Component (`Title.smark`)**
```ini
[h1] v{text} [end]
```

**Usage (`index.smark`)**
```ini
[import = Title: "./Title.smark"][end]

# 'id' is inherited (unused in component body)
# 'text' is isolated (consumed by v{text})
# 'text' will not be rendered as a root attribute!
[Title = id: "main", text: "Hello World" !]
```

**Rendered HTML**
```html
<h1 id="main">Hello World</h1>
```

---

## 2. Explicit Attribute Injection

If you want a property to go onto the component's root tag explicitly, bind it inside the component's header.

### Example: Dynamic Class Injection
**Component (`Button.smark`)**
```ini
[button = class: v{theme}] v{label} [end]
```

**Usage (`index.smark`)**
```ini
[import = Button: "./Button.smark"][end]

[Button = theme: "btn-blue", label: "Submit" !]
```

**Rendered HTML**
```html
<button class="btn-blue">Submit</button>
```

---

## 3. Multiple Variable Binding

You can pass and resolve multiple variables to handle complex component layouts.

### Example: User Profile Component
**Component (`Profile.smark`)**
```ini
[div = class: "user-card"]
  [h2] v{name} [end]
  [p] Status: v{status} [end]
[end]
```

**Usage (`index.smark`)**
```ini
[import = Profile: "./Profile.smark"][end]

[Profile = name: "Adam", status: "Active" !]
```

**Rendered HTML**
```html
<div class="user-card">
  <h2>Adam</h2>
  <p>Status: Active</p>
</div>
```

---

## 4. Local Variables (`v{}`) vs. Global Placeholders (`p{}`)

*   **Variables (`v{}`)**: Strictly local. Scoped to components, loops, and macro evaluation.
*   **Placeholders (`p{}`)**: Globally injected. Configured via the JS `placeholders` option.

```ini
# p{siteName} resolved globally from Javascript options
# v{localProp} resolved locally inside components or loops
[h1] p{siteName} [end] - [p] v{localProp} [end]
```
