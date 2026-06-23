# CSV

Use SomMark to generate CSV files from templates. Useful for data exports,
report generation, and any tabular output that goes into Excel, Google Sheets,
or a data pipeline.

```js
import SomMark from "sommark";

const sm = new SomMark({ src, format: "csv", placeholders: { ... } });
const csv = await sm.transpile();
```

```bash
sommark --csv input.smark
```

---

## Why use SomMark instead of writing CSV directly?

Raw CSV has no programming constructs — every row must be written by hand.

| Problem with raw CSV | How SomMark solves it |
| -------------------- | --------------------- |
| No loops — 1000 rows means writing 1000 rows | `[for-each]` generates rows from an array |
| No dynamic values — all data is hardcoded | `${ }$` computes values at build time |
| No environment switching — separate files for dev/prod | `placeholders` inject different data without changing the template |
| No file splitting — header and data live in one place | The module system separates headers, data, and footer into their own files |
| Commas and quotes in values must be escaped manually | SomMark quotes and escapes cell values automatically |

**Example**: exporting a sales report from live data — impossible in raw CSV
without writing every row yourself:

```ini
${
  const sales = [
    { product: "Keyboard", qty: 120, revenue: 5988.00 },
    { product: "Mouse",    qty: 340, revenue: 6799.60 },
    { product: "Monitor",  qty:  45, revenue: 22499.55 },
  ];
  const total = sales.reduce((sum, s) => sum + s.revenue, 0);
}$

[header = "Product", "Qty Sold", "Revenue ($)" !]
[for-each = ${ sales }$, as: "s"]
  [row = ${ s.product }$, ${ s.qty }$, ${ s.revenue.toFixed(2) }$ !]
[end]
[row = "TOTAL", "", ${ total.toFixed(2) }$ !]
```

```csv
Product,Qty Sold,Revenue ($)
Keyboard,120,5988.00
Mouse,340,6799.60
Monitor,45,22499.55
TOTAL,,35287.15
```

---

## Header row — `[header]`

Defines the column names. Must come before any data rows.

Self-closing form — pass column names as arguments:

```ini
[header = "name", "age", "city" !]
```

```csv
name,age,city
```

Body form — use `[col]` for each column name:

```ini
[header]
  [col]name[end]
  [col]age[end]
  [col]city[end]
[end]
```

`[thead]` is an alias for `[header]`.

---

## Data rows — `[row]`

Each `[row]` block becomes one line in the CSV output.

Self-closing form — pass cell values as arguments:

```ini
[row = "Adam", "25", "Hargeisa" !]
```

Body form — use `[col]` when a cell value contains a comma or other special
characters:

```ini
[row]
  [col]Adam[end]
  [col]25[end]
  [col]Hargeisa, Somaliland[end]
[end]
```

`[tr]` and `[td]` are aliases for `[row]` and `[col]`.

---

## Automatic escaping

SomMark handles RFC 4180 escaping automatically. You never need to quote values
manually — just write the value and SomMark wraps it if needed:

| Value you write        | CSV output             |
| ---------------------- | ---------------------- |
| `New York, NY`         | `"New York, NY"`       |
| `He said "hello"`      | `"He said ""hello"""` |
| Value with a newline   | Wrapped in quotes      |

---

## Loops with `[for-each]`

### Dynamic rows from an array

```ini
${
  const users = [
    { name: "Adam",  age: 25, city: "Hargeisa"  },
    { name: "Elmi",  age: 40, city: "Borama"    },
    { name: "Farah", age: 32, city: "Mogadishu" },
  ];
}$

[header = "name", "age", "city" !]
[for-each = ${ users }$, as: "u"]
  [row = ${ u.name }$, ${ u.age }$, ${ u.city }$ !]
[end]
```

```csv
name,age,city
Adam,25,Hargeisa
Elmi,40,Borama
Farah,32,Mogadishu
```

### Using the loop index

`${ i }$` gives the 0-based position of the current item:

```ini
${
  const items = ["apple", "banana", "cherry"];
}$

[header = "index", "fruit" !]
[for-each = ${ items }$, as: "fruit"]
  [row = ${ i }$, ${ fruit }$ !]
[end]
```

```csv
index,fruit
0,apple
1,banana
2,cherry
```

---

## Placeholders

Pass data in from outside the template using `placeholders`. Reference values
with `${ name }$` or the `p{}` shorthand:

```ini
[header = "env", "host", "port" !]
[row = p{ENV}, p{DB_HOST}, p{DB_PORT} !]
```

```js
new SomMark({
  src,
  format: "csv",
  placeholders: { ENV: "production", DB_HOST: "db.example.com", DB_PORT: "5432" }
});
```

```csv
env,host,port
production,db.example.com,5432
```

---

## Compile-time values

Use `${ }$` to compute values at build time — totals, formatted dates, derived
fields:

```ini
${
  const now = new Date().toISOString().slice(0, 10);
  const rows = [10, 20, 30];
  const total = rows.reduce((a, b) => a + b, 0);
}$

[header = "generated", "total" !]
[row = ${ now }$, ${ total }$ !]
```

```csv
generated,total
2026-06-22,60
```

---

## File splitting with modules

Split headers, data, and footers into separate `.smark` files:

```ini
[import = headers: "./headers.smark" !]
[import = data: "./data.smark" !]

[$use-module = "headers" !]
[$use-module = "data" !]
```

`headers.smark`:

```ini
[header = "name", "age", "city" !]
```

---

## Comments

SomMark comments are stripped and never appear in the output.

```ini
# this comment is removed — CSV output stays clean
[header = "name", "score" !]
[row = "Adam", "95" !]
```
