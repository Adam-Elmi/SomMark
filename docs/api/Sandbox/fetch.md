# fetch()

Asynchronously fetches external resources over HTTPS securely inside the sandboxed environment.
---

**Syntax:**
```js
await SomMark.fetch(url, options);
```

**Usage:**
```javascript
static ${
  // Asynchronously fetch a remote JSON resource
  const res = await SomMark.fetch("https://api.github.com/repos/Adam-Elmi/SomMark");
  const repo = await res.json();
  return `Stars: ${repo.stargazers_count}`;
}$
```

---

### Security Safeguards

To prevent Server-Side Request Forgeries (SSRF) and restrict network access inside templates, `SomMark.fetch()` enforces five layers of strict security:

| Control | Default Behavior | How to Configure (Host Context) |
| :--- | :--- | :--- |
| **Global Access** | Allowed | `{ security: { allowFetch: false } }` completely disables all fetch requests. |
| **HTTPS Enforcement** | Only `https:` allowed. `http:` is strictly blocked. | `{ security: { allowHttp: true } }` permits standard HTTP requests. |
| **SSRF Protection** | Automatically blocks loopbacks, private networks (RFC 1918), and local hostnames (`localhost`, `127.0.0.1`, `10.*`, `192.168.*`, `172.16.*`, etc.). | Cannot be disabled (enforced for security safety). |
| **Origin Whitelist** | Any HTTPS domain allowed. | `{ security: { allowedOrigins: ["https://api.github.com"] } }` restricts access strictly to specified domains. |
| **Extension Whitelist** | Any endpoint allowed. | `{ security: { allowedExtensions: [".json"] } }` blocks URLs that do not end with the specified extension. |

---

### Response Object Signature

The custom response returned by `SomMark.fetch()` mimics the standard Fetch API:

*   **Properties:**
    - `ok` (boolean)
    - `status` (number)
    - `statusText` (string)
    - `url` (string)
*   **Headers:**
    - `headers.get(name)` (case-insensitive retrieval)
    - `headers.forEach(callback)`
*   **Body Methods:**
    - `await res.text()` (returns raw string)
    - `await res.json()` (returns parsed JSON object)

---

### Example: Fetching and Rendering Remote Data

Example in template: `index.smark`

```js
static ${
  // Fetch user data from GitHub API
  const res = await SomMark.fetch("https://api.github.com/users/Adam-Elmi");
  
  if (!res.ok) {
    throw new Error(`Fetch failed with status: ${res.statusText}`);
  }
  
  const user = await res.json();
  return `Developer: ${user.name} | Location: ${user.location}`;
}$
```

**Usage via CLI:**
```sh
sommark --html -p index.smark
```

**Output:**
```html
Developer: Adam Elmi | Location: Somaliland
```

---

[Read raw.md for output bypassing and escaping rules](raw.md)

[Read settings.md for global configuration access](settings.md)

[Read compile.md for recursive template generation](compile.md)

[Read version.md for compiler version details](version.md)

[Read static.md for compile-time macros inside client scripts](static.md)
