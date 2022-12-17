function isObject(obj) {
  return typeof obj === 'object' &&
  obj !== null &&
  !Array.isArray(obj)
}

function getType(item) {
  if (isObject(item)) {
    return 'object'
  } else if (Array.isArray(item)) {
    return 'array'
  } else {
    return typeof item
  }
}

/**
 * Takes an object and flattens it, preserving array indexes with nulls.
 *
 * Safe to call on already flattened JSON.
 *
 * See https://github.com/danthegoodman1/DansJSONUtils for flattening rules.
 * @param {object} obj Object to flatten.
 * @param {string} separator Separator for nested object keys, default `__`
 * @returns The flattened object
 */
function flatten(obj, separator = "__") {
  const flat = {}
  const arr = []

  let hasObj = false
  let hasArr = false
  if (Array.isArray(obj)) {
    for (const [i, item] of Object.entries(obj)) {
      if (isObject(item)) {
        if (hasArr) {
          return JSON.stringify(obj)
        }
        hasObj = true
        const flattened = flatten(item)
        for (const [k, nval] of Object.entries(flattened)) {
          if (flat[k] === undefined) {
            // Back-fill nulls
            flat[k] = Array.apply(null, Array(Number(i))).map(() => null)
          }
          flat[k].push(nval)
        }
        // Forward-fill nulls
        for (const k of Object.keys(flat)) {
          if (!flattened[k]) {
            flat[k].push(null)
          }
        }
      } else if (Array.isArray(item)) {
        if (hasObj) {
          return JSON.stringify(obj)
        }
        const f = flatten(item)
        // array of arrays support
        hasArr = true
        arr.push(f)
      } else if (item === null && hasArr) {
        // if we have an array of arrays, but one item is null instead of an array
        arr.push(item)
      } else {
        if (hasObj || hasArr) {
          return JSON.stringify(obj)
        }
        // verify that we don't have mixed results
        const nonNulls = obj.filter((objItem) => objItem !== null)
        if (nonNulls.length <= 1) {
          // Either array of nulls, empty, or we have one non-null item
          return obj
        }
        const firstNonNullType = getType(nonNulls[0])
        const mixedResults = nonNulls.slice(1).filter((objItem) => firstNonNullType !== getType(objItem) && firstNonNullType).length > 0
        if (mixedResults) {
          return JSON.stringify(obj)
        }
        return obj
      }
    }
  } else {
    hasObj = true
    for (const [key, val] of Object.entries(obj)) {
      if (isObject(val)) {
        const flattened = flatten(val)
        for (const [nkey, nval] of Object.entries(flattened)) {
          flat[key+separator+nkey] = nval
        }
      } else if (Array.isArray(val)) {
        const flattened = flatten(val)
        if (isObject(flattened)) {
          // merge it
          for (const [nkey, nval] of Object.entries(flattened)) {
            flat[key+separator+nkey] = nval
          }
        } else if (Array.isArray(flattened)) {
          // set it
          flat[key] = flattened
        } else {
          // stringified, mixed results
          flat[key] = flattened
        }
      } else {
        flat[key] = val
      }
    }
  }

  if (hasObj) {
    return flat
  } else {
    return arr
  }
}

module.exports.flatten = flatten
