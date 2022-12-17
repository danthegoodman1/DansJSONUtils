const { flatten } = require("./flatten")

const test = {
  "hey": "ho",
  "lets": 1,
  "arr": [1,2],
  "obj": {
    "this": "key",
    "val": [1,2]
  },
  "objar": [
    {
      "a": "val",
      "b": 2,
      "c": [1],
      "d": [{"e": 1}, {"e": 2}],
      "dstr": [{"e": 1}, {"e": 2}, 2],
      "darr": [{"e": 1}, {"e": 2}, [2]],
      "f": {
        "g": 1,
        "h": [2]
      }
    },
    {
      "a": "val2",
      "new": "nvale"
    }
  ],
  "nestedar": [[1], [2]]
}

const a = flatten(test)
const b = flatten(a)
const aString = JSON.stringify(a)
const bString = JSON.stringify(b)

console.log(a, aString === bString)

console.log(JSON.stringify(flatten({
  "a": [
    {
      "b": 1
    },
    {
      "c": 2
    }
  ],
  "d": [
    1,
    "string"
  ]
}), null, 2))
