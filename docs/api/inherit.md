# inherit

The `inherit` method lets one mapper copy all the tags from other mappers. This is the best way to combine different mappers into one.

**Syntax:** `this.inherit(mapper1, mapper2, ...)`

---

## 1. Ways to Use It

*   **Copying from one mapper**: Copy everything from a standard mapper.
    ```js
    import { Mapper, HTML } from "sommark";
    const myMapper = new Mapper();
    
    // Copy all HTML tags into myMapper
    myMapper.inherit(HTML);
    ```

*   **Combining many mappers**: Merge many mappers together.
    ```js
    import { HTML, MARKDOWN, XML } from "sommark";
    
    // myMapper now knows how to handle HTML, Markdown, and XML
    myMapper.inherit(HTML, MARKDOWN, XML);
    ```

---

## 2. Rules

### The Last One Wins
If two mappers have a tag with the same name, the mapper that is listed **last** will be the one used.

```js
// If both HTML and MARKDOWN have a 'bold' tag, 
// the version from MARKDOWN will be used.
myMapper.inherit(HTML, MARKDOWN);
```

### Safety
When you copy a tag, SomMark automatically removes any old version of that tag first. This stops errors and prevents having two versions of the same tag.

---

## 3. Real Example: Adding Custom Tags to HTML

You can start with all the standard tags and then add your own special ones.

```js
import { Mapper, HTML } from "sommark";

const myMapper = new Mapper();

// 1. Start by copying all standard HTML tags
myMapper.inherit(HTML);

// 2. Add a new tag that standard HTML doesn't have
myMapper.register("MyButton", function({ content }) {
    return this.tag("button").body(content);
});

// Now myMapper can do everything HTML can do, plus handle <MyButton>
```
