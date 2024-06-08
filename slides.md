---
layout: cover
---

# Parcel

## and the limitations of writing tooling in JS

---
layout: intro
---

# Hi, I'm Matt 👋

## Work on Parcel in the App framework bundler team @ Atlassian

@mattcompiles

---
layout: header
---

## What are gonna talk about?

::content::

- Basics of how a bundler works
- A few interesting things we do to make it fast
- How sometimes we hit the limits of what JS can do

---
layout: statement
---

## But first...

---
layout: statement
---

## Why Parcel?

---
layout: center
---

# Flash back to 2022

- Atlassian is hitting the limits of Webpack
- Jira production builds are running for over 2 hours
- There's big ideas for features that are not supported by any open source bundlers
- Decisions is made to invest in Parcel, kicking off the Parcel V2 rewrite

---

<div class="grid grid-cols-2 gap-4 items-center h-full">
<div>
    
## Jira is big

</div>

<div>

- TODO: Number of files in Jira
- TODO: number of bundles in Jira
- TODO: Size in bytes

</div>
</div>

---
layout: center
---

# What does a bundler do exactly?

---
layout: two-col-header
---

### Phase one

::left::

# Create the Asset graph

- Scan assets/modules for dependencies
- Resolve dependencies to assets/modules
- Run file transformations
  - Remove types
  - Convert JSX to functions
  - etc

::right::

```mermaid
flowchart TB
entry.js -- react --> node_modules/react.js
entry.js -- ./App --> App.js
App.js -- react --> node_modules/react.js
App.js -. "import(./Async)" .-> Async.js
Async.js -- react --> node_modules/react.js
```

---
layout: two-col-header
---

### Phase two

::left::

# Bundling

- Create the bundle graph
- Create bundles for entry files and async imports
- Assign assets to bundles
- Split out common assets into shared bundles

::right::

```mermaid
flowchart LR
subgraph bundles
main-12345.js .-> async-12345.js
main-12345.js --> shared-12345.js
async-12345.js --> shared-12345.js
end
subgraph assets
main-12345.js --> entry.js
async-12345.js --> async.js
shared-12345.js --> react.js
end
```

---
layout: two-col-header
---

### Phase three

::left::

# Packaging

- Render bundles and source maps to string
  - Convert assets to functions
- Run bundle level optimizations
  - Dead code removal
  - Variable name shortening
  - Whitespace removal
  - etc
- Compression
- Write bundles to disk

::right::

<span class="-mt-16 block">

```js {0|1-10|12-16|18-22|24|all}
let moduleStore = {};
let moduleCache = {};
function require(moduleId) {
  if (moduleCache[moduleId]) {
    return moduleCache[moduleId];
  }
  let result = moduleStore[moduleId]();
  moduleCache[moduleId] = result;
  return result;
}

function define(...modules) {
  for (let m of modules) {
    moduleStore[m.id] = m.fn;
  }
}

define({id: 'entry', fn: () => {
  let react = require("react");
  let app = require("app");
  react.render(react.createElement(app));
});

require('entry');

```

</span>

---
layout: two-col
---

## How do we make things fast?

::right::

<v-clicks>
  
- <span v-mark="{at: 2, type: 'strike-through'}">Do less work</span>
- <span v-mark="{at: 5, type: 'circle'}">Do the same work, but smarter</span>
- Don't repeat work you've already done
- Do multiple things at once

</v-clicks>

---
layout: two-col-header
---

## During bundling...

::left::

```js {1-2|1-4|1-4,7-9}
let assets = new Set(bundleSpecificAssets);
let bundle = createBundle(assets);

// sometime later...

// prettier-ignore
let childBundleAssets = intersection(
  new Set(bundleA.assets), bundleB.assets
);
```

::right::

```js {none|all}
function intersection(a, b) {
  for (let entry of a) {
    if (!b.has(entry)) {
      a.delete(entry);
    }
  }
  return a;
}
```

---
layout: center
---

# Sets have no built-in intersect or union methods 😲

---
layout: center
---

# But there is one JS feature that implements intersections and unions natively!

---
layout: two-col
columnClass: "text-center"
---

## Intersection = Bitwise AND

# `&`

::right::

## Union = Bitwise OR

# `|`

---
layout: header
contentClass: "text-center"
---

## BitSet

Models a set from a known list of items

::content::

```mermaid
block-beta
columns 5
entry.js async.js react.js space:2
space:5
A["0"] B["0"] C["0"] space result["0"]
entry.js --> A
async.js --> B
react.js --> C
C --> result
```

---
layout: header
contentClass: "text-center"
---

## BitSet

Models a set from a known list of items

::content::

```mermaid
block-beta
columns 5
entry["entry.js"] async["async.js"] react["react.js"] space:2
space:5
A["0"] B["1"] C["0"] space result["2"]
entry --> A
async --> B
react --> C
C --> result

classDef on fill:#696;
class async,B on
```

---
layout: header
contentClass: "text-center"
---

## BitSet

Models a set from a known list of items

::content::

```mermaid
block-beta
columns 5
entry["entry.js"] async["async.js"] react["react.js"] space:2
space:5
A["0"] B["1"] C["1"] space result["3"]
entry --> A
async --> B
react --> C
C --> result

classDef on fill:#696;
class async,B,react,C on
```

---
layout: header
contentClass: "text-center"
---

## BitSet

Models a set from a known list of items

::content::

```mermaid
block-beta
columns 5
entry["entry.js"] async["async.js"] react["react.js"] space:2
space:5
A["1"] B["0"] C["1"] space result["5"]
entry --> A
async --> B
react --> C
C --> result

classDef on fill:#696;
class entry,A,react,C on
```

---
layout: two-col
columnClass: "text-center"
---

```mermaid
block-beta
columns 5
entry["entry.js"] async["async.js"] react["react.js"] space:2
space:5
A["1"] B["0"] C["1"] space result["5"]
entry --> A
async --> B
react --> C
C --> result

classDef on fill:#696;
class entry,A,react,C on
```

# &

```mermaid
block-beta
columns 5
entry["entry.js"] async["async.js"] react["react.js"] space:2
space:5
A["0"] B["0"] C["1"] space result["1"]
entry --> A
async --> B
react --> C
C --> result

classDef on fill:#696;
class react,C on
```

::right::

<v-click>

```mermaid
block-beta
columns 5
entry["entry.js"] async["async.js"] react["react.js"] space:2
space:5
A["0"] B["0"] C["1"] space result["1"]
entry --> A
async --> B
react --> C
C --> result

classDef on fill:#696;
class react,C on
```

</v-click>

---
layout: center
---

```js {1-2|1-6|all}
// Create BitSet with length of all assets array
let assets = new BitSet(allAssets.length);

// Add assets using index lookup
assets.add(assetsToIndex[targetAsset]);
let bundle = createBundle(assets);

// Sometime later...

// Profit from faster intersections and unions 🙌
let childBundleAssets = BitSet.intersect(bundleA.assets, bundleB.assets);
```

---
layout: two-col
---

## How do we make things fast?

::right::

- Do the same work, but smarter
- <span v-mark="{at: 1, type: 'circle'}">Don't repeat work you've already done</span>
- Do multiple things at once
