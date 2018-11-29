/* eslint security/detect-object-injection: 0 */

const env = module.exports

/** Populate environment variables from the environment, optionally parsing values.
 *
 * @param {string} prefix populate all environment variables with this prefix
 * @param {object} [schema] map of functions that transform string values into native types
 * @param {object} [defaultValues] any default values to return
 * @returns {object} object with key-value pairs
 */
env.populateFromPrefix = function(prefix, schema, defaultValues) {
    let ret = defaultValues || {}

    if (schema === undefined) {
        schema = {}
    }

    Object.keys(process.env)
        .filter(x => x.startsWith(prefix + '_') || x === prefix)
        .forEach(envKey => {
            const key = envKey.replace(prefix + '_', '')

            let tmp = ret
            const path = key.split('_')
            for (let i = 0; i < path.length - 1; i++) {
                const token = path[i]
                if (token in tmp) {
                    tmp = tmp[token]
                } else {
                    tmp = tmp[token] = {}
                }
            }

            let value = process.env[envKey]

            const token = path[path.length - 1]
            const transform = schema[key] || schema[token] || (x => x)

            tmp[token] = transform(value)
        })

    return Object.keys(ret).length === 0 ? undefined : ret
}
