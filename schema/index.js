const toJsonSchema = require("to-json-schema")

function isObject(obj) {
  return typeof obj === 'object' &&
  obj !== null &&
  !Array.isArray(obj)
}

function stripNulls(arr) {
  const newArr = []
  for (const item of arr) {
    if (Array.isArray(item)) {
      newArr.push(stripNulls(item))
    } else if (item !== null) {
      newArr.push(item)
    }
  }
  return newArr
}

/**
 * @param {object} obj object to generate schema from
 * @param {object} options configuration object
 * @param {boolean} options.stripNullArrayItems remove null items from arrays, used to prevent null JSON schema types
 * @param {boolean} options.stripNullValues remove directly null values, used to prevent null JSON schema types
 * @param {boolean} options.detectFormat detect format, default false, typically you don't want this as it can mess up schemas
 * @returns {object} JSON schema
 */
function genSchema(obj, options) {
  return toJsonSchema(obj, {
    arrays: {
      mode: 'first',
    },
    strings: {
      detectFormat: options?.detectFormat === true
    },
    objects: {
      preProcessFnc: (schema, df) => {
        // strip nulls so they don't mess up the typing
        for (const [key, val] of Object.entries(schema)) {
          if (Array.isArray(val) && options.stripNullArrayItems === true) {
            schema[key] = stripNulls(val)
          } if (val === null && options.stripNullValues) {
            delete schema[key]
          }
        }
        return df(schema)
      }
    }
  })
}
module.exports.genSchema = genSchema

/**
 * Removes all 'format' keys from an object. Used for removing inferred
 * @param {object} obj object potentially containing 'format' keys
 */
function removeFormatKeys(obj) {
  const copy = obj
  delete copy['format']
  for (const key in obj) {
    if (isObject(copy[key])) {
      copy[key] = removeFormatKeys(copy[key])
    }
  }
  return copy
}
module.exports.removeFormatKeys = removeFormatKeys
