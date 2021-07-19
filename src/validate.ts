import { EnvironmentMetadata } from './type-dotenv'

function throwError(meta: EnvironmentMetadata) {
  throw new Error(`Environment variable "${meta.property}" is not a ${meta.config.type}`)
}

export function validate(
  meta: EnvironmentMetadata,
  value: string
): undefined | string | number | boolean {
  const { config, property } = meta
  const { required, type } = {
    required: true,
    ...config
  }

  if (typeof value === 'undefined') {
    if (required) {
      throw new Error(`Environment variable "${property}" is not defined`)
    }

    return undefined
  }

  switch (type) {
    case 'string':
      return value

    case 'number':
      const transformed = +value

      if (Number.isNaN(transformed)) {
        throwError(meta)
      }

      return transformed

    case 'boolean':
      value = value.toLowerCase()

      // valid boolean values
      if (!['true', '1', 'false', '0'].includes(value)) {
        throwError(meta)
      }

      return value === 'true' || value === '1'

    /* istanbul ignore next */
    default:
      throw new Error('Unsupported validation type')
  }
}
