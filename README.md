# DansJSONUtils
Utilities for dealing with JSON in NodeJS

## Flatten

```js
const { flatten } = require("danjsonutils/flatten")
```

Flattening JSON for use such as creating columns for SQL schemas.

Rather than having something that preserves indexes in the format of `parent.0.child: val`, objects are flattened like `parent.child: [val]` so that arrays are preserved.

For arrays, `null` is forward and backward filled so that the index of a nested object is still retained.

For example, if we flatten:
```json
{
  "a": [
    {
      "b": 1
    },
    {
      "c": 2
    }
  ]
}
```

We get:

```json
{
  "a__b": [
    1,
    null
  ],
  "a__c": [
    null,
    2
  ]
}
```

### Array Type Collisions

PLEASE DO NOT MIX TYPES IN JSON ARRAYS.

In the event of array type collisions (multiple non-null types in an array, ex: `[1, "blah"]`) the entire value is the output of `JSON.stringify`.

For example the object
```json
{
  "multi": [
    1,
    "hey"
  ]
}
```

Would return:
```json
{
  "multi": "[1,\"hey\"]"
}
```

Because we can't do any more tricks here to flatten it.

If this is being used for an evolving schema, then issues could arise if the first time this column was encountered it had a single non-string type.

## Schema

Example of how to multiple JSON objects into one flattened schema:

```js
const { flatten } = require('dansjsonutils/flatten')
const { genSchema, removeFormatKeys } = require("dansjsonutils/schema")
const mergeJsonSchemas = require('merge-json-schemas')

// FLATTEN LOTS OF JSON ITEMS TO ONE SCHEMA
const raw = JSON.parse(fs.readFileSync('edges.json', { encoding: 'utf-8' }))
const flatItems = []
let mergedSchema = {}
for (const chatItem of raw) {
  const flat = flatten(chatItem, ".")
  flatItems.push(flat)
  // to remove any attempts at inferring timestamp formats of strings
  const schema = removeFormatKeys(genSchema(flat, {
    stripNullValues: true,
    stripNullArrayItems: true
  }))
  if (mergedSchema === {}) {
    mergedSchema = schema
  } else {
    mergedSchema = mergeJsonSchemas([mergedSchema, schema])
  }
}
console.log(JSON.stringify(mergedSchema, null, 2))

console.log(JSON.stringify(flatten(raw[0]), null, 2))
console.log(JSON.stringify(flatten(raw[raw.length-1]), null, 2))
console.log(JSON.stringify(raw[raw.length-1], null, 2))
console.log(raw.length, "items")

writeFileSync('out.json', JSON.stringify(flatItems))
```
