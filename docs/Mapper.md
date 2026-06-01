# Mapper Class

The `Mapper` class defines translation mappings for custom formats in SomMark.

For the complete list of individual properties, methods, and configurations, see the [Detailed API Reference](./api/Mapper/).

---

## 1. Initialization

You can initialize a mapper in two ways:

### Direct Instantiation
Creates a clean, blank mapper instance:

```javascript
import { Mapper } from "sommark";

const mapper = new Mapper();
```

### Declarative Factory Definition
`Mapper.define()` creates a mapper instance and attaches custom properties or methods directly to it:

```javascript
import { Mapper } from "sommark";

const mapper = Mapper.define({});
```
